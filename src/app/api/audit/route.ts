import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { resolveActivePropertyId } from '@/lib/active-property'
import { buildCompassContext, getOrCreateCompass, proposeCompassContribution } from '@/lib/compass'
import { COMPASS_FIELDS } from '@/lib/compass-fields'
import {
  AUDIT_STEPS,
  allQuestions,
  labelFor,
  scoreFromAnswers,
  visibleQuestions,
  type AuditAnswers,
} from '@/lib/audit-questions'
import { NextResponse } from 'next/server'
import type { CompassField } from '@/types'

const VALID_COMPASS_FIELDS = new Set<string>(COMPASS_FIELDS.map((f) => f.field))

/**
 * Turn the saved answers into readable lines for the Compass comparison, using
 * the question prompts and option labels from audit-questions.ts. Only visible
 * questions are included, so a skipped branch never reaches the model.
 */
function summariseAnswers(answers: AuditAnswers): string {
  const lines: string[] = []
  for (const step of AUDIT_STEPS) {
    const rows = visibleQuestions(step, answers)
      .map((q) => {
        const value = answers[q.id]
        if (Array.isArray(value)) {
          if (value.length === 0) return null
          return `- ${q.prompt} ${value.map((v) => labelFor(q.id, v)).join(', ')}`
        }
        if (typeof value !== 'string' || !value.trim()) return null
        const label = q.options ? labelFor(q.id, value) : value.trim()
        return `- ${q.prompt} ${label}`
      })
      .filter(Boolean)
    if (rows.length) lines.push(`${step.title}\n${rows.join('\n')}`)
  }
  return lines.join('\n\n')
}

interface CompassObservation {
  message: string
  compass_field: string | null
  suggested_refinement: string | null
}

async function compareAuditToCompass(
  answers: AuditAnswers,
  compassText: string
): Promise<CompassObservation[]> {
  const prompt = `${compassText}

This host just completed their Experience Audit. Here's what they reported:

${summariseAnswers(answers)}

Gently compare this against their Compass above. Where does the current reality clearly support, or clearly fall short of, what they said they want guests to feel? Only note it if there's a real, specific connection — do not manufacture a contradiction that isn't there.

Return JSON only:
{
  "observations": [
    {
      "message": "1-2 sentences, warm and specific, StayStory voice — never 'you should', never a lecture. Something like 'Here's something to consider...' or naming the gap plainly and gently.",
      "compass_field": "one of wonder, purpose, story, transformation_arrive, transformation_leave, hospitality_promise, signature_memory, story_theyll_tell — or null if it doesn't map to one field",
      "suggested_refinement": "a short revised value for that compass_field, only if a genuine refinement is truly warranted — otherwise null"
    }
  ]
}

Return at most 2 observations. An empty array is a completely valid answer — most audits won't reveal a genuine contradiction, and forcing one would be worse than saying nothing.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: 'You are a hospitality mentor. Always respond with valid JSON only, no markdown.',
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonStr = text.replace(/```(?:json)?\s*([\s\S]*?)```/, '$1').trim()
  const start = jsonStr.indexOf('{')
  const end = jsonStr.lastIndexOf('}')

  try {
    const parsed = JSON.parse(start !== -1 ? jsonStr.slice(start, end + 1) : jsonStr)
    return Array.isArray(parsed.observations) ? parsed.observations : []
  } catch {
    return []
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { answers }: { answers: AuditAnswers } = await request.json()

  if (typeof answers !== 'object' || answers === null || Array.isArray(answers)) {
    return NextResponse.json({ error: 'answers must be an object' }, { status: 400 })
  }

  const property_id = await resolveActivePropertyId(user.id)

  // The host never sees a 1–5 scale any more, but `audits.score` still exists
  // and other parts of the app read it, so it's derived from the descriptive
  // answers that carry a quality rating.
  const score = scoreFromAnswers(answers)

  const { data: auditRow, error } = await supabase
    .from('audits')
    .insert({ user_id: user.id, property_id, score, responses: answers })
    .select('id')
    .single()

  if (error) console.error('Audit save error:', error)

  // The Audit is finished, so the in-progress draft is no longer needed.
  const draftQuery = supabase.from('audit_drafts').delete().eq('user_id', user.id)
  await (property_id
    ? draftQuery.eq('property_id', property_id)
    : draftQuery.is('property_id', null))

  // ── Compass contributions ────────────────────────────────────────────────
  // Which answers feed which Compass field is declared on the questions
  // themselves, so adding a new contributing question is an edit in
  // audit-questions.ts and nothing here changes.
  for (const question of allQuestions()) {
    if (!question.compass) continue
    const value = answers[question.id]

    const suggested = Array.isArray(value)
      ? value.map((v) => labelFor(question.id, v)).join(', ')
      : typeof value === 'string' && question.options
        ? labelFor(question.id, value)
        : typeof value === 'string'
          ? value.trim()
          : ''

    if (!suggested) continue

    await proposeCompassContribution({
      userId: user.id,
      propertyId: property_id,
      field: question.compass,
      suggestedValue: suggested,
      sourceModule: 'audit',
      rationale: `From your Experience Audit — ${question.prompt}`,
      sourceRef: auditRow?.id ? { table: 'audits', id: auditRow.id } : undefined,
    })
  }

  let observations: CompassObservation[] = []
  try {
    const compass = await getOrCreateCompass(user.id, property_id)
    const compassContext = buildCompassContext(compass)
    const hasAuditContent = Object.values(answers).some((v) =>
      Array.isArray(v) ? v.length > 0 : typeof v === 'string' && v.trim().length > 0
    )

    if (compassContext && hasAuditContent) {
      observations = await compareAuditToCompass(answers, compassContext.text)

      for (const observation of observations) {
        if (
          observation.compass_field &&
          VALID_COMPASS_FIELDS.has(observation.compass_field) &&
          observation.suggested_refinement?.trim()
        ) {
          await proposeCompassContribution({
            userId: user.id,
            propertyId: property_id,
            field: observation.compass_field as CompassField,
            suggestedValue: observation.suggested_refinement.trim(),
            sourceModule: 'audit',
            rationale: observation.message,
            sourceRef: auditRow?.id ? { table: 'audits', id: auditRow.id } : undefined,
          })
        }
      }
    }
  } catch (err) {
    // Never let the Compass comparison break the Audit's core save flow.
    console.error('[audit] Compass comparison failed:', err)
  }

  return NextResponse.json({ ok: true, observations })
}
