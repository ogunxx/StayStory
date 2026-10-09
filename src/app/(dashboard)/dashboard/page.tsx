import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserTier, hasAccess } from '@/lib/get-tier'
import { resolveActivePropertyId } from '@/lib/active-property'
import { getJourneyState } from '@/lib/journey-state'
import { shouldGuideToFocusedPath } from '@/lib/focused-path'
import { countGeneratorUsageSince } from '@/lib/focused-recommendations'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LEGENDARY_PRICE } from '@/lib/config'
import { CompassSummary, JourneySteps, NextStepCard, RecommendationsCard } from './journey'

/**
 * Product home.
 *
 * The page answers four questions in order: where am I, what should I do
 * next and why, what has StayStory learned, and what am I building toward.
 * All of it is read from existing state by getJourneyState — this page owns
 * no progress model of its own.
 */

/**
 * `?full=1` skips the first-run detour and loads the Dashboard.
 *
 * Guided onboarding should be a door, not a lock. /start links here with it,
 * so a brand-new host who wants the whole product can always get to it — and
 * without it, that link would bounce straight back to /start and look broken.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const wantsFullDashboard = (await searchParams).full === '1'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tier = await getUserTier()

  const name = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'
  const isLegendary = hasAccess(tier, 'legendary')

  const propertyId = await resolveActivePropertyId(user!.id)
  const journey = await getJourneyState(user!.id, propertyId, isLegendary)

  // A host with nothing stored yet is guided to the focused journey instead
  // of being handed the whole system to choose from. isNewHost, not
  // isFirstRun: see journey-state.ts for why routing on the looser one would
  // trap a host who finished the focused path but never opened the Blueprint.
  if (!wantsFullDashboard && shouldGuideToFocusedPath(journey.isNewHost)) {
    redirect('/start')
  }

  // Monthly generator usage for free users. Focused recommendation sets live
  // in the same table but are not Generator work, so they're excluded here the
  // same way /api/generate excludes them when enforcing the limit.
  let monthlyUsed = 0
  if (!isLegendary) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    monthlyUsed = await countGeneratorUsageSince(user!.id, startOfMonth.toISOString())
  }

  const remaining = Math.max(0, 1 - monthlyUsed)

  return (
    <div className="flex flex-col gap-10">

      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
          {journey.isNewHost ? `Welcome to StayStory, ${name}.` : `Welcome back, ${name}.`}
        </h1>
        <p className="text-muted-foreground">
          Every unforgettable stay starts with intention. Let&apos;s make a guest feel seen today.
        </p>
        {/* The guided journey stays one click away from here, so a host who
            came in through it can always pick it back up. */}
        <Link
          href="/start"
          className="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-4"
        >
          Follow the guided journey →
        </Link>
      </div>

      {/* Free tier usage banner */}
      {!isLegendary && (
        <div className={cn(
          'rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4',
          remaining === 0 ? 'bg-destructive/10 border border-destructive/20' : 'bg-primary/10 border border-primary/20'
        )}>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">
              {remaining === 0
                ? 'You\'ve used your 1 free generation this month'
                : `${remaining} free generation remaining this month`}
            </p>
            <p className="text-xs text-muted-foreground">
              {remaining === 0
                ? 'Upgrade to Legendary for unlimited generation — every tool, no limits.'
                : 'Free plan includes 1 generation/month. Upgrade to Legendary for unlimited.'}
            </p>
          </div>
          <Link href="/pricing" className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}>
            Upgrade to Legendary →
          </Link>
        </div>
      )}

      {/* ── Recommendations, whenever a set exists for this property ─────
          A standing destination so they never have to be found through the
          Compass again. */}
      {journey.focusedSetExists && <RecommendationsCard stale={journey.focusedStale} />}

      {/* ── Primary: what to do next, and why ─────────────────────────────
          Suppressed only when it would repeat the card above word for word. */}
      {!(journey.focusedSetExists && journey.next.stepId === 'recommendations') && (
        <NextStepCard next={journey.next} pendingCount={journey.pendingCount} />
      )}

      {/* ── What StayStory currently knows ──────────────────────────────── */}
      <CompassSummary
        compass={journey.compass}
        highlights={journey.highlights}
        pendingCount={journey.pendingCount}
        filled={journey.compassFilled}
        total={journey.compassTotal}
      />

      {/* ── Secondary: the connected journey, in sequence ───────────────── */}
      <JourneySteps steps={journey.steps} />

      {/* ── What it is all building toward ──────────────────────────────── */}
      {/* Honest wording: the Playbook does not yet read the other tools'
          output. It says the work is building toward the Playbook, not that
          it is already assembled there. */}
      <div className="rounded-2xl border border-border bg-secondary p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            What you&apos;re building toward
          </p>
          <h2 className="font-serif font-semibold text-lg text-foreground">
            Guest Journey Playbook
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
            Your work across StayStory is building toward one guide you can host from — positioning,
            guest archetypes, touchpoint priorities and the rhythm that keeps it consistent.
          </p>
        </div>
        <Link
          href="/legend"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0')}
        >
          {journey.steps[5].status === 'completed' ? 'Open playbook →' : 'See the Playbook →'}
        </Link>
      </div>

      {/* Legendary upgrade nudge for free users */}
      {!isLegendary && (
        <div className="bg-secondary rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Upgrade</p>
            <p className="text-sm font-semibold text-foreground">Go Legendary — {LEGENDARY_PRICE}</p>
            <p className="text-xs text-muted-foreground mt-1">Every tool unlimited, your custom playbook, and priority support — {LEGENDARY_PRICE}.</p>
          </div>
          <Link href="/pricing" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0')}>
            See Legendary →
          </Link>
        </div>
      )}

      {/* Philosophy */}
      <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-border">
        {[
          { role: 'The Foundation', idea: 'Fix the invisible things. Stay in your own rental. Design is the soul of a property.' },
          { role: 'The Wow', idea: 'Service does the job. Hospitality makes people feel something. Spend a little foolishly on what matters most.' },
          { role: 'The Story', idea: 'The host is the guide. The guest is the hero. Every moment is a story waiting to be told.' },
        ].map((p) => (
          <div key={p.role} className="flex flex-col gap-1 pt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.role}</p>
            <p className="text-muted-foreground leading-relaxed italic text-xs">&ldquo;{p.idea}&rdquo;</p>
          </div>
        ))}
      </div>

    </div>
  )
}
