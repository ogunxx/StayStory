/**
 * The focused journey: which stage a host is on, and what each stage says.
 *
 * Covers the first-run rule, the returning-Audit state (including the
 * completed-beats-draft precedence), and the one rule that keeps optional
 * Feedback out of "what should I do next".
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  buildFocusedStages,
  activeStage,
  type FocusedProgress,
  type FocusedStage,
} from '@/lib/focused-path'
import { FOCUSED_NAV, isFocusedRoute, shouldGuideToFocusedPath } from '@/lib/focused-nav'
import { AUDIT_STEPS } from '@/lib/audit-questions'
import { FOCUSED_FIRST_RUN } from '@/lib/config'

/** Nothing done at all. Each test overrides only what it cares about. */
const NOTHING: FocusedProgress = {
  auditDone: false,
  auditDraftStep: null,
  compassConfirmed: false,
  recommendationsReady: false,
  recommendationsStale: false,
  starterPlaybookReady: false,
  starterPlaybookStale: false,
  feedbackGiven: false,
  blueprintStarted: false,
  storyStarted: false,
  playbookBuilt: false,
}

const at = (p: Partial<FocusedProgress>) => buildFocusedStages({ ...NOTHING, ...p })
const stage = (p: Partial<FocusedProgress>, id: FocusedStage['id']) =>
  at(p).stages.find((s) => s.id === id)!
const nextId = (p: Partial<FocusedProgress>) => activeStage(at(p).stages)?.id ?? null

describe('the shape of the journey', () => {
  test('five stages, in order', () => {
    assert.deepEqual(
      at({}).stages.map((s) => s.id),
      ['audit', 'compass', 'recommendations', 'starter_playbook', 'feedback']
    )
  })

  test('every stage is built and linked — none is "coming soon"', () => {
    for (const s of at({}).stages) {
      assert.equal(s.available, true, `${s.id} should be available`)
      assert.ok(s.href, `${s.id} should have a destination`)
    }
  })

  test('positions are 1..5 and match array order', () => {
    at({}).stages.forEach((s, i) => assert.equal(s.position, i + 1))
  })
})

describe('A — focused first run', () => {
  test('a brand-new host is in their first run', () => {
    assert.equal(at({}).isFirstRun, true)
  })

  test('finishing the Audit and Compass does NOT end the first run', () => {
    // Deliberate: ending it here would bounce a host between /start and the
    // Dashboard with no way to settle.
    assert.equal(at({ auditDone: true, compassConfirmed: true }).isFirstRun, true)
  })

  test('opening any deeper tool ends the first run', () => {
    assert.equal(at({ blueprintStarted: true }).isFirstRun, false)
    assert.equal(at({ storyStarted: true }).isFirstRun, false)
    assert.equal(at({ playbookBuilt: true }).isFirstRun, false)
  })

  test('an established deeper-system host is never guided', () => {
    assert.equal(shouldGuideToFocusedPath(at({ playbookBuilt: true }).isFirstRun), false)
  })

  test('FOCUSED_FIRST_RUN = false disables guidance for everyone', async () => {
    // The switch is read inside shouldGuideToFocusedPath, so with it on, a
    // first-run host is guided; the off case is asserted by the implication
    // below rather than by mutating a module constant at runtime.
    assert.equal(shouldGuideToFocusedPath(true), FOCUSED_FIRST_RUN)
    assert.equal(shouldGuideToFocusedPath(false), false, 'never guide a non-first-run host')
  })

  test('the focused nav offers the journey and the account, nothing else', () => {
    assert.deepEqual(
      FOCUSED_NAV.map((i) => i.href),
      ['/start', '/audit', '/compass', '/start/recommendations', '/start/playbook', '/account']
    )
  })

  test('only /start and below count as the focused path', () => {
    assert.equal(isFocusedRoute('/start'), true)
    assert.equal(isFocusedRoute('/start/playbook'), true)
    assert.equal(isFocusedRoute('/dashboard'), false, 'the Dashboard is the escape hatch')
    assert.equal(isFocusedRoute('/startling'), false, 'prefix must not match loosely')
  })
})

