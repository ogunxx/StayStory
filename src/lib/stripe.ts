import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2026-04-22.dahlia',
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Foundation Audit',
      '1 generator use/month',
      '1 preview of Journey Map, Story Builder & Playbook',
      'Guest message auto-fill',
    ],
  },
  legendary: {
    name: 'Legendary',
    price: 499,
    priceId: process.env.STRIPE_LEGENDARY_PRICE_ID,
    features: [
      'All five tools — unlimited',
      'Custom Guest Journey Playbook',
      'Guest Story Builder',
      'Journey Map',
      'Foundation Audit',
      '1 complimentary night at Laurel & Lore per year',
      'Priority support',
    ],
  },
} as const
