/**
 * Getting someone to Stripe's billing portal — and what to tell them when
 * they can't get there.
 *
 * ┌─ WHY THE FAILING PATH IS THE IMPORTANT ONE ────────────────────────────┐
 * │ The portal is how a host cancels. Someone clicking it has, more often  │
 * │ than not, decided to stop paying us. That is the worst possible moment │
 * │ to show them a crash, a raw JSON blob, or nothing at all: it reads as  │
 * │ a company making itself hard to leave.                                 │
 * │                                                                        │
 * │ The button is a plain <form method="post">, so the browser NAVIGATES   │
 * │ to the route. Anything the route returns is rendered as a page. A      │
 * │ JSON error becomes {"error":"..."} on a blank screen. So every outcome │
 * │ here has to be a redirect, never a response body.                      │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * Pure on purpose, so the decisions can be tested without Stripe, a request
 * or a browser. Same reasoning as refunds.ts and auth-redirects.ts.
 */

/** Why someone was sent back to their account instead of to Stripe. */
export type PortalNotice = 'no_subscription' | 'unavailable'

/**
 * What each notice says.
 *
 * Both of these are read by someone who tried to manage their money and
 * didn't get there, so both say plainly that nothing has changed, and both
 * leave a way to reach a person. Neither mentions Stripe's internals or the
 * word "error" — what the reader needs is the state of their subscription
 * and a next step.
 */
export const PORTAL_NOTICES: Record<PortalNotice, string> = {
  no_subscription:
    'There is no active subscription attached to this account, so there is nothing to manage here yet. Nothing has been charged or changed. If that does not sound right, email us and we will look into it.',
  unavailable:
    'We could not open the billing portal just now. Your subscription has not changed, and nothing has been charged. Please try again in a moment — or email us and we will cancel or amend it for you by hand.',
}

export function isPortalNotice(value: string | null | undefined): value is PortalNotice {
  return value === 'no_subscription' || value === 'unavailable'
}

/**
 * The origin to build return URLs from.
 *
 * NEXT_PUBLIC_APP_URL is set for production only, so on a preview deployment
 * it is absent and the configured value interpolated into a URL once produced
 * the literal string "undefined/dashboard…", which Stripe rejected outright.
 * The checkout route already falls back to the origin the request arrived on;
 * this is the same fallback, extracted so both can share one answer.
 *
 * An empty or whitespace value counts as unset — `??` alone would pass it
 * through — and so does the string "undefined", which is what a template
 * literal leaves behind when the variable is missing.
 */
export function resolveAppUrl(configured: string | undefined | null, requestUrl: string): string {
  const trimmed = configured?.trim()
  if (trimmed && trimmed !== 'undefined' && trimmed !== 'null') {
    try {
      return new URL(trimmed).origin
    } catch {
      // Configured but unusable. Fall through to the request's own origin
      // rather than building a URL Stripe will refuse.
    }
  }
  return new URL(requestUrl).origin
}

/** Where to send someone back to, carrying the reason they didn't get to Stripe. */
export function accountUrlWithNotice(appUrl: string, notice: PortalNotice): string {
  const url = new URL('/account', appUrl)
  url.searchParams.set('billing', notice)
  return url.toString()
}
