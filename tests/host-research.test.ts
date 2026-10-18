/**
 * Host Research — the public customer-discovery form.
 *
 * The endpoint is unauthenticated, so the server validator is the only thing
 * standing between an arbitrary JSON body and the table. These are the rules
 * it enforces, plus the two decisions around it: whether to offer the
 * fifteen-minute conversation, and whether a submission looks automated.
 *
 * Separation from focused_feedback is asserted at the bottom. They are two
 * datasets on purpose and nothing here should ever reach the other one.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  validateSubmission,
  shouldOfferConversation,
  isValidEmail,
  PROPERTY_TYPES,
  PROPERTY_TYPE_OTHER,
  TESTING_INTERESTS,
  ADMIN_STATUSES,
  LIMITS,
  propertyTypeLabel,
  testingInterestLabel,
  adminStatusLabel,
} from '@/lib/host-research'
import { looksAutomated, HONEYPOT_FIELD } from '@/lib/research-guard'

/** The smallest submission that should be accepted. */
const valid = {
  property_type: 'cabin_tiny_home',
  biggest_challenge: 'Arrivals after dark feel cold.',
  testing_interest: 'yes',
  email: 'host@example.com',
  idempotency_key: 'key-1',
}

const ok = (over: Record<string, unknown> = {}) => validateSubmission({ ...valid, ...over })

describe('question 1 — what they host', () => {
  test('every listed type is accepted and labelled', () => {
    for (const t of PROPERTY_TYPES) {
      assert.equal(ok({ property_type: t.value }).ok, true, t.value)
      assert.ok(propertyTypeLabel(t.value).length > 0)
    }
  })

  test('an unlisted type is refused', () => {
    for (const v of ['castle', '', null, 7, {}]) {
      const r = ok({ property_type: v })
      assert.equal(r.ok, false, String(v))
      if (!r.ok) assert.equal(r.field, 'property_type')
    }
  })

  test('"other" keeps its free text', () => {
    const r = ok({ property_type: PROPERTY_TYPE_OTHER, property_type_other: '  A converted barn  ' })
    assert.equal(r.ok, true)
    if (r.ok) assert.equal(r.value.property_type_other, 'A converted barn')
  })

  test('free text is dropped when the type is not "other"', () => {
    // Someone types into Other, then changes their mind. Dropping it is
    // kinder than refusing the form.
    const r = ok({ property_type: 'boutique', property_type_other: 'leftover' })
    assert.equal(r.ok, true)
    if (r.ok) assert.equal(r.value.property_type_other, null)
  })

  test('over-long free text is refused', () => {
    const r = ok({
      property_type: PROPERTY_TYPE_OTHER,
      property_type_other: 'x'.repeat(LIMITS.propertyTypeOther + 1),
    })
    assert.equal(r.ok, false)
  })
})

describe('question 2 — biggest challenge, the one required open answer', () => {
  test('text is accepted and trimmed', () => {
    const r = ok({ biggest_challenge: '  Check-in is confusing  ' })
    assert.equal(r.ok, true)
    if (r.ok) assert.equal(r.value.biggest_challenge, 'Check-in is confusing')
  })

  test('missing, blank or whitespace-only is refused', () => {
    for (const v of [undefined, null, '', '   ', '\n\t ']) {
      const r = ok({ biggest_challenge: v })
      assert.equal(r.ok, false, JSON.stringify(v))
      if (!r.ok) assert.equal(r.field, 'biggest_challenge')
    }
  })

  test('at the limit passes, over it is refused', () => {
    assert.equal(ok({ biggest_challenge: 'x'.repeat(LIMITS.biggestChallenge) }).ok, true)
    assert.equal(ok({ biggest_challenge: 'x'.repeat(LIMITS.biggestChallenge + 1) }).ok, false)
  })

  test('non-strings are refused rather than coerced', () => {
    for (const v of [42, [], {}, true]) assert.equal(ok({ biggest_challenge: v }).ok, false, String(v))
  })
})

