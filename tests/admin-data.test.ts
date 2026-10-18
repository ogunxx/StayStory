/**
 * G — the admin view of a host's progress.
 *
 * All of this derives from one batched snapshot, so the tests build a
 * snapshot fixture and read it. No database, no service-role key.
 *
 * The two rules worth protecting: every journey fact is keyed by user AND
 * property, so one property's work never speaks for another; and a completed
 * Audit beats a leftover draft row, the same precedence the host-facing
 * journey uses.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  scopeKey,
  journeyFor,
  journeysForUser,
  furthestJourney,
  JOURNEY_STAGES,
  type AdminSnapshot,
  type AdminProfile,
} from '@/lib/admin-data'

const USER = 'user-1'
const OTHER = 'user-2'
const A = { id: 'prop-a', user_id: USER, name: 'Property A', type: 'cabin' }
const B = { id: 'prop-b', user_id: USER, name: 'Property B', type: 'house' }

const profile = (id: string): AdminProfile => ({
  id,
  email: `${id}@example.test`,
  full_name: null,
  tier: 'free',
  created_at: '2026-10-01T00:00:00Z',
  suspended_at: null,
})

/** An empty snapshot; each test fills only the facts it is about. */
function snapshot(over: Partial<AdminSnapshot> = {}): AdminSnapshot {
  return {
    profiles: [profile(USER), profile(OTHER)],
    properties: [A, B],
    auditDone: new Set(),
    auditDrafts: new Map(),
    compassConfirmed: new Set(),
    compassStarted: new Set(),
    recommendations: new Set(),
    starterPlaybooks: new Set(),
    feedback: new Map(),
    lastSignIn: new Map(),
    ...over,
  }
}

describe('scope keys', () => {
  test('a user and a property make one key', () => {
    assert.equal(scopeKey(USER, A.id), `${USER}:${A.id}`)
  })

  test('unassigned work has its own key, distinct from any property', () => {
    assert.notEqual(scopeKey(USER, null), scopeKey(USER, A.id))
  })

  test('two users never share a key', () => {
    assert.notEqual(scopeKey(USER, A.id), scopeKey(OTHER, A.id))
  })
})

describe('G — journey facts are property-scoped', () => {
  const snap = snapshot({
    auditDone: new Set([scopeKey(USER, A.id)]),
    compassConfirmed: new Set([scopeKey(USER, A.id)]),
    starterPlaybooks: new Set([scopeKey(USER, A.id)]),
  })

  test('Property A shows the work done on it', () => {
    const j = journeyFor(snap, USER, A)
    assert.equal(j.auditDone, true)
    assert.equal(j.compassConfirmed, true)
    assert.equal(j.starterPlaybook, true)
  })

  test('Property B inherits none of it', () => {
    const j = journeyFor(snap, USER, B)
    assert.equal(j.auditDone, false)
    assert.equal(j.compassConfirmed, false)
    assert.equal(j.starterPlaybook, false)
    assert.equal(j.stage, 'none')
  })

  test('another user sees none of it either', () => {
    assert.equal(journeyFor(snap, OTHER, A).auditDone, false)
  })

  test('unassigned work is its own journey', () => {
    const s = snapshot({ auditDone: new Set([scopeKey(USER, null)]) })
    assert.equal(journeyFor(s, USER, null).auditDone, true)
    assert.equal(journeyFor(s, USER, A).auditDone, false)
  })
})