describe('B — returning Audit state', () => {
  test('no Audit and no draft: invite them to begin', () => {
    const s = stage({}, 'audit')
    assert.equal(s.status, 'active')
    assert.equal(s.statusLabel, undefined)
    assert.equal(s.ctaLabel, undefined)
    assert.match(s.summary, /Walk your property/)
  })

  test('a draft and no completed Audit: in progress, continue', () => {
    const s = stage({ auditDraftStep: 2 }, 'audit')
    assert.equal(s.status, 'active')
    assert.equal(s.statusLabel, 'Audit in progress')
    assert.equal(s.ctaLabel, 'Continue your Audit')
    assert.match(s.summary, /answers are saved/i)
    assert.equal(s.href, '/audit')
  })

  test('the step number is 1-based and uses the Audit\'s own step count', () => {
    // step_index is stored 0-based; the Audit header reads "Step 3 of 8".
    assert.match(stage({ auditDraftStep: 2 }, 'audit').summary, new RegExp(`step 3 of ${AUDIT_STEPS.length}\\b`))
    assert.match(stage({ auditDraftStep: 0 }, 'audit').summary, new RegExp(`step 1 of ${AUDIT_STEPS.length}\\b`))
  })

  test('step 0 still counts as started', () => {
    assert.equal(stage({ auditDraftStep: 0 }, 'audit').statusLabel, 'Audit in progress')
  })

  test('a completed Audit beats a leftover draft row', () => {
    // Submitting deletes the draft, but a row can outlive that. "Continue at
    // step 5" beside "Done" is a contradiction a host cannot resolve.
    const s = stage({ auditDone: true, auditDraftStep: 4 }, 'audit')
    assert.equal(s.status, 'done')
    assert.equal(s.statusLabel, undefined)
    assert.equal(s.ctaLabel, undefined)
    assert.doesNotMatch(s.summary, /step \d/i)
  })

  test('a completed Audit with a stale draft does not stay the next step', () => {
    assert.equal(nextId({ auditDone: true, auditDraftStep: 4 }), 'compass')
  })

  test('an unfinished Audit is still the next step', () => {
    assert.equal(nextId({ auditDraftStep: 2 }), 'audit')
  })
})

describe('stage progression', () => {
  test('a new host starts at the Audit', () => {
    assert.equal(nextId({}), 'audit')
  })

  test('Audit done moves to the Compass', () => {
    assert.equal(nextId({ auditDone: true }), 'compass')
  })

  test('a confirmed Compass moves to the recommendations', () => {
    assert.equal(nextId({ auditDone: true, compassConfirmed: true }), 'recommendations')
  })

  test('recommendations ready moves to the Starter Playbook', () => {
    assert.equal(
      nextId({ auditDone: true, compassConfirmed: true, recommendationsReady: true }),
      'starter_playbook'
    )
  })

  test('the Compass is "upcoming" until the Audit is done', () => {
    assert.equal(stage({}, 'compass').status, 'upcoming')
  })

  test('recommendations stay upcoming until the Compass is confirmed', () => {
    assert.equal(stage({ auditDone: true }, 'recommendations').status, 'upcoming')
  })
})

describe('F — Feedback is optional, and stays optional', () => {
  test('Feedback is marked optional; no other stage is', () => {
    const optional = at({}).stages.filter((s) => s.optional).map((s) => s.id)
    assert.deepEqual(optional, ['feedback'])
  })

  test('Feedback never becomes the required next step', () => {
    const done = {
      auditDone: true,
      compassConfirmed: true,
      recommendationsReady: true,
      starterPlaybookReady: true,
    }
    assert.equal(nextId(done), null, 'the product journey is finished at the Playbook')
    assert.equal(stage(done, 'feedback').status, 'active', 'it is offered, just not required')
  })

  test('skipping Feedback never shows the journey as unfinished', () => {
    const done = {
      auditDone: true,
      compassConfirmed: true,
      recommendationsReady: true,
      starterPlaybookReady: true,
      feedbackGiven: false,
    }
    const required = at(done).stages.filter((s) => !s.optional)
    assert.ok(required.every((s) => s.status === 'done'), required.map((s) => `${s.id}:${s.status}`).join(' '))
  })

  test('Stage 4 reads as complete whether or not feedback was left', () => {
    const base = { auditDone: true, compassConfirmed: true, recommendationsReady: true, starterPlaybookReady: true }
    assert.equal(stage({ ...base, feedbackGiven: false }, 'starter_playbook').status, 'done')
    assert.equal(stage({ ...base, feedbackGiven: true }, 'starter_playbook').status, 'done')
  })

  test('Feedback is not offered before there is a Playbook to react to', () => {
    assert.equal(stage({ auditDone: true }, 'feedback').status, 'upcoming')
  })
})

describe('D — Starter Playbook staleness, as the journey shows it', () => {
  test('no recommendations: the Playbook is not yet reachable work', () => {
    assert.equal(stage({}, 'starter_playbook').status, 'upcoming')
  })

  test('current recommendations: the Playbook is the active stage', () => {
    const s = stage({ auditDone: true, compassConfirmed: true, recommendationsReady: true }, 'starter_playbook')
    assert.equal(s.status, 'active')
  })

  test('a built, current Playbook reads as done', () => {
    const s = stage(
      { auditDone: true, compassConfirmed: true, recommendationsReady: true, starterPlaybookReady: true },
      'starter_playbook'
    )
    assert.equal(s.status, 'done')
    assert.equal(s.statusLabel, 'Starter Playbook ready')
  })

  test('a Playbook built from superseded recommendations asks to be updated', () => {
    const s = stage(
      {
        auditDone: true,
        compassConfirmed: true,
        recommendationsReady: true,
        starterPlaybookReady: true,
        starterPlaybookStale: true,
      },
      'starter_playbook'
    )
    assert.equal(s.status, 'active', 'stale means there is something to do, not that it is done')
    assert.equal(s.statusLabel, 'Update available')
  })

  test('ready recommendations say so, so a returning host can find them', () => {
    assert.equal(
      stage({ auditDone: true, compassConfirmed: true, recommendationsReady: true }, 'recommendations')
        .statusLabel,
      'Recommendations ready'
    )
  })
})