describe('question 3 — what would help, optional', () => {
  test('omitting it is fine', () => {
    const r = ok()
    assert.equal(r.ok, true)
    if (r.ok) assert.equal(r.value.desired_support, null)
  })

  test('blank becomes null, not an empty string', () => {
    const r = ok({ desired_support: '   ' })
    assert.equal(r.ok, true)
    if (r.ok) assert.equal(r.value.desired_support, null)
  })

  test('over the limit is refused', () => {
    assert.equal(ok({ desired_support: 'x'.repeat(LIMITS.desiredSupport + 1) }).ok, false)
  })
})

describe('question 4 — testing interest', () => {
  test('all three values are accepted and labelled', () => {
    for (const t of TESTING_INTERESTS) {
      assert.equal(ok({ testing_interest: t.value }).ok, true, t.value)
      assert.ok(testingInterestLabel(t.value).length > 0)
    }
  })

  test('the set is exactly yes / maybe / not_right_now', () => {
    assert.deepEqual(TESTING_INTERESTS.map((t) => t.value), ['yes', 'maybe', 'not_right_now'])
  })

  test('anything else is refused', () => {
    for (const v of ['definitely', '', null, 1]) {
      const r = ok({ testing_interest: v })
      assert.equal(r.ok, false, String(v))
      if (!r.ok) assert.equal(r.field, 'testing_interest')
    }
  })
})

describe('questions 5 and 6 — name and email', () => {
  test('name is optional and trimmed', () => {
    assert.equal(ok({ name: undefined }).ok, true)
    const r = ok({ name: '  Evie  ' })
    if (r.ok) assert.equal(r.value.name, 'Evie')
  })

  test('email is required', () => {
    for (const v of [undefined, null, '', '  ']) {
      const r = ok({ email: v })
      assert.equal(r.ok, false, String(v))
      if (!r.ok) assert.equal(r.field, 'email')
    }
  })

  test('email is lowercased, so the same person is recognisable later', () => {
    const r = ok({ email: '  Host@Example.COM ' })
    assert.equal(r.ok, true)
    if (r.ok) assert.equal(r.value.email, 'host@example.com')
  })

  test('plausible addresses pass', () => {
    for (const e of ['a@b.co', 'first.last+tag@sub.example.com', "o'brien@example.org"]) {
      assert.equal(isValidEmail(e), true, e)
    }
  })

  test('implausible ones do not', () => {
    for (const e of ['no-at-sign', 'two@@example.com', 'a@b', 'a b@example.com', '@example.com', 'a@.com']) {
      assert.equal(isValidEmail(e), false, e)
    }
  })

  test('an over-long address is refused', () => {
    assert.equal(ok({ email: `${'x'.repeat(LIMITS.email)}@example.com` }).ok, false)
  })
})

describe('internal fields can never be set from a submission', () => {
  const INTERNAL = [
    'admin_status',
    'id',
    'created_at',
    'updated_at',
    'contact_permission',
    'submission_source',
  ]

  test('none of them survives validation', () => {
    const r = validateSubmission({
      ...valid,
      admin_status: 'reviewed',
      id: '00000000-0000-4000-8000-000000000000',
      created_at: '1999-01-01T00:00:00Z',
      updated_at: '1999-01-01T00:00:00Z',
      contact_permission: false,
      submission_source: 'forged',
    })
    assert.equal(r.ok, true, 'extra fields are ignored, not an error that names them')
    if (r.ok) {
      for (const f of INTERNAL) {
        assert.ok(!(f in (r.value as Record<string, unknown>)), `${f} must not pass through`)
      }
    }
  })

  test('the validated value carries only the eight expected keys', () => {
    const r = ok()
    assert.equal(r.ok, true)
    if (r.ok) {
      assert.deepEqual(Object.keys(r.value).sort(), [
        'biggest_challenge',
        'desired_support',
        'email',
        'idempotency_key',
        'name',
        'property_type',
        'property_type_other',
        'testing_interest',
      ])
    }
  })

  test('the insert is built field by field, never spread from the request', () => {
    // The one guarantee with no runtime seam: that host-research-store
    // constructs its row explicitly. A spread would silently undo every
    // assertion above.
    const src = readFileSync(new URL('../src/lib/host-research-store.ts', import.meta.url), 'utf8')
    assert.doesNotMatch(src, /\.\.\.submission/, 'the submission must not be spread into the row')
    assert.doesNotMatch(src, /\.\.\.body/, 'the request body must not be spread into the row')
    assert.match(src, /admin_status, id, created_at and updated_at/, 'and the omission is stated')
  })
})

