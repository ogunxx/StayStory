import { createClient } from '@/lib/supabase/server'
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

  const plan = searchParams.get('plan')
  const next = plan === 'legendary' ? '/pricing' : '/dashboard'
  return NextResponse.redirect(`${origin}${next}`)
}
