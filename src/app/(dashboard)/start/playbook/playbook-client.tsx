'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { StarterPlaybookSection } from '@/lib/anthropic'
import type { PlaybookState, StarterPlaybookRecord } from '@/lib/focused-playbook'

/**
 * Stage 4 of the focused path.
 *
 * A document, not a dashboard. A host may well be reading this standing in
 * the room they are thinking about, so it is a single column at every width,
 * with the first step always the last thing in a section — the part you look
 * for when you have stopped reading and want to do something.
 */

type Blocker =
  | 'no_audit'
  | 'compass_unconfirmed'
  | 'too_sparse'
  | 'no_recommendations'
  | 'recommendations_stale'

/**
 * Every reason the Playbook cannot be built yet, each with the one thing to
 * do about it. No dead ends: every state here has a way forward.
 */
const BLOCKED: Record<Blocker, { title: string; body: string; href: string; cta: string }> = {
  no_audit: {
    title: 'Let’s start with your Audit',
    body: 'Your Starter Playbook is built from your own property. Walking through the Experience Audit is what gives StayStory something to work from.',
    href: '/audit',
    cta: 'Start your Audit',
  },
  compass_unconfirmed: {
    title: 'Your Compass needs one quick review',
    body: 'Confirming it tells StayStory the direction is ready to guide what comes next. You can change it whenever you like.',
    href: '/compass',
    cta: 'Review your Compass',
  },
  too_sparse: {
    title: 'A little more from your Audit would help',
    body: 'There isn’t quite enough yet to build something that would feel specific to your place. A few more answers is all it takes.',
    href: '/audit',
    cta: 'Open your Audit',
  },
  no_recommendations: {
    title: 'Your three opportunities come first',
    body: 'The Starter Playbook develops the three opportunities StayStory found for your stay — so those need to exist before there is anything to develop.',
    href: '/start/recommendations',
    cta: 'See my three opportunities',
  },
  // The important one. Building on superseded recommendations would produce
  // something that looks current and quietly isn't.
  recommendations_stale: {
    title: 'Your recommendations need refreshing first',
    body: 'Your Audit or Compass has changed since those three opportunities were created. Refresh them so your Starter Playbook is built from what you know now.',
    href: '/start/recommendations',
    cta: 'Refresh my recommendations first',
  },
}

function BlockedState({ reason }: { reason: Blocker }) {
  const state = BLOCKED[reason]
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h1 className="font-serif text-2xl font-semibold text-foreground">{state.title}</h1>
      <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
        {state.body}
      </p>
      {/* w-full + whitespace-normal: the shared Button is nowrap and
          shrink-0, so "Refresh my recommendations first →" overflowed a
          360px screen by 2px. Fixed here rather than in the primitive. */}
      <Link href={state.href} className="mt-6 block w-full sm:inline-block sm:w-auto">
        <Button className="h-auto min-h-11 w-full whitespace-normal px-6 py-2.5 text-center sm:w-auto">
          {state.cta} →
        </Button>
      </Link>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h4 className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </h4>
      <div className="mt-1.5 text-[0.9rem] leading-relaxed text-muted-foreground">{children}</div>
    </div>
  )
}

