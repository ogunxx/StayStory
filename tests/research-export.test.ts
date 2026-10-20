/**
 * CSV export and the rate-limit guard.
 *
 * The CSV matters more than it looks: a research answer is arbitrary text
 * typed by a stranger, and a spreadsheet treats a cell beginning "=" as a
 * formula to run. These are the escapes that stop that, plus the column list
 * that keeps internal identifiers out of a file people will email around.
 */
import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

import { csvCell, toCsv, CSV_COLUMNS } from '@/lib/host-research-csv'
import { tooManyFrom, remember, RATE_LIMIT, __resetGuard } from '@/lib/research-guard'
import type { HostResearchRecord } from '@/lib/host-research'

const row = (over: Partial<HostResearchRecord> = {}): HostResearchRecord => ({
  id: 'id-1',
  property_type: 'cabin_tiny_home',
  property_type_other: null,
  biggest_challenge: 'Arrivals after dark',
  desired_support: null,
  testing_interest: 'yes',
  name: 'Evie',
  email: 'evie@example.com',
  contact_permission: true,
  submission_source: 'homepage',
  admin_status: 'new',
  created_at: '2026-10-18T09:00:00Z',
  updated_at: '2026-10-18T09:00:00Z',
  ...over,
})

describe('CSV escaping', () => {
  test('ordinary text is quoted', () => {
    assert.equal(csvCell('hello'), '"hello"')
  })

  test('commas and newlines cannot break the row', () => {
    assert.equal(csvCell('a,b'), '"a,b"')
    assert.equal(csvCell('line\nbreak'), '"line\nbreak"')
  })

  test('quotes are doubled', () => {
    assert.equal(csvCell('say "hi"'), '"say ""hi"""')
  })

  test('null and undefined become empty', () => {
    assert.equal(csvCell(null), '""')
    assert.equal(csvCell(undefined), '""')
  })

  test('a formula cannot execute when the file is opened', () => {
    for (const dangerous of ['=1+1', '+1', '-1', '@SUM(A1)', '\t=cmd']) {
      const cell = csvCell(dangerous)
      assert.match(cell, /^"\t/, `${dangerous} should be neutralised with a leading tab`)
    }
  })

  test('text that merely contains = is untouched', () => {
    assert.equal(csvCell('width = 3'), '"width = 3"')
  })
})

describe('the exported file', () => {
  test('starts with the header row', () => {
    const csv = toCsv([])
    assert.equal(csv, CSV_COLUMNS.map((c) => `"${c}"`).join(','))
  })

  test('one line per response, CRLF separated', () => {
    const csv = toCsv([row(), row({ id: 'id-2' })])
    assert.equal(csv.split('\r\n').length, 3)
  })

  test('every row has the same number of fields as the header', () => {
    const csv = toCsv([row({ biggest_challenge: 'has, commas\nand a newline' })])
    const [header, body] = csv.split('\r\n')
    const count = (s: string) => (s.match(/","/g) ?? []).length
    assert.equal(count(body), count(header))
  })

  test('the answers appear', () => {
    const csv = toCsv([row()])
    for (const v of ['Evie', 'evie@example.com', 'Arrivals after dark', 'yes', 'new']) {
      assert.ok(csv.includes(v), v)
    }
  })

  test('internal identifiers and service metadata are NOT exported', () => {
    const csv = toCsv([row({ id: 'SECRET-ID' })])
    assert.doesNotMatch(csv, /SECRET-ID/, 'the primary key should not travel')
    for (const c of CSV_COLUMNS) {
      assert.doesNotMatch(c, /idempotency|source|permission|^id$/i, `${c} should not be a column`)
    }
  })

  test('no IP address can leak, because none is stored', () => {
    const keys = Object.keys(row())
    assert.ok(!keys.some((k) => /ip|address|agent/i.test(k)), keys.join(' '))
  })
})

describe('the rate-limit guard', () => {
  const from = (ip: string) => new Request('https://example.com', { headers: { 'x-forwarded-for': ip } })

  beforeEach(() => __resetGuard())

  test('a first submission is allowed', () => {
    assert.equal(tooManyFrom(from('1.2.3.4')), false)
  })

  test('the limit is reached only after RATE_LIMIT.max successes', () => {
    const r = from('1.2.3.4')
    for (let i = 0; i < RATE_LIMIT.max; i++) {
      assert.equal(tooManyFrom(r), false, `submission ${i + 1} should be allowed`)
      remember(r)
    }
    assert.equal(tooManyFrom(r), true, 'the next one is refused')
  })

  test('one address does not affect another', () => {
    const a = from('1.2.3.4')
    for (let i = 0; i < RATE_LIMIT.max; i++) remember(a)
    assert.equal(tooManyFrom(a), true)
    assert.equal(tooManyFrom(from('5.6.7.8')), false)
  })

  test('the window expires', () => {
    const r = from('1.2.3.4')
    const now = Date.now()
    for (let i = 0; i < RATE_LIMIT.max; i++) remember(r, now)
    assert.equal(tooManyFrom(r, now), true)
    assert.equal(tooManyFrom(r, now + RATE_LIMIT.windowMs + 1), false)
  })

  test('local and unknown addresses are never blocked', () => {
    // Blocking these would break development and anyone behind a proxy we
    // cannot read.
    for (const ip of ['127.0.0.1', '::1']) {
      const r = from(ip)
      for (let i = 0; i < RATE_LIMIT.max * 2; i++) remember(r)
      assert.equal(tooManyFrom(r), false, ip)
    }
    assert.equal(tooManyFrom(new Request('https://example.com')), false, 'no header at all')
  })

  test('only successes count, so a failed attempt is not punished', () => {
    const r = from('9.9.9.9')
    for (let i = 0; i < RATE_LIMIT.max * 2; i++) tooManyFrom(r)
    assert.equal(tooManyFrom(r), false)
  })
})
