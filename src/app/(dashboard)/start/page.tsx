import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserTier, hasAccess } from '@/lib/get-tier'
import { resolveActivePropertyId } from '@/lib/active-property'
import { getFocusedPath, type FocusedStage } from '@/lib/focused-path'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * The focused first-run path.
 *
 * A guidance layer over the existing product: stages 1 and 2 link straight at
 * the real Experience Audit and the real Experience Compass. Nothing here
 * re-implements either of them, and nothing here writes to the database.
 *
 * Stages 3 to 5 are shown so the shape of the journey is clear, but they are
 * not linked, because they have not been built. They become live by building
 * them and setting `available` in src/lib/focused-path.ts.
 */

export const metadata: Metadata = { title: 'Get started — StayStory' }

/**
 * What a finished stage offers when it is still worth opening. A generic
 * "Open again" tells a returning host nothing about what is waiting there.
 */
const REOPEN_LABEL: Partial<Record<FocusedStage['id'], string>> = {
  recommendations: 'View recommendations →',
  starter_playbook: 'Open Starter Playbook →',
}

function StageRow({ stage }: { stage: FocusedStage }) {
  const isDone = stage.status === 'done'
  const isActive = stage.status === 'active'

  const body = (
    <>
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full border text-[0.7rem] font-medium tabular-nums',
            isDone
              ? 'border-primary/40 bg-primary/10 text-primary'
              : isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground'
          )}
        >
          {isDone ? (
            <svg viewBox="0 0 20 20" fill="none" className="size-4">
              <path
                d="M4 10.5l4 4 8-9"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            String(stage.position).padStart(2, '0')
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2
              className={cn(
                'font-serif text-lg font-semibold',
                stage.available ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {stage.title}
            </h2>
            {/* Status in words, never colour alone. */}
            <span className="text-xs text-muted-foreground">
              {stage.statusLabel ??
                (isDone ? 'Done' : isActive ? 'Next' : stage.available ? 'Later' : 'Coming soon')}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{stage.summary}</p>
          {/* A done stage that is still worth opening says so, so a returning
              host can see where their three recommendations live. */}
          {isDone && stage.available && stage.href && (
            <p className="mt-2 text-sm font-medium text-primary">
              {REOPEN_LABEL[stage.id] ?? 'Open again →'}
            </p>
          )}
        </div>
      </div>
    </>
  )

  const shell = 'rounded-2xl border p-5 sm:p-6'

  if (!stage.available || !stage.href) {
    return <div className={cn(shell, 'border-dashed border-border bg-transparent')}>{body}</div>
  }

  return (
    <Link
      href={stage.href}
      className={cn(
        shell,
        'block transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        isActive
          ? 'border-primary/30 bg-primary/[0.06] hover:border-primary/50'
          : 'border-border bg-card hover:border-primary/40'
      )}
    >
      {body}
    </Link>
  )
}

export default async function StartPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tier = await getUserTier()
  const propertyId = await resolveActivePropertyId(user.id)
  const path = await getFocusedPath(user.id, propertyId, hasAccess(tier, 'legendary'))

  const firstName =
    user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'

  const productStages = path.stages.filter((s) => !s.optional)
  // Only worth offering once they have something to react to.
  const feedback = path.stages.find((s) => s.optional && s.status !== 'upcoming')

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-3 text-xs uppercase tracking-widest text-primary">
          Your StayStory journey
        </p>
        <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground">
          Let’s start with your stay, {firstName}.
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          StayStory works by understanding the experience you already have, then helping you
          design the one you want. Five steps — you’re never more than one away from something
          useful.
        </p>
      </div>

      {/* The product journey is these four. The optional closing stage is
          rendered separately below, so a host who never leaves feedback is
          never shown as having left something unfinished. */}
      <ol className="flex flex-col gap-3">
        {productStages.map((stage) => (
          <li key={stage.id}>
            <StageRow stage={stage} />
          </li>
        ))}
      </ol>

      {path.active ? (
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={path.active.href!}
            className={cn(buttonVariants({ size: 'sm' }), 'h-10 px-5')}
          >
            {path.active.position === 1 ? 'Start your Audit' : 'Continue'} →
          </Link>
          {path.pendingCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {path.pendingCount} Compass {path.pendingCount === 1 ? 'insight' : 'insights'} waiting
              for you
            </span>
          )}
        </div>
      ) : (
        /* Everything built is done. Point at the Starter Playbook, which is
           now the end of the journey and the thing worth returning to. */
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/start/playbook"
            className={cn(buttonVariants({ size: 'sm' }), 'h-10 px-5')}
          >
            Open my Starter Playbook →
          </Link>
          <span className="text-sm text-muted-foreground">
            Come back to it whenever you like — it stays here.
          </span>
        </div>
      )}

      {/* Separate from the journey above, and visually quieter: an
          invitation, not a step. */}
      {feedback && (
        <section className="rounded-2xl border border-dashed border-border p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="font-serif text-lg font-semibold text-foreground">
              {feedback.title}
            </h2>
            <span className="text-xs text-muted-foreground">{feedback.statusLabel}</span>
          </div>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {feedback.status === 'done'
              ? 'Thank you — we read every one of these. You can change what you said whenever you like.'
              : feedback.summary}
          </p>
          <Link
            href={feedback.href!}
            className="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-4"
          >
            {feedback.status === 'done' ? 'View or update my feedback →' : 'Share feedback →'}
          </Link>
        </section>
      )}

      <p className="border-t border-border pt-6 text-sm text-muted-foreground">
        Looking for everything else?{' '}
        {/* ?full=1 so this doesn't bounce straight back here while the host
            still has nothing stored. Guided, not locked in. */}
        <Link href="/dashboard?full=1" className="text-primary underline underline-offset-4">
          Open your full dashboard
        </Link>
        .
      </p>
    </div>
  )
}
