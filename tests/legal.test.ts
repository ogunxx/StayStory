/**
 * The legal pages.
 *
 * Not a review of the wording — that needs a lawyer, not a test. These check
 * the things that silently rot: a contact address that drifts out of step
 * with the one the app emails from, a refund window stated as one number on
 * the Refunds page and another beside the payment button, a page that stops
 * naming the entity it is a contract with.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  ENTITY,
  CONTACT_EMAIL,
  LAST_UPDATED,
  REFUND_WINDOW_DAYS,
  PROCESSORS,
  SITE,
} from '@/lib/legal'

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')
const PAGES = ['src/app/terms/page.tsx', 'src/app/privacy/page.tsx', 'src/app/refunds/page.tsx']

describe('the facts live in one place', () => {
  test('no page hardcodes the contact address', () => {
    for (const f of PAGES) {
      assert.doesNotMatch(read(f), /info@|hello@|support@/, `${f} should use CONTACT_EMAIL`)
    }
  })

  test('no page hardcodes the entity name', () => {
    for (const f of PAGES) {
      assert.doesNotMatch(read(f), /Laurel & Lore, LLC/, `${f} should use ENTITY`)
    }
  })

  test('no page hardcodes the refund window', () => {
    // "7 days" written by hand is how Refunds and the checkout button end up
    // promising different things.
    for (const f of [...PAGES, 'src/app/(dashboard)/upgrade/client.tsx']) {
      assert.doesNotMatch(read(f), /\b7[- ]day/i, `${f} should use REFUND_WINDOW_DAYS`)
    }
  })

  test('the shell states the entity, so no page has to remember to', () => {
    const shell = read('src/components/marketing/legal-page.tsx')
    assert.match(shell, /ENTITY\.legalName/)
    assert.match(shell, /ENTITY\.descriptor/)
    assert.match(shell, /LAST_UPDATED/)
  })
})

describe('the constants are usable', () => {
  test('the entity is named and placed', () => {
    assert.ok(ENTITY.legalName.length > 0)
    assert.match(ENTITY.descriptor, /limited liability company/)
    assert.equal(ENTITY.jurisdiction, 'Georgia')
    assert.equal(ENTITY.tradingAs, 'StayStory')
  })

  test('the contact address is a real-looking address at our own domain', () => {
    assert.match(CONTACT_EMAIL, /^[^@\s]+@[^@\s]+\.[^@\s]+$/)
    assert.ok(CONTACT_EMAIL.endsWith(`@${SITE.domain}`), CONTACT_EMAIL)
  })

  test('the refund window is a sane number of days', () => {
    assert.ok(Number.isInteger(REFUND_WINDOW_DAYS))
    assert.ok(REFUND_WINDOW_DAYS > 0 && REFUND_WINDOW_DAYS <= 90, String(REFUND_WINDOW_DAYS))
  })

  test('the last-updated date is a date, not a placeholder', () => {
    assert.ok(!Number.isNaN(Date.parse(LAST_UPDATED)), LAST_UPDATED)
  })
})

describe('the processor list matches what the app actually uses', () => {
  test('every processor has a name, a purpose and a plain explanation', () => {
    for (const p of PROCESSORS) {
      assert.ok(p.name.length > 0)
      assert.ok(p.purpose.length > 0)
      assert.ok(p.detail.length > 30, `${p.name}: "${p.detail}" is too thin to be useful`)
    }
  })

  test('the five the codebase depends on are all declared', () => {
    // A privacy policy that omits a processor is the kind of wrong that
    // matters. These are read off package.json and the integrations.
    // Widened: PROCESSORS is `as const`, so the mapped array is a union
    // of literals and would not accept a plain string in includes().
    const names: string[] = PROCESSORS.map((p) => p.name)
    for (const required of ['Supabase', 'Anthropic', 'Stripe', 'Resend', 'Vercel']) {
      assert.ok(names.includes(required), `${required} is used but not disclosed`)
    }
  })

  test('the AI processor is disclosed as receiving host content', () => {
    // The single most important disclosure, and the one a generic template
    // would miss entirely.
    const anthropic = PROCESSORS.find((p) => p.name === 'Anthropic')!
    assert.match(anthropic.detail, /sent to Anthropic/i)
  })
})

describe('what the pages must say', () => {
  test('Privacy covers the things a reader needs', () => {
    const src = read('src/app/privacy/page.tsx')
    for (const [topic, pattern] of [
      ['what is collected', /What we collect/],
      ['the AI, explicitly', /The AI, specifically/],
      ['third parties', /Who else sees it/],
      ['retention', /How long we keep it/],
      ['user rights', /What you can ask for/],
      ['guest data', /Your guests/],
      ['cookies', /Cookies/],
      ['children', /Children/],
      ['security', /Security/],
    ] as const) {
      assert.match(src, pattern, `Privacy should address ${topic}`)
    }
  })

  test('Privacy promises no selling of personal information', () => {
    assert.match(read('src/app/privacy/page.tsx'), /do not sell personal information/i)
  })

  test('Terms covers the clauses that carry weight', () => {
    const src = read('src/app/terms/page.tsx')
    for (const [topic, pattern] of [
      ['ownership of host content', /Your content is yours/],
      ['ownership of AI output', /drafts for you is yours/],
      ['AI fallibility', /AI gets things wrong/],
      ['billing', /Paying/],
      ['termination', /Stopping/],
      ['liability', /Limit of liability/],
      ['governing law', /governed by the laws/],
    ] as const) {
      assert.match(src, pattern, `Terms should address ${topic}`)
    }
  })

  test('Refunds leads with the answer rather than burying it', () => {
    const src = read('src/app/refunds/page.tsx')
    assert.match(src, /no questions asked/i)
    assert.match(src, /intro=\{`A full refund within/, 'the window belongs in the intro')
  })
})

describe('the pages are reachable', () => {
  test('the footer links to all three', () => {
    const footer = read('src/components/marketing/site-footer.tsx')
    for (const href of ['/terms', '/privacy', '/refunds']) {
      assert.match(footer, new RegExp(`href: '${href}'`), `footer should link ${href}`)
    }
  })

  test('the payment button carries refund, terms and privacy', () => {
    const src = read('src/app/(dashboard)/upgrade/client.tsx')
    for (const href of ['/refunds', '/terms', '/privacy']) {
      assert.ok(src.includes(`href="${href}"`), `checkout should link ${href}`)
    }
  })

  test('signup states what the account holder is agreeing to', () => {
    const src = read('src/app/(auth)/signup/page.tsx')
    assert.match(src, /By creating an account you agree/)
    assert.ok(src.includes('href="/terms"') && src.includes('href="/privacy"'))
  })

  test('the research form links its permission line to the policy', () => {
    const src = read('src/components/marketing/help-shape.tsx')
    assert.match(src, /PERMISSION_LINK/)
    assert.match(src, /href: '\/privacy'/)
  })

  test('each page links to the other two', () => {
    const shell = read('src/components/marketing/legal-page.tsx')
    for (const href of ['/terms', '/privacy', '/refunds']) {
      assert.ok(shell.includes(`href="${href}"`), `shell should link ${href}`)
    }
  })
})
