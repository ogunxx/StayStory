'use client'

import { useId, useRef, useState } from 'react'
import { ctaHeroPrimary, ctaSecondary } from './cta-styles'
import { cn } from '@/lib/utils'
import { CLARITY_MASK } from '@/lib/analytics'
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_OTHER,
  TESTING_INTERESTS,
  LIMITS,
  shouldOfferConversation,
  type PropertyType,
  type TestingInterest,
} from '@/lib/host-research'
import { HONEYPOT_FIELD } from '@/lib/research-guard'

/**
 * Help Shape StayStory — customer discovery on the public homepage.
 *
 * ┌─ WHAT THIS IS NOT ─────────────────────────────────────────────────────┐
 * │ Not step five. The public product story is four steps — Audit,        │
 * │ Compass, Opportunities, Starter Playbook — and this is an invitation  │
 * │ beside it, not part of it. It is also not the post-use Feedback at    │
 * │ /start/feedback, which asks a host who finished the journey whether   │
 * │ StayStory helped. This asks anyone, including people who have never   │
 * │ used it, what they need.                                             │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * Everything a person would want to change is data below: COPY for the
 * section, the questions from host-research.ts, CONFIRMATION and
 * CONVERSATION for the two states afterwards.
 *
 * The form is collapsed until asked for. A research form that greets every
 * visitor expanded reads as a lead-capture funnel; one that opens when
 * someone chooses to answer reads as a conversation.
 */

export const COPY = {
  label: 'Your voice matters',
  heading: 'Help Shape StayStory',
  body: [
    'Great hospitality is built on understanding people. We believe the tools that support hosts should be, too.',
    'We’re building StayStory alongside the people who know hospitality best: hosts themselves.',
    'Whether you’re just getting started or have been welcoming guests for years, we’d love to hear about your experiences, challenges, and ideas.',
    'Your perspective can help us create tools that make thoughtful hospitality easier, more creative, and more rewarding.',
  ],
  cta: 'Share Your Perspective',
  // No timing claim. "A few minutes" is a promise nobody measured.
  supporting: 'A few thoughtful questions. Your perspective can help shape what comes next.',
}

export const QUESTIONS = {
  propertyType: 'What type of property do you host?',
  propertyTypeOther: 'Tell us a little more',
  biggestChallenge:
    'What’s your biggest challenge when it comes to creating a memorable guest experience?',
  desiredSupport: 'What would make designing better guest experiences easier for you?',
  testingInterest: 'Would you be interested in testing StayStory and sharing your feedback?',
  name: 'Your name',
  email: 'Your email address',
}

export const PERMISSION =
  'By submitting, you’re giving StayStory permission to contact you about your feedback or potential participation in product research. You will not be automatically subscribed to marketing emails.'

/** The promise above is worth more with the policy behind it one click away. */
export const PERMISSION_LINK = { href: '/privacy', label: 'How we handle your information' }

export const CONFIRMATION = {
  heading: 'Thank you for helping shape StayStory.',
  body: 'Every thoughtful experience begins with listening. We appreciate you taking the time to share your perspective, and we’re excited to build something genuinely useful for hosts like you.',
}

export const CONVERSATION = {
  heading: 'Open to a quick conversation?',
  body: 'If you’d like to go a little deeper, we’d also love to hear about your experience in a short 15-minute conversation.',
  cta: 'Book a 15-Minute Conversation',
  decline: 'No thanks — I’m all set',
}

const OPTIONAL = <span className="font-normal text-muted-foreground"> (optional)</span>

const fieldBase =
  'w-full rounded-xl border border-border bg-background px-4 py-3 text-[0.95rem] text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-[0.95rem] font-medium leading-snug text-foreground">
      {children}
    </label>
  )
}

/** Native radios, styled. Keyboard behaviour and announcement come free. */
function Choice({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string
  value: string
  checked: boolean
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[0.92rem] transition-colors',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary',
        checked
          ? 'border-primary bg-primary/[0.06] text-foreground'
          : 'border-border bg-background text-foreground hover:border-primary/40'
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="size-4 shrink-0 accent-[var(--primary)]"
      />
      {children}
    </label>
  )
}

type Phase = 'collapsed' | 'form' | 'done'

