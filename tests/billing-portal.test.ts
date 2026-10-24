/**
 * Cancelling, and the paths that get in the way of it.
 *
 * The portal is how a host stops paying us. These tests exist because every
 * failure here is felt at the worst possible moment, and because three of the
 * four things they pin down were wrong in a way nothing would have caught:
 * a raw JSON body rendered as a page, a return URL that read
 * "undefined/account", and a webhook that could silently end paid access
 * mid-period.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  PORTAL_NOTICES,
  accountUrlWithNotice,
  isPortalNotice,
  resolveAppUrl,
} from '@/lib/billing-portal'
import { REFUND_WINDOW_DAYS } from '@/lib/legal'

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')

/** Source with comments stripped, so prose explaining a rule can't satisfy it. */
const code = (f: string) =>
  read(f)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

const PORTAL = 'src/app/api/stripe/portal/route.ts'
const WEBHOOK = 'src/app/api/stripe/webhook/route.ts'
const ACCOUNT_PAGE = 'src/app/(dashboard)/account/page.tsx'
const ACCOUNT_CLIENT = 'src/app/(dashboard)/account/client.tsx'
const REFUNDS_PAGE = 'src/app/refunds/page.tsx'

describe('a host can always reach the way out', () => {
  test('the portal route never answers with a body', () => {
    // The button is a plain form post, so the browser navigates here and
    // renders the response. NextResponse.json would appear as {"error":…}
    // on a blank page to someone trying to cancel.
    const src = code(PORTAL)
    assert.doesNotMatch(src, /NextResponse\.json/, 'every outcome must be a redirect')
    assert.match(src, /NextResponse\.redirect/)
  })

  test('a failure to reach Stripe is caught, not thrown', () => {
    const src = code(PORTAL)
    assert.match(src, /try\s*\{/, 'the portal session call must be guarded')
    assert.match(src, /catch\s*\(/)
    // The guard has to be around the Stripe call specifically.
    const create = src.indexOf('billingPortal.sessions.create')
    const tryAt = src.indexOf('try {')
    assert.ok(tryAt > 0 && create > tryAt, 'the try must open before the Stripe call')
  })

  test('every failure still offers a human', () => {
    for (const [key, text] of Object.entries(PORTAL_NOTICES)) {
      assert.ok(text.length > 40, `${key} needs a real explanation`)
      assert.match(text, /has not changed|has been charged or changed/i, `${key} must reassure`)
      assert.match(text, /email us/i, `${key} must leave a way to reach a person`)
      assert.doesNotMatch(text, /stripe|error|failed|null|undefined/i, `${key} leaks internals`)
    }
  })

  test('a paid tier with no Stripe customer is explained, not treated as broken', () => {
    // Exactly what a plan granted by hand from the admin controls looks like.
    assert.match(code(PORTAL), /back\('no_subscription'\)/)
    assert.doesNotMatch(PORTAL_NOTICES.no_subscription, /wrong|problem|sorry/i)
  })

  test('the signed-out case goes to login, not to a notice', () => {
    assert.match(code(PORTAL), /'\/login'/)
  })
})

describe('return URLs survive a missing NEXT_PUBLIC_APP_URL', () => {
  const requestUrl = 'https://staystory-preview.vercel.app/api/stripe/portal'

  test('a configured origin is used', () => {
    assert.equal(resolveAppUrl('https://staystory.co', requestUrl), 'https://staystory.co')
  })

  test('only the origin is kept from a configured value', () => {
    assert.equal(resolveAppUrl('https://staystory.co/dashboard', requestUrl), 'https://staystory.co')
  })

  test('an unset value falls back to the origin the request arrived on', () => {
    assert.equal(resolveAppUrl(undefined, requestUrl), 'https://staystory-preview.vercel.app')
    assert.equal(resolveAppUrl(null, requestUrl), 'https://staystory-preview.vercel.app')
  })

  test('the strings a missing variable leaves behind are treated as unset', () => {
    // These are the real shapes: an empty Vercel value, and what a template
    // literal writes when the variable is absent.
    for (const bad of ['', '   ', 'undefined', 'null', 'undefined/account']) {
      assert.equal(
        resolveAppUrl(bad, requestUrl),
        'https://staystory-preview.vercel.app',
        JSON.stringify(bad)
      )
    }
  })

  test('the route resolves the URL rather than interpolating the variable', () => {
    const src = code(PORTAL)
    assert.match(src, /resolveAppUrl\(process\.env\.NEXT_PUBLIC_APP_URL, request\.url\)/)
    assert.doesNotMatch(src, /\$\{process\.env\.NEXT_PUBLIC_APP_URL\}/)
  })

  test('the notice travels back on the account URL', () => {
    assert.equal(
      accountUrlWithNotice('https://staystory.co', 'unavailable'),
      'https://staystory.co/account?billing=unavailable'
    )
  })
})

describe('the notice reaches the page without the query string becoming copy', () => {
  test('only our own keys are recognised', () => {
    assert.equal(isPortalNotice('unavailable'), true)
    assert.equal(isPortalNotice('no_subscription'), true)
    for (const bad of [null, undefined, '', 'Something a stranger typed', 'no_subscription ']) {
      assert.equal(isPortalNotice(bad), false, JSON.stringify(bad))
    }
  })

  test('the account page looks the key up rather than rendering it', () => {
    const src = code(ACCOUNT_PAGE)
    assert.match(src, /isPortalNotice\(billing\)/)
    assert.match(src, /PORTAL_NOTICES\[billing\]/)
  })

  test('the notice is shown outside the focused gate', () => {
    // A focused host reaching this needs the answer too, and the plan card
    // they would otherwise read it inside is hidden from them.
    const src = read(ACCOUNT_CLIENT)
    const notice = src.indexOf('billingNotice &&')
    const gate = src.indexOf('{!focused && (')
    assert.ok(notice > 0 && gate > 0)
    assert.ok(notice < gate, 'the notice must render before the plan card')
  })

  test('it is announced, and carries the contact address', () => {
    const src = read(ACCOUNT_CLIENT)
    assert.match(src, /role="status"/)
    assert.match(src, /mailto:\$\{CONTACT_EMAIL\}/)
  })
})

describe('only one event may end paid access', () => {
  test('an unrecognised price yields null, never a tier', () => {
    const src = code(WEBHOOK)
    assert.match(src, /getTierFromPriceId\(priceId: string\): string \| null/)
    assert.match(src, /return legacy \? 'legendary' : null/)
    assert.doesNotMatch(src, /return legacy \? 'legendary' : 'free'/)
  })

  test('subscription.updated writes nothing when the price is unknown', () => {
    const src = code(WEBHOOK)
    const guard = src.indexOf('if (!tier) {')
    assert.ok(guard > 0, 'the handler must guard on an unplaceable price')
    // The profile write has to sit on the other branch of that guard.
    const updated = src.indexOf("event.type === 'customer.subscription.updated'")
    const write = src.indexOf('.update({ tier })')
    assert.ok(updated > 0 && write > guard, 'the tier write must come after the guard')
  })

  test('the drift is loud, because the cause is ours', () => {
    assert.match(read(WEBHOOK), /unrecognised price \$\{priceId\}/)
    assert.match(read(WEBHOOK), /STRIPE_\*_PRICE_ID/)
  })

  test('the downgrade to free belongs to subscription.deleted alone', () => {
    const src = code(WEBHOOK)
    const deleted = src.indexOf("event.type === 'customer.subscription.deleted'")
    const free = src.indexOf("tier: 'free'")
    assert.ok(deleted > 0 && free > deleted, "'free' is only written by the deleted handler")
  })
})

describe('what we tell someone whose subscription has ended', () => {
  test('the email does not promise access it has just removed', () => {
    // It fires when the subscription actually ends — including straight after
    // a refund — and the handler sets the tier to free in the same breath.
    const src = read(WEBHOOK)
    const body = src.slice(src.indexOf("event.type === 'customer.subscription.deleted'"))
    assert.doesNotMatch(
      body,
      /access continues until the end of your current billing period/,
      'this was untrue at the moment it was sent'
    )
    assert.match(body, /now on the free plan/)
    assert.match(body, /won't be charged again/)
  })

  test('it is plan-neutral, so a Portfolio host is not called Legendary', () => {
    // Comments stripped: the note recording WHY the wording changed names
    // the old copy, and must not be read as the copy itself.
    const src = code(WEBHOOK)
    const body = src.slice(src.indexOf("event.type === 'customer.subscription.deleted'"))
    assert.doesNotMatch(body, /Legendary/)
  })

  test('it says the saved work survives, as the Refunds page promises', () => {
    const src = read(WEBHOOK)
    const body = src.slice(src.indexOf("event.type === 'customer.subscription.deleted'"))
    assert.match(body, /Nothing has been deleted/)
    assert.match(read(REFUNDS_PAGE), /Nothing is deleted when you cancel/)
  })

  test('resubscribing points somewhere that sells, during the focused launch', () => {
    // /pricing renders a focused composition with nothing to buy on it;
    // /upgrade is ungated and always offers the plans.
    const src = read(WEBHOOK)
    const body = src.slice(src.indexOf("event.type === 'customer.subscription.deleted'"))
    assert.match(body, /staystory\.co\/upgrade/)
  })
})

describe('the published policy and the product still agree', () => {
  test('the refund window is stated once and read everywhere', () => {
    assert.equal(typeof REFUND_WINDOW_DAYS, 'number')
    assert.ok(REFUND_WINDOW_DAYS > 0)
    const src = read(REFUNDS_PAGE)
    assert.match(src, /REFUND_WINDOW_DAYS/)
    // No hard-coded day count that could drift from the constant.
    assert.doesNotMatch(src, />\s*7[- ]day/)
  })

  test('cancelling is described as self-serve, and the button exists', () => {
    assert.match(read(REFUNDS_PAGE), /Cancel any time from your account/)
    assert.match(read(ACCOUNT_CLIENT), /\/api\/stripe\/portal/)
  })

  test('no proration is offered anywhere, which is what the policy says', () => {
    assert.match(read(REFUNDS_PAGE), /do not refund part of a month/)
    assert.doesNotMatch(code('src/lib/refunds.ts'), /prorat/i)
  })
})
