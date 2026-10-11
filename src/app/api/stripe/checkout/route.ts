import { createClient } from '@/lib/supabase/server'
import { findPriceMismatch, getStripe, PLANS } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier, interval = 'monthly', autoRenew = true } = await request.json()
    const plan = PLANS[tier as keyof typeof PLANS]

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const priceId =
      interval === 'annual' ? plan.priceIds.annual : plan.priceIds.monthly

    if (!priceId) {
      return NextResponse.json(
        { error: 'This plan is not available for checkout yet.' },
        { status: 400 }
      )
    }

    // ── Does this price actually match the plan we are selling? ───────────
    // See findPriceMismatch. A mismatch means an environment variable points
    // at the wrong Stripe price, which is a misconfiguration and never
    // something to charge through.
    const price = await getStripe().prices.retrieve(priceId)
    const mismatch = findPriceMismatch(price, plan, interval === 'annual' ? 'annual' : 'monthly')

    if (mismatch) {
      console.error(
        `[stripe/checkout] price ${priceId} does not match the ${tier} ${interval} plan. ` +
          `Expected ${mismatch.expectedAmount} per ${mismatch.expectedInterval}; ` +
          `Stripe has ${mismatch.actualAmount} per ${mismatch.actualInterval ?? 'one-off'}. ` +
          `Check the ${interval === 'annual' ? 'annual' : 'monthly'} price ID for ${tier}.`
      )
      return NextResponse.json(
        {
          error:
            'We could not start checkout for this plan. Nothing has been charged. Please let us know and we will sort it out.',
        },
        { status: 500 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    // When the host opts out of auto-renewal we still create the subscription so
    // they get access for the period they paid for — the webhook then flags it
    // to cancel at period end, so Stripe never charges them again automatically.
    const autoRenewFlag = autoRenew === false ? 'false' : 'true'

    // NEXT_PUBLIC_APP_URL is only set for production, so on a preview these
    // became the string "undefined/dashboard..." and Stripe rejected the
    // session outright — checkout could never be tested before release.
    // Falling back to the origin this request arrived on fixes previews and
    // local work without changing production, where the variable is set.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      customer: profile?.stripe_customer_id || undefined,
      customer_email: !profile?.stripe_customer_id ? user.email : undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      // Cancelling returns to the in-app chooser, not the marketing page.
      cancel_url: `${appUrl}/upgrade`,
      metadata: { user_id: user.id, tier, auto_renew: autoRenewFlag },
      subscription_data: { metadata: { user_id: user.id, tier, auto_renew: autoRenewFlag } },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe/checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
