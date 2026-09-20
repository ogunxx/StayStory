import { createClient } from '@/lib/supabase/server'
import { buildCompassContext, getOrCreateCompass } from '@/lib/compass'
import { auditSignalCount, auditSignals, type AuditSignals } from '@/lib/audit-questions'

/**
 * The one place context is assembled for the focused path's recommendations.
 *
 * Three sources, all of them things StayStory already stores:
 *
 *   PROPERTY  — name, type and description from `properties`
 *   COMPASS   — via the existing buildCompassContext, the canonical
 *               serializer. No second one is defined here.
 *   AUDIT     — the most recent completed audit for this property, reduced to
 *               signals by auditSignals(). This is the connection the product
 *               audit found missing: the answers were stored and nothing read
 *               them.
 *
 * Nothing is invented. A field that isn't stored simply doesn't appear, and
 * the host is never asked to retype something the system already has.
 */

export type FocusedContext =
  | { ready: true; text: string; compassElementsUsed: string[]; signals: AuditSignals; auditId: string }
  | { ready: false; reason: 'no_audit' | 'compass_unconfirmed' | 'too_sparse' }

function section(title: string, lines: string[]): string {
  return lines.length ? `${title}\n${lines.map((l) => `- ${l}`).join('\n')}\n` : ''
}

/**
 * Assemble the context block the model receives. Pure, so the exact text can
 * be inspected without a database or an API key.
 */
export function composeFocusedContextText(input: {
  propertyLines: string[]
  compassText: string
  signals: AuditSignals
}): string {
  const { propertyLines, compassText, signals } = input
  return [
    section('THE PROPERTY', propertyLines),
    `WHERE THE EXPERIENCE IS HEADING (the host's confirmed Compass)\n${compassText}\n`,
    section('HOW THE HOST WANTS GUESTS TO FEEL', signals.desiredFeeling),
    section('WHAT IS ALREADY WORKING', signals.strengths),
    section('WHERE THE EXPERIENCE CREATES FRICTION TODAY', signals.friction),
    section('WHAT IS DISTINCTIVE ABOUT THIS PLACE', signals.distinctive),
    section('GAPS THE HOST ALREADY SEES', signals.opportunities),
  ]
    .filter(Boolean)
    .join('\n')
}

export async function buildFocusedContext(
  userId: string,
  propertyId: string | null
): Promise<FocusedContext> {
  const supabase = await createClient()

  // ── The most recent completed audit for this property ───────────────────
  const auditQuery = supabase
    .from('audits')
    .select('id, responses, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
  const { data: audits } = await (propertyId
    ? auditQuery.eq('property_id', propertyId)
    : auditQuery.is('property_id', null))

  const audit = audits?.[0]
  if (!audit) return { ready: false, reason: 'no_audit' }

  // ── The confirmed Compass ───────────────────────────────────────────────
  // buildCompassContext returns null until the Compass has been confirmed at
  // least once. That behaviour is deliberate and is left exactly as it is —
  // an unconfirmed Compass should not silently steer a recommendation.
  const compass = await getOrCreateCompass(userId, propertyId)
  const compassContext = buildCompassContext(compass)
  if (!compassContext) return { ready: false, reason: 'compass_unconfirmed' }

  const signals = auditSignals(audit.responses as Record<string, unknown>)
  if (auditSignalCount(signals) < 3) return { ready: false, reason: 'too_sparse' }

  // ── Property, only what's actually stored ───────────────────────────────
  const propertyLines: string[] = []
  if (propertyId) {
    const { data: property } = await supabase
      .from('properties')
      .select('name, type, description')
      .eq('id', propertyId)
      .eq('user_id', userId)
      .maybeSingle()
    if (property?.name) propertyLines.push(`Name: ${property.name}`)
    if (property?.type) propertyLines.push(`Type: ${property.type}`)
    if (property?.description) propertyLines.push(`Description: ${property.description}`)
  }

  const text = composeFocusedContextText({
    propertyLines,
    compassText: compassContext.text,
    signals,
  })

  return {
    ready: true,
    text,
    compassElementsUsed: compassContext.usedFields,
    signals,
    auditId: audit.id as string,
  }
}
