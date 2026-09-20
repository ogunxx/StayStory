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

function RecommendationCard({ item, index }: { item: FocusedRecommendation; index: number }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 sm:p-7">
      <p className="text-xs font-medium tabular-nums text-primary">
        {String(index + 1).padStart(2, '0')}
      </p>
      <h2 className="mt-2 font-serif text-xl font-semibold leading-snug text-foreground">
        {item.title}
      </h2>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground">{item.recommendation}</p>

      <div className="mt-5 border-t border-border pt-5">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
          Why this fits your stay
        </h3>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
          {item.why_it_fits}
        </p>
      </div>

      <div className="mt-4">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
          What this could change for the guest
        </h3>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
          {item.what_this_could_change}
        </p>
      </div>
    </article>
  )
}

export default function RecommendationsClient({
  set,
  blocked,
}: {
  set?: FocusedSet
  blocked?: Blocked
}) {
  const [retrying, setRetrying] = useState(false)

  async function retry() {
    setRetrying(true)
    try {
      await fetch('/api/start/recommendations', { method: 'POST' })
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
        <Button onClick={() => void retry()} disabled={retrying} className="mt-6 h-11 px-6">
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

      <div className="flex flex-col gap-4">
        {set.recommendations.map((item, i) => (
          <RecommendationCard key={item.title} item={item} index={i} />
        ))}
      </div>

      <footer className="border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          Next, this comes together in your Starter Playbook.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Link href="/start" className="text-sm font-medium text-primary underline underline-offset-4">
            Back to your path
          </Link>
          <Link
            href="/compass"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Adjust your Compass
          </Link>
        </div>
      </footer>
    </div>
  )
}
