import { PREVIEWS, type PreviewKey } from './benefit-previews'

/**
 * Section 3 — Why hosts choose StayStory.
 *
 * Each benefit is one entry below and one reusable <BenefitStory> block, so
 * you can:
 *
 *   • edit the title            → `title`
 *   • edit the supporting copy  → `description`
 *   • edit the CTA text         → `ctaLabel`
 *   • change where it goes      → `ctaHref`
 *   • replace the preview       → set `image` (and `imageAlt`) to a screenshot
 *   • reorder the benefits      → move an entry up or down
 *   • add or remove a benefit   → add or delete an entry
 *
 * The left/right rhythm follows position in the array, so reordering keeps
 * the alternating layout correct without any other edit.
 */

export type Benefit = {
  id: string
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  /** Which in-code preview to show when no `image` is set. */
  preview: PreviewKey
  /** Set this to swap the preview for a real screenshot. */
  image?: string
  imageAlt?: string
}

export const BENEFITS: Benefit[] = [
  {
    id: 'see',
    title: 'See what your guests experience.',
    description:
      'Use the Experience Audit to uncover friction, missed opportunities, emotional peaks, and invisible details.',
    ctaLabel: 'See how the Audit works',
    ctaHref: '/platform',
    preview: 'audit',
  },
  {
    id: 'journey',
    title: 'Turn a property into a journey.',
    description:
      'Use the Experience Compass and Blueprint together to decide what the stay should feel like, and intentionally shape the moments before, during, and after it.',
    ctaLabel: 'Explore the Compass and Blueprint',
    ctaHref: '/platform',
    preview: 'journey',
  },
  {
    id: 'create',
    title: 'Turn intention into something guests can feel — and remember.',
    description:
      'Use the Generator and Story Builder to create moments, rituals, touches, and guest-facing language that bring the experience to life.',
    ctaLabel: 'Start creating moments',
    ctaHref: '/signup',
    preview: 'create',
  },
]

function ArrowCta({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className="group inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
    >
      <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden>
        <path
          d="M4 10h11m0 0l-4-4m4 4l-4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  )
}

function Sparkle() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className="size-16 text-primary/35">
      <path
        d="M32 4l4.2 20.4L56 32l-19.8 7.6L32 60l-4.2-20.4L8 32l19.8-7.6z"
        fill="currentColor"
      />
    </svg>
  )
}

function BenefitStory({ benefit, index }: { benefit: Benefit; index: number }) {
  const Preview = PREVIEWS[benefit.preview]
  // Mockup rhythm: preview leads on the first row, then alternates.
  const previewFirst = index % 2 === 0

  return (
    <div
      className={`grid items-center gap-8 lg:gap-14 ${
        // The preview always takes the wider column, whichever side it's on.
        previewFirst ? 'lg:grid-cols-[1.3fr_1fr]' : 'lg:grid-cols-[1fr_1.3fr]'
      }`}
    >
      {/* Copy stays first in the DOM so mobile reads
          headline → explanation → CTA → preview. */}
      <div className={previewFirst ? 'lg:order-2' : 'lg:order-1'}>
        <p className="mb-3 text-[0.7rem] font-semibold tabular-nums tracking-[0.12em] text-primary">
          {String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="font-serif text-2xl leading-tight font-semibold text-foreground sm:text-[1.9rem]">
          {benefit.title}
        </h3>
        <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
          {benefit.description}
        </p>
        <div className="mt-6">
          <ArrowCta label={benefit.ctaLabel} href={benefit.ctaHref} />
        </div>
      </div>

      <div className={previewFirst ? 'lg:order-1' : 'lg:order-2'}>
        {benefit.image ? (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_20px_60px_-34px_rgba(60,40,25,0.45)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={benefit.image} alt={benefit.imageAlt ?? ''} className="block w-full" />
          </div>
        ) : (
          <Preview />
        )}
      </div>
    </div>
  )
}

export function Benefits() {
  return (
    <section id="benefits" className="px-6 py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        {/* ── Intro ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-10">
          <div>
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Why hosts choose StayStory
            </p>
            <h2 className="max-w-2xl font-serif text-[2rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.6rem]">
              Design with intention.
              <br />
              Deliver it consistently.
              <br />
              Give guests something worth remembering.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              StayStory helps you uncover friction, shape meaningful moments, and turn ideas
              into repeatable guest experiences.
            </p>
          </div>
          <div className="hidden shrink-0 pt-6 lg:block">
            <Sparkle />
          </div>
        </div>

        {/* ── Benefit stories ─────────────────────────────────────────── */}
        <div className="mt-16 flex flex-col gap-16 lg:mt-20 lg:gap-24">
          {BENEFITS.map((b, i) => (
            <BenefitStory key={b.id} benefit={b} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
