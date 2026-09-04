import Link from 'next/link'
import { LAUREL_IMAGES } from './laurel-images'

/**
 * About — Section 1. Hero.
 *
 * Everything is a prop with a default, so the headline, the supporting line,
 * both CTAs, the photograph and the framed guest quote can each be changed
 * without touching the layout.
 *
 * On the quote: the mockup shows an invented guest line. This uses a real one
 * from Laurel & Lore instead, per the brief's rule on unverified claims.
 */

export function AboutHero({
  eyebrow = 'Our story',
  headline = 'We’re here to help you design stays that stay with your guests.',
  supporting = 'StayStory was created from a simple belief: when you design the right experience on purpose, guests don’t just have a good stay — they remember it.',
  primaryLabel = 'Explore the Platform',
  primaryHref = '/platform',
  secondaryLabel = 'The StayStory Method',
  secondaryHref = '/method',
  image = LAUREL_IMAGES.interior,
  imageAlt = 'Inside Laurel & Lore, the property where the StayStory system was built',
  quote = 'This host had thought of everything.',
  quoteAuthor = 'Jo, Airbnb guest',
}: {
  eyebrow?: string
  headline?: string
  supporting?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  image?: string
  imageAlt?: string
  quote?: string
  quoteAuthor?: string
}) {
  return (
    <section className="grid items-stretch lg:grid-cols-[1fr_1.05fr]">
      {/* Copy. Right-aligned inside its half so it lines up with the site
          container on wide screens without hard-coding a viewport calculation. */}
      <div className="flex items-center px-6 py-14 lg:py-24">
        <div className="w-full max-w-[34rem] lg:ml-auto lg:pr-12">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h1 className="font-serif text-[2.1rem] leading-[1.1] font-semibold tracking-tight text-foreground sm:text-[2.8rem] lg:text-[3.1rem]">
            {headline}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            {supporting}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>

      {/* Photograph with the framed guest quote, as in the mockup. */}
      <div className="relative min-h-[20rem] bg-muted lg:min-h-[32rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={imageAlt} className="absolute inset-0 size-full object-cover" />

        <figure className="absolute left-6 top-6 max-w-[16rem] rounded-xl border border-accent/60 bg-background/95 p-5 shadow-[0_20px_50px_-28px_rgba(60,40,25,0.6)] backdrop-blur-sm sm:left-10 sm:top-10">
          <blockquote className="font-serif text-[1.05rem] leading-snug text-foreground">
            “{quote}”
          </blockquote>
          <figcaption className="mt-3 text-[0.75rem] text-muted-foreground">
            — {quoteAuthor}
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
