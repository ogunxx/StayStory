/**
 * C/D — when generated work goes stale, and when it must not.
 *
 * Both of these cost a model call to redo, so a false positive is expensive
 * and a false negative is wrong. The rule is a fingerprint of the context,
 * not a timestamp: confirmCompass rewrites updated_at on every call, so
 * timestamps would mark unchanged work as stale on every confirmation.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { isStale, type FocusedSet } from '@/lib/focused-recommendations'
import type { FocusedContext } from '@/lib/focused-context'

const AUDIT_1 = 'audit-1111'
const AUDIT_2 = 'audit-2222'

const set = (over: Partial<FocusedSet> = {}): FocusedSet =>
  ({
    kind: 'focused_recommendations',
    generated_at: '2026-10-01T00:00:00Z',
    compass_elements_used: ['purpose', 'transformation'],
    audit_signal_counts: {},
    source_audit_id: AUDIT_1,
    source_fingerprint: 'fp-aaa',
    recommendations: [],
    ...over,
  }) as FocusedSet

/**
 * FocusedContext is a discriminated union: a ready context carries the text,
 * the audit id and the fingerprint; a not-ready one carries only a reason.
 * Two builders rather than one with an override, so the union is respected.
 */
const ready = (over: { auditId?: string; fingerprint?: string } = {}): FocusedContext => ({
  ready: true,
  text: 'the host\u2019s own words',
  compassElementsUsed: ['purpose'],
  signals: {} as never,
  auditId: AUDIT_1,
  fingerprint: 'fp-aaa',
  ...over,
})

const notReady = (): FocusedContext => ({ ready: false, reason: 'compass_unconfirmed' })

describe('C — staleness of the three recommendations', () => {
  test('unchanged context is not stale', () => {
    assert.equal(isStale(set(), ready()), false)
  })

  test('re-confirming an unchanged Compass does NOT make it stale', () => {
    // The whole reason this is a fingerprint and not a timestamp.
    assert.equal(isStale(set(), ready({ fingerprint: 'fp-aaa' })), false)
  })

  test('a changed Audit or Compass makes it stale', () => {
    assert.equal(isStale(set(), ready({ fingerprint: 'fp-bbb' })), true)
  })

  test('context that is not ready is never stale', () => {
    // Nothing to compare against; claiming stale would nag a host who has
    // not finished the Compass.
    assert.equal(isStale(set(), notReady()), false)
  })

  test('a set written before fingerprints falls back to the audit id', () => {
    const old = set({ source_fingerprint: undefined })
    assert.equal(isStale(old, ready({ auditId: AUDIT_1, fingerprint: 'anything' })), false)
    assert.equal(isStale(old, ready({ auditId: AUDIT_2, fingerprint: 'anything' })), true)
  })

  test('a legacy set with no audit id either is not stale', () => {
    const ancient = set({ source_fingerprint: undefined, source_audit_id: '' })
    assert.equal(isStale(ancient, ready({ auditId: AUDIT_2 })), false)
  })

  test('the fingerprint wins over the audit id when both are present', () => {
    // A redone Audit produces a new id AND a new fingerprint; a reworded
    // Compass produces only a new fingerprint. The fingerprint catches both.
    assert.equal(isStale(set(), ready({ auditId: AUDIT_2, fingerprint: 'fp-aaa' })), false)
  })
})
