import Stripe from 'stripe'
import { PLAN_PRICING } from '@/lib/config'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2026-04-22.dahlia',
    })
  }
  return stripeInstance
}

export type BillingInterval = 'monthly' | 'annual'

export const PLANS = {
  free: {
    name: 'Free',
    monthly: 0,
    annual: 0,
    priceIds: {
      monthly: null as string | null | undefined,
      annual: null as string | null | undefined,
    },
    features: [
      'Build & edit your Experience Blueprint',
      'Experience Audit',
      'A taste of the Experience Generator',
      'Guest message auto-fill',
    ],
  },
  legendary: {
    name: 'Legendary',
    monthly: PLAN_PRICING.legendary.monthly,
    annual: PLAN_PRICING.legendary.annual,
    priceIds: {
      monthly: process.env.STRIPE_LEGEND_PRICE_ID,
      annual: process.env.STRIPE_LEGEND_ANNUAL_PRICE_ID,
    },
    features: [
      'Everything in Free',
      'Unlimited moments',
      'Advanced customization',
      'Saved blueprint variations',
      'Enhanced outputs',
      'Custom Guest Journey Playbook',
      'Priority support',
    ],
  },
  portfolio: {
    name: 'Portfolio',
    monthly: PLAN_PRICING.portfolio.monthly,
    annual: PLAN_PRICING.portfolio.annual,
    priceIds: {
      monthly: process.env.STRIPE_PORTFOLIO_PRICE_ID,
      annual: process.env.STRIPE_PORTFOLIO_ANNUAL_PRICE_ID,
    },
    features: [
      'Everything in Legendary',
      'Up to 5 properties',
      'A blueprint & playbook per property',
      'Co-host team access',
      'Priority support + onboarding',
    ],
  },
} as const

/**
 * Does the Stripe price we are about to charge match the plan we are selling?
 *
 * Which price a plan maps to is decided entirely by an environment variable,
 * and nothing checked that the variable held what its name claimed. A
 * Portfolio price sitting in STRIPE_LEGEND_PRICE_ID sends a host who chose
 * Legendary to a Portfolio checkout, at the Portfolio price, with every screen
 * around them still saying Legendary. That is not a hypothetical.
 *
 * The amount and the billing period are what the host is agreeing to, so they
 * are what gets compared. Pure, and separate from the route, so the rule can
 * be tested without Stripe.
 *
 * Returns null when the price is right, or the discrepancy when it is not.
 */
export type PriceMismatch = {
  expectedAmount: number
  actualAmount: number | null
  expectedInterval: 'month' | 'year'
  actualInterval: string | null
}

export function findPriceMismatch(
  price: { unit_amount: number | null; recurring?: { interval: string } | null },
  plan: { monthly: number; annual: number },
  interval: BillingInterval
): PriceMismatch | null {
  // Stripe holds amounts in the currency's smallest unit; our plans are whole
  // dollars.
  const expectedAmount = (interval === 'annual' ? plan.annual : plan.monthly) * 100
  const expectedInterval = interval === 'annual' ? 'year' : 'month'
  const actualInterval = price.recurring?.interval ?? null

  if (price.unit_amount === expectedAmount && actualInterval === expectedInterval) return null

  return {
    expectedAmount,
    actualAmount: price.unit_amount,
    expectedInterval,
    actualInterval,
  }
}
