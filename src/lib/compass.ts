import { createClient } from '@/lib/supabase/server'
import { COMPASS_FIELDS } from '@/lib/compass-fields'
import type { CompassContribution, CompassField, CompassFieldProvenance, ExperienceCompass } from '@/types'

const IDENTITY_FIELD_LABELS: Record<CompassField, string> = {
  wonder: 'Your Wonder',
  purpose: 'Your Purpose',
  story: 'Your Story',
  transformation_arrive: 'Guests arrive feeling',
  transformation_leave: 'Guests leave feeling',
  hospitality_promise: 'Your Hospitality Promise',
  signature_memory: 'Your Signature Memory',
  story_theyll_tell: "The Story They'll Tell",
}

/** Fetch the compass for this property (or the unassigned one), creating a blank row on first use. */
export async function getOrCreateCompass(
  userId: string,
  propertyId: string | null
): Promise<ExperienceCompass> {
  const supabase = await createClient()

  let query = supabase.from('experience_compass').select('*').eq('user_id', userId)
  query = propertyId ? query.eq('property_id', propertyId) : query.is('property_id', null)

  const { data: existing } = await query.maybeSingle()
  if (existing) return existing as ExperienceCompass

  const { data: created, error } = await supabase
    .from('experience_compass')
    .insert({ user_id: userId, property_id: propertyId })
    .select('*')
    .single()

  if (created) return created as ExperienceCompass

  // Lost a race with a concurrent first-create (unique index violation) — re-select.
  if (error?.code === '23505') {
    let retryQuery = supabase.from('experience_compass').select('*').eq('user_id', userId)
    retryQuery = propertyId ? retryQuery.eq('property_id', propertyId) : retryQuery.is('property_id', null)
    const { data: retried } = await retryQuery.single()
    if (retried) return retried as ExperienceCompass
  }

  throw new Error(error?.message ?? 'Could not load your Experience Compass.')
}

