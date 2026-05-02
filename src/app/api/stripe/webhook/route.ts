import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TIER_MAP: Record<string, string> = {
  price_1TSJDMIOCUJyk0u8w3b6nCa1: 'host',
  price_1TSJD2IOCUJyk0u8eJU7QOSd: 'signature',
  price_1TSJDkIOCUJyk0u82KyQ0j97: 'legend',
}

export async function POST(request: Request) {
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
    }
  }

  if (event.type === 'customer.subscription.updated') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = event.data.object as any
    const priceId = sub.items.data[0]?.price.id
    const tier = TIER_MAP[priceId] || 'free'

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
      .select('id')
      .eq('stripe_subscription_id', sub.id)
      .single()

    if (profile) {
      await supabaseAdmin
        .from('profiles')
        .update({ tier: 'free', stripe_subscription_id: null })
        .eq('id', profile.id)
    }
  }

  return NextResponse.json({ received: true })
}
