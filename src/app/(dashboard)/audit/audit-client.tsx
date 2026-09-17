'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  AUDIT_STEPS,
  stepProgress,
  visibleQuestions,
  type AuditAnswers,
  type AuditQuestion,
} from '@/lib/audit-questions'

/**
 * The Experience Audit — eight guided steps, one section at a time.
 *
 * This file renders whatever src/lib/audit-questions.ts describes. It holds no
 * copy of its own: questions, options, conditional rules and the StayStory
 * Insights all come from that file, so the Audit is edited there.
 *
 * Answers autosave to /api/audit/draft after a short pause, and on every step
 * change, so Back and Next never lose anything and a host can leave and
 * return.
 */

type Props = {
  initialAnswers: AuditAnswers
  initialStep: number
}

/* ── Progress rail ────────────────────────────────────────────────────────── */

function ProgressRail({
  current,
  answers,
  onJump,
}: {
  current: number
  answers: AuditAnswers
  onJump: (i: number) => void
}) {
  return (
    <nav aria-label="Audit progress" className="border-b border-border pb-5">
      {/* Horizontal on desktop, as in the mockup. On mobile it collapses to a
          single line of text rather than eight cramped circles. */}
      <ol className="hidden items-start justify-between gap-1 lg:flex">
        {AUDIT_STEPS.map((step, i) => {
          const { answered, total } = stepProgress(step, answers)
          const complete = total > 0 && answered === total
          const isCurrent = i === current
          return (
            <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                <span className={cn('h-px flex-1', i === 0 ? 'bg-transparent' : 'bg-border')} />
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Step ${i + 1}: ${step.navLabel}${complete ? ' (complete)' : ''}`}
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    isCurrent
                      ? 'border-primary bg-primary text-primary-foreground'
                      : complete
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  )}
                >
                  {complete && !isCurrent ? (
                    <svg viewBox="0 0 20 20" fill="none" className="size-3.5" aria-hidden>
                      <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </button>
                <span className={cn('h-px flex-1', i === AUDIT_STEPS.length - 1 ? 'bg-transparent' : 'bg-border')} />
              </div>
              <span
                className={cn(
                  'text-center text-[0.7rem] leading-tight',
                  isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.navLabel}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="flex items-center justify-between gap-4 lg:hidden">
        <p className="text-sm font-medium text-foreground">
          {AUDIT_STEPS[current].navLabel}
        </p>
        <p className="text-xs text-muted-foreground">
          Step {current + 1} of {AUDIT_STEPS.length}
        </p>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted lg:hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((current + 1) / AUDIT_STEPS.length) * 100}%` }}
        />
      </div>
    </nav>
  )
}

/* ── StayStory Insight card ───────────────────────────────────────────────── */

function InsightCard({ children }: { children: React.ReactNode }) {
  return (
    <aside className="flex gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] p-4">
      <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden>
        <path
          d="M9 18h6M10 21h4M12 3a6 6 0 013.5 10.9c-.5.4-.8 1-.8 1.6H9.3c0-.6-.3-1.2-.8-1.6A6 6 0 0112 3z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div>
        <p className="text-xs font-semibold text-primary">StayStory Insight</p>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </aside>
  )
}

/* ── One question ─────────────────────────────────────────────────────────── */

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: AuditQuestion
  value: string | string[] | undefined
  onChange: (v: string | string[]) => void
}) {
  const selected = Array.isArray(value) ? value : []

  function toggle(optionValue: string) {
    const isOn = selected.includes(optionValue)
    if (isOn) {
      onChange(selected.filter((v) => v !== optionValue))
      return
    }
    if (question.max && selected.length >= question.max) return
    onChange([...selected, optionValue])
  }

  const atLimit = Boolean(question.max && selected.length >= question.max)

  return (
    <fieldset className="border-0 p-0">
      <legend className="text-[0.95rem] font-semibold leading-snug text-foreground">
        {question.prompt}
      </legend>
      {question.helper && (
        <p className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">{question.helper}</p>
      )}

      <div className="mt-3">
        {/* Single choice — radio semantics, so keyboard and screen readers work. */}
        {question.kind === 'single' && (
          <div role="radiogroup" className="flex flex-col gap-1">
            {question.options?.map((option) => {
              const checked = value === option.value
              return (
                <label
                  key={option.value}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 text-[0.88rem] text-foreground transition-colors hover:bg-muted/60 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={checked}
                    onChange={() => onChange(option.value)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-[1.15rem] shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      checked ? 'border-primary' : 'border-border'
                    )}
                  >
                    {checked && <span className="size-2.5 rounded-full bg-primary" />}
                  </span>
                  {option.label}
                </label>
              )
            })}
          </div>
        )}

        {/* Multi-select — checkbox semantics. */}
        {question.kind === 'multi' && (
          <div className="flex flex-col gap-1">
            {question.options?.map((option) => {
              const checked = selected.includes(option.value)
              return (
                <label
                  key={option.value}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 text-[0.88rem] text-foreground transition-colors hover:bg-muted/60"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(option.value)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      'flex size-[1.15rem] shrink-0 items-center justify-center rounded-[0.3rem] border-2 transition-colors',
                      checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                    )}
                  >
                    {checked && (
                      <svg viewBox="0 0 20 20" fill="none" className="size-3">
                        <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {option.label}
                </label>
              )
            })}
          </div>
        )}

        {/* Pills — the mockup's selectable chips, capped by `max`. */}
        {question.kind === 'pills' && (
          <>
            <div className="flex flex-wrap gap-2">
              {question.options?.map((option) => {
                const checked = selected.includes(option.value)
                const disabled = !checked && atLimit
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    disabled={disabled}
                    onClick={() => toggle(option.value)}
                    className={cn(
                      'min-h-10 rounded-full border px-4 text-[0.83rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                      checked
                        ? 'border-primary bg-primary text-primary-foreground'
                        : disabled
                          ? 'cursor-not-allowed border-border/60 text-muted-foreground/50'
                          : 'border-border bg-card text-foreground hover:border-primary/50'
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            {question.max && (
              <p className="mt-2 text-[0.75rem] text-muted-foreground" aria-live="polite">
                {selected.length} of {question.max} chosen
              </p>
            )}
          </>
        )}

        {question.kind === 'text' && (
          <Input
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            aria-label={question.prompt}
          />
        )}

        {question.kind === 'textarea' && (
          <Textarea
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            aria-label={question.prompt}
          />
        )}
      </div>
    </fieldset>
  )
}

/* ── The Audit ────────────────────────────────────────────────────────────── */

export default function AuditClient({ initialAnswers, initialStep }: Props) {
  const [answers, setAnswers] = useState<AuditAnswers>(initialAnswers)
  const [stepIndex, setStepIndex] = useState(
    Math.min(Math.max(initialStep, 0), AUDIT_STEPS.length - 1)
  )
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const headingRef = useRef<HTMLHeadingElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Values are passed in rather than read from a ref, so a save triggered by
  // a step change sends the step being moved to, not the one just left.
  const save = useCallback(async (toSave: AuditAnswers, step: number) => {
    try {
      const res = await fetch('/api/audit/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: toSave, step_index: step }),
      })
      if (res.ok) {
        const data = await res.json()
        setSavedAt(data.saved_at)
      }
    } catch {
      // A failed autosave shouldn't interrupt the host. The answers stay in
      // state and the next save attempt sends them.
    }
  }, [])

  // Debounced autosave on answer changes.
  useEffect(() => {
    if (done) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => void save(answers, stepIndex), 1200)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [answers, stepIndex, save, done])

  const step = AUDIT_STEPS[stepIndex]
  const questions = visibleQuestions(step, answers)
  const isLast = stepIndex === AUDIT_STEPS.length - 1

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  function go(next: number) {
    const target = Math.min(Math.max(next, 0), AUDIT_STEPS.length - 1)
    setStepIndex(target)
    void save(answers, target)
    // Move focus to the new step's heading so keyboard and screen-reader
    // users land in the right place rather than at the top of the document.
    requestAnimationFrame(() => headingRef.current?.focus())
  }

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Could not save your Audit.')
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your Audit.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Completion ─────────────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center sm:p-10">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <svg viewBox="0 0 24 24" fill="none" className="size-6 text-primary" aria-hidden>
            <path
              d="M12 3l2.2 5.9 5.9 2.2-5.9 2.2L12 19.2l-2.2-5.9L3.9 11l5.9-2.2z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1 className="mt-5 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          You&apos;re all set
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          We&apos;re reading through your answers and turning them into your StayStory Experience
          Report.
        </p>

        <ul className="mx-auto mt-7 flex max-w-sm flex-col gap-3 text-left">
          {[
            'Identifying your property’s strengths',
            'Finding opportunities to enhance the guest experience',
            'Highlighting what makes your place unique',
            'Providing thoughtful, prioritised recommendations',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-[0.85rem] leading-snug text-foreground">
              <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden>
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.3" />
                <path d="M6.5 10.3l2.4 2.3 4.6-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/compass" className="w-full sm:w-auto">
            <Button className="h-11 w-full px-6 sm:w-auto">See my results →</Button>
          </Link>
          <p className="max-w-sm text-[0.78rem] leading-relaxed text-muted-foreground">
            Your answers have been proposed to your Experience Compass. Nothing is added until you
            review and accept it.
          </p>
        </div>
      </div>
    )
  }

  /* ── The step ───────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-6">
      <ProgressRail current={stepIndex} answers={answers} onJump={go} />

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Step {stepIndex + 1} of {AUDIT_STEPS.length}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 font-serif text-2xl font-semibold text-foreground outline-none sm:text-[1.75rem]"
        >
          {stepIndex + 1}. {step.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-muted-foreground">
          {step.intro}
        </p>

        {step.image && (
          <div className="mt-6 overflow-hidden rounded-xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={step.image} alt={step.imageAlt ?? ''} className="block h-48 w-full object-cover sm:h-60" />
          </div>
        )}

        {/* Dividers rather than gaps alone: some steps carry a dozen
            questions, and a hairline keeps them scannable without adding
            twelve nested boxes inside the step card. */}
        <div className="mt-7 flex flex-col divide-y divide-border border-t border-border">
          {questions.map((question) => (
            <div key={question.id} className="py-6 first:pt-7 last:pb-0">
            <QuestionField
              question={question}
              value={answers[question.id]}
              onChange={(v) => setAnswer(question.id, v)}
            />
            </div>
          ))}
        </div>

        {step.insight && (
          <div className="mt-8">
            <InsightCard>{step.insight}</InsightCard>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-6 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => go(stepIndex - 1)}
            disabled={stepIndex === 0}
            className="h-11 px-4 sm:w-auto"
          >
            ← Back
          </Button>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-muted-foreground sm:inline" aria-live="polite">
              {savedAt ? 'Progress saved' : 'Saves as you go'}
            </span>
            {isLast ? (
              <Button onClick={submit} disabled={submitting} className="h-11 w-full px-6 sm:w-auto">
                {submitting ? 'Saving…' : 'See my results →'}
              </Button>
            ) : (
              <Button onClick={() => go(stepIndex + 1)} className="h-11 w-full px-6 sm:w-auto">
                Next →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
