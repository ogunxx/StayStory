import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

/**
 * The StayStory Method page — Hero.
 *
 * Three parts, as in the approved mockup: the idea on the left, the guest
 * journey through the middle, and the Guest Journey Playbook as the thing it
 * all leads to on the right.
 *
 * All copy lives in the exported constants below so labels, stage names, CTA
 * text and destinations can change without touching the layout. The Playbook
 * callout is its own container — set `PLAYBOOK.image` to swap the in-code
 * version for a real screenshot.
 */

export const HERO = {
  label: 'The StayStory Method',
  headline: 'Great hospitality isn’t accidental. It’s designed.',
  supporting:
    'Memorable guest experiences aren’t created by adding more amenities. They’re shaped on purpose — around what guests notice, what they feel, and what they still talk about after they leave.',
  primaryLabel: 'Explore the Method',
  primaryHref: '#the-problem',
  secondaryLabel: 'See the Platform',
  secondaryHref: '/#platform',
}

/** The guest journey shown across the middle. Reorder, rename, add or remove. */
export const JOURNEY_STAGES: { id: string; label: string; icon: string }[] = [
  {
    id: 'dreaming',
    label: 'Dreaming',
    icon: 'M7 17.5a4 4 0 01-.4-8A5.5 5.5 0 0117.3 10a3.75 3.75 0 01-.3 7.5z',
  },
  {
    id: 'booking',
    label: 'Booking',
    icon: 'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4',
  },
  {
    id: 'arriving',
    label: 'Arriving',
    icon: 'M6.5 20V5.5a1 1 0 011-1h9a1 1 0 011 1V20M4.5 20h15 M15.4 12.6a.85.85 0 11-1.7 0 .85.85 0 011.7 0',
  },
  {
    id: 'staying',
    label: 'Staying',
    icon: 'M12 19.5s-6.8-4.3-6.8-9A3.8 3.8 0 0112 8.3a3.8 3.8 0 016.8 2.2c0 4.7-6.8 9-6.8 9z',
  },
  {
    id: 'reflecting',
    label: 'Reflecting',
    icon: 'M20 12.5a7 7 0 01-7 7H5.5l2-2.6A7 7 0 1120 12.5z',
  },
]

export const JOURNEY_CAPTION = 'Intentional moments that create impact'

export const PLAYBOOK = {
  title: 'Guest Journey Playbook',
  supporting: 'A complete guide to the experience you design.',
  ctaLabel: 'Open Your Playbook',
  ctaHref: '/signup',
  /** Set this to replace the in-code callout with a real screenshot. */
  image: undefined as string | undefined,
  imageAlt: 'The Guest Journey Playbook',
}

function StageIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden>
      <path
        d="M4 4.8h5.5A2.5 2.5 0 0112 7.3v12a2 2 0 00-2-2H4zM20 4.8h-5.5A2.5 2.5 0 0012 7.3v12a2 2 0 012-2h6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Journey() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stages. Horizontal from sm up; a vertical rail on phones, where five
          across would shrink the labels past readability. */}
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-0">
        {JOURNEY_STAGES.map((stage, i) => (
          <li
            key={stage.id}
            className="relative flex items-center gap-3 sm:flex-1 sm:flex-col sm:gap-0"
          >
            {/* Line to the next stage, inset so it stops short of both
                circles. Sits at the circles' vertical centre (44px / 2). */}
            {i < JOURNEY_STAGES.length - 1 && (
              <span
                aria-hidden
                className="absolute top-[22px] left-[calc(50%_+_28px)] right-[calc(-50%_+_28px)] hidden h-px bg-border sm:block"
              />
            )}

            <div className="flex items-center gap-3 sm:w-full sm:flex-col sm:gap-0">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-auto">
                <StageIcon d={stage.icon} />
              </span>
              <span className="text-sm text-foreground sm:mt-2.5 sm:text-center sm:text-[0.78rem]">
                {stage.label}
              </span>
            </div>

            {/* Phones: the same link drawn vertically, dropping from the
                circle's centre (44px wide, so 22px in) across the row gap. */}
            {i < JOURNEY_STAGES.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[21.5px] top-11 h-3 w-px bg-border sm:hidden"
              />
            )}
          </li>
        ))}
      </ol>

      <p className="flex items-center gap-4 text-sm font-medium text-primary">
        {JOURNEY_CAPTION}
        <span aria-hidden className="hidden h-px flex-1 bg-primary/30 sm:block" />
        <svg viewBox="0 0 20 20" fill="none" className="hidden size-4 shrink-0 sm:block" aria-hidden>
          <path
            d="M3 10h13m0 0l-4.5-4.5M16 10l-4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </p>
    </div>
  )
}

function PlaybookCallout() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-[0_20px_60px_-38px_rgba(60,40,25,0.5)]">
      {PLAYBOOK.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={PLAYBOOK.image} alt={PLAYBOOK.imageAlt} className="mb-4 block w-full rounded-xl" />
      ) : (
        <span className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookIcon />
        </span>
      )}

      <h2 className="font-serif text-lg leading-snug font-semibold text-foreground">
        {PLAYBOOK.title}
      </h2>
      <p className="mt-2 text-[0.82rem] leading-relaxed text-muted-foreground">
        {PLAYBOOK.supporting}
      </p>
      <Link
        href={PLAYBOOK.ctaHref}
        className={cn(buttonVariants(), 'mt-5 h-10 w-full rounded-lg px-4 text-sm')}
      >
        {PLAYBOOK.ctaLabel}
      </Link>
    </div>
  )
}

export function MethodHero() {
  return (
    <section className="px-6 pt-14 pb-16 lg:pt-16 lg:pb-20">
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.8fr_2.2fr_1fr] lg:items-center lg:gap-12">
        {/* ── The idea ─────────────────────────────────────────────────── */}
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {HERO.label}
          </p>
          <h1 className="font-serif text-[2rem] leading-[1.12] font-semibold tracking-tight text-foreground sm:text-[2.6rem]">
            {HERO.headline}
          </h1>
          <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
            {HERO.supporting}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={HERO.primaryHref}
              className={cn(buttonVariants(), 'h-11 rounded-lg px-6 text-sm')}
            >
              {HERO.primaryLabel}
            </a>
            <Link
              href={HERO.secondaryHref}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-11 rounded-lg border-border px-6 text-sm'
              )}
            >
              {HERO.secondaryLabel}
            </Link>
          </div>
        </div>

        {/* ── The journey ──────────────────────────────────────────────── */}
        <Journey />

        {/* ── What it leads to ─────────────────────────────────────────── */}
        <PlaybookCallout />
      </div>
    </section>
  )
}
