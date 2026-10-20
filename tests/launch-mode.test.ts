/**
 * I/J/K — what the focused launch shows, and what it preserves.
 *
 * The rule that decides who sees the narrowed shell, the copy constants that
 * depend on it, and the compositions that must come back when the flag is
 * off. Nothing here asserts that the deeper tools stop existing — they are
 * preserved, and that is the point.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { decideAudience } from '@/lib/launch-mode'
import { FOCUSED_NAV } from '@/lib/focused-nav'
import {
  REASSURANCE,
  FOCUSED_REASSURANCE,
  FULL_REASSURANCE,
  COMMERCIAL_LINK,
} from '@/components/marketing/cta-styles'
import {
  FOCUSED_LAUNCH_MODE,
  FOCUSED_HOMEPAGE,
  FOCUSED_FREE_LAUNCH,
  FOCUSED_FIRST_RUN,
} from '@/lib/config'

/** Anything an early-access host must not be shown. */
const COMMERCIAL =
  /legendary|portfolio|\$\d|subscribe|upgrade|free generation|generation credit|usage allowance|cancel anytime/i

describe('the four switches are independent booleans', () => {
  test('each is a boolean', () => {
    for (const [n, v] of Object.entries({
      FOCUSED_LAUNCH_MODE,
      FOCUSED_HOMEPAGE,
      FOCUSED_FREE_LAUNCH,
      FOCUSED_FIRST_RUN,
    })) {
      assert.equal(typeof v, 'boolean', n)
    }
  })
})

describe('I — who gets the focused shell', () => {
  test('brand new and free: focused', () => {
    assert.equal(decideAudience({ hasDeeperWork: false, isPaid: false }), 'focused')
  })

  test('real work in the deeper tools: established, nothing vanishes', () => {
    assert.equal(decideAudience({ hasDeeperWork: true, isPaid: false }), 'established')
  })

  test('paying: established, so billing stays reachable', () => {
    assert.equal(decideAudience({ hasDeeperWork: false, isPaid: true }), 'established')
  })

  test('paying and building: established', () => {
    assert.equal(decideAudience({ hasDeeperWork: true, isPaid: true }), 'established')
  })

  test('pure — same input, same answer, no hidden state', () => {
    const a = decideAudience({ hasDeeperWork: false, isPaid: false })
    const b = decideAudience({ hasDeeperWork: false, isPaid: false })
    assert.equal(a, b)
  })

  test('an established host is never downgraded to focused', () => {
    // The only way to be focused is to have neither signal.
    for (const hasDeeperWork of [true, false]) {
      for (const isPaid of [true, false]) {
        const a = decideAudience({ hasDeeperWork, isPaid })
        if (hasDeeperWork || isPaid) assert.equal(a, 'established')
      }
    }
  })
})

describe('I — the focused product shell offers nothing commercial', () => {
  test('no pricing, upgrade or deeper tool in the focused nav', () => {
    for (const item of FOCUSED_NAV) {
      assert.doesNotMatch(item.label, COMMERCIAL, item.label)
      assert.ok(
        !['/pricing', '/upgrade', '/generator', '/journey', '/story', '/legend'].includes(item.href),
        item.href
      )
    }
  })

  test('the focused nav is the journey plus the account', () => {
    assert.equal(FOCUSED_NAV.length, 6)
    assert.equal(FOCUSED_NAV.at(-1)!.href, '/account')
  })
})

describe('the reassurance line', () => {
  test('focused: free, no card, start with the Audit', () => {
    assert.deepEqual(FOCUSED_REASSURANCE, [
      'Free to start',
      'No credit card required',
      'Begin with your Experience Audit',
    ])
  })

  test('focused: nothing about cancelling something that cannot be bought', () => {
    assert.doesNotMatch(FOCUSED_REASSURANCE.join(' '), /cancel/i)
  })

  test('focused: no unmeasured timing or performance claim', () => {
    assert.doesNotMatch(
      FOCUSED_REASSURANCE.join(' '),
      /minute|second|instant|fast|quick|guarantee|more bookings|better reviews/i
    )
  })

  test('full mode wording is preserved exactly', () => {
    assert.deepEqual(FULL_REASSURANCE, ['No credit card', 'Setup in minutes', 'Cancel anytime'])
  })

  test('the live line follows the switch', () => {
    assert.deepEqual(REASSURANCE, FOCUSED_LAUNCH_MODE ? FOCUSED_REASSURANCE : FULL_REASSURANCE)
  })

  test('the two are genuinely different, so neither was overwritten', () => {
    assert.notDeepEqual(FOCUSED_REASSURANCE, FULL_REASSURANCE)
  })
})

describe('the "what does it cost" link', () => {
  test('it always points somewhere real', () => {
    assert.match(COMMERCIAL_LINK.href, /^\//)
    assert.ok(COMMERCIAL_LINK.label.length > 0)
  })

  test('focused: it does not promise a price list', () => {
    if (!FOCUSED_LAUNCH_MODE) return
    assert.doesNotMatch(COMMERCIAL_LINK.label, /pricing|price|\$|plan/i)
  })
})
