// Display prices shown across the site. Single source of truth — keep in sync
// with the Stripe PLANS amounts in src/lib/stripe.ts.
export const LEGENDARY_PRICE = '$29/mo'
export const PORTFOLIO_PRICE = '$79/mo'

// Everyone can build & edit their Experience Blueprint. Free accounts get a
// taste of idea generation; paid plans (Legendary, Portfolio) are unlimited.
export const FREE_BLUEPRINT_GENERATIONS = 3

// How many properties each tier can run. Free & Legendary focus on one place;
// Portfolio scales across many.
export const PROPERTY_LIMITS: Record<string, number> = {
  free: 1,
  host: 1,
  signature: 1,
  legend: 1,
  legendary: 1,
  portfolio: 5,
}
