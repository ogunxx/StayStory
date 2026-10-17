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
// ON. Stages 1 to 4 — the Audit, the Compass, the three recommendations and
// the Starter Playbook — are built and are what the public homepage promises,
// so landing a new host in the full six-tool Dashboard contradicts the page
// they arrived from. Stage 5 (Feedback) is still unbuilt; the routing does
// not depend on it.
//
// Who this applies to is JourneyState.isNewHost — a host with nothing stored
// at all. Any single piece of saved work ends it, so the detour happens at
// most once, and /dashboard?full=1 skips it outright. An established host is
// never affected.
//
// This is one constant rather than a feature-flag framework because one
// boolean is all that's needed. Nothing about it is stored per user and
// nothing is user-facing; flipping it back to false fully restores the old
// behaviour with no data to unwind.
export const FOCUSED_FIRST_RUN = true

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

// ── FOCUSED FREE LAUNCH ──────────────────────────────────────────────────────
// Whether signup offers the paid plan as a starting point.
//
//   true  — signup is about starting the Audit, and nothing on it invites a
//           brand-new host into a checkout before they have used anything.
//   false — the "Sign up as Legendary" route is offered again at signup.
//
// Worth being exact about what this does NOT do, because the name could
// suggest otherwise: it grants nothing and unlocks nothing. The focused
// journey was never behind a paywall. The Audit, the Compass, the three
// recommendations and their API routes contain no tier check, middleware has
// no subscription gate, and the Free plan already exists on the Pricing page.
// Every link in the app points at plain /signup, which has always read "Free
// to start, no card needed".
//
// The only way to reach the $29 screen was a link on the signup page offering
// it. This decides whether that link is there. Stripe, the Legendary plan, the
// /signup?plan=legendary flow and the checkout redirect in the auth callback
// are all untouched and still work — they are simply not advertised to someone
// who has not yet seen what StayStory does.
export const FOCUSED_FREE_LAUNCH = true

// ── FOCUSED_LAUNCH_MODE ─────────────────────────────────────────────────────
//
// Whether the product SHELL presents only what this launch is actually
// offering. The other three switches each own one decision; this one owns
// what an ordinary host can stumble into.
//
//   FOCUSED_HOMEPAGE    which homepage composition the public sees
//   FOCUSED_FIRST_RUN   where a brand-new host lands after signing up
//   FOCUSED_FREE_LAUNCH whether signup offers the paid plan
//   FOCUSED_LAUNCH_MODE what the rest of the shell shows while we launch free
//
// ON. The focused launch is free, and a host who was promised four steps
// should not click Pricing and meet a $29 tier comparison, or open their
// Dashboard and be told they have "1 free generation" left — a phrase that
// means nothing until you know what the Generator is.
//
// This hides and contextualises. It changes no backend behaviour, no limits
// and no billing. Every component it hides still exists and returns when this
// is false. Generator cost controls are untouched: see FREE_MONTHLY_LIMIT in
// /api/generate, which is enforced regardless of what the UI advertises.
//
// Who it applies to is decided in one place — see launchAudience in
// src/lib/launch-mode.ts. A host with real work in the deeper tools, or who
// is paying, is never shown less than they had.
export const FOCUSED_LAUNCH_MODE = true
