/**
 * The photographs on "Built for the way you host".
 *
 * These guard the config contract — that a photograph stays a one-line swap
 * and never gets baked into the layout — rather than how any picture looks,
 * which was checked by rendering the section at five widths.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

import { AUDIENCES } from '@/components/marketing/audiences'

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')
const SRC = 'src/components/marketing/audiences.tsx'
const withImage = AUDIENCES.filter((a) => a.image)

describe('a photograph is a one-line swap', () => {
  test('every image is a path into /public, not a remote URL', () => {
    // A remote URL would put the section at the mercy of someone else's
    // uptime, and would not be swappable by dropping in a file.
    for (const a of withImage) {
      assert.ok(a.image!.startsWith('/images/'), `${a.id}: ${a.image}`)
      assert.doesNotMatch(a.image!, /^https?:/, `${a.id} points off-site`)
    }
  })

  test('every image file actually exists', () => {
    for (const a of withImage) {
      assert.ok(existsSync(new URL(`../public${a.image}`, import.meta.url)), `${a.id}: ${a.image}`)
    }
  })

  test('nothing is baked into the layout as a background', () => {
    // The whole point: these stay ordinary <img> assets someone can replace.
    const src = read(SRC)
    assert.doesNotMatch(src, /background-image/i)
    assert.doesNotMatch(src, /bg-\[url\(/)
  })

  test('the component reads the config rather than naming a file', () => {
    const src = read(SRC)
    assert.match(src, /src=\{a\.image\}/)
    assert.doesNotMatch(src, /src="\/images\//, 'a hardcoded src defeats the swap')
  })
})

describe('fit and focal position are per image', () => {
  test('an image with no fit is covered', () => {
    // The default lives in the ImageSlot signature.
    assert.match(read(SRC), /fit = 'cover'/)
  })

  test('both fits are wired, and neither distorts', () => {
    const src = read(SRC)
    assert.match(src, /object-contain/)
    assert.match(src, /object-cover/)
    // object-fill and object-none would stretch or overflow.
    assert.doesNotMatch(src, /object-fill|object-none/)
  })

  test('the component applies the configured position', () => {
    assert.match(read(SRC), /objectPosition: position/)
  })

  test('any position set is a two-value CSS object-position', () => {
    for (const a of AUDIENCES) {
      if (!a.imagePosition) continue
      assert.match(a.imagePosition, /^\d+% \d+%$/, `${a.id}: "${a.imagePosition}"`)
    }
  })

  test('any fit set is one of the two that exist', () => {
    for (const a of AUDIENCES) {
      if (!a.imageFit) continue
      assert.ok(['cover', 'contain'].includes(a.imageFit), `${a.id}: ${a.imageFit}`)
    }
  })
})

describe('the frame and the empty state', () => {
  test('a card with no photograph still has a frame, not a hole', () => {
    // Until a real photograph exists the card shows a warm placeholder.
    // Stock photography would imply customers who do not exist.
    const src = read(SRC)
    assert.match(src, /bg-gradient-to-br from-accent/)
  })

  test('the frame has neutral ground behind it for contained images', () => {
    assert.match(read(SRC), /aspect-\[16\/11\] overflow-hidden rounded-xl bg-muted/)
  })
})

describe('what the pictures claim', () => {
  test('a photograph of the real property says so in its alt text', () => {
    // These are Laurel & Lore, not a customer's property. The alt text is
    // where that is stated, since the card carries no caption.
    for (const a of withImage) {
      assert.ok(a.imageAlt && a.imageAlt.length > 20, `${a.id} needs descriptive alt text`)
      assert.match(a.imageAlt!, /Laurel & Lore/, `${a.id} should name the property`)
    }
  })
})
