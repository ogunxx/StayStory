import { createClient } from '@/lib/supabase/server'
import { generateFocusedRecommendations, type FocusedRecommendation } from '@/lib/anthropic'
import { buildFocusedContext, type FocusedContext } from '@/lib/focused-context'

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
  /**
   * Fingerprint of the context this set was reasoned from. Absent on sets
   * written before staleness existed — those fall back to comparing the audit
   * id alone. A new key inside the existing jsonb column, not a new column.
   */
  source_fingerprint?: string
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
 * Whether a saved set was reasoned from context that has since changed.
 *
 * Pure, so the rule can be read and tested without a database.
 *
 * Deliberately conservative: it only says "stale" when it can see that the
 * context genuinely differs. If the context can't be rebuilt right now (the
 * Compass has been un-confirmed, say), the host keeps their recommendations
 * and is not nagged to regenerate — nothing has been shown to have changed.
 * A set written before fingerprints existed falls back to the audit id, which
 * still catches the case that prompted this: redoing the Audit.
 */
export function isStale(set: FocusedSet, context: FocusedContext): boolean {
  if (!context.ready) return false

  if (set.source_fingerprint) return set.source_fingerprint !== context.fingerprint

  return Boolean(set.source_audit_id) && set.source_audit_id !== context.auditId
}

/**
 * Whether a focused set exists at all, without pulling its contents back.
 *
 * The Dashboard and the focused path both need this to decide what a host
 * should do next, and both get it from here so the `kind` predicate that
 * identifies these rows is written in exactly one place.
 */
export async function hasFocusedSet(userId: string, propertyId: string | null): Promise<boolean> {
  const supabase = await createClient()
  const query = supabase
    .from('suggestions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('content->>kind', FOCUSED_KIND)

  const { count } = await (propertyId
    ? query.eq('property_id', propertyId)
    : query.is('property_id', null))

  return (count ?? 0) > 0
}

/**
 * How many Generator suggestions this host has created since `sinceIso`,
 * not counting focused recommendation sets.
 *
 * Focused sets share the `suggestions` table but are not Generator work, so a
 * host walking the focused path shouldn't quietly spend a monthly credit on
 * them. Counted as "everything minus focused" rather than with a `neq` filter,
 * because `content->>kind` is null on every Generator row and `null <> 'x'` is
 * null in SQL — a neq would silently exclude exactly the rows we want.
 *
 * Both the limit check in /api/generate and the figure shown on the Dashboard
 * come from here, so they can't drift apart.
 */
export async function countGeneratorUsageSince(
  userId: string,
  sinceIso: string
): Promise<number> {
  const supabase = await createClient()
  const base = () =>
    supabase
      .from('suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', sinceIso)

  const [all, focused] = await Promise.all([
    base(),
    base().eq('content->>kind', FOCUSED_KIND),
  ])

  return Math.max(0, (all.count ?? 0) - (focused.count ?? 0))
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
  | { ok: true; set: FocusedSet; reused: boolean; stale: boolean }
  | { ok: false; reason: 'no_audit' | 'compass_unconfirmed' | 'too_sparse' | 'generation_failed' }
> {
  const context = await buildFocusedContext(userId, propertyId)

  if (!options.regenerate) {
    const existing = await findExistingSet(userId, propertyId)
    if (existing) {
      return { ok: true, set: existing.content, reused: true, stale: isStale(existing.content, context) }
    }
  }

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
      host_notes: context.signals.hostNotes.length,
    },
    source_audit_id: context.auditId,
    source_fingerprint: context.fingerprint,
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

  // A fresh set is by definition current. The row just written is the newest,
  // and findExistingSet takes the newest, so it supersedes the old one for
  // Stage 3 without anything being deleted.
  return { ok: true, set, reused: false, stale: false }
}
