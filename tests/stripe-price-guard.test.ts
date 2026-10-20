/**
 * The checkout price guard.
 *
 * An environment variable once pointed the Legendary button at the Portfolio
 * price, and nothing noticed until a host reached Stripe and saw the wrong
 * amount. findPriceMismatch compares what Stripe is about to charge against
 * what the plan says, and checkout refuses rather than charging the wrong
 * amount. Every case below is a way that can go wrong.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { findPriceMismatch, type BillingInterval } from '@/lib/stripe'
import { PAID_PLANS } from '@/lib/plans'

const price = (amount: number | null, interval: string | null) => ({
  unit_amount: amount,
  recurring: interval ? { interval } : null,
})

describe('a correct price passes', () => {
  for (const plan of PAID_PLANS) {
    test(`${plan.id} monthly`, () => {
      assert.equal(findPriceMismatch(price(plan.monthly * 100, 'month'), plan, 'monthly'), null)
    })
    test(`${plan.id} annual`, () => {
      assert.equal(findPriceMismatch(price(plan.annual * 100, 'year'), plan, 'annual'), null)
    })
  }
})

describe('the crossed-price bug is caught', () => {
  const [legendary, portfolio] = PAID_PLANS

  test('the Portfolio price on the Legendary button is refused', () => {
    const m = findPriceMismatch(price(portfolio.monthly * 100, 'month'), legendary, 'monthly')
    assert.ok(m, 'this is exactly what shipped once')
    assert.equal(m!.expectedAmount, legendary.monthly * 100)
    assert.equal(m!.actualAmount, portfolio.monthly * 100)
  })

  test('the Legendary price on the Portfolio button is refused', () => {
    assert.ok(findPriceMismatch(price(legendary.monthly * 100, 'month'), portfolio, 'monthly'))
  })
})

describe('the interval must match too', () => {
  const [plan] = PAID_PLANS

  test('an annual price on a monthly checkout is refused', () => {
    const m = findPriceMismatch(price(plan.annual * 100, 'year'), plan, 'monthly')
    assert.ok(m)
    assert.equal(m!.expectedInterval, 'month')
    assert.equal(m!.actualInterval, 'year')
  })

  test('a monthly price on an annual checkout is refused', () => {
    assert.ok(findPriceMismatch(price(plan.monthly * 100, 'month'), plan, 'annual'))
  })

  test('the right amount with the wrong interval is still refused', () => {
    assert.ok(findPriceMismatch(price(plan.monthly * 100, 'year'), plan, 'monthly'))
  })

  test('a one-off price with no recurring interval is refused', () => {
    const m = findPriceMismatch(price(plan.monthly * 100, null), plan, 'monthly')
    assert.ok(m)
    assert.equal(m!.actualInterval, null)
  })
})

describe('malformed prices never pass silently', () => {
  const [plan] = PAID_PLANS

  test('a null amount is refused', () => {
    assert.ok(findPriceMismatch(price(null, 'month'), plan, 'monthly'))
  })

  test('a free price on a paid plan is refused', () => {
    assert.ok(findPriceMismatch(price(0, 'month'), plan, 'monthly'))
  })

  test('cents instead of dollars is refused', () => {
    // A classic off-by-100: $29 sent as 29 rather than 2900.
    assert.ok(findPriceMismatch(price(plan.monthly, 'month'), plan, 'monthly'))
  })
})

describe('the guard reads the plans, it does not restate them', () => {
  test('every paid plan has a sane monthly and annual price', () => {
    for (const plan of PAID_PLANS) {
      assert.ok(plan.monthly > 0, plan.id)
      assert.ok(plan.annual > 0, plan.id)
      assert.ok(plan.annual < plan.monthly * 12, `${plan.id}: annual should beat 12 months`)
    }
  })

  test('both intervals are covered', () => {
    const intervals: BillingInterval[] = ['monthly', 'annual']
    assert.equal(intervals.length, 2)
  })
})
