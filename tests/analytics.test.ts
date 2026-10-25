/**
 * Microsoft Clarity: installed once, in production only, with everything a
 * host types masked.
 *
 * These test the three properties that would be expensive to get wrong and
 * invisible if we did — a second copy double-counting every session, preview
 * and local traffic polluting a live project, and a recording that captured a
 * password. Not a restatement of the implementation: each one pins a decision
 * that has a reason behind it.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { CLARITY_MASK, CLARITY_PROJECT_ID, shouldLoadClarity } from '@/lib/analytics'

const root = new URL('..', import.meta.url).pathname
const read = (f: string) => readFileSync(join(root, f), 'utf8')

/** Source with comments stripped, so prose explaining a rule can't satisfy it. */
const code = (f: string) =>
  read(f)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

const COMPONENT = 'src/components/analytics/clarity.tsx'
const ROOT_LAYOUT = 'src/app/layout.tsx'
const AUTH_LAYOUT = 'src/app/(auth)/layout.tsx'
const DASH_LAYOUT = 'src/app/(dashboard)/layout.tsx'
const HELP_SHAPE = 'src/components/marketing/help-shape.tsx'
const PRIVACY = 'src/app/privacy/page.tsx'

/** Every .ts/.tsx file under src, so "appears exactly once" can be checked. */
function sourceFiles(dir = join(root, 'src')): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full))
    else if (/\.tsx?$/.test(entry)) out.push(full)
  }
  return out
}

describe('the install exists exactly once', () => {
  test('the sweep actually reads the tree', () => {
    // Guards the three tests below: if this ever returns nothing they would
    // all pass vacuously.
    const files = sourceFiles()
    assert.ok(files.length > 100, `expected a real tree, swept ${files.length} files`)
  })

  test('the project id is written down in one file only', () => {
    const holders = sourceFiles().filter((f) => readFileSync(f, 'utf8').includes(CLARITY_PROJECT_ID))
    assert.deepEqual(
      holders.map((f) => f.slice(root.length)),
      ['src/lib/analytics.ts'],
      'the id belongs in analytics.ts and nowhere else'
    )
  })

  test('nothing loads the Clarity tag except the one component', () => {
    const loaders = sourceFiles().filter((f) => readFileSync(f, 'utf8').includes('clarity.ms/tag'))
    assert.deepEqual(loaders.map((f) => f.slice(root.length)), [COMPONENT])
  })

  test('the component is rendered once, from the root layout', () => {
    const renders = sourceFiles().filter((f) => /<Clarity\s*\/>/.test(readFileSync(f, 'utf8')))
    assert.deepEqual(renders.map((f) => f.slice(root.length)), [ROOT_LAYOUT])
  })

  test('no page carries its own copy', () => {
    // A raw inline snippet pasted into a page would not be caught by the
    // checks above if someone changed the id or the URL while doing it.
    const inline = sourceFiles().filter((f) => {
      const src = readFileSync(f, 'utf8')
      return /\(window,\s*document,\s*"clarity"/.test(src)
    })
    assert.deepEqual(inline.map((f) => f.slice(root.length)), [COMPONENT])
  })
})

describe('production only, and for the stated reason', () => {
  test('production loads it', () => {
    assert.equal(shouldLoadClarity('production'), true)
  })

  test('a preview does not', () => {
    // The reason this function exists: a Vercel preview build reports
    // NODE_ENV as 'production' too, so gating on NODE_ENV would file every
    // preview deploy into the same project as real host sessions.
    assert.equal(shouldLoadClarity('preview'), false)
  })

  test('local work does not, whether the variable is absent or set', () => {
    assert.equal(shouldLoadClarity(undefined), false)
    assert.equal(shouldLoadClarity(null), false)
    assert.equal(shouldLoadClarity(''), false)
    assert.equal(shouldLoadClarity('development'), false)
  })

  test('nothing is coerced into looking like production', () => {
    for (const near of ['Production', 'PRODUCTION', 'production ', 'prod']) {
      assert.equal(shouldLoadClarity(near), false, JSON.stringify(near))
    }
  })

  test('the component reads VERCEL_ENV, not NODE_ENV', () => {
    const src = code(COMPONENT)
    assert.match(src, /shouldLoadClarity\(process\.env\.VERCEL_ENV\)/)
    assert.doesNotMatch(src, /NODE_ENV/)
  })

  test('it returns nothing rather than rendering a disabled script', () => {
    assert.match(code(COMPONENT), /if \(!shouldLoadClarity\([^)]*\)\) return null/)
  })
})

