'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { FocusedRecommendation } from '@/lib/anthropic'
import type { FocusedSet } from '@/lib/focused-recommendations'

/**
 * Stage 3 of the focused path.
 *
 * Presentational. The page has already read or generated the set on the
 * server, so there is no fetch on mount and no effect — the only request this
 * file can make is an explicit retry after a failure.
 */

type NotReady = 'no_audit' | 'compass_unconfirmed' | 'too_sparse'
type Blocked = NotReady | 'generation_failed'

const NOT_READY: Record<NotReady, { title: string; body: string; href: string; cta: string }> = {
  no_audit: {
    title: 'Let’s start with your Audit',
    body: 'StayStory shapes these recommendations around your own property. Walking through the Experience Audit is what gives it something to work from.',
    href: '/audit',
    cta: 'Start your Audit',
  },
  compass_unconfirmed: {
    title: 'Your Compass needs one quick review',
    body: 'You can change it whenever you like — confirming just tells StayStory it’s ready to guide the recommendations for your stay.',
    href: '/compass',
    cta: 'Review your Compass',
  },
  too_sparse: {
    title: 'A little more from your Audit would help',
    body: 'There isn’t quite enough yet for recommendations that would feel specific to your place. Adding a few more answers is all it takes.',
    href: '/audit',
    cta: 'Open your Audit',
  },
}

/**
 * One recommendation, read in the order the thinking happened.
 *
 * The stored shape is unchanged — this is presentation only, so sets generated
 * before this change display the same way with nothing regenerated. What moved
 * is the order and the labels: the observation comes first, because a host
 * should see what StayStory noticed before being handed an idea. Leading with
 * the idea made the reasoning look like justification after the fact.
 *
 *   why_it_fits             → What we noticed
 *   recommendation          → The opportunity
 *   what_this_could_change  → What this could change for your guest
 */
function RecommendationCard({ item, index }: { item: FocusedRecommendation; index: number }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 sm:p-7">
      <p className="text-xs font-medium tabular-nums text-primary">
        {String(index + 1).padStart(2, '0')}
      </p>
      <h2 className="mt-2 font-serif text-xl font-semibold leading-snug text-foreground">
        {item.title}
      </h2>

      <div className="mt-5 border-l-2 border-primary/30 pl-4">
        <h3 className="text-[0.7rem] font-semibold uppercase tracking-widest text-primary">
          What we noticed
        </h3>
        <p className="mt-1.5 text-[0.9rem] leading-relaxed text-muted-foreground">
          {item.why_it_fits}
        </p>
      </div>

      <div className="mt-5">
        <h3 className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
          The opportunity
        </h3>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground">
          {item.recommendation}
        </p>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <h3 className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
          What this could change for your guest
        </h3>
        <p className="mt-1.5 text-[0.9rem] leading-relaxed text-muted-foreground">
          {item.what_this_could_change}
        </p>
      </div>
    </article>
  )
}

export default function RecommendationsClient({
  set,
  stale,
  blocked,
}: {
  set?: FocusedSet
  stale?: boolean
  blocked?: Blocked
}) {
  const [retrying, setRetrying] = useState(false)

  // Used both to retry after a failure and to refresh a set whose Audit or
  // Compass has moved on. `regenerate` is what separates the two: without it
  // the server reuses whatever is saved, so nothing regenerates by accident.
  async function ask(regenerate: boolean) {
    setRetrying(true)
    try {
      await fetch('/api/start/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate }),
      })
    } finally {
      // The page reads the saved set on the server, so a reload is the
      // simplest correct way to show a set that has just been created.
      window.location.reload()
    }
  }

  if (blocked && blocked !== 'generation_failed') {
    const state = NOT_READY[blocked]
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="font-serif text-2xl font-semibold text-foreground">{state.title}</h1>
        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
          {state.body}
        </p>
        <Link href={state.href} className="mt-6 inline-block">
          <Button className="h-11 px-6">{state.cta} →</Button>
        </Link>
      </div>
    )
  }

  if (!set) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          We couldn’t put those together just now
        </h1>
        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
          Nothing was lost — your Audit and Compass are safe. Try again in a moment.
        </p>
        <Button onClick={() => void ask(false)} disabled={retrying} className="mt-6 h-11 px-6">
          {retrying ? 'Trying again…' : 'Try again'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="mb-3 text-xs uppercase tracking-widest text-primary">
          Your experience is taking shape
        </p>
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          Three opportunities worth exploring
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Based on what you shared in your Audit and what you&apos;ve shaped in your Experience
          Compass, here are three ways you could make the experience more intentional.
        </p>
      </header>

      {/* Shown only when the saved set was reasoned from an Audit or Compass
          that has since changed. Nothing regenerates until the host asks — a
          refresh of the page never spends a model call. */}
      {stale && (
        <div className="rounded-2xl border border-accent/40 bg-accent/[0.08] p-5 sm:p-6">
          <p className="text-sm font-semibold text-foreground">
            Your Audit or Compass has changed since these were created
          </p>
          <p className="mt-1.5 max-w-xl text-[0.9rem] leading-relaxed text-muted-foreground">
            These three still reflect what you told us before. Refresh them whenever you&apos;d
            like StayStory to think again with what you know now.
          </p>
          <Button
            onClick={() => void ask(true)}
            disabled={retrying}
            className="mt-4 h-11 px-6"
          >
            {retrying ? 'Thinking again…' : 'Refresh my recommendations →'}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {set.recommendations.map((item, i) => (
          <RecommendationCard key={item.title} item={item} index={i} />
        ))}
      </div>

      <footer className="flex flex-col gap-5">
        {/* Stage 4 doesn't exist yet, so this says what's coming without
            offering a button that would go nowhere. It becomes the
            continuation CTA once the Starter Playbook is built. */}
        <div className="rounded-2xl border border-dashed border-border p-6">
          <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
            Next
          </p>
          <p className="mt-2 font-serif text-lg font-semibold text-foreground">
            Turn these opportunities into your Starter Playbook
          </p>
          <p className="mt-1.5 max-w-xl text-[0.9rem] leading-relaxed text-muted-foreground">
            Your Starter Playbook will turn these ideas into practical moments you can actually
            design and deliver. We’re building it now.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-5">
          <Link href="/start" className="text-sm font-medium text-primary underline underline-offset-4">
            Back to your journey
          </Link>
          <Link
            href="/compass"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Adjust my Compass
          </Link>
        </div>
      </footer>
    </div>
  )
}
