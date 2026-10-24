/**
 * Where email links come back to, and what to say when one doesn't work.
 *
 * Confirming a new account and resetting a password are different journeys
 * that share a single callback route, because Supabase gives that route no
 * way to tell them apart — a confirmation link and a recovery link both
 * arrive with nothing but a `code`. The sender says which is which by adding
 * a key to its own redirect URL, and this module owns both halves of that
 * convention so they cannot drift.
 *
 * ┌─ WHY THE FAILING PATH MATTERS AS MUCH AS THE HAPPY ONE ────────────────┐
 * │ The exchange fails whenever the link is opened somewhere other than    │
 * │ the browser that asked for it, because the PKCE verifier is a cookie   │
 * │ in that browser. For a confirmation that is uncommon — people sign up  │
 * │ and confirm in one sitting. For a password reset it is the ordinary    │
 * │ case: you ask on a laptop and open the mail on your phone.             │
 * │                                                                        │
 * │ So the callback must carry the journey into the failure, or someone    │
 * │ resetting a password is told to go and sign up instead — which is      │
 * │ what used to happen, and is why the flow looked broken.                │
 * └────────────────────────────────────────────────────────────────────────┘
 */

/** The one route every email link returns to. */
export const CALLBACK_PATH = '/api/auth/callback'

/**
 * The value of `?next=` that marks a link as a password reset.
 *
 * A key, never a path. It comes off a query string, and anything that turned
 * a query string into a redirect target would be an open redirect: a link
 * that reads as staystory.co and lands somewhere else.
 */
export const RECOVERY_KEY = 'reset'

/** Every destination a `next` key may resolve to. Nothing else is reachable. */
export const DESTINATIONS: Record<string, string> = {
  [RECOVERY_KEY]: '/reset-password',
}

/** Which journey a link belongs to, read from its own `next` key. */
export type AuthJourney = 'confirm' | 'recover'

export function journeyFor(next: string | null | undefined): AuthJourney {
  return next === RECOVERY_KEY ? 'recover' : 'confirm'
}

/**
 * Why a link didn't work. `expired` is a link that timed out or was already
 * used; `invalid` covers everything else, overwhelmingly "opened in a
 * different browser from the one that asked".
 */
export type LinkFailure = 'expired' | 'invalid'

/**
 * The notice key the login page should show. Four keys rather than two,
 * because the right next step differs: a confirmation that failed wants a
 * fresh signup, a reset that failed wants a fresh reset link.
 */
export function noticeKey(journey: AuthJourney, failure: LinkFailure): string {
  if (journey === 'recover') {
    return failure === 'expired' ? 'reset_expired' : 'reset_invalid'
  }
  return failure === 'expired' ? 'link_expired' : 'link_invalid'
}

/**
 * Supabase reports a dead link in the query string on some paths and in the
 * URL fragment on others. A fragment never reaches the server, so the only
 * place both can be read is the browser — see the reset page.
 */
export function failureFromParams(params: {
  error?: string | null
  errorCode?: string | null
}): LinkFailure | null {
  const { error, errorCode } = params
  if (!error && !errorCode) return null
  return errorCode === 'otp_expired' ? 'expired' : 'invalid'
}

/**
 * An origin we are willing to send someone back to.
 *
 * These URLs are built from `window.location.origin`, so in practice they are
 * already ours — but this is the value that ends up in an email, and an email
 * link is exactly the thing people click without reading. Anything that is
 * not a plain http(s) origin is refused rather than passed along.
 */
export function isSafeOrigin(origin: string): boolean {
  let url: URL
  try {
    url = new URL(origin)
  } catch {
    return false
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
  // An origin is scheme + host (+ port). Anything more means something has
  // been smuggled in — a path, a query, a fragment, or credentials.
  if (url.pathname !== '/' || url.search !== '' || url.hash !== '') return false
  if (url.username !== '' || url.password !== '') return false
  // http is for local development only; a production email must be https.
  if (url.protocol === 'http:' && url.hostname !== 'localhost') return false
  return true
}

/**
 * The absolute URL an email link should return to.
 *
 * One builder for both journeys, so the reset link and the confirmation link
 * cannot end up pointing at different places — which is the class of bug
 * that sends production users to localhost.
 */
export function buildCallbackUrl(
  origin: string,
  options: { next?: string; plan?: string } = {}
): string {
  if (!isSafeOrigin(origin)) {
    throw new Error(`Refusing to build an auth callback URL for origin: ${origin}`)
  }
  const url = new URL(CALLBACK_PATH, origin)
  if (options.next) url.searchParams.set('next', options.next)
  if (options.plan) url.searchParams.set('plan', options.plan)
  return url.toString()
}
