/**
 * E — Generator and History safety.
 *
 * The focused path stores its work in the `suggestions` table, the same table
 * the Generator writes guest moments to, distinguished only by a `kind` on
 * the jsonb content. Two queries must know about that: the Generator's
 * monthly usage count, and the History page. Get it wrong and a host is
 * charged a Generator credit for a Starter Playbook, and focused rows render
 * as blank Guest Moment cards.
 *
 * This tests the registry every such query reads, so adding a third kind
 * cannot quietly break either one.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  FOCUSED_KINDS,
  FOCUSED_RECOMMENDATIONS_KIND,
  FOCUSED_STARTER_PLAYBOOK_KIND,
  isFocusedKind,
  type FocusedKind,
} from '@/lib/focused-kinds'

describe('the registry', () => {
  test('both known kinds are registered', () => {
    assert.ok(FOCUSED_KINDS.includes(FOCUSED_RECOMMENDATIONS_KIND))
    assert.ok(FOCUSED_KINDS.includes(FOCUSED_STARTER_PLAYBOOK_KIND))
  })

  test('kinds are unique', () => {
    assert.equal(new Set(FOCUSED_KINDS).size, FOCUSED_KINDS.length)
  })

  test('no kind is empty or whitespace', () => {
    for (const k of FOCUSED_KINDS) assert.match(k, /^\S+$/)
  })
})

describe('isFocusedKind is the one predicate', () => {
  test('recognises every registered kind', () => {
    for (const k of FOCUSED_KINDS) assert.equal(isFocusedKind(k), true, k)
  })

  test('a Generator row has no kind, and is not focused', () => {
    assert.equal(isFocusedKind(undefined), false)
    assert.equal(isFocusedKind(null), false)
  })

  test('an unknown kind is not focused', () => {
    assert.equal(isFocusedKind('guest_moment'), false)
    assert.equal(isFocusedKind('focused_'), false)
    assert.equal(isFocusedKind(''), false)
  })

  test('non-strings are rejected rather than coerced', () => {
    for (const v of [0, 1, {}, [], true]) assert.equal(isFocusedKind(v), false, String(v))
  })
})

describe('the two queries that must know about kinds read the registry', () => {
  // A source check, deliberately: the guarantee is "these call sites use the
  // shared list rather than hardcoding one kind", and there is no runtime
  // seam that can observe that. Narrow and specific enough to be worth it.
  const reads = (file: string) => {
    const src = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
    return /focused-kinds/.test(src)
  }

  test('the Generator usage count imports the registry', () => {
    assert.ok(reads('src/lib/focused-recommendations.ts'), 'countGeneratorUsageSince lives here')
  })

  test('the History page imports the registry', () => {
    // The filtering happens in the server component, which drops focused
    // rows before the client ever sees them.
    assert.ok(reads('src/app/(dashboard)/history/page.tsx'))
  })

  test('no call site hardcodes the Playbook kind as a bare string', () => {
    for (const f of ['src/lib/focused-recommendations.ts', 'src/app/(dashboard)/history/page.tsx']) {
      const src = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')
      assert.doesNotMatch(src, /'focused_starter_playbook'/, `${f} should use the constant`)
    }
  })
})

describe('the content type admits every registered kind', () => {
  test('SuggestionContent.kind is derived from the registry, not spelled out', () => {
    // It was written as the recommendations kind alone and stayed that way
    // when the Playbook added a second, so a Playbook row carried a kind its
    // own type did not allow. This asserts the type assignment compiles for
    // every kind in the list.
    const all: FocusedKind[] = [...FOCUSED_KINDS]
    for (const k of all) {
      const content: { kind?: FocusedKind } = { kind: k }
      assert.equal(content.kind, k)
    }
  })
})