export async function getPendingContributions(compassId: string): Promise<CompassContribution[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('compass_contributions')
    .select('*')
    .eq('compass_id', compassId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return (data ?? []) as CompassContribution[]
}

/**
 * Format the Compass into the labeled block the OS doc's own example uses
 * ("Your Purpose is...", "Your Hospitality Promise is...") for injection into
 * AI prompts. Returns null unless the Compass has been confirmed at least
 * once — an unconfirmed draft should never silently steer a recommendation.
 * `usedFields` is computed here (not asked of the model) so the "informed by"
 * trace shown to hosts can't hallucinate a field that wasn't actually included.
 */
export function buildCompassContext(
  compass: ExperienceCompass | null
): { text: string; usedFields: CompassField[] } | null {
  if (!compass || !compass.confirmed_at) return null

  const lines: string[] = []
  const usedFields: CompassField[] = []

  for (const { field } of COMPASS_FIELDS) {
    if (field === 'transformation_leave') continue // combined with transformation_arrive below
    const value = compass[field]
    if (!value) continue

    if (field === 'transformation_arrive') {
      const leave = compass.transformation_leave
      if (leave) {
        lines.push(`Transformation: guests arrive feeling ${value}, and leave feeling ${leave}.`)
        usedFields.push('transformation_arrive', 'transformation_leave')
        continue
      }
    }

    lines.push(`${IDENTITY_FIELD_LABELS[field]} is ${value}.`)
    usedFields.push(field)
  }

  if (lines.length === 0) return null

  return {
    text: `This host's Experience Compass — the meaning behind their property, use it to ground your recommendation:\n${lines.join('\n')}`,
    usedFields,
  }
}

/** Compute the Compass's next status given a field is being applied right now. */
function nextStatus(current: ExperienceCompass['status'], confirmedAt: string | null): ExperienceCompass['status'] {
  if (confirmedAt) return 'evolving'
  if (current === 'preliminary') return 'developing'
  return current
}

/** Single place every field mutation flows through, so status/provenance can't drift between code paths. */
async function applyFieldChange(
  compass: ExperienceCompass,
  field: CompassField,
  value: string,
  contributionId: string,
  sourceModule: string
): Promise<ExperienceCompass> {
  const supabase = await createClient()

  const provenance: CompassFieldProvenance = {
    source_module: sourceModule,
    contribution_id: contributionId,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('experience_compass')
    .update({
      [field]: value,
      field_provenance: { ...compass.field_provenance, [field]: provenance },
      status: nextStatus(compass.status, compass.confirmed_at),
      updated_at: new Date().toISOString(),
    })
    .eq('id', compass.id)
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Could not update your Experience Compass.')
  return data as ExperienceCompass
}

/**
 * Propose a suggested field value from another module (Story Builder, Audit, ...).
 * Best-effort: never throws — a Compass write failure must never break the
 * feature that's calling it.
 */
export async function proposeCompassContribution(input: {
  userId: string
  propertyId: string | null
  field: CompassField
  suggestedValue: string
  sourceModule: string
  rationale?: string
  sourceRef?: Record<string, unknown>
}): Promise<void> {
  try {
    const compass = await getOrCreateCompass(input.userId, input.propertyId)
    const supabase = await createClient()
    await supabase.from('compass_contributions').insert({
      compass_id: compass.id,
      user_id: input.userId,
      property_id: input.propertyId,
      field: input.field,
      suggested_value: input.suggestedValue,
      source_module: input.sourceModule,
      source_ref: input.sourceRef ?? null,
      rationale: input.rationale ?? null,
      status: 'pending',
    })
  } catch (err) {
    console.error('[compass] proposeCompassContribution failed:', err)
  }
}

/** Direct host edit — applied immediately, recorded as an already-accepted contribution. */
export async function updateCompassField(input: {
  userId: string
  propertyId: string | null
  field: CompassField
  value: string
}): Promise<ExperienceCompass> {
  const supabase = await createClient()
  const compass = await getOrCreateCompass(input.userId, input.propertyId)

  const { data: contribution, error } = await supabase
    .from('compass_contributions')
    .insert({
      compass_id: compass.id,
      user_id: input.userId,
      property_id: input.propertyId,
      field: input.field,
      suggested_value: input.value,
      source_module: 'host',
      status: 'accepted',
      reviewed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !contribution) throw new Error(error?.message ?? 'Could not save your change.')

  return applyFieldChange(compass, input.field, input.value, contribution.id, 'host')
}

/** Accept or reject a pending suggestion. Accepting may use an edited value instead of the original. */
export async function reviewContribution(input: {
  userId: string
  contributionId: string
  decision: 'accept' | 'reject'
  editedValue?: string
}): Promise<ExperienceCompass> {
  const supabase = await createClient()

  const { data: contribution, error: fetchError } = await supabase
    .from('compass_contributions')
    .select('*')
    .eq('id', input.contributionId)
    .eq('user_id', input.userId)
    .single()

  if (fetchError || !contribution) throw new Error('Contribution not found.')

  const { data: compassRow, error: compassError } = await supabase
    .from('experience_compass')
    .select('*')
    .eq('id', contribution.compass_id)
    .eq('user_id', input.userId)
    .single()

  if (compassError || !compassRow) throw new Error('Compass not found.')
  const compass = compassRow as ExperienceCompass

  await supabase
    .from('compass_contributions')
    .update({ status: input.decision === 'accept' ? 'accepted' : 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', input.contributionId)

  if (input.decision === 'reject') return compass

  const value = (input.editedValue ?? contribution.suggested_value) as string
  return applyFieldChange(compass, contribution.field as CompassField, value, contribution.id, contribution.source_module)
}

/** Mark the Compass confirmed (or re-confirmed, if already evolving). */
export async function confirmCompass(userId: string, propertyId: string | null): Promise<ExperienceCompass> {
  const supabase = await createClient()
  const compass = await getOrCreateCompass(userId, propertyId)

  const { data, error } = await supabase
    .from('experience_compass')
    .update({
      status: 'confirmed',
      confirmed_at: compass.confirmed_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', compass.id)
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Could not confirm your Experience Compass.')
  return data as ExperienceCompass
}
