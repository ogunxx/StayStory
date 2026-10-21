/**
 * Audit step imagery.
 *
 * Not a judgement about whether a photograph is well framed — that needs
 * eyes, and it was done by rendering the real component at phone and desktop
 * widths. These guard the things that rot silently: a fit mode that stops
 * being per-image, a frame that goes back to a fixed height and crops a
 * desktop twice as hard as a phone, a picture that loses its caption.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  AUDIT_IMAGES,
  AUDIT_IMAGE_FRAME,
  auditImage,
  auditImageFitClass,
  type AuditImage,
} from '@/lib/audit-images'
import { AUDIT_STEPS } from '@/lib/audit-questions'

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')
const CLIENT = 'src/app/(dashboard)/audit/audit-client.tsx'

describe('the fit mode is per image', () => {
  test('an image with no fit is covered', () => {
    assert.equal(auditImageFitClass({}), 'object-cover')
    assert.equal(auditImageFitClass({ fit: undefined }), 'object-cover')
  })

  test('an image asking to be contained is contained', () => {
    assert.equal(auditImageFitClass({ fit: 'contain' }), 'object-contain')
  })

  test('cover is still the default across the set', () => {
    // Containing everything would be as wrong as cropping everything: most of
    // these photographs lose nothing worth keeping at the frame's ratio.
    const covered = Object.values(AUDIT_IMAGES).filter((i) => (i.fit ?? 'cover') === 'cover')
    assert.ok(covered.length >= Object.keys(AUDIT_IMAGES).length - 2, 'cover should stay the norm')
  })

  test('arrival is contained — it is the portrait shot and the step is the approach', () => {
    assert.equal(AUDIT_IMAGES.arrival.fit, 'contain')
  })

  test('nothing declares a fit outside the two that exist', () => {
    for (const [step, image] of Object.entries(AUDIT_IMAGES)) {
      const fit: string = image.fit ?? 'cover'
      assert.ok(['cover', 'contain'].includes(fit), `${step} has fit "${fit}"`)
    }
  })
})

describe('the frame is one shape everywhere', () => {
  test('it is an aspect ratio, not a fixed height', () => {
    // A fixed height with a fluid width means the frame's SHAPE changes with
    // the viewport, so one photograph gets cropped mildly on a phone and
    // brutally on a desktop. That is the bug this replaced.
    assert.match(AUDIT_IMAGE_FRAME, /aspect-/)
    assert.doesNotMatch(AUDIT_IMAGE_FRAME, /(^|\s)h-\d/, 'a fixed height reintroduces the problem')
  })

  test('the component uses the shared frame rather than its own classes', () => {
    const src = read(CLIENT)
    assert.match(src, /AUDIT_IMAGE_FRAME/)
    assert.match(src, /auditImageFitClass\(image\)/)
    assert.doesNotMatch(src, /object-cover/, 'the fit belongs to the image, not the component')
  })

  test('a contained image has neutral ground behind it', () => {
    // Without a background the letterboxed area is whatever is underneath,
    // which reads as a broken image rather than a deliberate margin.
    assert.match(read(CLIENT), /rounded-xl bg-muted \$\{AUDIT_IMAGE_FRAME\}/)
  })

  test('the image fills the frame it is given', () => {
    assert.match(read(CLIENT), /block size-full \$\{auditImageFitClass\(image\)\}/)
  })
})

describe('positioning stays available and sane', () => {
  test('a position, where set, is a two-value CSS object-position', () => {
    for (const [step, image] of Object.entries(AUDIT_IMAGES)) {
      if (!image.position) continue
      assert.match(image.position, /^\d+% \d+%$/, `${step}: "${image.position}"`)
    }
  })

  test('the contained image carries no position', () => {
    // Harmless but misleading: nothing is cropped, so there is no slice to
    // choose. A reader would think it was doing something.
    for (const image of Object.values(AUDIT_IMAGES)) {
      if (image.fit === 'contain') assert.equal(image.position, undefined)
    }
  })

  test('the component still applies a position when one is set', () => {
    assert.match(read(CLIENT), /objectPosition: image\.position/)
  })
})

describe('the set itself', () => {
  test('every step that has an image has a caption naming the property', () => {
    // A photograph of someone else's place, shown to a host auditing their
    // own, reads as a claim about theirs unless it says whose it is.
    for (const [step, image] of Object.entries(AUDIT_IMAGES)) {
      assert.match(image.caption, /Laurel & Lore/, `${step} must say whose property this is`)
    }
  })

  test('every image is served from this app rather than an outside CDN', () => {
    for (const [step, image] of Object.entries(AUDIT_IMAGES)) {
      assert.ok(image.src.startsWith('/images/audit/'), `${step}: ${image.src}`)
    }
  })

  test('every configured image belongs to a real Audit step', () => {
    const ids = new Set(AUDIT_STEPS.map((s) => s.id))
    for (const step of Object.keys(AUDIT_IMAGES)) {
      assert.ok(ids.has(step), `"${step}" is not an Audit step`)
    }
  })

  test('a step with no image is a working state, not a crash', () => {
    assert.equal(auditImage('no-such-step'), undefined)
  })

  test('the lookup returns what the table holds', () => {
    const image: AuditImage | undefined = auditImage('arrival')
    assert.equal(image?.src, AUDIT_IMAGES.arrival.src)
  })
})