describe('idempotency', () => {
  test('a key is required', () => {
    assert.equal(ok({ idempotency_key: undefined }).ok, false)
    assert.equal(ok({ idempotency_key: '  ' }).ok, false)
  })

  test('the key travels through unchanged', () => {
    const r = ok({ idempotency_key: 'abc-123' })
    assert.equal(r.ok, true)
    if (r.ok) assert.equal(r.value.idempotency_key, 'abc-123')
  })

  test('two submissions of the same interaction carry the same key', () => {
    // What makes the unique index able to collapse them into one row.
    const first = ok({ idempotency_key: 'same' })
    const second = ok({ idempotency_key: 'same' })
    assert.ok(first.ok && second.ok)
    if (first.ok && second.ok) assert.equal(first.value.idempotency_key, second.value.idempotency_key)
  })

  test('a fresh interaction carries a different key, so it may create a new row', () => {
    const a = ok({ idempotency_key: 'first' })
    const b = ok({ idempotency_key: 'second' })
    assert.ok(a.ok && b.ok)
    if (a.ok && b.ok) assert.notEqual(a.value.idempotency_key, b.value.idempotency_key)
  })

  test('email is deliberately not the key — the same host may answer again', () => {
    const a = ok({ email: 'same@example.com', idempotency_key: 'one' })
    const b = ok({ email: 'same@example.com', idempotency_key: 'two' })
    assert.ok(a.ok && b.ok)
    if (a.ok && b.ok) assert.notEqual(a.value.idempotency_key, b.value.idempotency_key)
  })
})

describe('the fifteen-minute conversation', () => {
  const url = 'https://example.com/book'

  test('yes with a configured URL: offered', () => {
    assert.equal(shouldOfferConversation({ testingInterest: 'yes', callUrl: url }), true)
  })

  test('maybe with a configured URL: offered', () => {
    assert.equal(shouldOfferConversation({ testingInterest: 'maybe', callUrl: url }), true)
  })

  test('not right now: never offered, even with a URL', () => {
    // They answered the question. Asking again is pressure.
    assert.equal(shouldOfferConversation({ testingInterest: 'not_right_now', callUrl: url }), false)
  })

  test('no URL: never offered, whatever they said', () => {
    // A booking button with nowhere to go is worse than no button.
    for (const i of ['yes', 'maybe', 'not_right_now'] as const) {
      assert.equal(shouldOfferConversation({ testingInterest: i, callUrl: '' }), false, i)
      assert.equal(shouldOfferConversation({ testingInterest: i, callUrl: null }), false, i)
      assert.equal(shouldOfferConversation({ testingInterest: i, callUrl: undefined }), false, i)
      assert.equal(shouldOfferConversation({ testingInterest: i, callUrl: '   ' }), false, i)
    }
  })
})

describe('admin status', () => {
  test('exactly three, with labels', () => {
    assert.deepEqual(ADMIN_STATUSES.map((s) => s.value), ['new', 'reviewed', 'follow_up'])
    for (const s of ADMIN_STATUSES) assert.ok(adminStatusLabel(s.value).length > 0)
  })

  test('a row starts as new — the default is the database’s, not the client’s', () => {
    const src = readFileSync(new URL('../supabase-migration.sql', import.meta.url), 'utf8')
    assert.match(src, /admin_status text not null default 'new'/)
  })
})

