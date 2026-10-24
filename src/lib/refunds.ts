/**
 * The rules behind the admin refund button.
 *
 * Kept away from the route so they can be tested without Stripe and without
 * moving money. Nothing here calls anything; it decides, and the route acts.
 *
 * ┌─ THE ONE IRREVERSIBLE ADMIN ACTION ────────────────────────────────────┐
 * │ Everything else an admin can do to an account — change the plan,       │
 * │ suspend, reactivate — can be undone by clicking the other button.      │
 * │ A refund cannot. The money has left, Stripe will not take it back,     │
 * │ and the only way to undo it is to ask the customer to pay again.       │
 * │                                                                        │
 * │ So this module is deliberately narrow. One payment, the latest. The    │
 * │ whole amount. No free-text amount field to mistype. Anything unusual   │
 * │ belongs in the Stripe dashboard, where the person doing it has the     │
 * │ full picture and Stripe's own safeguards.                              │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * The behaviour matches what the Refunds page already promises customers:
 * a full refund, and access ending when the refund is issued.
 */

import { REFUND_WINDOW_DAYS } from '@/lib/legal'

/** What the admin screen needs to know about the last payment. */
export type ChargeSummary = {
  id: string
  /** Smallest currency unit, as Stripe stores it. */
  amount: number
  currency: string
  /** Seconds since the epoch, as Stripe reports it. */
  created: number
  /** Stripe's own flag. A charge can also be partially refunded. */
  refunded: boolean
  amountRefunded: number
  /** A charge that never succeeded cannot be refunded. */
  paid: boolean
  status: string
}

export type RefundDecision =
  | { refundable: true; charge: ChargeSummary; amount: number }
  | { refundable: false; reason: RefundBlockedReason }

export type RefundBlockedReason =
  | 'no_customer'
  | 'no_charge'
  | 'already_refunded'
  | 'not_paid'

/**
 * Why a refund is not on offer, in words an admin can act on. Never Stripe's
 * own text: an admin screen that prints a provider's error teaches nobody
 * anything and ages badly.
 */
export const BLOCKED_REASONS: Record<RefundBlockedReason, string> = {
  no_customer: 'This account has never paid through Stripe, so there is nothing to refund.',
  no_charge: 'No completed payment was found for this account.',
  already_refunded: 'The last payment has already been refunded in full.',
  not_paid: 'The last payment did not complete, so there is nothing to refund.',
}

/**
 * Whether the latest charge can be refunded, and for how much.
 *
 * Always the full amount. A partially refunded charge is treated as done
 * rather than topped up to full — a partial refund was a deliberate decision
 * someone made in Stripe, and quietly completing it from here would override
 * them without their knowing.
 */
export function decideRefund(input: {
  hasCustomer: boolean
  charge: ChargeSummary | null
}): RefundDecision {
  if (!input.hasCustomer) return { refundable: false, reason: 'no_customer' }
  if (!input.charge) return { refundable: false, reason: 'no_charge' }

  const { charge } = input
  if (!charge.paid || charge.status !== 'succeeded') {
    return { refundable: false, reason: 'not_paid' }
  }
  if (charge.refunded || charge.amountRefunded > 0) {
    return { refundable: false, reason: 'already_refunded' }
  }
  return { refundable: true, charge, amount: charge.amount }
}

/**
 * Is this payment still inside the window the Refunds page promises?
 *
 * Shown to the admin, never enforced. The page says a refund inside the
 * window is unconditional; it does not say one outside it is impossible, and
 * it explicitly promises to "deal with it properly" when something goes
 * wrong later. Blocking here would turn a promise about the easy case into a
 * refusal in the hard one.
 */
export function withinRefundWindow(chargeCreatedSeconds: number, now: Date = new Date()): boolean {
  const ageMs = now.getTime() - chargeCreatedSeconds * 1000
  if (ageMs < 0) return true
  return ageMs <= REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000
}

export function daysSinceCharge(chargeCreatedSeconds: number, now: Date = new Date()): number {
  const ageMs = Math.max(0, now.getTime() - chargeCreatedSeconds * 1000)
  return Math.floor(ageMs / (24 * 60 * 60 * 1000))
}

/** `4900` and `usd` as `$49.00`. Display only. */
export function formatAmount(amount: number, currency: string): string {
  const major = amount / 100
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: major % 1 === 0 ? 0 : 2,
    }).format(major)
  } catch {
    // An unknown currency code should not break an admin page.
    return `${major.toFixed(2)} ${currency.toUpperCase()}`
  }
}

/**
 * The word an admin has to type before the button will do anything.
 *
 * A confirm dialog is dismissed by reflex; typing is not. This is the only
 * control in the admin area that spends money, so it is the only one that
 * asks for more than a click.
 */
export const CONFIRM_WORD = 'REFUND'

export function confirmationMatches(typed: string): boolean {
  return typed.trim().toUpperCase() === CONFIRM_WORD
}

/**
 * A key that makes a repeated request a no-op rather than a second refund.
 *
 * Derived from the charge, not from the moment: a double-click, a retried
 * fetch and a browser replaying the request all produce the same key, and
 * Stripe returns the original refund instead of issuing another.
 */
export function refundIdempotencyKey(chargeId: string): string {
  return `staystory-admin-refund-${chargeId}`
}
