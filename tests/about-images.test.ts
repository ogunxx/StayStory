/**
 * The three Laurel & Lore photographs on the About page.
 *
 * As with the homepage set, these guard the config contract rather than how
 * a picture looks — that was checked by rendering the row at five widths.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

import { LAUREL_PHOTOS, LAUREL_PHOTO_FRAME } from '@/components/marketing/about-laurel'
import { LAUREL_IMAGES } from '@/components/marketing/laurel-images'

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')
const SRC = 'src/components/marketing/about-laurel.tsx'

describe('the three photographs are real local files', () => {
  test('there are three of them', () => {
    assert.equal(LAUREL_PHOTOS.length, 3)
  })

  test('each is served from /public and exists on disk', () => {
    // The row used to hot-link Airbnb's and Squarespace's CDNs, which can
    // start refusing requests with no deploy on our side and nothing in our
    // logs. The Audit images were moved into the repo for exactly that.
    for (const p of LAUREL_PHOTOS) {
      assert.ok(p.src.startsWith('/images/about/'), `${p.src} is not a local path`)
      assert.ok(existsSync(new URL(`../public${p.src}`, import.meta.url)), `missing: ${p.src}`)
    }
  })

  test('no component renders a hot-linked image', () => {
    // On 23 October 2026 Airbnb's CDN started refusing the hero photograph
    // and it rendered as a broken image on the live About page, with nothing
    // in our logs — the request never reached us. Any remote image is one
    // outage away from that, so the rule is: if a component renders it, it
    // lives in /public.
    const rendered = ['about-hero', 'about-origin', 'about-laurel']
      .flatMap((f) => [...read(`src/components/marketing/${f}.tsx`).matchAll(/LAUREL_IMAGES\.(\w+)/g)])
      .map((m) => m[1])
    assert.ok(rendered.length >= 5, 'expected to find the image references')
    for (const key of new Set(rendered)) {
      const url = LAUREL_IMAGES[key as keyof typeof LAUREL_IMAGES]
      assert.doesNotMatch(url, /^https?:/, `${key} is hot-linked and rendered: ${url}`)
    }
  })

  test('the keys the About page renders are local, whatever else is not', () => {
    // `exterior` is the hero; `interior` is the origin section beneath it.
    for (const key of ['rv', 'outdoorShower', 'wellness', 'exterior', 'interior'] as const) {
      assert.ok(LAUREL_IMAGES[key].startsWith('/images/'), `${key}: ${LAUREL_IMAGES[key]}`)
      assert.ok(
        existsSync(new URL(`../public${LAUREL_IMAGES[key]}`, import.meta.url)),
        `missing file: ${LAUREL_IMAGES[key]}`
      )
    }
  })

  test('the origin photograph matches its frame, so nothing is cropped', () => {
    // Prepared at 7:5 against an aspect-[7/5] frame. If either moves without
    // the other, the whole-photograph property quietly stops being true.
    const src = read('src/components/marketing/about-origin.tsx')
    assert.match(src, /aspect-\[7\/5\]/)
    assert.doesNotMatch(src, /(^|\s)h-64/, 'a fixed height makes the frame shape move with the viewport')
  })

  test('the origin section takes a fit and a focal position', () => {
    const src = read('src/components/marketing/about-origin.tsx')
    assert.match(src, /imageFit === 'contain'/)
    assert.match(src, /objectPosition: imagePosition/)
    assert.doesNotMatch(src, /object-fill|object-none/)
  })

  test('nothing is baked into the layout as a background', () => {
    const src = read(SRC)
    assert.doesNotMatch(src, /background-image/i)
    assert.doesNotMatch(src, /bg-\[url\(/)
  })

  test('the component reads the config rather than naming a file', () => {
    const src = read(SRC)
    assert.match(src, /src=\{img\.src\}/)
    assert.doesNotMatch(src, /src="\/images\//)
  })
})

describe('framing is shared, and adjustable per photograph', () => {
  test('the frame is a ratio, not a fixed height', () => {
    // A fixed height against a fluid column meant the frame's shape changed
    // with the viewport, cropping a desktop far harder than a phone.
    assert.match(LAUREL_PHOTO_FRAME, /aspect-/)
    assert.doesNotMatch(LAUREL_PHOTO_FRAME, /(^|\s)h-\d/)
  })

  test('the frame adapts at the small breakpoint', () => {
    // Three columns on a phone are ~90px wide; a landscape frame there
    // leaves slivers.
    assert.match(LAUREL_PHOTO_FRAME, /sm:aspect-/)
  })

  test('the component uses the shared frame and per-image fit', () => {
    const src = read(SRC)
    assert.match(src, /LAUREL_PHOTO_FRAME/)
    assert.match(src, /img\.fit === 'contain'/)
    assert.match(src, /objectPosition: img\.position/)
  })

  test('no fit stretches or distorts', () => {
    assert.doesNotMatch(read(SRC), /object-fill|object-none/)
  })

  test('any position set is a two-value CSS object-position', () => {
    for (const p of LAUREL_PHOTOS) {
      if (!p.position) continue
      assert.match(p.position, /^\d+% \d+%$/, `${p.src}: "${p.position}"`)
    }
  })
})

describe('what the photographs claim', () => {
  test('each has alt text describing what is actually shown', () => {
    for (const p of LAUREL_PHOTOS) {
      assert.ok(p.alt.length > 25, `${p.src}: alt text is too thin`)
      assert.match(p.alt, /Laurel & Lore/, `${p.src} should name the property`)
    }
  })

  test('the alt text is not three copies of one sentence', () => {
    const alts = new Set(LAUREL_PHOTOS.map((p) => p.alt))
    assert.equal(alts.size, LAUREL_PHOTOS.length, 'each photograph needs its own description')
  })
})
