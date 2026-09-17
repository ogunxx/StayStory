import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { STATUS_LABEL, type CompassHighlight, type JourneyStep, type NextStep, type StepStatus } from '@/lib/journey-state'
import type { ExperienceCompass } from '@/types'

/**
 * The dashboard's orientation layer: where you are, what to do next, what
 * your Compass currently knows, and how the six tools relate.
 *
 * Everything here is rendered from state read elsewhere — this file decides
 * nothing about the host's progress, it only shows it.
 */

/** Status is always a word. Colour is a second signal, never the only one. */
function StatusChip({ status }: { status: StepStatus }) {
  const tone: Record<StepStatus, string> = {
    not_started: 'bg-muted text-muted-foreground',
    in_progress: 'bg-accent text-accent-foreground',
    ready_to_review: 'bg-primary/15 text-primary',
    confirmed: 'bg-secondary text-secondary-foreground',
    completed: 'bg-secondary text-secondary-foreground',
  }
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', tone[status])}>
      {STATUS_LABEL[status]}
    </span>
  )
}

/* ── The recommended next step ───────────────────────────────────────────── */

export function NextStepCard({ next, pendingCount }: { next: NextStep; pendingCount: number }) {
  return (
    <section
      aria-labelledby="next-step-heading"
      className="rounded-2xl border border-primary/20 bg-primary/[0.07] p-6 sm:p-7"
    >
      <p className="text-xs uppercase tracking-widest text-primary mb-2">Your next step</p>
      <h2 id="next-step-heading" className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
        {next.title}
      </h2>
      {/* Why this step follows from the last one. The dashboard teaches the
          connection between tools rather than just linking to them. */}
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{next.why}</p>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Link href={next.href} className={cn(buttonVariants({ size: 'sm' }), 'h-10 px-5')}>
          {next.ctaLabel} →
        </Link>
        {pendingCount > 0 && next.stepId !== 'compass' && (
          <Link href="/compass" className="text-sm font-medium text-primary underline underline-offset-4">
            {pendingCount} Compass {pendingCount === 1 ? 'insight' : 'insights'} ready to review
          </Link>
        )}
      </div>
    </section>
  )
}

/* ── What the Compass currently holds ────────────────────────────────────── */

const COMPASS_STATUS_LABEL: Record<ExperienceCompass['status'], string> = {
  preliminary: 'Preliminary',
  developing: 'Developing',
  confirmed: 'Confirmed',
  evolving: 'Evolving',
}

export function CompassSummary({
  compass,
  highlights,
  pendingCount,
  filled,
  total,
}: {
  compass: ExperienceCompass
  highlights: CompassHighlight[]
  pendingCount: number
  filled: number
  total: number
}) {
  return (
    <section aria-labelledby="compass-heading" className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            The centre of your system
          </p>
          <h2 id="compass-heading" className="font-serif text-lg font-semibold text-foreground">
            Experience Compass
          </h2>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {COMPASS_STATUS_LABEL[compass.status]}
        </span>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Your Experience Compass captures what you want guests to feel, remember and associate with
        your stay. It develops as you move through StayStory.
      </p>

      {highlights.length > 0 ? (
        <dl className="mt-5 flex flex-col gap-3 border-t border-border pt-5">
          {highlights.map((h) => (
            <div key={h.field}>
              <dt className="text-xs uppercase tracking-widest text-muted-foreground">{h.label}</dt>
              {/* line-clamp keeps a long answer from dominating the dashboard;
                  the full text lives on the Compass page. */}
              <dd className="mt-1 text-sm leading-relaxed text-foreground line-clamp-2">{h.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-5 border-t border-border pt-5 text-sm text-muted-foreground">
          StayStory is still learning what matters most to this experience. Nothing has been
          captured yet.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Link href="/compass" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-10 px-5')}>
          {filled === 0 ? 'Start your Compass →' : 'Open your Compass →'}
        </Link>
        <p className="text-xs text-muted-foreground">
          {filled} of {total} answered
          {pendingCount > 0 && (
            <>
              {' · '}
              <span className="font-medium text-primary">
                {pendingCount} ready to review
              </span>
            </>
          )}
        </p>
      </div>
    </section>
  )
}

/* ── The six steps, in sequence ──────────────────────────────────────────── */

export function JourneySteps({ steps }: { steps: JourneyStep[] }) {
  return (
    <section aria-labelledby="journey-heading">
      <div className="mb-4">
        <h2 id="journey-heading" className="text-xs uppercase tracking-widest text-muted-foreground">
          Your StayStory journey
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-2xl">
          Each step builds on the one before it. The goal isn&apos;t to create more ideas — it&apos;s
          to create a stay where every decision supports what you want guests to feel.
        </p>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(step.position).padStart(2, '0')}
                  </span>
                  <h3 className="mt-1 font-serif font-semibold text-foreground">{step.name}</h3>
                </div>
                <StatusChip status={step.status} />
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>

            </Link>
          </li>
        ))}
      </ol>

      {steps.some((s) => s.limitedOnFreePlan) && (
        <p className="mt-4 text-xs text-muted-foreground">
          Every step is open to you. Some have limits on the free plan —{' '}
          <Link href="/pricing" className="underline underline-offset-4 hover:text-foreground">
            Legendary removes them
          </Link>
          .
        </p>
      )}
    </section>
  )
}
