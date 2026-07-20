import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

function getTierFromPriceId(priceId: string): string {
  const map: Record<string, string> = {
    // Legacy price IDs — treated as legendary for access purposes
    price_1TSJDMIOCUJyk0u8w3b6nCa1: 'host',
    price_1TSJD2IOCUJyk0u8eJU7QOSd: 'signature',
    price_1TSJDkIOCUJyk0u82KyQ0j97: 'legend',
  }
  if (process.env.STRIPE_PORTFOLIO_PRICE_ID && priceId === process.env.STRIPE_PORTFOLIO_PRICE_ID) {
    return 'portfolio'
  }
  if (process.env.STRIPE_PORTFOLIO_ANNUAL_PRICE_ID && priceId === process.env.STRIPE_PORTFOLIO_ANNUAL_PRICE_ID) {
    return 'portfolio'
  }
  if (process.env.STRIPE_LEGEND_PRICE_ID && priceId === process.env.STRIPE_LEGEND_PRICE_ID) {
    return 'legendary'
  }
  if (process.env.STRIPE_LEGEND_ANNUAL_PRICE_ID && priceId === process.env.STRIPE_LEGEND_ANNUAL_PRICE_ID) {
    return 'legendary'
  }
  // Normalize legacy tier values to 'legendary'
  const legacy = map[priceId]
  return legacy ? 'legendary' : 'free'
}

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const stripe = getStripe()
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = event.data.object as any
    const userId = session.metadata?.user_id
    const tier = session.metadata?.tier

    if (userId && tier) {
      await supabaseAdmin
        .from('profiles')
        .update({
          tier,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq('id', userId)

      // Host opted out of auto-renewal: keep their paid access for this period,
      // but tell Stripe to end the subscription when the period is over so they
      // are never charged again automatically.
      if (session.metadata?.auto_renew === 'false' && session.subscription) {
        await stripe.subscriptions
          .update(session.subscription as string, { cancel_at_period_end: true })
          .catch((err) => console.error('[stripe] cancel_at_period_end failed:', err))
      }

      const customerEmail = session.customer_details?.email ?? session.customer_email
      if (customerEmail && resend) {
        const planName = tier === 'portfolio' ? 'Portfolio' : 'Legendary'
        const intro =
          tier === 'portfolio'
            ? 'Your subscription is active. The whole system is now unlimited across up to five properties — the Experience Audit, Experience Blueprint, Experience Generator, Story Builder, and a full Guest Journey Playbook for each place, plus co-host team access.'
            : 'Your subscription is active. The whole system is now unlimited — the Experience Audit, Experience Blueprint, Experience Generator, Story Builder, and your full Guest Journey Playbook.'
        await resend.emails.send({
          from: 'StayStory <hello@staystory.co>',
          to: customerEmail,
          replyTo: 'hello@staystory.co',
          subject: `Welcome to ${planName} — you're in.`,
          html: `
            <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1a1a1a">
              <p style="font-size:20px;font-weight:600;margin:0 0 24px">Welcome to StayStory ${planName}.</p>
              <p style="font-size:15px;line-height:1.7;margin:0 0 16px">
                ${intro}
              </p>
              <p style="font-size:15px;line-height:1.7;margin:0 0 32px">
                This is where great hosting begins. Head to your dashboard and start building the stay your guests will talk about.
              </p>
              <a href="https://staystory.co/dashboard" style="background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">
                Go to your dashboard →
              </a>
              <p style="font-size:13px;color:#666;margin:40px 0 0;line-height:1.6">
                Questions? Reply to this email or reach us at <a href="mailto:hello@staystory.co" style="color:#1a1a1a">hello@staystory.co</a>.<br>
                Cancel anytime from your account settings.
              </p>
            </div>
          `,
        }).catch((err) => console.error('[resend] confirmation email failed:', err))
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = event.data.object as any
    const priceId = sub.items.data[0]?.price.id
    const tier = getTierFromPriceId(priceId)

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('stripe_subscription_id', sub.id)
      .single()

    if (profile) {
      await supabaseAdmin.from('profiles').update({ tier }).eq('id', profile.id)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = event.data.object as any

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('stripe_subscription_id', sub.id)
      .single()

    if (profile) {
      await supabaseAdmin
        .from('profiles')
        .update({ tier: 'free', stripe_subscription_id: null })
        .eq('id', profile.id)

      const customerEmail = sub.customer_email ?? profile.email
      if (customerEmail && resend) {
        await resend.emails.send({
          from: 'StayStory <hello@staystory.co>',
          to: customerEmail,
          replyTo: 'hello@staystory.co',
          subject: 'Your Legendary subscription has been cancelled.',
          html: `
            <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1a1a1a">
              <p style="font-size:20px;font-weight:600;margin:0 0 24px">We're sorry to see you go.</p>
              <p style="font-size:15px;line-height:1.7;margin:0 0 16px">
                Your Legendary subscription has been cancelled. Your access continues until the end of your current billing period — after that your account will move to the free plan.
              </p>
              <p style="font-size:15px;line-height:1.7;margin:0 0 32px">
                If you cancelled by mistake or change your mind, you can resubscribe anytime from your account page. Everything you've built — your audits, stories, and playbooks — will still be there waiting for you.
              </p>
              <a href="https://staystory.co/pricing" style="background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">
                Resubscribe →
              </a>
              <p style="font-size:13px;color:#666;margin:40px 0 0;line-height:1.6">
                Have feedback or need help? Reply to this email or reach us at <a href="mailto:hello@staystory.co" style="color:#1a1a1a">hello@staystory.co</a>.
              </p>
            </div>
          `,
        }).catch((err) => console.error('[resend] cancellation email failed:', err))
      }
    }
  }

  return NextResponse.json({ received: true })
}
