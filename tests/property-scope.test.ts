/**
 * H — property scoping, and the /legend Playbook regression.
 *
 * The bug: journey-state counted the full Guest Journey Playbook by user_id
 * alone, on the strength of a comment claiming the playbooks table had no
 * property_id column. It has one. One property's Playbook counted for every
 * property the host owned — the query still ran, it just answered wrongly.
 *
 * Tested through a fake query builder that records the filters applied, so
 * this needs no database and no credentials. A live verification of the same
 * behaviour lives in tests/live/ and is not part of the release run.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

import { scopeToProperty } from '@/lib/property-scope'

/** Records what was asked of it, and returns itself so it stays chainable. */
class FakeQuery {
  filters: string[] = []
  eq(column: string, value: string) {
    this.filters.push(`${column}=${value}`)
    return this
  }
  is(column: string, value: null) {
    this.filters.push(`${column} IS ${String(value)}`)
    return this
  }
  /** Rows a real query would return, given the filters applied so far. */
  matches(rows: { user_id: string; property_id: string | null }[]) {
    return rows.filter((r) =>
      this.filters.every((f) => {
        if (f === 'property_id IS null') return r.property_id === null
        const [col, val] = f.split('=')
        return String((r as Record<string, unknown>)[col]) === val
      })
    )
  }
}

const PROP_A = 'aaaaaaaa-0000-4000-8000-000000000001'
const PROP_B = 'bbbbbbbb-0000-4000-8000-000000000002'
const USER = 'uuuuuuuu-0000-4000-8000-000000000003'

describe('the scoping convention itself', () => {
  test('an active property filters by equality', () => {
    const q = scopeToProperty(new FakeQuery(), PROP_A)
    assert.deepEqual(q.filters, [`property_id=${PROP_A}`])
  })

  test('no active property filters for the unassigned rows', () => {
    const q = scopeToProperty(new FakeQuery(), null)
    assert.deepEqual(q.filters, ['property_id IS null'])
  })

  test('it never silently skips the filter', () => {
    for (const id of [PROP_A, null]) {
      assert.equal(scopeToProperty(new FakeQuery(), id).filters.length, 1)
    }
  })

  test('it stays chainable', () => {
    const q = scopeToProperty(new FakeQuery().eq('user_id', USER), PROP_A)
    assert.deepEqual(q.filters, [`user_id=${USER}`, `property_id=${PROP_A}`])
  })
})

describe('H — one host, two properties, one Playbook', () => {
  // Property A has a full Guest Journey Playbook. Property B has none.
  const rows = [{ user_id: USER, property_id: PROP_A }]

  const countFor = (propertyId: string | null) =>
    scopeToProperty(new FakeQuery().eq('user_id', USER), propertyId).matches(rows).length

  test('Property A sees its Playbook', () => {
    assert.equal(countFor(PROP_A), 1)
  })

  test('Property B does NOT inherit it — this is the bug', () => {
    assert.equal(countFor(PROP_B), 0)
  })

  test('the unassigned scope does not inherit it either', () => {
    assert.equal(countFor(null), 0)
  })

  test('for comparison, the old user-only query leaked', () => {
    // Exactly what journey-state used to do. Kept so the regression is
    // visible as a contrast rather than described in a comment.
    const old = new FakeQuery().eq('user_id', USER).matches(rows).length
    assert.equal(old, 1, 'the old query returned A’s Playbook whatever property was active')
    assert.notEqual(old, countFor(PROP_B), 'which is precisely what the fix changes')
  })
})

describe('H — each property keeps its own Playbook', () => {
  // B's row is listed last, so any "latest row wins" leak would show here.
  const rows = [
    { user_id: USER, property_id: PROP_A },
    { user_id: USER, property_id: PROP_B },
  ]
  const countFor = (propertyId: string | null) =>
    scopeToProperty(new FakeQuery().eq('user_id', USER), propertyId).matches(rows).length

  test('A counts one', () => assert.equal(countFor(PROP_A), 1))
  test('B counts one', () => assert.equal(countFor(PROP_B), 1))
  test('neither counts two', () => {
    assert.equal(countFor(PROP_A) + countFor(PROP_B), 2)
  })
})

describe('another host never sees these rows', () => {
  test('user scoping still applies', () => {
    const rows = [{ user_id: USER, property_id: PROP_A }]
    const other = scopeToProperty(new FakeQuery().eq('user_id', 'someone-else'), PROP_A)
    assert.equal(other.matches(rows).length, 0)
  })
})
