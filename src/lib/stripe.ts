import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
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
    price: 17,
    priceId: process.env.STRIPE_LEGENDARY_PRICE_ID,
    features: [
      'All five tools — unlimited',
      'Custom Guest Journey Playbook',
      'Guest Story Builder',
      'Journey Map',
      'Foundation Audit',
      'Priority support',
    ],
  },
} as const
