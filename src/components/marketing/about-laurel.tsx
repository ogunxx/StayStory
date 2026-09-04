import { AIRBNB_URL, LAUREL_IMAGES, LAUREL_URL } from './laurel-images'

/**
 * About — Section 3. Laurel & Lore, where the thinking was tested.
 *
 * Tinted band: copy left, a row of photographs and the Laurel & Lore seal
 * right. Photographs live in `images`, so the row length is editable.
 *
 * The mockup's copy claims "thousands of guest stays". We can't substantiate
 * that, so this states the figure we can — the live rating and review count,
 * passed in from the page and read from Supabase — and links to the listing so
 * anyone can check it.
 */

export const LAUREL_PHOTOS = [
  { src: LAUREL_IMAGES.deck, alt: 'The deck at Laurel & Lore' },
  { src: LAUREL_IMAGES.outdoorShower, alt: 'The outdoor shower at Laurel & Lore' },
  { src: LAUREL_IMAGES.wellness, alt: 'The wellness corner at Laurel & Lore' },
]

function Seal() {
  return (
    <div className="hidden size-28 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full border border-accent bg-background/70 text-center xl:flex">
      <span className="font-serif text-[0.62rem] uppercase tracking-[0.22em] text-foreground">
        Laurel
      </span>
      <span className="font-serif text-[0.62rem] text-muted-foreground">&amp;</span>
      <span className="font-serif text-[0.62rem] uppercase tracking-[0.22em] text-foreground">
        Lore
      </span>
    </div>
  )
}

export function AboutLaurel({
  eyebrow = 'Where the thinking was tested',
  headline = ['Laurel & Lore is where', 'everything started.'],
  body = 'Laurel & Lore is our hospitality brand and our real-world laboratory. Every idea, framework and tool inside StayStory was shaped by real guest stays, real feedback and the conversations that followed.',
  linkLabel = 'Explore Laurel & Lore',
  linkHref = LAUREL_URL,
  images = LAUREL_PHOTOS,
  rating = '4.99',
  reviews = '136',
}: {
  eyebrow?: string
  headline?: string[]
  body?: string
  linkLabel?: string
  linkHref?: string
  images?: { src: string; alt: string }[]
  rating?: string
  reviews?: string
}) {
  return (
    <section className="px-6 py-4">
      <div className="mx-auto w-full max-w-7xl rounded-3xl bg-secondary/25 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:items-center lg:gap-14">
          <div className="min-w-0">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h2 className="font-serif text-[1.7rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2.1rem]">
              {headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-5 max-w-sm text-[0.92rem] leading-relaxed text-muted-foreground">
              {body}
            </p>
            <p className="mt-4 max-w-sm text-[0.92rem] leading-relaxed text-foreground">
              Today it sits at{' '}
              <a
                href={AIRBNB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
              >
                {rating}★ across {reviews} guest reviews
              </a>
              .
            </p>

            <a
              href={linkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4"
            >
              {linkLabel}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="grid min-w-0 flex-1 grid-cols-3 gap-3 sm:gap-4">
              {images.map((img) => (
                <div key={img.src} className="overflow-hidden rounded-2xl bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="block h-32 w-full object-cover sm:h-44 lg:h-52"
                  />
                </div>
              ))}
            </div>
            <Seal />
          </div>
        </div>
      </div>
    </section>
  )
}
