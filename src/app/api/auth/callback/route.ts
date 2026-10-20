import { createClient } from '@/lib/supabase/server'
import { isPaidPlanId } from '@/lib/plans'
import { NextResponse } from 'next/server'

/**
 * Where Supabase sends people after they click an email confirmation link.
 *
 * Supabase can arrive here three ways: with a `code` to exchange, with an
 * `error` in the query string (an expired or already-used link), or with
 * neither. All three used to end in the same redirect to /dashboard, where
 * middleware bounced the visitor to /login with nothing explaining what
 * happened — the link simply appeared to do nothing. Each one now lands on
 * /login with a notice it can show.
 *
 * Only a short key travels in the URL, never the provider's own message, so
 * no arbitrary text can be reflected onto the page.
 */

type Notice = 'link_expired' | 'link_invalid'

function toLogin(origin: string, notice: Notice) {
  return NextResponse.redirect(`${origin}/login?notice=${notice}`)
}

/**
 * Where a link may send someone once its code has been exchanged.
 *
 * Supabase does not tell us what kind of link was clicked — a confirmation
 * and a password reset both arrive here with nothing but a code — so the
 * sender says where it is going by putting a key in its own redirect URL.
 *
 * A key, not a path. The value comes off a query string, and anything that
 * turned a query string into a redirect target would be an open redirect: a
 * link that looks like staystory.co but lands somewhere else. Only these
 * destinations exist, and anything unrecognised falls back to the dashboard.
 */
const DESTINATIONS: Record<string, string> = {
  reset: '/reset-password',
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  // A dead link is reported in the query string rather than by failing.
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  if (error || errorCode) {
    return toLogin(origin, errorCode === 'otp_expired' ? 'link_expired' : 'link_invalid')
  }

  const code = searchParams.get('code')
  if (!code) return toLogin(origin, 'link_invalid')

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    // Usually the link was opened in a different browser from the one that
    // started signup, so the verifier that pairs with this code isn't there.
    console.error('Auth callback exchange failed:', exchangeError.message)
    return toLogin(origin, 'link_invalid')
  }

  const destination = DESTINATIONS[searchParams.get('next') ?? '']
  if (destination) return NextResponse.redirect(`${origin}${destination}`)

  // Someone who picked a paid plan before creating an account lands on the
  // in-app upgrade screen with that plan already chosen, rather than on the
  // public pricing page where they cannot buy anything.
  const plan = searchParams.get('plan')
  const next = isPaidPlanId(plan) ? `/upgrade?plan=${plan}` : '/dashboard'
  return NextResponse.redirect(`${origin}${next}`)
}
