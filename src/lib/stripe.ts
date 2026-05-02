import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Foundation Audit',
      '3 generator uses/month',
      'Basic shopping lists',
    ],
  },
  host: {
    name: 'Host',
    price: 12,
    priceId: process.env.STRIPE_HOST_PRICE_ID,
    features: [
      'Unlimited generator',
      'Shopping lists',
      'All message templates',
      'Seasonal experience ideas',
      'Touchpoint journey map',
    ],
  },
  signature: {
    name: 'Signature',
    price: 29,
    priceId: process.env.STRIPE_SIGNATURE_PRICE_ID,
    features: [
      'Everything in Host',
      'Guest Story Builder',
      'Brand voice & listing copy',
      'Experience map',
      'Social captions',
    ],
  },
  legend: {
    name: 'Legend',
    price: 79,
    priceId: process.env.STRIPE_LEGEND_PRICE_ID,
    features: [
      'Everything in Signature',
      'Done-with-you experience design',
      'Property audit call',
      'Custom guest journey playbook',
      'Priority support',
    ],
  },
} as const
