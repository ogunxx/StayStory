import { createClient } from '@/lib/supabase/server'
import { getAdminClient, isAdminEmail, logAdminAction } from '@/lib/admin'
import { getStripe } from '@/lib/stripe'
import {
  BLOCKED_REASONS,
  confirmationMatches,
  decideRefund,
  formatAmount,
  refundIdempotencyKey,
  type ChargeSummary,
} from '@/lib/refunds'
import { NextResponse } from 'next/server'

/**
 * Refund the last payment, end the subscription, and drop the account to Free.
 *
 * Three things, one button, because the Refunds page promises all three
 * together: a full refund, and "your access ends when the refund is issued".
 * Doing them separately would leave an admin one browser crash away from a
 * customer who has their money back and still has a paid account.
 *
 * ┌─ ORDER MATTERS, AND THIS IS THE SAFE ONE ──────────────────────────────┐
 * │ The refund goes first. If it fails, nothing else has happened and the  │
 * │ admin can try again — the account is exactly as it was.                │
 * │                                                                        │
 * │ If the refund succeeds and a later step fails, the customer has their  │
 * │ money, which is the part that matters and the part that cannot be      │
 * │ retried safely. The response says precisely which steps completed, so  │
 * │ the leftover is a known five-second fix with the plan buttons rather   │
 * │ than a mystery. The reverse order could take access away and then fail │
 * │ to refund, which is the worst outcome for the customer.                │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * The Stripe secret key is only ever read here, on the server. Nothing in
 * this route is reachable without an ADMIN_EMAILS match.
 */

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const targetUserId: unknown = body?.targetUserId
  const confirmation: unknown = body?.confirmation

  if (typeof targetUserId !== 'string' || !targetUserId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Typed, not clicked. The browser checks this too; so does the server,
  // because a control that spends money cannot trust its own form.
  if (typeof confirmation !== 'string' || !confirmationMatches(confirmation)) {
    return NextResponse.json({ error: 'Confirmation did not match.' }, { status: 400 })
  }

  const admin = getAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('id, email, tier, stripe_customer_id, stripe_subscription_id')
    .eq('id', targetUserId)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'No such account.' }, { status: 404 })
  }

  const stripe = getStripe()

  // Re-read the charge here rather than trusting anything the browser sent.
  // The page may have been open for an hour, and a refund issued in the
  // Stripe dashboard in the meantime must not be repeated from here.
  let charge: ChargeSummary | null = null
  if (profile.stripe_customer_id) {
    try {
      const charges = await stripe.charges.list({
        customer: profile.stripe_customer_id,
        limit: 1,
      })
      const latest = charges.data[0]
      if (latest) {
        charge = {
          id: latest.id,
          amount: latest.amount,
          currency: latest.currency,
          created: latest.created,
          refunded: latest.refunded,
          amountRefunded: latest.amount_refunded,
          paid: latest.paid,
          status: latest.status,
        }
      }
    } catch (err) {
      console.error('[admin/refund] could not read charges:', err)
      return NextResponse.json(
        { error: 'Could not reach Stripe to check the last payment. Nothing was changed.' },
        { status: 502 }
      )
    }
  }

  const decision = decideRefund({ hasCustomer: Boolean(profile.stripe_customer_id), charge })
  if (!decision.refundable) {
    return NextResponse.json({ error: BLOCKED_REASONS[decision.reason] }, { status: 409 })
  }

  // ── 1. The money ────────────────────────────────────────────────────────
  let refundId: string
  try {
    const refund = await stripe.refunds.create(
      { charge: decision.charge.id },
      { idempotencyKey: refundIdempotencyKey(decision.charge.id) }
    )
    refundId = refund.id
  } catch (err) {
    console.error('[admin/refund] refund failed:', err)
    return NextResponse.json(
      { error: 'Stripe refused the refund. Nothing was changed — check the Stripe dashboard.' },
      { status: 502 }
    )
  }

  // From here the customer has their money back. Everything below is
  // bookkeeping: report what did and did not happen rather than failing.
  const warnings: string[] = []

  // ── 2. The subscription ─────────────────────────────────────────────────
  if (profile.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(profile.stripe_subscription_id)
    } catch (err) {
      console.error('[admin/refund] subscription cancel failed:', err)
      warnings.push('The refund went through, but the Stripe subscription could not be cancelled.')
    }
  }

  // ── 3. The access ───────────────────────────────────────────────────────
  const { error: tierError } = await admin
    .from('profiles')
    .update({ tier: 'free', stripe_subscription_id: null })
    .eq('id', targetUserId)

  if (tierError) {
    console.error('[admin/refund] tier downgrade failed:', tierError.message)
    warnings.push('The refund went through, but the plan is still showing as paid. Set it to Free.')
  }

  await logAdminAction({
    adminUserId: user.id,
    targetUserId,
    action: 'refund',
    previousValue: profile.tier,
    // Enough to reconcile against Stripe later without storing anything secret.
    newValue: `free · ${formatAmount(decision.amount, decision.charge.currency)} · ${refundId}`,
  })

  return NextResponse.json({
    refunded: formatAmount(decision.amount, decision.charge.currency),
    subscriptionCancelled: Boolean(profile.stripe_subscription_id) && warnings.length === 0,
    warnings,
  })
}
