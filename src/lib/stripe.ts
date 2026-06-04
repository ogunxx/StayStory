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
      'Experience Audit',
      '1 designed moment/month',
      '1 preview of Experience Blueprint, Story Builder & Playbook',
      'Guest message auto-fill',
    ],
  },
  legendary: {
    name: 'Legendary',
    price: 17,
    priceId: process.env.STRIPE_LEGEND_PRICE_ID,
    features: [
      'The whole system — unlimited',
      'Custom Guest Journey Playbook',
      'Story Builder',
      'Experience Blueprint',
      'Experience Audit',
      'Priority support',
    ],
  },
} as const
