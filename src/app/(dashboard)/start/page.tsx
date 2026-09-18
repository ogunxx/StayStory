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

function StageRow({ stage }: { stage: FocusedStage }) {
  const isDone = stage.status === 'done'
  const isActive = stage.status === 'active'

  const body = (
    <>
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
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
            stage.position
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
              {isDone ? 'Done' : isActive ? 'Next' : stage.available ? 'Later' : 'Coming soon'}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{stage.summary}</p>
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground">
          Let’s start with your stay, {firstName}.
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          StayStory works by understanding the experience you already have, then helping you
          design the one you want. Here’s the path.
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {path.stages.map((stage) => (
          <li key={stage.id}>
            <StageRow stage={stage} />
          </li>
        ))}
      </ol>

      {path.active && (
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
      )}

      <p className="border-t border-border pt-6 text-sm text-muted-foreground">
        Looking for everything else?{' '}
        <Link href="/dashboard" className="text-primary underline underline-offset-4">
          Open your full dashboard
        </Link>
        .
      </p>
    </div>
  )
}
