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
  imageAlt = 'Laurel & Lore at dusk',
}: {
  eyebrow?: string
  /** One line per array entry, so the break point stays editable. */
  headline?: string[]
  paragraphs?: string[]
  closing?: string
  image?: string
  imageAlt?: string
}) {
  return (
    <section className="px-6 py-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="overflow-hidden rounded-2xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={imageAlt} className="block h-64 w-full object-cover sm:h-80 lg:h-[26rem]" />
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
