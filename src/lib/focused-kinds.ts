/**
 * The discriminators that mark a `suggestions` row as focused-path work.
 *
 * The focused path stores its output in the existing `suggestions` table
 * rather than adding tables, which is cheap and property-scoped — but it
 * means every query that assumed "a suggestions row is a Guest Moment" is
 * now wrong unless it says otherwise.
 *
 * There are exactly two such queries, and both read this list rather than
 * naming kinds themselves:
 *
 *   - countGeneratorUsageSince, so focused work never spends a free host's
 *     monthly Generator credit
 *   - the History page, so focused rows don't render as blank moment cards
 *
 * Adding a third focused kind therefore means adding it here and nowhere
 * else. That is the entire reason this module exists separately: the first
 * version of this list was a single constant beside the recommendations, and
 * a second kind would have silently started charging hosts for playbooks.
 *
 * Pure and client-safe — no server imports — so any layer can read it.
 */

/** Stage 3: the three personalized opportunities. */
export const FOCUSED_RECOMMENDATIONS_KIND = 'focused_recommendations'

/** Stage 4: the Starter Playbook built from those three. */
export const FOCUSED_STARTER_PLAYBOOK_KIND = 'focused_starter_playbook'

/** Every kind that is focused-path work rather than a Guest Moment. */
export const FOCUSED_KINDS = [
  FOCUSED_RECOMMENDATIONS_KIND,
  FOCUSED_STARTER_PLAYBOOK_KIND,
] as const

export type FocusedKind = (typeof FOCUSED_KINDS)[number]

/**
 * Whether a stored row's `content.kind` marks it as focused-path work.
 *
 * Takes unknown because it is read off free-form jsonb, where the value may
 * legitimately be absent — every Generator row has no `kind` at all.
 */
export function isFocusedKind(kind: unknown): kind is FocusedKind {
  return typeof kind === 'string' && (FOCUSED_KINDS as readonly string[]).includes(kind)
}
