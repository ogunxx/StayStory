// Display prices shown across the site. Single source of truth — keep in sync
// with the Stripe PLANS amounts in src/lib/stripe.ts.
export const LEGENDARY_PRICE = '$29/mo'
export const PORTFOLIO_PRICE = '$79/mo'

// Numeric plan pricing used by the (client-side) pricing UI and homepage toggle.
// Annual is billed once for the year; the per-month figure shown for annual is
// annual / 12. Keep these in sync with the Stripe PLANS amounts in stripe.ts.
export const PLAN_PRICING = {
  legendary: { monthly: 29, annual: 290 },
  portfolio: { monthly: 79, annual: 790 },
} as const

// Cookie holding the user's active property selection. Defined here (a
// client-safe module) so both the client PropertySwitcher and the server-side
// resolver can share it without pulling server-only code into the client bundle.
export const ACTIVE_PROPERTY_COOKIE = 'active_property_id'

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