export function HelpShape({ callUrl }: { callUrl?: string | null }) {
  const uid = useId()
  const id = (s: string) => `${uid}-${s}`

  const [phase, setPhase] = useState<Phase>('collapsed')
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('')
  const [propertyTypeOther, setPropertyTypeOther] = useState('')
  const [biggestChallenge, setBiggestChallenge] = useState('')
  const [desiredSupport, setDesiredSupport] = useState('')
  const [testingInterest, setTestingInterest] = useState<TestingInterest | ''>('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorField, setErrorField] = useState<string | null>(null)
  const [showConversation, setShowConversation] = useState(true)

  // One key per form interaction. A double click or a retry sends the same
  // key, and the server turns the second insert into the same success
  // instead of a second row. Created once, when the form opens.
  const key = useRef<string>('')
  const formRef = useRef<HTMLFormElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)

  function open() {
    key.current = globalThis.crypto?.randomUUID?.() ?? `k-${Date.now()}-${Math.random()}`
    setPhase('form')
    // Move focus into the form that just appeared, rather than leaving it on
    // a button that is no longer there.
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLInputElement>('input, textarea')?.focus()
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return

    setError(null)
    setErrorField(null)
    setSending(true)

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_type: propertyType,
          property_type_other: propertyTypeOther,
          biggest_challenge: biggestChallenge,
          desired_support: desiredSupport,
          testing_interest: testingInterest,
          name,
          email,
          idempotency_key: key.current,
          [HONEYPOT_FIELD]: honeypot,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; field?: string }

      if (!res.ok) {
        // Answers are left exactly as typed — nothing is cleared on failure.
        setError(data.error ?? 'We could not save that just now. Please try again.')
        setErrorField(data.field ?? null)
        requestAnimationFrame(() => errorRef.current?.focus())
        return
      }

      // Only after the write succeeded.
      setPhase('done')
      requestAnimationFrame(() => headingRef.current?.focus())
    } catch {
      setError('We could not reach StayStory just now. Please try again.')
      requestAnimationFrame(() => errorRef.current?.focus())
    } finally {
      setSending(false)
    }
  }

  const offerConversation =
    phase === 'done' &&
    showConversation &&
    testingInterest !== '' &&
    shouldOfferConversation({ testingInterest, callUrl })

  return (
    <section
      id="help-shape-staystory"
      aria-labelledby={id('heading')}
      className="border-t border-border/60 bg-secondary/25 px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto w-full max-w-2xl">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">
          {COPY.label}
        </p>
        <h2
          id={id('heading')}
          className="mt-3 font-serif text-[1.9rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2.4rem]"
        >
          {COPY.heading}
        </h2>

        <div className="mt-5 flex flex-col gap-4">
          {COPY.body.map((p) => (
            <p key={p} className="text-[0.95rem] leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>

        {/* ── Collapsed ──────────────────────────────────────────────── */}
        {phase === 'collapsed' && (
          <div className="mt-8">
            <button
              type="button"
              onClick={open}
              aria-expanded={false}
              aria-controls={id('form')}
              className={`${ctaHeroPrimary} w-full sm:w-auto`}
            >
              {COPY.cta}
            </button>
            <p className="mt-4 text-[0.85rem] leading-relaxed text-muted-foreground">
              {COPY.supporting}
            </p>
          </div>
        )}

        {/* ── The questions ──────────────────────────────────────────── */}
        {phase === 'form' && (
          <form
            ref={formRef}
            id={id('form')}
            onSubmit={submit}
            noValidate
            // The only public form that collects a person's name, address and
            // free text. Masked so recordings show how the form is used —
            // which questions stall people, where they abandon it — without
            // showing what any individual wrote. See src/lib/analytics.ts.
            data-clarity-mask={CLARITY_MASK}
            className="relative mt-9 flex flex-col gap-8 rounded-2xl border border-border bg-card p-5 sm:p-7"
          >
            {/* 1 — what they host */}
            <fieldset className="flex flex-col gap-3 border-0 p-0">
              <legend className="mb-1 text-[0.95rem] font-medium leading-snug text-foreground">
                {QUESTIONS.propertyType}
              </legend>
              <div className="flex flex-col gap-2">
                {PROPERTY_TYPES.map((t) => (
                  <Choice
                    key={t.value}
                    name={id('property-type')}
                    value={t.value}
                    checked={propertyType === t.value}
                    onChange={(v) => setPropertyType(v as PropertyType)}
                  >
                    {t.label}
                  </Choice>
                ))}
              </div>
              {propertyType === PROPERTY_TYPE_OTHER && (
                <div className="mt-2 flex flex-col gap-2">
                  <Label htmlFor={id('other')}>
                    {QUESTIONS.propertyTypeOther}
                    {OPTIONAL}
                  </Label>
                  <input
                    id={id('other')}
                    type="text"
                    value={propertyTypeOther}
                    maxLength={LIMITS.propertyTypeOther}
                    onChange={(e) => setPropertyTypeOther(e.target.value)}
                    className={fieldBase}
                  />
                </div>
              )}
            </fieldset>

            {/* 2 — their biggest challenge */}
            <div className="flex flex-col gap-2">
              <Label htmlFor={id('challenge')}>{QUESTIONS.biggestChallenge}</Label>
              <textarea
                id={id('challenge')}
                required
                rows={4}
                value={biggestChallenge}
                maxLength={LIMITS.biggestChallenge}
                onChange={(e) => setBiggestChallenge(e.target.value)}
                aria-invalid={errorField === 'biggest_challenge' || undefined}
                aria-describedby={errorField === 'biggest_challenge' ? id('error') : undefined}
                className={cn(fieldBase, 'resize-y', errorField === 'biggest_challenge' && 'border-destructive')}
              />
            </div>

            {/* 3 — what would help */}
            <div className="flex flex-col gap-2">
              <Label htmlFor={id('support')}>
                {QUESTIONS.desiredSupport}
                {OPTIONAL}
              </Label>
              <textarea
                id={id('support')}
                rows={3}
                value={desiredSupport}
                maxLength={LIMITS.desiredSupport}
                onChange={(e) => setDesiredSupport(e.target.value)}
                className={cn(fieldBase, 'resize-y')}
              />
            </div>

            {/* 4 — would they test it */}
            <fieldset className="flex flex-col gap-3 border-0 p-0">
              <legend className="mb-1 text-[0.95rem] font-medium leading-snug text-foreground">
                {QUESTIONS.testingInterest}
              </legend>
              <div className="flex flex-col gap-2 sm:flex-row">
                {TESTING_INTERESTS.map((t) => (
                  <div key={t.value} className="sm:flex-1">
                    <Choice
                      name={id('interest')}
                      value={t.value}
                      checked={testingInterest === t.value}
                      onChange={(v) => setTestingInterest(v as TestingInterest)}
                    >
                      {t.label}
                    </Choice>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* 5 and 6 — who they are */}
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor={id('name')}>
                  {QUESTIONS.name}
                  {OPTIONAL}
                </Label>
                <input
                  id={id('name')}
                  type="text"
                  autoComplete="name"
                  value={name}
                  maxLength={LIMITS.name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldBase}
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor={id('email')}>{QUESTIONS.email}</Label>
                <input
                  id={id('email')}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  maxLength={LIMITS.email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={errorField === 'email' || undefined}
                  aria-describedby={errorField === 'email' ? id('error') : undefined}
                  className={cn(fieldBase, errorField === 'email' && 'border-destructive')}
                />
              </div>
            </div>

            {/* Hidden from people and from screen readers. Only something
                filling every input finds it.

                Hidden by size and opacity rather than by shoving it off to
                left:-9999px: a negative offset puts a box outside the page,
                which is a horizontal-overflow bug waiting to happen the
                moment a parent's overflow rules change. One transparent
                pixel behind the form achieves the same thing and can never
                widen the page. */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 -z-10 h-px w-px overflow-hidden opacity-0"
            >
              <label htmlFor={id('hp')}>Leave this empty</label>
              <input
                id={id('hp')}
                name={HONEYPOT_FIELD}
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-4 border-t border-border/70 pt-6">
              <p className="text-[0.8rem] leading-relaxed text-muted-foreground">
                {PERMISSION}{' '}
                <a
                  href={PERMISSION_LINK.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  {PERMISSION_LINK.label}
                </a>
                .
              </p>

              {error && (
                <p
                  id={id('error')}
                  ref={errorRef}
                  tabIndex={-1}
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-[0.9rem] leading-relaxed text-foreground"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className={cn(ctaHeroPrimary, 'w-full sm:w-auto', sending && 'opacity-70')}
              >
                {sending ? 'Sending…' : COPY.cta}
              </button>
            </div>
          </form>
        )}

        {/* ── Afterwards ─────────────────────────────────────────────── */}
        {phase === 'done' && (
          <div className="mt-9 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h3
              ref={headingRef}
              tabIndex={-1}
              className="font-serif text-[1.4rem] leading-snug font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {CONFIRMATION.heading}
            </h3>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
              {CONFIRMATION.body}
            </p>

            {offerConversation && (
              <div className="mt-7 border-t border-border/70 pt-6">
                <h4 className="font-serif text-[1.15rem] font-semibold text-foreground">
                  {CONVERSATION.heading}
                </h4>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-muted-foreground">
                  {CONVERSATION.body}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href={callUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${ctaHeroPrimary} w-full sm:w-auto`}
                  >
                    {CONVERSATION.cta}
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowConversation(false)}
                    className={`${ctaSecondary} w-full sm:w-auto`}
                  >
                    {CONVERSATION.decline}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
