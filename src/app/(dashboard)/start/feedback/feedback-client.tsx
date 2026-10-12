'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  LIMITS,
  MOST_VALUABLE_OPTIONS,
  MOST_VALUABLE_OTHER,
  USEFULNESS_OPTIONS,
  type FeedbackRecord,
} from '@/lib/feedback'

/**
 * The closing feedback form. About a minute: one required rating and three
 * optional questions.
 *
 * Radios and checkboxes are real inputs rather than styled buttons, so
 * keyboard navigation, arrow-key movement within the group and screen-reader
 * announcements all work without being reimplemented. The visible styling
 * hangs off peer-checked.
 */

export default function FeedbackClient({ existing }: { existing: FeedbackRecord | null }) {
  const [usefulness, setUsefulness] = useState<number | null>(existing?.usefulness ?? null)
  const [mostValuable, setMostValuable] = useState<string>(existing?.most_valuable ?? '')
  const [other, setOther] = useState(existing?.most_valuable_other ?? '')
  const [improvement, setImprovement] = useState(existing?.improvement_feedback ?? '')
  const [additional, setAdditional] = useState(existing?.additional_feedback ?? '')
  const [followUp, setFollowUp] = useState(existing?.open_to_followup ?? false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const confirmationRef = useRef<HTMLHeadingElement>(null)

  const isUpdate = Boolean(existing)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return

    if (usefulness === null) {
      setError('Please choose how useful the experience was.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/start/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usefulness,
          most_valuable: mostValuable || null,
          most_valuable_other: mostValuable === MOST_VALUABLE_OTHER ? other : null,
          improvement_feedback: improvement,
          additional_feedback: additional,
          open_to_followup: followUp,
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error ?? 'We could not save that just now. Please try again.')
        setSaving(false)
        return
      }

      setDone(true)
      // Move focus to the confirmation so the outcome is announced rather
      // than left behind on a button that no longer exists.
      requestAnimationFrame(() => confirmationRef.current?.focus())
    } catch {
      setError('We could not reach StayStory just now. Please try again.')
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="flex max-w-2xl flex-col gap-6">
        <div>
          <h1
            ref={confirmationRef}
            tabIndex={-1}
            className="font-serif text-3xl font-semibold text-foreground outline-none"
          >
            Thank you.
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            This is exactly the kind of feedback that helps us decide what StayStory should
            become next.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/start">
            <Button className="h-11 px-6">Return to my journey →</Button>
          </Link>
          <Link href="/start/playbook">
            <Button variant="outline" className="h-11 px-6">
              Open my Starter Playbook
            </Button>
          </Link>
        </div>
        <p className="border-t border-border pt-5 text-sm text-muted-foreground">
          Changed your mind about something?{' '}
          <button
            type="button"
            onClick={() => setDone(false)}
            className="text-primary underline underline-offset-4"
          >
            Edit what you said
          </button>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <header>
        <p className="mb-3 text-xs uppercase tracking-widest text-primary">Optional</p>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Help shape StayStory</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          We&apos;re building this around what actually helps hosts think differently about the
          guest experience. Telling us what worked and what didn&apos;t is the most useful thing
          you can do for the next host. Takes about a minute.
        </p>
        {isUpdate && (
          <p className="mt-3 text-sm text-muted-foreground">
            You&apos;ve shared feedback before — your answers are below, and saving will update
            them.
          </p>
        )}
      </header>

      <form onSubmit={submit} className="flex flex-col gap-8">
        {/* ── 1. Usefulness, the only required answer ───────────────────── */}
        <fieldset>
          <legend className="font-serif text-lg font-semibold text-foreground">
            How useful was this StayStory experience for you?
          </legend>
          <div className="mt-4 flex flex-col gap-2">
            {USEFULNESS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/[0.06]"
              >
                <input
                  type="radio"
                  name="usefulness"
                  value={option.value}
                  checked={usefulness === option.value}
                  onChange={() => setUsefulness(option.value)}
                  className="peer size-4 shrink-0 accent-primary"
                />
                <span className="text-[0.95rem] text-foreground peer-checked:font-medium">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* ── 2. Most valuable ──────────────────────────────────────────── */}
        <fieldset>
          <legend className="font-serif text-lg font-semibold text-foreground">
            What was most valuable?
          </legend>
          <p className="mt-1 text-sm text-muted-foreground">Optional.</p>
          <div className="mt-4 flex flex-col gap-2">
            {MOST_VALUABLE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary/[0.06]"
              >
                <input
                  type="radio"
                  name="most_valuable"
                  value={option.value}
                  checked={mostValuable === option.value}
                  onChange={() => setMostValuable(option.value)}
                  className="peer size-4 shrink-0 accent-primary"
                />
                <span className="text-[0.95rem] text-foreground peer-checked:font-medium">
                  {option.label}
                </span>
              </label>
            ))}
          </div>

          {mostValuable === MOST_VALUABLE_OTHER && (
            <div className="mt-3 flex flex-col gap-1.5">
              <Label htmlFor="most_valuable_other">What was it?</Label>
              <Textarea
                id="most_valuable_other"
                value={other}
                onChange={(e) => setOther(e.target.value)}
                maxLength={LIMITS.mostValuableOther}
                rows={2}
                placeholder="In your own words"
              />
            </div>
          )}
        </fieldset>

        {/* ── 3. What could be better ───────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="improvement" className="font-serif text-lg font-semibold">
            What felt confusing, missing, or less useful?
          </Label>
          <p className="text-sm text-muted-foreground">
            Anything you wished worked differently or explained itself better is helpful.
            Optional.
          </p>
          <Textarea
            id="improvement"
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
            maxLength={LIMITS.improvement}
            rows={4}
            className="mt-2"
          />
        </div>

        {/* ── 4. Anything else ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="additional" className="font-serif text-lg font-semibold">
            Anything else you&apos;d like us to know?
          </Label>
          <p className="text-sm text-muted-foreground">Optional.</p>
          <Textarea
            id="additional"
            value={additional}
            onChange={(e) => setAdditional(e.target.value)}
            maxLength={LIMITS.additional}
            rows={4}
            className="mt-2"
          />
        </div>

        {/* ── Follow-up permission ──────────────────────────────────────── */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <input
            type="checkbox"
            checked={followUp}
            onChange={(e) => setFollowUp(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-primary"
          />
          <span className="text-[0.9rem] leading-relaxed text-foreground">
            I&apos;m open to being contacted about my feedback.
            <span className="mt-0.5 block text-[0.8rem] text-muted-foreground">
              We already have your email — this just tells us it&apos;s alright to use it. No
              marketing either way.
            </span>
          </span>
        </label>

        {error && (
          <p role="alert" className="text-sm leading-relaxed text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
          <Button
            type="submit"
            disabled={saving}
            className={cn('h-auto min-h-11 w-full whitespace-normal px-6 py-2.5 sm:w-auto')}
          >
            {saving ? 'Saving…' : isUpdate ? 'Update my feedback' : 'Share my feedback'}
          </Button>
          <Link
            href="/start"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Not now
          </Link>
        </div>
      </form>
    </div>
  )
}
