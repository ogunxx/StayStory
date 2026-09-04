import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

/**
 * The StayStory Method page — Section 7, The Outcome.
 *
 * The page's largest product visual, because this is the first time the
 * visitor sees what the method actually produces.
 *
 * The preview is built from data — sidebar sections, journey stages, key
 * moments, guest feelings — so every label can change as the real Playbook
 * evolves. Set OUTCOME.image to swap the whole thing for a screenshot; the
 * frame and surrounding layout stay put.
 */

export const OUTCOME = {
  label: 'The Outcome',
  headline: 'One living Guest Journey Playbook.',
  supporting:
    'A complete, shareable guide that keeps your team aligned and your experience consistent across every stay.',
  aside: 'Everything in one place. Every moment connected.',
  ctaLabel: 'Explore the Playbook',
  ctaHref: '/signup',
  /** Set to a screenshot path to replace the in-code preview. */
  image: undefined as string | undefined,
  imageAlt: 'The Guest Journey Playbook',
}

/** The subtle "all roads lead here" trail. Not a second Method diagram. */
export const FLOW = ['Audit', 'Compass', 'Blueprint', 'Generator + Story Builder', 'Playbook']

export const PLAYBOOK_SECTIONS = [
  'Overview',
  'Journey',
  'Moments',
  'Details',
  'Team Notes',
  'Resources',
]

const STAGE_ICONS = [
  'M7 17.5a4 4 0 01-.4-8A5.5 5.5 0 0117.3 10a3.75 3.75 0 01-.3 7.5z',
  'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4',
  'M6.5 20V5.5a1 1 0 011-1h9a1 1 0 011 1V20M4.5 20h15 M15.4 12.6a.85.85 0 11-1.7 0 .85.85 0 011.7 0',
  'M12 19.5s-6.8-4.3-6.8-9A3.8 3.8 0 0112 8.3a3.8 3.8 0 016.8 2.2c0 4.7-6.8 9-6.8 9z',
  'M20 12.5a7 7 0 01-7 7H5.5l2-2.6A7 7 0 1120 12.5z',
]

export const JOURNEY_STAGES = ['Dreaming', 'Booking', 'Arriving', 'Staying', 'Reflecting']
export const KEY_MOMENTS = [
  'Pre-arrival welcome',
  'Smooth check-in',
  'Local recommendations',
  'Personal touches',
]
export const GUEST_FEELINGS = ['Excited', 'Welcomed', 'Relaxed', 'Connected', 'Inspired']

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  )
}

function PlaybookPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_30px_80px_-40px_rgba(60,40,25,0.5)]">
      <div className="border-b border-border/60 px-5 py-4">
        <p className="font-serif text-base font-semibold text-foreground">Guest Journey Playbook</p>
      </div>

      <div className="flex">
        {/* Section rail */}
        <nav className="hidden w-36 shrink-0 flex-col gap-0.5 border-r border-border/60 bg-background/50 p-3 sm:flex">
          {PLAYBOOK_SECTIONS.map((s, i) => (
            <span
              key={s}
              className={`rounded-lg px-2.5 py-1.5 text-[0.72rem] ${
                i === 0 ? 'bg-primary/10 font-medium text-foreground' : 'text-muted-foreground'
              }`}
            >
              {s}
            </span>
          ))}
        </nav>

        <div className="min-w-0 flex-1 p-4 sm:p-5">
          {/* Journey across the top */}
          <ol className="flex items-start">
            {JOURNEY_STAGES.map((stage, i) => (
              <li key={stage} className="relative flex min-w-0 flex-1 flex-col items-center">
                {i < JOURNEY_STAGES.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[calc(50%_+_18px)] right-[calc(-50%_+_18px)] top-[15px] h-px bg-border"
                  />
                )}
                <span className="flex size-[30px] items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
                    <path
                      d={STAGE_ICONS[i % STAGE_ICONS.length]}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="mt-1.5 truncate text-[0.58rem] text-muted-foreground">{stage}</span>
              </li>
            ))}
          </ol>

          {/* The three panels */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background p-3.5">
              <PanelTitle>Key Moments</PanelTitle>
              <ul className="flex flex-col gap-1.5">
                {KEY_MOMENTS.map((m) => (
                  <li key={m} className="flex items-start gap-2 text-[0.68rem] leading-snug text-foreground">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/60" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border/70 bg-background p-3.5">
              <PanelTitle>Guest Feelings</PanelTitle>
              <div className="flex flex-wrap gap-1.5">
                {GUEST_FEELINGS.map((f, i) => (
                  <span
                    key={f}
                    className={`rounded-full px-2 py-0.5 text-[0.62rem] ${
                      i % 2 === 0
                        ? 'bg-primary/10 text-primary'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-background p-3.5">
              <PanelTitle>Signature Details</PanelTitle>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-9 rounded-lg bg-gradient-to-br from-accent to-secondary/60" />
                ))}
              </div>
              <p className="mt-2 text-[0.62rem] text-primary">+ Add detail</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MethodOutcome() {
  return (
    <section id="the-outcome" className="px-6 py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.9fr] lg:items-center lg:gap-14">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {OUTCOME.label}
          </p>
          <h2 className="font-serif text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2rem]">
            {OUTCOME.headline}
          </h2>
          <p className="mt-4 max-w-sm text-[0.9rem] leading-relaxed text-muted-foreground">
            {OUTCOME.supporting}
          </p>

          {/* All roads lead here — deliberately a trail of words, not a
              second copy of the Method diagram. */}
          <ul className="mt-6 flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[0.72rem]">
            {FLOW.map((step, i) => (
              <li key={step} className="flex items-center gap-1.5">
                <span
                  className={
                    i === FLOW.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'
                  }
                >
                  {step}
                </span>
                {i < FLOW.length - 1 && (
                  <span aria-hidden className="text-primary/50">
                    →
                  </span>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-6 font-serif text-[1.05rem] leading-snug text-foreground">
            {OUTCOME.aside}
          </p>

          <Link
            href={OUTCOME.ctaHref}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'mt-6 h-11 rounded-lg border-border px-6 text-sm'
            )}
          >
            {OUTCOME.ctaLabel}
            <span aria-hidden className="ml-1.5">→</span>
          </Link>
        </div>

        <div>
          {OUTCOME.image ? (
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_30px_80px_-40px_rgba(60,40,25,0.5)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={OUTCOME.image} alt={OUTCOME.imageAlt} className="block w-full" />
            </div>
          ) : (
            <PlaybookPreview />
          )}
        </div>
      </div>
    </section>
  )
}
