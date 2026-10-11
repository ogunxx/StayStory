import { PLAN_PRICING } from '@/lib/config'

/**
 * The plans, once.
 *
 * Both the public pricing page and the in-app upgrade screen read from here,
 * so the two can never describe the same plan differently. Prices come from
 * PLAN_PRICING, which is kept in step with Stripe.
 *
 * Client-safe on purpose — no server imports — so a 'use client' component
 * can import it directly.
 */

export type PlanId = 'free' | 'legendary' | 'portfolio'

export type Plan = {
  id: PlanId
  name: string
  promise: string
  /** Whole dollars per month, billed monthly. */
  monthly: number
  /** Whole dollars billed once a year. 0 means the plan is free. */
  annual: number
  includes: string[]
  /** What the button says on the public pricing page. */
  ctaLabel: string
  /** Where that button goes on the public pricing page. */
  ctaHref: string
  /** One plan carries the badge and the emphasised frame. */
  featured?: boolean
  badge?: string
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    promise: 'Start seeing your stay the way your guests do.',
    monthly: 0,
    annual: 0,
    includes: [
      'One property',
      'Build and edit your Experience Blueprint',
      'Run an Experience Audit',
      'A first taste of the Generator',
    ],
    ctaLabel: 'Start free',
    ctaHref: '/signup',
  },
  {
    id: 'legendary',
    name: 'Legendary',
    promise: 'The whole system, unlimited — for the place you pour yourself into.',
    monthly: PLAN_PRICING.legendary.monthly,
    annual: PLAN_PRICING.legendary.annual,
    includes: [
      'Everything in Free, without limits',
      'Unlimited moments, audits and stories',
      'Saved blueprint variations',
      'Your full Guest Journey Playbook',
      'Priority support',
    ],
    // Not "Start Free". This plan costs money, and a button that says
    // otherwise is a false claim about what happens when you press it.
    ctaLabel: 'Choose Legendary',
    ctaHref: '/signup?plan=legendary',
    featured: true,
    badge: 'Most loved',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    promise: 'Everything in Legendary — across every place you host.',
    monthly: PLAN_PRICING.portfolio.monthly,
    annual: PLAN_PRICING.portfolio.annual,
    includes: [
      'Everything in Legendary',
      'Up to five properties, each with its own blueprint',
      'Co-host and team access',
      'Priority support and onboarding',
    ],
    ctaLabel: 'Choose Portfolio',
    ctaHref: '/signup?plan=portfolio',
  },
]

/** The plans that are actually bought. The free plan is not a purchase. */
export const PAID_PLANS = PLANS.filter((p) => p.id !== 'free')

export function isPaidPlanId(value: string | null | undefined): value is 'legendary' | 'portfolio' {
  return value === 'legendary' || value === 'portfolio'
}

export function planById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id)
}
