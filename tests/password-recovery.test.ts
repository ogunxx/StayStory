/**
 * Password recovery.
 *
 * The rules here are the ones that were wrong in production, plus the ones
 * that would be expensive to get wrong later: what a failed link tells
 * someone to do next, what the form admits about who has an account, and
 * where an email link is allowed to point.
 *
 * Nothing in this file talks to Supabase or sends an email. The behaviour
 * worth protecting is the decision-making, and that is all pure.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  CALLBACK_PATH,
  DESTINATIONS,
  RECOVERY_KEY,
  buildCallbackUrl,
  failureFromParams,
  isSafeOrigin,
  journeyFor,
  noticeKey,
} from '@/lib/auth-redirects'

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')

/**
 * The same file with its comments removed.
 *
 * These files explain their own reasoning at length — the forgot-password
 * page spells out why it must never say "no account with that email", and
 * the reset page describes `updateUser` before calling it. Scanning the raw
 * text for those phrases finds the explanations and reports the opposite of
 * the truth, so anything looking for behaviour reads this instead.
 */
const code = (f: string) =>
  read(f)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
const FORGOT = 'src/app/(auth)/forgot-password/page.tsx'
const RESET = 'src/app/(auth)/reset-password/page.tsx'
const LOGIN = 'src/app/(auth)/login/page.tsx'
const CALLBACK = 'src/app/api/auth/callback/route.ts'
const SIGNUP = 'src/app/(auth)/signup/page.tsx'

/* ── The bug this was all about ──────────────────────────────────────────── */

describe('a failed link gives advice that fits the journey', () => {
  /**
   * The production failure: a reset link that did not exchange sent someone
   * to the login page and told them to "sign up again for a new one". They
   * already had an account — that was the whole point — and nothing on the
   * page offered a new reset link. The journey dead-ended.
   */
  test('a failed recovery link does not reuse the confirmation wording', () => {
    assert.notEqual(noticeKey('recover', 'invalid'), noticeKey('confirm', 'invalid'))
    assert.notEqual(noticeKey('recover', 'expired'), noticeKey('confirm', 'expired'))
  })

  test('every notice the callback can emit exists on the login page', () => {
    const login = read(LOGIN)
    for (const journey of ['confirm', 'recover'] as const) {
      for (const failure of ['expired', 'invalid'] as const) {
        const key = noticeKey(journey, failure)
        assert.match(login, new RegExp(`\\b${key}:`), `login page has no notice for "${key}"`)
      }
    }
  })

  test('the recovery notices offer a new reset link, not a signup', () => {
    const login = read(LOGIN)
    // Both recovery notices carry an action pointing at the reset form.
    const recovery = login.slice(login.indexOf('reset_expired:'), login.indexOf('const NOTICES') + 4000)
    const actions = [...recovery.matchAll(/href: '([^']+)'/g)].map((m) => m[1])
    assert.ok(actions.length >= 2, 'both recovery notices need a way forward')
    for (const href of actions) {
      assert.equal(href, '/forgot-password', `recovery notice should lead to the reset form, not ${href}`)
    }
  })

  test('the callback reads the journey before anything can fail', () => {
    // If it were read after the exchange, the failure path would not know
    // which journey it was on — which is exactly how the bug happened.
    const src = read(CALLBACK)
    const journeyAt = src.indexOf('journeyFor(')
    const exchangeAt = src.indexOf('exchangeCodeForSession')
    assert.ok(journeyAt > 0 && exchangeAt > 0)
    assert.ok(journeyAt < exchangeAt, 'the journey must be read before the exchange is attempted')
  })

  test('journeyFor only treats the recovery key as recovery', () => {
    assert.equal(journeyFor(RECOVERY_KEY), 'recover')
    assert.equal(journeyFor(null), 'confirm')
    assert.equal(journeyFor(''), 'confirm')
    assert.equal(journeyFor('dashboard'), 'confirm')
    assert.equal(journeyFor('RESET'), 'confirm', 'matching should not be loose')
  })
})

/* ── Expired and invalid links ───────────────────────────────────────────── */

