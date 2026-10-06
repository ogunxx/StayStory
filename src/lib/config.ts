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

// ── FOCUSED FIRST-RUN PATH ───────────────────────────────────────────────────
// Whether a brand-new host is guided along the focused path (/start) instead
// of landing straight in the full six-tool product.
//
// OFF on purpose. The path's structure exists and stages 1 and 2 work, but
// stages 3 to 5 — the three recommendations, the starter playbook and the
// feedback step — have not been built yet, so nobody should be routed into it.
// Turn this on only once those exist.
//
// This is one constant rather than a feature-flag framework because one
// boolean is all that's needed. Nothing about it is stored per user and
// nothing is user-facing; flipping it back to false fully restores today's
// behaviour with no data to unwind.
export const FOCUSED_FIRST_RUN = false

// ── FOCUSED HOMEPAGE ─────────────────────────────────────────────────────────
// Which story the public homepage tells.
//
//   true  — the focused MVP homepage: Audit → Compass → three opportunities →
//           Starter Playbook, with a bridge out to /platform for the rest.
//   false — the original full-platform homepage, exactly as it was.
//
// Both compositions are real and permanent. Nothing about the original was
// deleted or rewritten to make room for the focused one: they are two orderings
// of the same components in src/components/marketing, so flipping this restores
// the full homepage in one edit with nothing to rebuild.
//
// This is NOT the same switch as FOCUSED_FIRST_RUN above, and the two are
// deliberately kept apart:
//
//   FOCUSED_HOMEPAGE   → what a visitor sees on the public marketing site
//   FOCUSED_FIRST_RUN  → where a signed-in host is guided inside the product
//
// One can be on while the other is off. Combining them would mean the marketing
// site could not be changed without changing the product, which is not a
// relationship either of them should have.
export const FOCUSED_HOMEPAGE = true
