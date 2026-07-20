import Stripe from 'stripe'

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
    monthly: 29,
    annual: 290,
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
    monthly: 79,
    annual: 790,
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