describe('G — Audit draft precedence matches the host-facing rule', () => {
  test('a draft with no completed Audit shows the step', () => {
    const s = snapshot({
      auditDrafts: new Map([[scopeKey(USER, A.id), { stepIndex: 3, updatedAt: '2026-10-02T00:00:00Z' }]]),
    })
    const j = journeyFor(s, USER, A)
    assert.equal(j.stage, 'audit_draft')
    assert.equal(j.stageLabel, 'Audit in progress')
    assert.equal(j.auditStep, 3)
  })

  test('a completed Audit beats a leftover draft row', () => {
    const s = snapshot({
      auditDone: new Set([scopeKey(USER, A.id)]),
      auditDrafts: new Map([[scopeKey(USER, A.id), { stepIndex: 3, updatedAt: '2026-10-02T00:00:00Z' }]]),
    })
    const j = journeyFor(s, USER, A)
    assert.equal(j.stage, 'audit_done')
    assert.equal(j.auditStep, null, 'no step number beside a completed Audit')
  })

  test('a draft on Property A never shows against Property B', () => {
    const s = snapshot({
      auditDrafts: new Map([[scopeKey(USER, A.id), { stepIndex: 2, updatedAt: '2026-10-02T00:00:00Z' }]]),
    })
    assert.equal(journeyFor(s, USER, B).auditStep, null)
    assert.equal(journeyFor(s, USER, B).stage, 'none')
  })
})

describe('G — the furthest stage wins, in a fixed order', () => {
  test('the stage list runs furthest to nearest', () => {
    assert.equal(JOURNEY_STAGES[0].id, 'feedback')
    assert.equal(JOURNEY_STAGES.at(-1)!.id, 'none')
  })

  test('feedback outranks a Playbook, which outranks recommendations', () => {
    const key = scopeKey(USER, A.id)
    const all = snapshot({
      feedback: new Map([[key, { id: 'f1', usefulness: 5, review_status: 'new' }]]),
      starterPlaybooks: new Set([key]),
      recommendations: new Set([key]),
      compassConfirmed: new Set([key]),
      auditDone: new Set([key]),
    })
    assert.equal(journeyFor(all, USER, A).stage, 'feedback')
  })

  test('a user is summarised by their furthest property', () => {
    const s = snapshot({ starterPlaybooks: new Set([scopeKey(USER, B.id)]) })
    const journeys = journeysForUser(s, USER)
    assert.equal(furthestJourney(journeys).stage, 'playbook')
    assert.equal(furthestJourney(journeys).propertyId, B.id)
  })

  test('journeysForUser covers every property the user owns', () => {
    const ids = journeysForUser(snapshot(), USER).map((j) => j.propertyId)
    assert.ok(ids.includes(A.id))
    assert.ok(ids.includes(B.id))
  })

  test('another user’s properties are not included', () => {
    const ids = journeysForUser(snapshot(), OTHER).map((j) => j.propertyId)
    assert.ok(!ids.includes(A.id))
    assert.ok(!ids.includes(B.id))
  })
})

describe('G — the funnel counts people, not rows', () => {
  // A host with two properties that both completed an Audit is one person
  // who completed an Audit, and the funnel must never widen as it deepens.
  const key = (p: string | null) => scopeKey(USER, p)
  const snap = snapshot({
    auditDone: new Set([key(A.id), key(B.id)]),
    compassConfirmed: new Set([key(A.id)]),
  })

  const reached = (stage: 'auditDone' | 'compassConfirmed') =>
    snap.profiles.filter((p) => journeysForUser(snap, p.id).some((j) => j[stage])).length

  test('two Audits on one account is one person', () => {
    assert.equal(snap.auditDone.size, 2, 'two rows')
    assert.equal(reached('auditDone'), 1, 'one person')
  })

  test('the funnel never widens as it deepens', () => {
    assert.ok(reached('compassConfirmed') <= reached('auditDone'))
  })
})

describe('G — feedback status', () => {
  test('a feedback row is attached to its own property only', () => {
    const s = snapshot({
      feedback: new Map([[scopeKey(USER, A.id), { id: 'f1', usefulness: 4, review_status: 'new' }]]),
    })
    assert.equal(journeyFor(s, USER, A).feedback?.id, 'f1')
    assert.equal(journeyFor(s, USER, B).feedback, null)
  })

  test('no feedback reads as null, not as an empty object', () => {
    assert.equal(journeyFor(snapshot(), USER, A).feedback, null)
  })
})
