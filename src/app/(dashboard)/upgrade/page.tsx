import type { Metadata } from 'next'
import { getUserTier } from '@/lib/get-tier'
import { isPaidPlanId } from '@/lib/plans'
import { UpgradePlans } from './client'
import type { SubscriptionTier } from '@/types'

/**
 * Upgrading, from inside the product.
 *
 * Every "Upgrade" in the app used to lead to /pricing — a public marketing
 * page with the signed-out navigation, whose buttons pointed at /signup,
 * which middleware bounces straight back to the dashboard for anyone already
 * signed in. There was no way to buy anything from within StayStory.
 *
 * This page is that way. It sits in the dashboard shell so the host stays
 * signed in and surrounded by their own navigation, and its buttons call the
 * Stripe checkout route that has been sitting unused.
 *
 * `?plan=` carries intent from elsewhere — the public pricing page sends a
 * new host through signup with it, and the auth callback hands it back after
 * their email is confirmed — so someone who chose Legendary before creating
 * an account still arrives looking at Legendary.
 */

export const metadata: Metadata = { title: 'Upgrade — StayStory' }

/**
 * The paid tiers have legacy names in the database (host, signature, legend
 * all predate "legendary"). Collapse them so the page compares like with
 * like — see TIER_RANK in get-tier.ts for the same mapping.
 */
function normaliseTier(tier: SubscriptionTier): 'free' | 'legendary' | 'portfolio' {
  if (tier === 'portfolio') return 'portfolio'
  if (tier === 'free') return 'free'
  return 'legendary'
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const requested = (await searchParams).plan
  const highlight = isPaidPlanId(typeof requested === 'string' ? requested : null)
    ? (requested as 'legendary' | 'portfolio')
    : undefined

  // The layout above this page already requires a signed-in host, so there is
  // no auth check here to drift out of step with it.
  const current = normaliseTier(await getUserTier())

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Your plan</p>
        <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground">
          {current === 'portfolio'
            ? 'You are on Portfolio.'
            : current === 'legendary'
              ? 'You are on Legendary.'
              : 'Room to go further.'}
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          {current === 'portfolio'
            ? 'Every tool, unlimited, across all your properties. Nothing left to add — manage your billing below whenever you need to.'
            : current === 'legendary'
              ? 'Everything unlimited for one property. Portfolio adds the rest of your places, and co-host access for the people who help you run them.'
              : 'You can keep going on Free for as long as you like. These plans lift the limits when the work outgrows them.'}
        </p>
      </div>

      <UpgradePlans currentTier={current} highlight={highlight} />
    </div>
  )
}
