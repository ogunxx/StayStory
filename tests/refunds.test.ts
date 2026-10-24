/**
 * The admin refund button.
 *
 * This is the only admin action that spends money and the only one that
 * cannot be undone, so the rules around it are worth holding still. Nothing
 * here calls Stripe or moves anything — the decisions are pure, which is
 * the reason they live in `refunds.ts` and not in the route.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  BLOCKED_REASONS,
  CONFIRM_WORD,
  confirmationMatches,
  daysSinceCharge,
  decideRefund,
  formatAmount,
  refundIdempotencyKey,
  withinRefundWindow,
  type ChargeSummary,
} from '@/lib/refunds'
import { REFUND_WINDOW_DAYS } from '@/lib/legal'

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')
const ROUTE = 'src/app/api/admin/refund/route.ts'
const CONTROL = 'src/app/(dashboard)/admin/users/[id]/refund-control.tsx'

const charge = (over: Partial<ChargeSummary> = {}): ChargeSummary => ({
  id: 'ch_test123',
  amount: 4900,
  currency: 'usd',
  created: Math.floor(Date.now() / 1000),
  refunded: false,
  amountRefunded: 0,
  paid: true,
  status: 'succeeded',
  ...over,
})

describe('when a refund is offered at all', () => {
  test('a good charge is refundable, in full', () => {
    const d = decideRefund({ hasCustomer: true, charge: charge() })
    assert.equal(d.refundable, true)
    if (d.refundable) assert.equal(d.amount, 4900, 'always the whole amount')
  })

  test('an account that never paid has nothing to refund', () => {
    const d = decideRefund({ hasCustomer: false, charge: null })
    assert.deepEqual(d, { refundable: false, reason: 'no_customer' })
  })

  test('a customer with no charges has nothing to refund', () => {
    const d = decideRefund({ hasCustomer: true, charge: null })
    assert.deepEqual(d, { refundable: false, reason: 'no_charge' })
  })

  test('an already-refunded charge is not refunded twice', () => {
    const d = decideRefund({ hasCustomer: true, charge: charge({ refunded: true }) })
    assert.deepEqual(d, { refundable: false, reason: 'already_refunded' })
  })

  test('a partly-refunded charge is left alone, not topped up', () => {
    // Someone made that decision deliberately in Stripe. Quietly completing
    // it from here would override them without their knowing.
    const d = decideRefund({ hasCustomer: true, charge: charge({ amountRefunded: 1000 }) })
    assert.deepEqual(d, { refundable: false, reason: 'already_refunded' })
  })

  test('a payment that never completed is not refundable', () => {
    for (const bad of [charge({ paid: false }), charge({ status: 'pending' })]) {
      const d = decideRefund({ hasCustomer: true, charge: bad })
      assert.equal(d.refundable, false)
      if (!d.refundable) assert.equal(d.reason, 'not_paid')
    }
  })

  test('every blocked reason has wording an admin can act on', () => {
    for (const [reason, text] of Object.entries(BLOCKED_REASONS)) {
      assert.ok(text.length > 20, `${reason} needs a real explanation`)
      assert.doesNotMatch(text, /stripe_|error|null|undefined/i, `${reason} leaks internals`)
    }
  })
})

describe('the refund window is shown, never enforced', () => {
  const day = 24 * 60 * 60
  const now = new Date('2026-06-15T12:00:00Z')
  const at = (daysAgo: number) => Math.floor(now.getTime() / 1000) - daysAgo * day

  test('a payment inside the window is marked as such', () => {
    assert.equal(withinRefundWindow(at(0), now), true)
    assert.equal(withinRefundWindow(at(REFUND_WINDOW_DAYS - 1), now), true)
  })

  test('a payment past the window is marked as past it', () => {
    assert.equal(withinRefundWindow(at(REFUND_WINDOW_DAYS + 1), now), false)
    assert.equal(withinRefundWindow(at(400), now), false)
  })

  test('being outside the window does not block the refund', () => {
    // The Refunds page promises an unconditional refund inside the window.
    // It does not say one outside it is impossible, and it promises to
    // "deal with it properly" when something goes wrong later.
    const old = charge({ created: at(400) })
    assert.equal(decideRefund({ hasCustomer: true, charge: old }).refundable, true)
  })

  test('a clock skewed into the future does not read as ancient', () => {
    assert.equal(withinRefundWindow(at(-2), now), true)
    assert.equal(daysSinceCharge(at(-2), now), 0)
  })

  test('days since the charge are counted down, not rounded', () => {
    assert.equal(daysSinceCharge(at(0), now), 0)
    assert.equal(daysSinceCharge(at(1), now), 1)
    assert.equal(daysSinceCharge(at(9), now), 9)
  })
})

describe('confirmation', () => {
  test('the exact word passes', () => {
    assert.equal(confirmationMatches(CONFIRM_WORD), true)
  })

  test('case and surrounding space are forgiven', () => {
    for (const ok of ['refund', ' Refund ', 'REFUND\n']) {
      assert.equal(confirmationMatches(ok), true, ok)
    }
  })

  test('anything else is refused', () => {
    for (const bad of ['', ' ', 'y', 'yes', 'REFUN', 'REFUNDS', 'confirm']) {
      assert.equal(confirmationMatches(bad), false, JSON.stringify(bad))
    }
  })
})

describe('a repeated request does not refund twice', () => {
  test('the key comes from the charge, not the moment', () => {
    const a = refundIdempotencyKey('ch_abc')
    const b = refundIdempotencyKey('ch_abc')
    assert.equal(a, b, 'a retry must reuse the key')
    assert.notEqual(a, refundIdempotencyKey('ch_def'))
  })

  test('the route sends it to Stripe', () => {
    assert.match(read(ROUTE), /idempotencyKey: refundIdempotencyKey\(/)
  })
})

describe('amounts are shown the way a person reads them', () => {
  test('whole amounts have no stray decimals', () => {
    assert.equal(formatAmount(4900, 'usd'), '$49.00'.replace('.00', ''))
  })

  test('uneven amounts keep their cents', () => {
    assert.equal(formatAmount(4950, 'usd'), '$49.50')
  })

  test('an unregistered currency code still reads sensibly', () => {
    // Intl accepts any three-letter code, so this does not hit the fallback.
    // Matched loosely on purpose: Intl separates the code from the number
    // with a non-breaking space, which is invisible in a failure message and
    // has cost people an afternoon before.
    assert.match(formatAmount(1000, 'zzz'), /^ZZZ\s10$/u)
  })

  test('a malformed currency code falls back instead of throwing', () => {
    // Two letters is not a currency code; Intl throws on it.
    assert.doesNotThrow(() => formatAmount(1000, 'us'))
    assert.match(formatAmount(1000, 'us'), /10\.00\s+US/)
  })
})

describe('the route is safe by construction', () => {
  test('it refuses anyone who is not an admin, first', () => {
    const src = read(ROUTE)
    const gate = src.indexOf('isAdminEmail')
    const stripe = src.indexOf('getStripe()')
    assert.ok(gate > 0 && stripe > 0)
    assert.ok(gate < stripe, 'the admin gate must come before anything touches Stripe')
  })

  test('it checks the typed confirmation server-side too', () => {
    // The browser checks it, but a control that spends money cannot trust
    // its own form.
    assert.match(read(ROUTE), /confirmationMatches\(confirmation\)/)
  })

  test('it re-reads the charge rather than trusting the browser', () => {
    const src = read(ROUTE)
    assert.match(src, /stripe\.charges\.list/)
    // No amount or charge id is accepted from the request body.
    assert.doesNotMatch(src, /body\?\.(amount|chargeId|charge)/)
  })

  test('the money moves before anything else changes', () => {
    // If the refund fails, nothing has happened and it is safe to retry. The
    // reverse order could remove access and then fail to refund.
    const src = read(ROUTE)
    const refund = src.indexOf('stripe.refunds.create')
    const cancel = src.indexOf('stripe.subscriptions.cancel')
    const downgrade = src.indexOf("tier: 'free'")
    assert.ok(refund > 0 && cancel > 0 && downgrade > 0)
    assert.ok(refund < cancel && refund < downgrade)
  })

  test('it writes an audit entry', () => {
    assert.match(read(ROUTE), /action: 'refund'/)
  })

  test('it never returns Stripe error text to the browser', () => {
    const src = read(ROUTE)
    assert.doesNotMatch(src, /error:\s*err(\.message)?\b/)
    assert.match(src, /console\.error\(/)
  })

  test('the secret key is never named outside the server helper', () => {
    // The control may say "Stripe dashboard" in prose — what it must never
    // do is read an environment variable or name a key.
    for (const f of [ROUTE, CONTROL]) {
      assert.doesNotMatch(read(f), /STRIPE_SECRET_KEY/, f)
      assert.doesNotMatch(read(f), /process\.env/, f)
    }
  })

  test('the billing lookup cannot be pulled into the browser', () => {
    assert.match(read('src/lib/billing-summary.ts'), /^import 'server-only'/m)
  })
})

describe('the control itself', () => {
  test('it asks for a typed word, not just a click', () => {
    const src = read(CONTROL)
    assert.match(src, /confirmationMatches\(typed\)/)
    assert.match(src, /CONFIRM_WORD/)
  })

  test('the submit button is dead until the word matches', () => {
    assert.match(read(CONTROL), /disabled=\{busy \|\| !confirmationMatches\(typed\)\}/)
  })

  test('it says the action cannot be undone before offering it', () => {
    assert.match(read(CONTROL), /cannot be undone/i)
  })

  test('it spells out all three consequences', () => {
    const src = read(CONTROL)
    assert.match(src, /back to the card/i)
    assert.match(src, /cancelled immediately/i)
    assert.match(src, /drops to Free/i)
  })

  test('it reassures that saved work survives, as the policy promises', () => {
    assert.match(read(CONTROL), /not touched|untouched/i)
  })

  test('it offers nothing when there is nothing to refund', () => {
    assert.match(read(CONTROL), /billing\.refundable && !done/)
  })

  test('errors and results are announced', () => {
    const src = read(CONTROL)
    assert.match(src, /role="alert"/)
    assert.match(src, /role="status"/)
  })
})