describe('dead links are read correctly and explained safely', () => {
  test('no error params means no failure', () => {
    assert.equal(failureFromParams({ error: null, errorCode: null }), null)
    assert.equal(failureFromParams({}), null)
  })

  test('an expired one-time password is reported as expired', () => {
    assert.equal(failureFromParams({ errorCode: 'otp_expired' }), 'expired')
    assert.equal(failureFromParams({ error: 'access_denied', errorCode: 'otp_expired' }), 'expired')
  })

  test('anything else is invalid rather than expired', () => {
    assert.equal(failureFromParams({ error: 'access_denied' }), 'invalid')
    assert.equal(failureFromParams({ errorCode: 'bad_oauth_state' }), 'invalid')
  })

  test('the reset page reads the URL fragment, which the server never sees', () => {
    // Supabase reports some dead links in the hash. A fragment is not sent
    // to the server, so if the page does not read it the visitor gets a
    // form that cannot work instead of an explanation.
    const src = read(RESET)
    assert.match(src, /window\.location\.hash/)
    assert.match(src, /failureFromParams/)
  })

  test('the reset page never prints Supabase error text', () => {
    const src = read(RESET)
    assert.doesNotMatch(src, /setError\(\s*updateError\.message/)
    assert.doesNotMatch(src, /\{updateError\.message\}/)
    // It still records it where an engineer can find it.
    assert.match(src, /console\.error\(/)
  })

  test('an invalid reset link offers a route back, not a dead end', () => {
    const src = read(RESET)
    assert.match(src, /href="\/forgot-password"/)
  })
})

/* ── Account enumeration ─────────────────────────────────────────────────── */

describe('the form does not say who has an account', () => {
  test('the confirmation is shown without consulting the result', () => {
    // resetPasswordForEmail's error is usually "no such user". Branching on
    // it would turn this form into a way to enumerate accounts one guess at
    // a time, so the call result is deliberately not inspected.
    const src = read(FORGOT)
    assert.doesNotMatch(src, /const\s*\{\s*error[^}]*\}\s*=\s*await supabase\.auth\.resetPasswordForEmail/)
    assert.match(src, /await supabase\.auth\.resetPasswordForEmail/)
  })

  test('the confirmation copy is conditional about the account existing', () => {
    const src = read(FORGOT)
    assert.match(src, /If there is a StayStory account/i)
  })

  test('nothing on the page says an account was not found', () => {
    const src = code(FORGOT)
    for (const leak of [/no account/i, /not found/i, /isn.t registered/i, /unknown email/i]) {
      assert.doesNotMatch(src, leak, 'the form must not reveal whether an email is registered')
    }
  })
})

/* ── Where an email link may point ───────────────────────────────────────── */

describe('the redirect builder', () => {
  test('production resolves to the real host and the callback path', () => {
    assert.equal(
      buildCallbackUrl('https://staystory.co', { next: RECOVERY_KEY }),
      `https://staystory.co${CALLBACK_PATH}?next=${RECOVERY_KEY}`
    )
  })

  test('a reset link lands on the reset page once exchanged', () => {
    assert.equal(DESTINATIONS[RECOVERY_KEY], '/reset-password')
  })

  test('signup produces exactly what it produced before', () => {
    assert.equal(buildCallbackUrl('https://staystory.co'), `https://staystory.co${CALLBACK_PATH}`)
    assert.equal(
      buildCallbackUrl('https://staystory.co', { plan: 'legendary' }),
      `https://staystory.co${CALLBACK_PATH}?plan=legendary`
    )
  })

  test('localhost still works for development', () => {
    assert.equal(
      buildCallbackUrl('http://localhost:3000', { next: RECOVERY_KEY }),
      `http://localhost:3000${CALLBACK_PATH}?next=${RECOVERY_KEY}`
    )
  })

  test('unsafe origins are refused rather than emailed to someone', () => {
    for (const bad of [
      'javascript:alert(1)',
      'data:text/html,hi',
      'https://staystory.co/path',
      'https://staystory.co?x=1',
      'https://staystory.co#frag',
      'https://user:pw@staystory.co',
      'http://evil.example.com',
      'not a url',
      '',
    ]) {
      assert.equal(isSafeOrigin(bad), false, `${bad} should not be a usable origin`)
      assert.throws(() => buildCallbackUrl(bad), /Refusing/, `${bad} should not build a URL`)
    }
  })

  test('https origins are accepted', () => {
    for (const good of ['https://staystory.co', 'https://www.staystory.co', 'http://localhost:3000']) {
      assert.equal(isSafeOrigin(good), true, good)
    }
  })

  test('both senders use the builder rather than hand-made strings', () => {
    for (const f of [FORGOT, SIGNUP]) {
      assert.match(read(f), /buildCallbackUrl\(/, `${f} should use the shared builder`)
      assert.doesNotMatch(
        read(f),
        /\$\{window\.location\.origin\}\/api\/auth\/callback/,
        `${f} still builds the URL by hand`
      )
    }
  })
})

/* ── Signup must not regress ─────────────────────────────────────────────── */

describe('the confirmation journey is unchanged', () => {
  test('confirmation notices keep their original keys and wording', () => {
    const login = read(LOGIN)
    assert.match(login, /link_expired:/)
    assert.match(login, /link_invalid:/)
    assert.match(login, /sign up again for a new one/)
  })

  test('a confirmation link with no next key still goes to the dashboard', () => {
    assert.equal(journeyFor(null), 'confirm')
    assert.equal(DESTINATIONS[''], undefined)
  })

  test('the paid-plan branch after confirmation is untouched', () => {
    const src = read(CALLBACK)
    assert.match(src, /isPaidPlanId\(plan\)/)
    assert.match(src, /\/upgrade\?plan=/)
  })
})

/* ── The form itself ─────────────────────────────────────────────────────── */

describe('the reset form', () => {
  test('mismatched passwords are rejected before anything is sent', () => {
    const src = code(RESET)
    const guard = src.indexOf('password !== confirm')
    const update = src.indexOf('supabase.auth.updateUser')
    assert.ok(guard > 0, 'the two fields must be compared')
    assert.ok(guard < update, 'the comparison must come before the update call')
  })

  test('it enforces the same minimum length as signup', () => {
    const lengths = (src: string) => [...src.matchAll(/minLength=\{(\d+)\}/g)].map((m) => m[1])
    const signup = lengths(read(SIGNUP))
    const reset = lengths(read(RESET))
    assert.ok(signup.length > 0 && reset.length > 0)
    assert.ok(new Set([...signup, ...reset]).size === 1, 'signup and reset must agree on length')
  })

  test('it runs the same breached-password check as signup', () => {
    assert.match(read(RESET), /checkPwnedPassword/)
    assert.match(read(SIGNUP), /checkPwnedPassword/)
  })

  test('the submit button is disabled while saving', () => {
    assert.match(read(RESET), /disabled=\{saving\}/)
  })

  test('the fields are labelled and declared as new passwords', () => {
    const src = read(RESET)
    assert.match(src, /htmlFor="password"/)
    assert.match(src, /htmlFor="confirm"/)
    assert.equal((src.match(/autoComplete="new-password"/g) ?? []).length, 2)
  })

  test('state changes are announced, not just repainted', () => {
    const src = read(RESET)
    assert.match(src, /role="alert"/, 'errors need announcing')
    assert.match(src, /headingRef\.current\?\.focus\(\)/, 'focus should move on a state change')
  })

  test('no password or token is ever logged', () => {
    const src = read(RESET)
    for (const line of src.split('\n')) {
      if (!line.includes('console.')) continue
      assert.doesNotMatch(line, /\bpassword\b(?!\s*update)/i, `logs a password: ${line.trim()}`)
      assert.doesNotMatch(line, /token|code/i, `logs a token: ${line.trim()}`)
    }
  })

  test('the recovery token is never rendered', () => {
    const src = read(RESET)
    assert.doesNotMatch(src, /\{.*token.*\}/i)
    assert.doesNotMatch(src, /searchParams\.get\('code'\)/)
  })
})
