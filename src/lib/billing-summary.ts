import 'server-only'

import { getStripe } from '@/lib/stripe'
import {
  BLOCKED_REASONS,
  decideRefund,
  daysSinceCharge,
  formatAmount,
  withinRefundWindow,
  type ChargeSummary,
} from '@/lib/refunds'

/**
 * What the admin screen shows about one person's billing.
 *
 * Read on the server, from Stripe, at the moment the page renders — not
 * from our own database. The two can disagree: a refund issued in the
 * Stripe dashboard, a card that failed overnight, a subscription cancelled
 * by the customer. On a screen whose job is to decide whether to give money
 * back, the payment processor is the source of truth and our profiles table
 * is a cache.
 *
 * `server-only` because reaching this with the browser's bundle would drag
 * the Stripe secret key along with it.
 */

export type BillingSummary = {
  hasCustomer: boolean
  /** Null when there is no completed payment to describe. */
  lastPayment: {
    amount: string
    whenISO: string
    daysAgo: number
    withinWindow: boolean
    refunded: boolean
  } | null
  refundable: boolean
  /** Why not, when not — already in words an admin can act on. */
  blockedReason: string | null
  /** Stripe could not be reached; the screen should say so rather than imply "no payments". */
  unavailable: boolean
}

const UNAVAILABLE: BillingSummary = {
  hasCustomer: false,
  lastPayment: null,
  refundable: false,
  blockedReason: 'Stripe could not be reached, so the billing state is unknown.',
  unavailable: true,
}

export async function getBillingSummary(
  stripeCustomerId: string | null | undefined
): Promise<BillingSummary> {
  if (!stripeCustomerId) {
    const decision = decideRefund({ hasCustomer: false, charge: null })
    return {
      hasCustomer: false,
      lastPayment: null,
      refundable: false,
      blockedReason: decision.refundable ? null : BLOCKED_REASONS[decision.reason],
      unavailable: false,
    }
  }

  let charge: ChargeSummary | null = null
  try {
    const charges = await getStripe().charges.list({ customer: stripeCustomerId, limit: 1 })
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
    // An admin page that cannot reach Stripe should say so. Rendering "no
    // payments" would be a lie that invites the wrong conclusion.
    console.error('[billing-summary] could not read charges:', err)
    return UNAVAILABLE
  }

  const decision = decideRefund({ hasCustomer: true, charge })

  return {
    hasCustomer: true,
    lastPayment: charge
      ? {
          amount: formatAmount(charge.amount, charge.currency),
          whenISO: new Date(charge.created * 1000).toISOString(),
          daysAgo: daysSinceCharge(charge.created),
          withinWindow: withinRefundWindow(charge.created),
          refunded: charge.refunded || charge.amountRefunded > 0,
        }
      : null,
    refundable: decision.refundable,
    blockedReason: decision.refundable ? null : BLOCKED_REASONS[decision.reason],
    unavailable: false,
  }
}
