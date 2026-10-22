import { LAUREL_IMAGES } from './laurel-images'

/**
 * About — Section 2. The origin of StayStory.
 *
 * Photograph left, copy right, closing line emphasised — the mockup's
 * arrangement. Body copy is an array so paragraphs can be added, removed or
 * reordered without editing markup.
 *
 * The brief forbids inflating the history — no invented stay counts, no
 * invented performance improvements — so this says only what actually
 * happened.
 */

export const ORIGIN_PARAGRAPHS = [
  'StayStory began inside Laurel & Lore, our own boutique hospitality brand. While hosting guests, we noticed something.',
  'It wasn’t the biggest homes or the nicest amenities that guests remembered. It was the thoughtful details. The feeling of being cared for. The moments that made the stay meaningful.',
  'We realised hosts needed a better way to design those moments on purpose — not guess, not copy, and not leave it to chance.',
]

export function AboutOrigin({
  eyebrow = 'The origin of StayStory',
  headline = ['Built from real stays.', 'Designed for better ones.'],
  paragraphs = ORIGIN_PARAGRAPHS,
  closing = 'So we built the system we wished we had.',
  image = LAUREL_IMAGES.exterior,
  imageAlt = 'Laurel & Lore: the cabin and its deck, the oak, and the guest RV across the lawn',
  imageFit = 'cover',
  imagePosition,
}: {
  eyebrow?: string
  /** One line per array entry, so the break point stays editable. */
  headline?: string[]
  paragraphs?: string[]
  closing?: string
  /** Swap the photograph by pointing this at another file. */
  image?: string
  imageAlt?: string
  /** `contain` when a crop would cost the subject. Neither fit distorts. */
  imageFit?: 'cover' | 'contain'
  /**
   * CSS object-position. Omit for centre. The photograph currently here is
   * already 7:5 — the frame's own shape — so there is nothing to slide and
   * nothing to choose. A replacement of different proportions will want one.
   */
  imagePosition?: string
}) {
  return (
    <section className="px-6 py-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        {/* A ratio rather than a fixed height. The column is fluid, so a
            fixed height meant the frame's SHAPE moved with the viewport —
            about 1.34 on a phone, 1.40 on a desktop, but 2.25 on a tablet,
            where a square photograph lost over half its height for no
            reason anyone chose. 7/5 is the desktop shape, held everywhere. */}
        <div className="aspect-[7/5] overflow-hidden rounded-2xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            style={imagePosition ? { objectPosition: imagePosition } : undefined}
            className={`block size-full ${imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
          />
        </div>

        <div className="min-w-0">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h2 className="font-serif text-[1.8rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2.3rem]">
            {headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <div className="mt-6 flex flex-col gap-4">
            {paragraphs.map((p) => (
              <p key={p} className="max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>

          <p className="mt-6 text-[0.95rem] font-semibold text-primary">{closing}</p>
        </div>
      </div>
    </section>
  )
}
