/**
 * What the Dashboard tells a host to do next, and why.
 *
 * decideNextStep walks the StayStory sequence and stops at the first thing
 * that is not done. Two rules here are easy to break by accident: a host who
 * already started an Audit must not be told to start one, and a host who is
 * still at the front door must not be sent into the six-tool product.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { decideNextStep, STATUS_LABEL, type JourneyProgress } from '@/lib/journey-sequence'

const NOTHING: JourneyProgress = {
  auditCount: 0,
  pendingCount: 0,
  compassFilled: 0,
  compassConfirmed: false,
  blueprintTouchpoints: 0,
  suggestionCount: 0,
  storyCount: 0,
  playbookCount: 0,
  focusedSetExists: false,
  auditDraftStep: null,
}
const next = (p: Partial<JourneyProgress>) => decideNextStep({ ...NOTHING, ...p })

describe('every recommendation carries its reason', () => {
  const cases: Partial<JourneyProgress>[] = [
    {},
    { auditDraftStep: 1 },
    { auditCount: 1 },
    { auditCount: 1, pendingCount: 2 },
    { auditCount: 1, compassFilled: 3 },
    { auditCount: 1, compassFilled: 8, compassConfirmed: true },
    { auditCount: 1, compassFilled: 8, compassConfirmed: true, focusedSetExists: true },
    { auditCount: 1, compassFilled: 8, compassConfirmed: true, blueprintTouchpoints: 4 },
  ]
  for (const [i, c] of cases.entries()) {
    test(`case ${i} explains itself and points somewhere`, () => {
      const n = next(c)
      assert.ok(n.why.length > 40, 'the reason is never omitted or perfunctory')
      assert.match(n.href, /^\//)
      assert.ok(n.ctaLabel.length > 0)
      assert.ok(n.title.length > 0)
    })
  }
})

describe('B — the Audit, started or not', () => {
  test('nothing done: start with the Audit', () => {
    const n = next({})
    assert.equal(n.stepId, 'audit')
    assert.equal(n.title, 'Start with your Experience Audit')
    assert.equal(n.ctaLabel, 'Run your Audit')
  })

  test('a draft exists: continue, do not start', () => {
    const n = next({ auditDraftStep: 3 })
    assert.equal(n.stepId, 'audit')
    assert.equal(n.ctaLabel, 'Continue your Audit')
    assert.match(n.title, /in progress/i)
    assert.match(n.why, /saved/i, 'tell them the work is still there')
    assert.equal(n.href, '/audit')
  })

  test('a draft at step 0 still counts as started', () => {
    assert.equal(next({ auditDraftStep: 0 }).ctaLabel, 'Continue your Audit')
  })

  test('a completed Audit moves past the Audit entirely', () => {
    // Even if a stale draft step were passed in, auditCount wins.
    assert.notEqual(next({ auditCount: 1, auditDraftStep: 3 }).stepId, 'audit')
  })
})

describe('the Compass gates what follows', () => {
  test('pending contributions are reviewed before anything else', () => {
    const n = next({ auditCount: 1, pendingCount: 2 })
    assert.equal(n.stepId, 'compass')
    assert.match(n.title, /2 Compass insights/)
  })

  test('an empty Compass is shaped next', () => {
    assert.equal(next({ auditCount: 1 }).stepId, 'compass')
  })

  test('a filled but unconfirmed Compass must be confirmed', () => {
    const n = next({ auditCount: 1, compassFilled: 8 })
    assert.equal(n.stepId, 'compass')
    assert.match(n.title, /Confirm/i)
  })
})

describe('C/I — a host at the front door is not sent into the deeper product', () => {
  const frontDoor = { auditCount: 1, compassFilled: 8, compassConfirmed: true }

  test('a confirmed Compass leads to the three opportunities, not the Blueprint', () => {
    const n = next(frontDoor)
    assert.equal(n.stepId, 'recommendations')
    assert.equal(n.href, '/start/recommendations')
  })

  test('an existing set is offered to return to, not regenerated', () => {
    const n = next({ ...frontDoor, focusedSetExists: true })
    assert.equal(n.stepId, 'recommendations')
    assert.match(n.why, /come back to them|stay here/i)
  })

  test('once they open the Blueprint, the full sequence takes over', () => {
    const n = next({ ...frontDoor, blueprintTouchpoints: 4 })
    assert.notEqual(n.stepId, 'recommendations')
  })

  test('a Story or a Playbook also counts as leaving the front door', () => {
    assert.notEqual(next({ ...frontDoor, storyCount: 1 }).stepId, 'recommendations')
    assert.notEqual(next({ ...frontDoor, playbookCount: 1 }).stepId, 'recommendations')
  })
})

describe('status is never communicated by colour alone', () => {
  test('every status has words', () => {
    for (const [k, v] of Object.entries(STATUS_LABEL)) {
      assert.ok(v.length > 0, `${k} has no label`)
    }
  })
})