function Section({ section, index }: { section: StarterPlaybookSection; index: number }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 sm:p-8 print:break-inside-avoid print:border-0 print:p-0">
      <p className="text-xs font-medium tabular-nums text-primary">
        {String(index + 1).padStart(2, '0')}
      </p>
      <h2 className="mt-2 font-serif text-xl font-semibold leading-snug text-foreground sm:text-2xl">
        {section.opportunity}
      </h2>

      {/* The intention, given the emphasis — it is the thing the other
          sections all serve. */}
      <div className="mt-5 border-l-2 border-primary/30 pl-4">
        <h3 className="text-[0.7rem] font-semibold uppercase tracking-widest text-primary">
          What we’re designing
        </h3>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground">
          {section.what_were_designing}
        </p>
      </div>

      <Field label="Why it belongs here">{section.why_it_belongs_here}</Field>
      <Field label="What this could change for your guest">{section.what_this_could_change}</Field>

      {section.bring_it_to_life.length > 0 && (
        <div className="mt-6 rounded-xl bg-secondary/40 p-5">
          <h3 className="text-[0.7rem] font-semibold uppercase tracking-widest text-foreground">
            Bring it to life
          </h3>
          <p className="mt-1 text-[0.78rem] text-muted-foreground">
            Ways you could begin — pick whichever fits your place.
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {section.bring_it_to_life.map((option, i) => (
              <li key={i} className="flex gap-3 text-[0.9rem] leading-relaxed text-foreground">
                <span aria-hidden className="mt-0.5 shrink-0 text-primary">
                  ·
                </span>
                <span className="min-w-0">{option}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Field label="Use what you already have">{section.use_what_you_already_have}</Field>

      {/* Last, and the most visually distinct thing in the card: it is what a
          host looks for when they have stopped reading and want to act. */}
      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/[0.06] p-5">
        <h3 className="text-[0.7rem] font-semibold uppercase tracking-widest text-primary">
          Your first step
        </h3>
        <p className="mt-1.5 text-[0.95rem] font-medium leading-relaxed text-foreground">
          {section.first_step}
        </p>
      </div>

      {section.reflection && (
        <p className="mt-4 border-t border-border pt-4 text-[0.88rem] italic leading-relaxed text-muted-foreground">
          {section.reflection}
        </p>
      )}
    </article>
  )
}

export default function PlaybookClient({
  playbook,
  state,
  feedbackGiven = false,
}: {
  playbook: StarterPlaybookRecord | null
  state: PlaybookState
  /** Whether this host has already left closing feedback for this property. */
  feedbackGiven?: boolean
}) {
  const [working, setWorking] = useState(false)
  const [failed, setFailed] = useState(false)

  async function build() {
    // Guarded as well as disabled, so a double submit can't start two
    // generations even if the click lands twice.
    if (working) return
    setWorking(true)
    setFailed(false)

    try {
      const response = await fetch('/api/start/playbook', { method: 'POST' })
      if (!response.ok) {
        setFailed(true)
        setWorking(false)
        return
      }
      // The page reads the saved playbook on the server, so a reload is the
      // simplest correct way to show what was just written.
      window.location.reload()
    } catch {
      setFailed(true)
      setWorking(false)
    }
  }

  // ── Nothing to build from yet ──────────────────────────────────────────
  if (!playbook) {
    if (!state.recommendationsExist) return <BlockedState reason="no_recommendations" />
    if (state.recommendationsStale) return <BlockedState reason="recommendations_stale" />
  }

  // ── Not built yet, but everything is ready ─────────────────────────────
  if (!playbook) {
    return (
      <div className="flex max-w-2xl flex-col gap-6">
        <header>
          <p className="mb-3 text-xs uppercase tracking-widest text-primary">Your Starter Playbook</p>
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            Turn your three opportunities into a plan
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            StayStory will take the three opportunities you’ve already seen and work out what each
            one could mean for your place — what you’re designing, how you might begin, what you
            already have that supports it, and one small first step for each.
          </p>
        </header>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
          {failed && (
            <p className="mb-4 text-sm leading-relaxed text-destructive">
              We couldn’t put that together just now. Nothing was lost — your opportunities are
              safe. Try again in a moment.
            </p>
          )}
          <Button
            onClick={() => void build()}
            disabled={working}
            className="h-auto min-h-11 w-full whitespace-normal px-6 py-2.5 sm:w-auto"
          >
            {working ? 'Working through your three…' : 'Create my Starter Playbook →'}
          </Button>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-muted-foreground">
            {working
              ? 'Thinking about what each opportunity means for your property. This takes a few moments.'
              : 'It takes a few moments, and you only need to do this once.'}
          </p>
        </div>

        <p className="border-t border-border pt-5 text-sm text-muted-foreground">
          <Link href="/start" className="text-primary underline underline-offset-4">
            Back to your journey
          </Link>
        </p>
      </div>
    )
  }

  // ── The playbook ───────────────────────────────────────────────────────
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      {/* No eyebrow here: it would repeat the heading word for word, which
          read as a stutter at the top of the document. */}
      <header className="print:mb-4">
        <h1 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          Your Starter Playbook
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Three opportunities. Three practical ways to begin shaping the experience more
          intentionally.
        </p>
      </header>

      {/* Recommendations moved on after this was built. Say so plainly and
          leave it to the host — nothing regenerates on its own, and the
          existing playbook is never thrown away. */}
      {state.stale && (
        <div className="rounded-2xl border border-accent/40 bg-accent/[0.08] p-5 sm:p-6 print:hidden">
          <p className="text-sm font-semibold text-foreground">
            Your recommendations have changed since this Playbook was created
          </p>
          <p className="mt-1.5 max-w-xl text-[0.9rem] leading-relaxed text-muted-foreground">
            This Playbook still reflects the previous three opportunities. You can keep it as it
            is, or create an updated version from your current ones.
          </p>
          {failed && (
            <p className="mt-3 text-sm text-destructive">
              That didn’t work just now. Your existing Playbook is untouched — try again in a
              moment.
            </p>
          )}
          <Button
            onClick={() => void build()}
            disabled={working}
            className="mt-4 h-auto min-h-11 w-full whitespace-normal px-6 py-2.5 sm:w-auto"
          >
            {working ? 'Working through your three…' : 'Refresh my Starter Playbook →'}
          </Button>
        </div>
      )}

      {/* Recommendations are themselves out of date. Refreshing the Playbook
          now would just develop superseded ideas, so point one step back. */}
      {!state.stale && state.recommendationsStale && (
        <div className="rounded-2xl border border-accent/40 bg-accent/[0.08] p-5 sm:p-6 print:hidden">
          <p className="text-sm font-semibold text-foreground">
            Your Audit or Compass has changed since your recommendations were created
          </p>
          <p className="mt-1.5 max-w-xl text-[0.9rem] leading-relaxed text-muted-foreground">
            Refresh your three opportunities first, and you’ll be able to build a Starter Playbook
            from what you know now.
          </p>
          <Link
            href="/start/recommendations"
            className="mt-4 block w-full sm:inline-block sm:w-auto"
          >
            <Button className="h-auto min-h-11 w-full whitespace-normal px-6 py-2.5 text-center sm:w-auto">
              Refresh my recommendations first →
            </Button>
          </Link>
        </div>
      )}

      <section className="rounded-2xl border border-border bg-secondary/30 p-6 sm:p-7 print:break-inside-avoid">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          The direction you’re designing toward
        </h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
          {playbook.direction}
        </p>
      </section>

      <div className="flex flex-col gap-5">
        {playbook.sections.map((section, i) => (
          <Section key={`${section.opportunity}-${i}`} section={section} index={i} />
        ))}
      </div>

      {/* After the Playbook, never inside it. The host has what they came
          for; this is an invitation they can walk past. No modal, nothing
          that interrupts the document above. */}
      <section className="rounded-2xl border border-dashed border-border p-6 print:hidden">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Help shape StayStory
        </h2>
        <p className="mt-2 max-w-xl text-[0.9rem] leading-relaxed text-muted-foreground">
          {feedbackGiven
            ? 'Thank you for the feedback you already shared — it genuinely shapes what we build next. You can change what you said whenever you like.'
            : 'You’ve completed your first StayStory journey. We’re building this around what actually helps hosts think differently about the guest experience. If you have a minute, we’d love to know what worked and what didn’t.'}
        </p>
        <Link href="/start/feedback" className="mt-4 inline-block">
          <Button
            variant="outline"
            className="h-auto min-h-11 w-full whitespace-normal px-6 py-2.5 sm:w-auto"
          >
            {feedbackGiven ? 'View or update my feedback →' : 'Share feedback →'}
          </Button>
        </Link>
        {!feedbackGiven && (
          <p className="mt-2 text-[0.8rem] text-muted-foreground">Takes about a minute.</p>
        )}
      </section>

      <footer className="flex flex-wrap items-center gap-4 border-t border-border pt-5 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="text-sm font-medium text-primary underline underline-offset-4"
        >
          Print or save as PDF
        </button>
        <Link
          href="/start/recommendations"
          className="text-sm font-medium text-primary underline underline-offset-4"
        >
          See the three opportunities
        </Link>
        <Link href="/start" className="text-sm font-medium text-primary underline underline-offset-4">
          Back to your journey
        </Link>
      </footer>
    </div>
  )
}
