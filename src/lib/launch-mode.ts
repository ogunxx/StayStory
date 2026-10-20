import { FOCUSED_LAUNCH_MODE } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'
import type { SubscriptionTier } from '@/types'

/**
 * Who is this host, for the purposes of the focused launch?
 *
 * The one rule. Every surface that hides something during this launch asks
 * here rather than deciding for itself, so the Dashboard, the navigation, the
 * Account page and the deeper tools can never disagree about the same person.
 *
 *   focused      — new to StayStory. Sees the four-step journey and nothing
 *                  about tiers, credits or the six-tool product.
 *   established  — has real work in the deeper tools, or is paying. Sees
 *                  everything they had. Nothing disappears from under them.
 *
 * With FOCUSED_LAUNCH_MODE off everyone is `established`, which is exactly
 * the behaviour before this launch existed.
 */

export type LaunchAudience = 'focused' | 'established'

/**
 * Pure, so the rule can be read and tested without a database.
 *
 * Paying counts as established on its own: someone who has given us money
 * must keep their billing controls and the product they bought, whatever
 * they have or haven't built yet.
 */
export function decideAudience(input: {
  hasDeeperWork: boolean
  isPaid: boolean
}): LaunchAudience {
  if (!FOCUSED_LAUNCH_MODE) return 'established'
  if (input.isPaid || input.hasDeeperWork) return 'established'
  return 'focused'
}

/**
 * Has this host done anything in the deeper system?
 *
 * Four cheap head-counts, in parallel. Deliberately user-scoped rather than
 * property-scoped: the question is "would hiding these tools take something
 * away from this person", and work on any property answers it.
 *
 * Generator rows are `suggestions` with no `kind`. The focused path's own
 * rows carry one, so they are excluded by asking for IS NULL rather than by
 * excluding each focused kind — a focused host has focused rows, and counting
 * those would make everyone established immediately.
 */
export async function hasDeeperWork(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const [generator, blueprint, stories, playbooks] = await Promise.all([
    supabase
      .from('suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('content->>kind', null),
    supabase
      .from('experience_blueprint')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase.from('guest_stories').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('playbooks').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ])

  return [generator, blueprint, stories, playbooks].some((r) => (r.count ?? 0) > 0)
}

/** The audience for this host, read from what they have actually done. */
export async function getLaunchAudience(
  userId: string,
  tier: SubscriptionTier
): Promise<LaunchAudience> {
  // Skip the queries entirely when the answer cannot depend on them.
  if (!FOCUSED_LAUNCH_MODE) return 'established'
  if (tier !== 'free') return 'established'

  return decideAudience({ hasDeeperWork: await hasDeeperWork(userId), isPaid: false })
}
