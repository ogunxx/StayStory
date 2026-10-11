import { createClient } from '@/lib/supabase/server'
import { generateStarterPlaybook, type StarterPlaybook } from '@/lib/anthropic'
import { buildFocusedContext } from '@/lib/focused-context'
import { findExistingSet, isStale } from '@/lib/focused-recommendations'
import { FOCUSED_STARTER_PLAYBOOK_KIND } from '@/lib/focused-kinds'

/**
 * Stage 4 of the focused path: the Starter Playbook.
 *
 * ── Where it lives ────────────────────────────────────────────────────────
 *
 * The existing `suggestions` table, one row per playbook, under a `kind`
 * discriminator — exactly how the focused recommendations are stored. No
 * schema change.
 *
 * Not the `playbooks` table, despite the name. That table belongs to the full
 * Guest Journey Playbook at /legend, which is a different product with a
 * different shape (property_name, executive_summary as columns). More to the
 * point, journey-state reads it per user with no property filter, so a
 * playbook written for one property is counted for all of them. Putting
 * Stage 4 there would inherit that bug. `suggestions` carries property_id and
 * every focused query already scopes to it.
 *
 * ── What makes it current ─────────────────────────────────────────────────
 *
 * Two different kinds of staleness, and conflating them would break the
 * chain:
 *
 *   Audit/Compass → recommendations → Starter Playbook
 *
 * A playbook is stale when the *recommendations moved on* — tracked by the id
 * of the recommendation row it was built from, which is exact and survives
 * rewording. Separately, the recommendations themselves can be stale because
 * the Audit or Compass changed. Building a "current" playbook on top of stale
 * recommendations would produce something that looks fresh and isn't, so that
 * case is refused and the host is sent to refresh the recommendations first.
 */

export type StarterPlaybookRecord = StarterPlaybook & {
  kind: typeof FOCUSED_STARTER_PLAYBOOK_KIND
  generated_at: string
  /**
   * The `suggestions` row id of the recommendation set this was built from.
   * Provenance by identity, not by timestamp — a regenerated set is a new
   * row, so this changes exactly when the source changes and never because
   * something was merely re-saved.
   */
  source_set_id: string
  /** The opportunity titles as they stood, so drift is visible if it happens. */
  source_recommendation_titles: string[]
  compass_elements_used: string[]
}

export type PlaybookBlocker =
  | 'no_audit'
  | 'compass_unconfirmed'
  | 'too_sparse'
  | 'no_recommendations'
  | 'recommendations_stale'
  | 'generation_failed'

export type PlaybookState = {
  exists: boolean
  /** The saved playbook was built from an older recommendation set. */
  stale: boolean
  /** Recommendations exist for this property at all. */
  recommendationsExist: boolean
  /** The recommendations themselves predate an Audit or Compass change. */
  recommendationsStale: boolean
}

/** The most recent Starter Playbook for this user and property. */
export async function findExistingPlaybook(
  userId: string,
  propertyId: string | null
): Promise<{ id: string; content: StarterPlaybookRecord; created_at: string } | null> {
  const supabase = await createClient()
  const query = supabase
    .from('suggestions')
    .select('id, content, created_at')
    .eq('user_id', userId)
    .eq('content->>kind', FOCUSED_STARTER_PLAYBOOK_KIND)
    .order('created_at', { ascending: false })
    .limit(1)

  const { data } = await (propertyId
    ? query.eq('property_id', propertyId)
    : query.is('property_id', null))

  return (
    (data?.[0] as { id: string; content: StarterPlaybookRecord; created_at: string } | undefined) ??
    null
  )
}

/**
 * Everything a caller needs to decide what to offer, in one read.
 *
 * Used by /start, the Dashboard and the playbook page itself, so all three
 * describe the same situation. Scoped to the active property throughout.
 */
export async function getStarterPlaybookState(
  userId: string,
  propertyId: string | null
): Promise<PlaybookState> {
  const [playbook, recommendations] = await Promise.all([
    findExistingPlaybook(userId, propertyId),
    findExistingSet(userId, propertyId),
  ])

  if (!recommendations) {
    return {
      exists: Boolean(playbook),
      stale: false,
      recommendationsExist: false,
      recommendationsStale: false,
    }
  }

  const context = await buildFocusedContext(userId, propertyId)
  const recommendationsStale = isStale(recommendations.content, context)

  return {
    exists: Boolean(playbook),
    // Built from a recommendation set that is no longer the current one.
    stale: Boolean(playbook) && playbook!.content.source_set_id !== recommendations.id,
    recommendationsExist: true,
    recommendationsStale,
  }
}

/** Read only. Never generates — see createStarterPlaybook. */
export async function getStarterPlaybook(
  userId: string,
  propertyId: string | null
): Promise<{ playbook: StarterPlaybookRecord | null; state: PlaybookState }> {
  const [existing, state] = await Promise.all([
    findExistingPlaybook(userId, propertyId),
    getStarterPlaybookState(userId, propertyId),
  ])
  return { playbook: existing?.content ?? null, state }
}

/**
 * Build a Starter Playbook from the current recommendations.
 *
 * Separate from the read on purpose. The page only ever reads, so loading or
 * refreshing /start/playbook can never spend a model call — generation
 * happens solely when a host presses the button and the API route calls this.
 *
 * Previous playbooks are never deleted. A new one is a new row, and
 * findExistingPlaybook takes the newest, so the latest becomes current while
 * the old one remains in place.
 */
export async function createStarterPlaybook(
  userId: string,
  propertyId: string | null
): Promise<
  { ok: true; playbook: StarterPlaybookRecord } | { ok: false; reason: PlaybookBlocker }
> {
  const recommendations = await findExistingSet(userId, propertyId)
  if (!recommendations) return { ok: false, reason: 'no_recommendations' }

  const context = await buildFocusedContext(userId, propertyId)
  if (!context.ready) return { ok: false, reason: context.reason }

  // The chain has to stay coherent. A playbook built on recommendations that
  // predate an Audit or Compass change would present itself as current while
  // developing superseded ideas, so refuse and let the host refresh Stage 3.
  if (isStale(recommendations.content, context)) {
    return { ok: false, reason: 'recommendations_stale' }
  }

  const sourceRecommendations = recommendations.content.recommendations
  if (sourceRecommendations.length === 0) return { ok: false, reason: 'no_recommendations' }

  let generated
  try {
    generated = await generateStarterPlaybook(context.text, sourceRecommendations)
  } catch (err) {
    console.error('[focused] starter playbook generation failed:', err)
    return { ok: false, reason: 'generation_failed' }
  }
  if (!generated || generated.sections.length === 0) {
    return { ok: false, reason: 'generation_failed' }
  }

  const playbook: StarterPlaybookRecord = {
    kind: FOCUSED_STARTER_PLAYBOOK_KIND,
    generated_at: new Date().toISOString(),
    direction: generated.direction,
    sections: generated.sections,
    source_set_id: recommendations.id,
    source_recommendation_titles: sourceRecommendations.map((r) => r.title),
    compass_elements_used: context.compassElementsUsed,
  }

  const supabase = await createClient()
  const { error } = await supabase.from('suggestions').insert({
    user_id: userId,
    property_id: propertyId,
    guest_id: null,
    level: 4,
    content: playbook,
  })
  if (error) console.error('[focused] could not save starter playbook:', error)

  return { ok: true, playbook }
}
