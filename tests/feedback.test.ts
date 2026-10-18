/**
 * F — feedback submission rules.
 *
 * Feedback is optional and arrives from the browser, so everything the
 * server stores goes through validateSubmission first. The fields a host may
 * set and the field only an admin may set are deliberately different: RLS
 * cannot restrict columns, so review_status is protected by column grants in
 * the database and must never appear in a validated submission.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import {
  validateSubmission,
  LIMITS,
  REVIEW_STATUSES,
  USEFULNESS_OPTIONS,
  MOST_VALUABLE_OPTIONS,
  MOST_VALUABLE_OTHER,
  usefulnessLabel,
  mostValuableLabel,
  reviewStatusLabel,
} from '@/lib/feedback'

const valid = { usefulness: 4, most_valuable: MOST_VALUABLE_OPTIONS[0].value }

describe('the usefulness rating', () => {
  test('1 to 5 are accepted', () => {
    for (const n of [1, 2, 3, 4, 5]) {
      assert.equal(validateSubmission({ ...valid, usefulness: n }).ok, true, String(n))
    }
  })

  test('out of range is refused', () => {
    for (const n of [0, 6, -1, 99]) {
      assert.equal(validateSubmission({ ...valid, usefulness: n }).ok, false, String(n))
    }
  })

  test('non-integers are refused', () => {
    for (const n of [2.5, NaN, 'four', null, undefined, {}]) {
      assert.equal(validateSubmission({ ...valid, usefulness: n }).ok, false, String(n))
    }
  })

  test('every option has a label', () => {
    for (const o of USEFULNESS_OPTIONS) assert.ok(usefulnessLabel(o.value).length > 0)
  })
})

describe('the free-text answers', () => {
  test('blank and whitespace become null, not empty strings', () => {
    const r = validateSubmission({ ...valid, improvement_feedback: '   ', additional_feedback: '' })
    assert.equal(r.ok, true)
    if (r.ok) {
      assert.equal(r.value.improvement_feedback, null)
      assert.equal(r.value.additional_feedback, null)
    }
  })

  test('text is trimmed', () => {
    const r = validateSubmission({ ...valid, improvement_feedback: '  the arrival  ' })
    assert.equal(r.ok, true)
    if (r.ok) assert.equal(r.value.improvement_feedback, 'the arrival')
  })

  test('over the limit is refused, at the limit is accepted', () => {
    const at = 'x'.repeat(LIMITS.improvement)
    const over = 'x'.repeat(LIMITS.improvement + 1)
    assert.equal(validateSubmission({ ...valid, improvement_feedback: at }).ok, true)
    assert.equal(validateSubmission({ ...valid, improvement_feedback: over }).ok, false)
  })

  test('non-strings are refused rather than coerced', () => {
    assert.equal(validateSubmission({ ...valid, improvement_feedback: 42 }).ok, false)
    assert.equal(validateSubmission({ ...valid, additional_feedback: [] }).ok, false)
  })
})

describe('what was most valuable', () => {
  test('every listed option is accepted and labelled', () => {
    for (const o of MOST_VALUABLE_OPTIONS) {
      assert.equal(validateSubmission({ ...valid, most_valuable: o.value }).ok, true, o.value)
      assert.ok(mostValuableLabel(o.value).length > 0)
    }
  })

  test('an unlisted value is refused', () => {
    assert.equal(validateSubmission({ ...valid, most_valuable: 'not_an_option' }).ok, false)
  })

  test('omitting it is allowed — the question is optional', () => {
    const r = validateSubmission({ usefulness: 3 })
    assert.equal(r.ok, true)
    if (r.ok) assert.equal(r.value.most_valuable, null)
  })

  test('the "other" option carries its own bounded text', () => {
    const over = 'x'.repeat(LIMITS.mostValuableOther + 1)
    assert.equal(
      validateSubmission({ usefulness: 3, most_valuable: MOST_VALUABLE_OTHER, most_valuable_other: over }).ok,
      false
    )
  })
})

describe('review_status belongs to us, not the host', () => {
  test('a submission never carries a review status, even if one is sent', () => {
    const r = validateSubmission({ ...valid, review_status: 'reviewed' })
    assert.equal(r.ok, true, 'the extra field is ignored, not an error')
    if (r.ok) {
      assert.ok(
        !('review_status' in (r.value as Record<string, unknown>)),
        'a validated submission must not be able to set it'
      )
    }
  })

  test('the statuses are a closed set with labels', () => {
    assert.ok(REVIEW_STATUSES.length > 0)
    for (const s of REVIEW_STATUSES) assert.ok(reviewStatusLabel(s.value).length > 0)
  })
})

describe('malformed input', () => {
  test('non-objects are refused', () => {
    for (const v of [null, undefined, 'x', 3, []]) {
      // An array is an object, but has no usefulness, so it still fails.
      assert.equal(validateSubmission(v).ok, false, String(v))
    }
  })

  test('an empty object is refused', () => {
    assert.equal(validateSubmission({}).ok, false)
  })
})
