import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ctaTextLink } from './cta-styles'

/**
 * The focused homepage's four-step journey.
 *
 * Replaces the six-tool Platform Overview on the focused homepage only. The
 * full overview is untouched and still renders on the full homepage and on
 * /platform — this is a different story about the same product, not a
 * replacement for it.
 *
 * Everything shown is in JOURNEY_STEPS and BRIDGE below: titles, numbers,
 * headlines, copy, the optional second line and the bridge's CTA. Reordering,
 * rewording or renaming a step is an edit to that array, and the connector
 * rail and mobile stacking follow however many steps there are.
 */

export type JourneyStep = {
  id: string
  /** Shown as 01–04. Derived from position, not stored. */
  name: string
  headline: string
  body: string
  /** An optional second line, for a step that earns one. */
  aside?: string
  /** Marks a step whose product work is still being finished. */
  comingSoon?: boolean
}

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 'audit',
    name: 'Experience Audit',
    headline: 'See the stay through your guest’s eyes.',
    body: 'Walk thoughtfully through the experience — from arrival and atmosphere to sleep, amenities, meaningful details and friction. StayStory helps surface what is already working and where the experience could become more intentional.',
  },
  {
    id: 'compass',
    name: 'Experience Compass',
    headline: 'Define what you want guests to feel and remember.',
    body: 'StayStory brings what it learns into a guiding direction for your stay — something you can review, shape and evolve over time.',
  },
  {
    id: 'opportunities',
    name: 'Three Personalized Opportunities',
    headline: 'Discover where the experience could become more memorable.',
    body: 'Using your property, Audit and confirmed Compass, StayStory identifies three opportunities shaped around your particular stay.',
    aside: 'Not more ideas for the sake of more. Three places worth paying attention to.',
  },
  {
    id: 'playbook',
    name: 'Starter Playbook',
    headline: 'Turn insight into something you can actually use.',
    body: 'Bring your experience direction and personalized opportunities together into a practical Starter Playbook designed to help you move from insight to action.',
    // The Starter Playbook is still being built. Saying so is better than
    // describing something a visitor cannot yet use.
    comingSoon: true,
  },
]

export const JOURNEY_HEADING = {
  eyebrow: 'Your first StayStory journey',
  title: 'Four steps, in order.',
  body: 'Each one gives the next something to work from. You can stop after any of them and still have something useful.',
}

export const BRIDGE = {
  title: 'StayStory can grow with you.',
  body: 'The focused journey is the simplest place to begin. The broader StayStory platform includes deeper guest-journey design, experience development, story building and a living Guest Journey Playbook.',
  ctaLabel: 'Explore the Full Platform',
  ctaHref: '/platform',
}

function StepCard({ step, index, total }: { step: JourneyStep; index: number; total: number }) {
  const isLast = index === total - 1

  return (
    <li className="relative flex gap-5 lg:block">
      {/* ── Mobile and tablet: a vertical rail down the left ──────────────
          A real column rather than a diagram scaled down, so the journey
          reads top to bottom on a phone. */}
      <div className="flex flex-col items-center lg:hidden" aria-hidden>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[0.72rem] font-semibold tabular-nums text-primary">
          {String(index + 1).padStart(2, '0')}
        </span>
        {!isLast && <span className="mt-1 w-px flex-1 bg-border" />}
      </div>

      {/* ── Desktop: the number sits above the card, on a horizontal rail ── */}
      <div className="hidden items-center lg:flex" aria-hidden>
        <span className={cn('h-px flex-1', index === 0 ? 'bg-transparent' : 'bg-border')} />
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[0.72rem] font-semibold tabular-nums text-primary">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className={cn('h-px flex-1', isLast ? 'bg-transparent' : 'bg-border')} />
      </div>

      <div className="min-w-0 flex-1 pb-10 lg:pb-0 lg:pt-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-primary">
            {step.name}
          </p>
          {step.comingSoon && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-medium text-secondary-foreground">
              Coming soon
            </span>
          )}
        </div>
        <h3 className="mt-2 font-serif text-[1.3rem] leading-snug font-semibold text-foreground">
          {step.headline}
        </h3>
        <p className="mt-2.5 text-[0.9rem] leading-relaxed text-muted-foreground">{step.body}</p>
        {step.aside && (
          <p className="mt-2.5 border-l-2 border-primary/30 pl-3 text-[0.85rem] leading-relaxed text-foreground">
            {step.aside}
          </p>
        )}
      </div>
    </li>
  )
}

export function HomeJourney({
  steps = JOURNEY_STEPS,
  heading = JOURNEY_HEADING,
  bridge = BRIDGE,
}: {
  steps?: JourneyStep[]
  heading?: typeof JOURNEY_HEADING
  /**
   * null leaves the journey as the whole of the section. The focused homepage
   * passes null: a first-time visitor should finish this section understanding
   * one process, not holding a second, larger system in their head as well.
   * The copy itself is kept and reused on /platform, where someone has asked.
   */
  bridge?: typeof BRIDGE | null
}) {
  return (
    <section id="how-it-works" className="scroll-mt-24 px-6 py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-primary">{heading.eyebrow}</p>
          <h2 className="mt-3 font-serif text-[2rem] leading-[1.1] font-semibold tracking-tight text-foreground sm:text-[2.6rem]">
            {heading.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{heading.body}</p>
        </div>

        {/* One list, two arrangements: a vertical journey with a rail down the
            side on small screens, four connected columns from lg up. */}
        <ol className="mt-12 lg:mt-14 lg:grid lg:grid-cols-4 lg:gap-x-6">
          {steps.map((step, i) => (
            <StepCard key={step.id} step={step} index={i} total={steps.length} />
          ))}
        </ol>

        {bridge && (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:mt-14 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-2xl">
              <h3 className="font-serif text-xl font-semibold text-foreground">{bridge.title}</h3>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
                {bridge.body}
              </p>
            </div>
            <Link href={bridge.ctaHref} className={cn(ctaTextLink, 'shrink-0')}>
              {bridge.ctaLabel} <span aria-hidden>→</span>
            </Link>
          </div>
        )}

      </div>
    </section>
  )
}
