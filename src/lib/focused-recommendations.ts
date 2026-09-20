import { createClient } from '@/lib/supabase/server'
import { generateFocusedRecommendations, type FocusedRecommendation } from '@/lib/anthropic'
import { buildFocusedContext } from '@/lib/focused-context'

/**
 * Where the focused path's recommendations live.
 *
 * They reuse the existing `suggestions` table with no schema change: one
 * generation is one row, and the three recommendations sit inside the
 * existing free-form jsonb `content` column under a `kind` discriminator.
 * `kind` is what makes these rows findable, and what stops an older
 * Generator suggestion from being mistaken for a focused set.
 */

export const FOCUSED_KIND = 'focused_recommendations'

export type FocusedSet = {
  kind: typeof FOCUSED_KIND
  generated_at: string
  compass_elements_used: string[]
  audit_signal_counts: Record<string, number>
  source_audit_id: string
  recommendations: FocusedRecommendation[]
}

/** The most recent focused set for this user and property, if one exists. */
export async function findExistingSet(
  userId: string,
  propertyId: string | null
): Promise<{ id: string; content: FocusedSet; created_at: string } | null> {
  const supabase = await createClient()
  const query = supabase
    .from('suggestions')
    .select('id, content, created_at')
    .eq('user_id', userId)
    .eq('content->>kind', FOCUSED_KIND)
    .order('created_at', { ascending: false })
    .limit(1)

  const { data } = await (propertyId
    ? query.eq('property_id', propertyId)
    : query.is('property_id', null))

  return (data?.[0] as { id: string; content: FocusedSet; created_at: string } | undefined) ?? null
}

/**
 * The saved set for this property, generating one if there isn't one yet.
 *
 * Both the page and the API route call this, so "reuse before generating"
 * is decided in one place and a refresh can never produce a second set.
 */
export async function getOrCreateFocusedSet(
  userId: string,
  propertyId: string | null,
  options: { regenerate?: boolean } = {}
): Promise<
  | { ok: true; set: FocusedSet; reused: boolean }
  | { ok: false; reason: 'no_audit' | 'compass_unconfirmed' | 'too_sparse' | 'generation_failed' }
> {
  if (!options.regenerate) {
    const existing = await findExistingSet(userId, propertyId)
    if (existing) return { ok: true, set: existing.content, reused: true }
  }

  const context = await buildFocusedContext(userId, propertyId)
  if (!context.ready) return { ok: false, reason: context.reason }

  let recommendations
  try {
    recommendations = await generateFocusedRecommendations(context.text)
  } catch (err) {
    console.error('[focused] generation failed:', err)
    return { ok: false, reason: 'generation_failed' }
  }
  if (recommendations.length === 0) return { ok: false, reason: 'generation_failed' }

  const set: FocusedSet = {
    kind: FOCUSED_KIND,
    generated_at: new Date().toISOString(),
    // Traceability the same way the Generator already does it: the Compass
    // fields that actually went into the prompt, computed here rather than
    // asked of the model. Audit influence is recorded as counts per group —
    // enough to know what shaped a set, with no schema change and no
    // provenance system.
    compass_elements_used: context.compassElementsUsed,
    audit_signal_counts: {
      strengths: context.signals.strengths.length,
      friction: context.signals.friction.length,
      desired_feeling: context.signals.desiredFeeling.length,
      distinctive: context.signals.distinctive.length,
      opportunities: context.signals.opportunities.length,
    },
    source_audit_id: context.auditId,
    recommendations,
  }

  const supabase = await createClient()
  const { error } = await supabase.from('suggestions').insert({
    user_id: userId,
    property_id: propertyId,
    guest_id: null,
    level: 3,
    content: set,
  })
  if (error) console.error('[focused] could not save recommendations:', error)

  return { ok: true, set, reused: false }
}
