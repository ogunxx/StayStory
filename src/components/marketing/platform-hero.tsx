import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

/**
 * Platform page — Section 1, Hero.
 *
 * Product-led rather than idea-led: the Method page explains the thinking,
 * this one shows the thing.
 *
 * The dashboard preview is deliberately isolated. The logged-in dashboard gets
 * designed separately later, so set HERO.image to a screenshot and the whole
 * preview swaps without the hero layout changing.
 */

export const HERO = {
  label: 'The Platform',
  headline: 'Design the experience. Deliver what guests remember.',
  supporting:
    'StayStory is the all-in-one platform for understanding the guest experience you have today, designing the one you want, and delivering it consistently across every stay.',
  primaryLabel: 'Start Free',
  primaryHref: '/signup',
  secondaryLabel: 'Explore the Platform',
  secondaryHref: '#the-system',
  reassurance: ['No credit card', 'Setup in minutes', 'Cancel anytime'],
  /** Set to a screenshot path to replace the in-code dashboard preview. */
  image: undefined as string | undefined,
  imageAlt: 'The StayStory dashboard',
}

/** The six modules shown as tiles in the preview, with their status. */
export const HERO_MODULES = [
  { name: 'Experience Audit', state: 'done' },
  { name: 'Experience Compass', state: 'done' },
  { name: 'Experience Blueprint', state: 'done' },
  { name: 'Generator', state: 'active' },
  { name: 'Story Builder', state: 'todo' },
  { name: 'Guest Journey Playbook', state: 'todo' },
] as const

export const HERO_PROGRESS = { label: 'Designing an unforgettable guest experience', percent: 78 }

export const HERO_NEXT = {
  title: 'Add arrival experience details',
  body: 'Help us understand how guests arrive and what happens when they do.',
  cta: 'Continue',
}

export const HERO_ACTIVITY = [
  { text: 'Added 3 new story moments', when: '2h ago' },
  { text: 'Updated your Experience Compass', when: '1d ago' },
  { text: 'Published to Playbook', when: '2d ago' },
]

function Tick() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-3.5 shrink-0 text-primary" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M6.5 10.3l2.4 2.3 4.6-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DashboardPreview() {
  return (
    <div className="flex overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_30px_80px_-38px_rgba(60,40,25,0.5)]">
      {/* Dark icon rail, as in the mockup. */}
      <div className="hidden w-12 shrink-0 flex-col items-center gap-3 bg-foreground py-4 sm:flex">
        <span className="flex size-6 items-center justify-center text-background">
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5" aria-hidden>
            <path d="M10 1.5l1.9 5.1 5.1 1.9-5.1 1.9L10 15.5l-1.9-5.1L3 8.5l5.1-1.9z" />
          </svg>
        </span>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="size-5 rounded-md border border-background/25" />
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <p className="truncate font-serif text-[0.92rem] font-semibold text-foreground">
              Good morning, Alex
            </p>
            <p className="truncate text-[0.68rem] text-muted-foreground">Laurel &amp; Lore Cottage</p>
          </div>
          <span className="hidden shrink-0 rounded-lg border border-border bg-background px-2.5 py-1 text-[0.62rem] text-muted-foreground sm:inline">
            View as Host
          </span>
        </div>

        <div className="flex flex-col gap-3.5 px-4 pb-4 sm:px-5 sm:pb-5">
          {/* Progress */}
          <div className="rounded-xl border border-border/70 bg-background p-3.5">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p className="truncate text-[0.68rem] text-muted-foreground">
                {HERO_PROGRESS.label}
              </p>
              <span className="shrink-0 text-[0.66rem] font-medium text-foreground">
                {HERO_PROGRESS.percent}%
              </span>
            </div>
            <span className="block h-1.5 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${HERO_PROGRESS.percent}%` }}
              />
            </span>

            <ul className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
              {HERO_MODULES.map((m) => (
                <li
                  key={m.name}
                  className={`flex flex-col justify-between gap-2 rounded-lg border p-2 ${
                    m.state === 'active'
                      ? 'border-primary/30 bg-primary/[0.07]'
                      : 'border-border/70 bg-card'
                  }`}
                >
                  <span className="text-[0.55rem] leading-[1.2] text-foreground">{m.name}</span>
                  <span
                    className={`size-2 rounded-full ${
                      m.state === 'done'
                        ? 'bg-primary'
                        : m.state === 'active'
                          ? 'bg-accent'
                          : 'bg-border'
                    }`}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background p-3.5">
              <p className="text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground">
                Next up
              </p>
              <p className="mt-1 text-[0.72rem] font-medium leading-snug text-foreground">
                {HERO_NEXT.title}
              </p>
              <p className="mt-1 text-[0.64rem] leading-snug text-muted-foreground">
                {HERO_NEXT.body}
              </p>
              <span className="mt-2.5 inline-block rounded-md border border-border px-2.5 py-1 text-[0.62rem] text-foreground">
                {HERO_NEXT.cta}
              </span>
            </div>

            <div className="rounded-xl border border-border/70 bg-background p-3.5">
              <p className="mb-1.5 text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground">
                Recent activity
              </p>
              <ul className="flex flex-col gap-1.5">
                {HERO_ACTIVITY.map((a) => (
                  <li key={a.text} className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[0.64rem] text-foreground">{a.text}</span>
                    <span className="shrink-0 text-[0.58rem] text-muted-foreground">{a.when}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[0.62rem] text-primary">View all activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PlatformHero() {
  return (
    <section className="px-6 pt-14 pb-16 lg:pt-16 lg:pb-20">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.15fr] lg:gap-16">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {HERO.label}
          </p>
          <h1 className="font-serif text-[2.1rem] leading-[1.12] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.1rem]">
            {HERO.headline}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            {HERO.supporting}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={HERO.primaryHref}
              className={cn(buttonVariants(), 'h-12 rounded-xl px-7 text-base')}
            >
              {HERO.primaryLabel}
              <span aria-hidden className="ml-1">→</span>
            </Link>
            <a
              href={HERO.secondaryHref}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-12 rounded-xl border-border px-7 text-base'
              )}
            >
              {HERO.secondaryLabel}
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
            {HERO.reassurance.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-[0.8rem] text-muted-foreground">
                <Tick />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          {HERO.image ? (
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_30px_80px_-38px_rgba(60,40,25,0.5)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HERO.image} alt={HERO.imageAlt} className="block w-full" />
            </div>
          ) : (
            <DashboardPreview />
          )}
        </div>
      </div>
    </section>
  )
}