describe('it cannot block the page', () => {
  test('the script is deferred until after hydration', () => {
    assert.match(code(COMPONENT), /strategy="afterInteractive"/)
  })

  test('it goes through next/script rather than a raw tag', () => {
    const src = code(COMPONENT)
    assert.match(src, /^import Script from 'next\/script'/m)
    assert.doesNotMatch(src, /dangerouslySetInnerHTML/)
  })

  test('no npm dependency was added for it', () => {
    const pkg = JSON.parse(read('package.json'))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    for (const name of Object.keys(deps)) {
      assert.doesNotMatch(name, /clarity/i, `${name} should not be needed`)
    }
  })
})

describe('what a host types never reaches a recording', () => {
  test('every signed-in page is masked, from the dashboard shell', () => {
    assert.match(code(DASH_LAYOUT), /data-clarity-mask=\{CLARITY_MASK\}/)
  })

  test('every auth page is masked, from its own layout', () => {
    // A layout, not an attribute per page: these pages have several return
    // branches and some display the address just typed in.
    assert.match(code(AUTH_LAYOUT), /data-clarity-mask=\{CLARITY_MASK\}/)
  })

  test('the public research form is masked', () => {
    assert.match(code(HELP_SHAPE), /data-clarity-mask=\{CLARITY_MASK\}/)
  })

  test('the mask value is what Microsoft documents', () => {
    assert.equal(CLARITY_MASK, 'True')
  })

  test('masking is set in code, never left to the dashboard default', () => {
    // Microsoft documents the attribute as overriding the dashboard setting.
    // That is the whole point: a toggle months from now must not be able to
    // start recording a password.
    const users = sourceFiles().filter((f) =>
      readFileSync(f, 'utf8').includes('data-clarity-mask')
    )
    assert.deepEqual(users.map((f) => f.slice(root.length)).sort(), [
      AUTH_LAYOUT,
      DASH_LAYOUT,
      HELP_SHAPE,
    ].sort())
  })

  test('nothing is ever unmasked', () => {
    const unmasked = sourceFiles().filter((f) =>
      readFileSync(f, 'utf8').includes('data-clarity-unmask')
    )
    assert.deepEqual(unmasked, [], 'an unmask attribute would reopen what we just closed')
  })
})

describe('no host is identified to Microsoft', () => {
  test('the identify API is never called', () => {
    const callers = sourceFiles().filter((f) => /clarity\(\s*['"]identify/.test(readFileSync(f, 'utf8')))
    assert.deepEqual(callers, [], 'identifying a host is a privacy decision, not a wiring one')
  })

  test('no custom tag or variable is set either', () => {
    const setters = sourceFiles().filter((f) =>
      /clarity\(\s*['"](set|consent|upgrade)['"]/.test(readFileSync(f, 'utf8'))
    )
    assert.deepEqual(setters, [], 'nothing is sent to Clarity beyond the page itself')
  })
})

describe('the Privacy page tells the truth about this', () => {
  test('the old claim that nothing tracks is gone', () => {
    // It said "There are no advertising or tracking cookies." Clarity sets
    // two and records sessions, so shipping it without this edit would have
    // made a published statement false.
    assert.doesNotMatch(read(PRIVACY), /no advertising or tracking cookies/)
  })

  test('Clarity, its cookies and the recordings are all disclosed', () => {
    const src = read(PRIVACY)
    assert.match(src, /Microsoft Clarity/)
    assert.match(src, /sets two cookies/)
    assert.match(src, /Session recordings/)
    assert.match(src, /Passwords are never captured/)
  })

  test('Microsoft is named in the list of who else sees data', () => {
    const processors = read('src/lib/legal.ts')
    assert.match(processors, /name: 'Microsoft'/)
    // The list is what the Privacy page renders as complete, so an installed
    // processor missing from it is the page contradicting itself.
    assert.match(processors, /Microsoft Clarity records which pages are visited/)
  })

  test('the advertising promise is kept, narrowed rather than dropped', () => {
    assert.match(read(PRIVACY), /no advertising cookies/)
  })
})