describe('spam protection', () => {
  test('a filled honeypot is detected', () => {
    assert.equal(looksAutomated({ ...valid, [HONEYPOT_FIELD]: 'http://spam' }), true)
  })

  test('an empty or absent honeypot is not', () => {
    assert.equal(looksAutomated(valid), false)
    assert.equal(looksAutomated({ ...valid, [HONEYPOT_FIELD]: '' }), false)
    assert.equal(looksAutomated({ ...valid, [HONEYPOT_FIELD]: '   ' }), false)
  })

  test('a non-object body does not throw', () => {
    for (const v of [null, undefined, 'x', 5]) assert.equal(looksAutomated(v), false, String(v))
  })
})

describe('malformed bodies', () => {
  test('non-objects are refused', () => {
    for (const v of [null, undefined, 'x', 5, []]) assert.equal(validateSubmission(v).ok, false, String(v))
  })

  test('an empty object is refused', () => {
    assert.equal(validateSubmission({}).ok, false)
  })
})

describe('separate from product Feedback, in storage and in code', () => {
  test('nothing in the research path touches focused_feedback', () => {
    for (const f of [
      'src/lib/host-research.ts',
      'src/lib/host-research-store.ts',
      'src/app/api/research/route.ts',
      'src/components/marketing/help-shape.tsx',
    ]) {
      const src = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')
      // Code, not prose: these files explain the separation in comments, and
      // the comments are the point rather than a violation of it.
      assert.doesNotMatch(src, /\.from\('focused_feedback'\)/, `${f} must not reach the feedback table`)
      assert.doesNotMatch(src, /^import .* from '@\/lib\/feedback'/m, `${f} must not share the feedback rules`)
      assert.doesNotMatch(src, /focused-feedback/, `${f} must not use the feedback store`)
    }
  })

  test('the research path writes only to host_research', () => {
    const src = readFileSync(new URL('../src/lib/host-research-store.ts', import.meta.url), 'utf8')
    const tables = [...src.matchAll(/\.from\('([^']+)'\)/g)].map((m) => m[1])
    assert.ok(tables.length > 0)
    assert.deepEqual([...new Set(tables)], ['host_research'])
  })

  test('the two status vocabularies are independent', () => {
    // They happen to read the same today. Importing one into the other would
    // mean changing a label for admins of one inbox changed the other.
    const src = readFileSync(new URL('../src/lib/host-research.ts', import.meta.url), 'utf8')
    assert.doesNotMatch(src, /REVIEW_STATUSES/)
  })
})

describe('public read protection', () => {
  test('the table grants nothing to anon or authenticated', () => {
    // RLS with zero policies denies everything; the revokes make it explicit
    // and survive someone later adding a policy by mistake.
    const src = readFileSync(new URL('../supabase-migration.sql', import.meta.url), 'utf8')
    const block = src.slice(src.indexOf('create table if not exists host_research'))
    assert.match(block, /alter table host_research enable row level security/)
    assert.match(block, /revoke all on host_research from anon/)
    assert.match(block, /revoke all on host_research from authenticated/)
    assert.doesNotMatch(block, /create policy[^;]*host_research/, 'no policy should open it up')
  })

  test('the store is server-only, so it cannot be imported into the browser', () => {
    const src = readFileSync(new URL('../src/lib/host-research-store.ts', import.meta.url), 'utf8')
    assert.match(src, /^import 'server-only'/m)
  })

  test('the client component never imports the store or the admin client', () => {
    const src = readFileSync(new URL('../src/components/marketing/help-shape.tsx', import.meta.url), 'utf8')
    assert.doesNotMatch(src, /host-research-store/)
    assert.doesNotMatch(src, /getAdminClient|SERVICE_ROLE/)
  })
})
