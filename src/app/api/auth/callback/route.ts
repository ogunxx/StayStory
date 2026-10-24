import { createClient } from '@/lib/supabase/server'
import { isPaidPlanId } from '@/lib/plans'
import {
  DESTINATIONS,
  failureFromParams,
  journeyFor,
  noticeKey,
  type AuthJourney,
  type LinkFailure,
} from '@/lib/auth-redirects'
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

function toLogin(origin: string, journey: AuthJourney, failure: LinkFailure) {
  return NextResponse.redirect(`${origin}/login?notice=${noticeKey(journey, failure)}`)
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  // Which journey this link belongs to, read before anything can fail. The
  // failure paths below need it: a confirmation that did not work and a
  // password reset that did not work want opposite advice, and this is the
  // only place that still knows which one the visitor was on.
  const journey = journeyFor(searchParams.get('next'))

  // A dead link is reported in the query string rather than by failing.
  const queryFailure = failureFromParams({
    error: searchParams.get('error'),
    errorCode: searchParams.get('error_code'),
  })
  if (queryFailure) return toLogin(origin, journey, queryFailure)

  const code = searchParams.get('code')
  if (!code) return toLogin(origin, journey, 'invalid')

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    // Usually the link was opened in a different browser from the one that
    // asked for it, so the PKCE verifier that pairs with this code is not
    // there. Common for a confirmation, and the norm for a password reset:
    // people ask on a laptop and open the mail on a phone.
    console.error('Auth callback exchange failed:', exchangeError.message)
    return toLogin(origin, journey, 'invalid')
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
