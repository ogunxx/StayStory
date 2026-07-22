import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { resolveActivePropertyId } from '@/lib/active-property'
import { buildCompassContext, getOrCreateCompass, proposeCompassContribution } from '@/lib/compass'
import { COMPASS_FIELDS } from '@/lib/compass-fields'
import { NextResponse } from 'next/server'
import type { AuditResponses, CompassField } from '@/types'

const VALID_COMPASS_FIELDS = new Set<string>(COMPASS_FIELDS.map((f) => f.field))

const RATING_LABELS: Record<string, string> = {
  arrival_rating: 'Arrival experience (first 10 minutes)',
  lighting_rating: 'Lighting — warm, layered, intentional?',
  temperature_rating: 'Temperature control',
  sleep_rating: 'Sleep quality',
  bathroom_rating: 'Bathroom experience',
  kitchen_rating: 'Kitchen / kitchenette usability',
  layout_rating: 'Layout & flow',
  sound_smell_rating: 'Sound & smell',
  instructions_rating: 'Instructions & clarity',
}

interface CompassObservation {
  message: string
  compass_field: string | null
  suggested_refinement: string | null
}

async function compareAuditToCompass(
  responses: AuditResponses,
  compassText: string
): Promise<CompassObservation[]> {
  const ratingLines = Object.entries(RATING_LABELS)
    .map(([key, label]) => {
      const value = responses[key as keyof AuditResponses]
      return typeof value === 'number' ? `${label}: ${value}/5` : null
    })
    .filter(Boolean)
    .join('\n')

  const prompt = `${compassText}

This host just completed their Experience Audit. Here's what they reported:

${ratingLines}
${responses.pain_points ? `\nBiggest friction point: ${responses.pain_points}` : ''}
${responses.one_thing ? `\nWhat they do better than anywhere else: ${responses.one_thing}` : ''}

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

  const { score, responses }: { score: number; responses: AuditResponses } = await request.json()

  const property_id = await resolveActivePropertyId(user.id)

  const { data: auditRow, error } = await supabase
    .from('audits')
    .insert({ user_id: user.id, property_id, score, responses })
    .select('id')
    .single()

  if (error) console.error('Audit save error:', error)

  // "The one thing you do best" is already the closest existing question to
  // Signature Memory — propose it as-is, no rewording needed.
  if (responses.one_thing?.trim()) {
    await proposeCompassContribution({
      userId: user.id,
      propertyId: property_id,
      field: 'signature_memory',
      suggestedValue: responses.one_thing.trim(),
      sourceModule: 'audit',
      rationale: 'From your Audit — the one thing your property does better than anywhere else',
      sourceRef: auditRow?.id ? { table: 'audits', id: auditRow.id } : undefined,
    })
  }

  let observations: CompassObservation[] = []
  try {
    const compass = await getOrCreateCompass(user.id, property_id)
    const compassContext = buildCompassContext(compass)
    const hasAuditContent =
      Object.keys(RATING_LABELS).some((key) => typeof responses[key as keyof AuditResponses] === 'number') ||
      Boolean(responses.pain_points?.trim()) ||
      Boolean(responses.one_thing?.trim())

    if (compassContext && hasAuditContent) {
      observations = await compareAuditToCompass(responses, compassContext.text)

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
    // Never let the Compass comparison break the Audit's core save/score flow.
    console.error('[audit] Compass comparison failed:', err)
  }

  return NextResponse.json({ ok: true, observations })
}
