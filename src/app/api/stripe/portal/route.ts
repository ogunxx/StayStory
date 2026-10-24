import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import {
  accountUrlWithNotice,
  resolveAppUrl,
  type PortalNotice,
} from '@/lib/billing-portal'

/**
 * Open Stripe's billing portal, where a host updates their card, reads their
 * invoices, or cancels.
 *
 * Reached from a plain <form method="post">, so the browser navigates here
 * and renders whatever comes back. Every outcome is therefore a redirect:
 * a response body would appear as raw JSON on a blank page, to someone who
 * is in the middle of trying to cancel. See billing-portal.ts.
 */
export async function POST(request: Request) {
  const appUrl = resolveAppUrl(process.env.NEXT_PUBLIC_APP_URL, request.url)
  const back = (notice: PortalNotice) =>
    NextResponse.redirect(accountUrlWithNotice(appUrl, notice), 303)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/login', appUrl), 303)

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  // A paid tier with no Stripe customer is a real state, not a bug: a plan
  // granted by hand from the admin Members controls looks exactly like this.
  // Such an account has nothing to manage in Stripe and must be told so
  // rather than shown a failure.
  if (!profile?.stripe_customer_id) return back('no_subscription')

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: new URL('/account', appUrl).toString(),
    })
    return NextResponse.redirect(session.url, 303)
  } catch (err) {
    // The commonest cause is a portal that has never been configured in this
    // Stripe mode — live mode is configured separately from a sandbox, so it
    // can work in testing and fail on the first real subscriber. Whatever the
    // cause, the host still needs a way out, which the notice gives them.
    console.error('[stripe/portal] could not open the billing portal:', err)
    return back('unavailable')
  }
}
