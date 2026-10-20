import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { JOURNEY_STEPS } from './home-journey'

/**
 * What a host can use today, placed first on /platform.
 *
 * Someone who chooses Platform is asking two questions, in this order: what
 * can I actually use, and where is this going. This section answers the first
 * one plainly, and PlatformDirection below it marks where the second begins.
 *
 * The steps come from JOURNEY_STEPS — the same array the homepage renders —
 * so the two pages cannot drift apart or disagree about what exists.
 */

export const TODAY = {
  label: 'Available today',
  headline: 'Start with the StayStory experience available today',
  body: 'One guided process, in four steps. Each gives the next something to work from, and you can stop after any of them and still have something useful.',
  ctaLabel: 'Start your Experience Audit',
  ctaHref: '/signup',
}

export function PlatformToday() {
  return (
    <section id="available-today" className="scroll-mt-24 px-6 py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-primary">{TODAY.label}</p>
          <h2 className="mt-3 font-serif text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2.2rem]">
            {TODAY.headline}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{TODAY.body}</p>
        </div>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {JOURNEY_STEPS.map((step, i) => (
            <li
              key={step.id}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[0.68rem] font-semibold tabular-nums text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {step.comingSoon && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.62rem] font-medium text-secondary-foreground">
                    Coming soon
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-serif text-base font-semibold leading-snug text-foreground">
                {step.name}
              </h3>
              <p className="mt-1.5 text-[0.85rem] leading-relaxed text-muted-foreground">
                {step.headline}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <Link href={TODAY.ctaHref} className={cn(buttonVariants(), 'h-11 px-6')}>
            {TODAY.ctaLabel} <span aria-hidden className="ml-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

/**
 * The line between where to begin and the rest of the system.
 *
 * Worth being precise about what this divides, because it is not built versus
 * unbuilt. The Blueprint, Generator, Story Builder and Guest Journey Playbook
 * are all shipped and in the dashboard today — labelling them "in development"
 * would be a false claim about working software, in the same way inventing a
 * testimonial would be.
 *
 * What is actually true is that they are not part of the guided journey a new
 * host starts with. So this section marks a change of depth, not of
 * availability: here is where to begin, and here is everything else, waiting
 * for when it is useful.
 *
 * The one genuinely unbuilt thing is the focused Starter Playbook, and it
 * carries its own "Coming soon" where it appears.
 */

export const DIRECTION = {
  label: 'The rest of the system',
  headline: 'A broader system for designing the guest experience',
  body: 'The guided journey above is where to begin, and for most hosts it is enough for a long time. Beyond it, StayStory holds tools for mapping the whole guest journey, developing ideas for a particular guest, shaping the story of the stay, and keeping all of it in one living playbook. They are there when you want them — not something to work through on day one.',
}

export function PlatformDirection() {
  return (
    <section className="px-6 pt-8 lg:pt-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="border-t border-border pt-12 lg:pt-16">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {DIRECTION.label}
            </p>
            <h2 className="mt-3 font-serif text-[1.6rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2rem]">
              {DIRECTION.headline}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {DIRECTION.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
