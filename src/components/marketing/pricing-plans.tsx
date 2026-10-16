'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PLANS as DEFAULT_PLANS, type Plan } from '@/lib/plans'

/**
 * Pricing — Section 2. The plans.
 *
 * Nothing about a plan is written here. Every card comes from PLANS in
 * src/lib/plans, which takes its prices from PLAN_PRICING in src/lib/config —
 * the single source of truth kept in sync with Stripe. The in-app upgrade
 * screen reads the same data, so the two can never disagree.
 *
 * Annual is billed once for the year; the figure shown for annual billing is
 * that amount divided by twelve.
 */

type Interval = 'monthly' | 'annual'

/**
 * Plan data moved to src/lib/plans.ts so the in-app upgrade screen and this
 * page describe the same plans. Re-exported here because this module was the
 * public home of PLANS.
 */
export type { Plan } from '@/lib/plans'
export { PLANS } from '@/lib/plans'

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden>
      <path
        d="M4 10.5l4 4 8-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlanCard({ plan, interval }: { plan: Plan; interval: Interval }) {
  const perMonth =
    interval === 'annual' ? Math.round(plan.annual / 12) : plan.monthly
  const billingNote =
    plan.monthly === 0
      ? 'Free forever'
      : interval === 'annual'
        ? `$${plan.annual} billed once a year`
        : 'billed each month'

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-7 ${
        plan.featured
          ? 'border-primary bg-primary/[0.06] shadow-[0_28px_70px_-42px_rgba(60,40,25,0.5)]'
          : 'border-border bg-card'
      }`}
    >
      {plan.badge ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-primary-foreground">
          {plan.badge}
        </span>
      ) : null}

      <h3 className="font-serif text-xl font-semibold text-foreground">{plan.name}</h3>
      <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">{plan.promise}</p>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="font-serif text-[2.1rem] font-semibold text-foreground">${perMonth}</span>
        <span className="text-sm text-muted-foreground">/ month</span>
      </div>
      <p className="mt-1 text-[0.72rem] text-muted-foreground">{billingNote}</p>

      <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-border/70 pt-5">
        {plan.includes.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[0.83rem] leading-snug text-foreground">
            <Check />
            {item}
          </li>
        ))}
      </ul>

      <Link
        href={plan.ctaHref}
        /* Every plan's button is filled.
           A faint outlined button beside a filled one reads as disabled
           rather than as the quieter of two choices — on a phone, "Choose
           Portfolio" did not look clickable at all. Which plan is featured
           is already said by the card's frame and its badge, so it does not
           also need to be said by making the others look unavailable. */
        className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium whitespace-nowrap text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {plan.ctaLabel}
      </Link>
    </div>
  )
}

export function PricingPlans({
  eyebrow = 'Choose your plan',
  headline = 'Simple, flexible pricing.',
  supporting = 'Get full access to the StayStory platform with everything you need to design, refine and deliver an unforgettable guest experience.',
  savingNote = 'Two months free with annual billing',
  plans = DEFAULT_PLANS,
}: {
  eyebrow?: string
  headline?: string
  supporting?: string
  savingNote?: string
  plans?: Plan[]
}) {
  const [interval, setInterval] = useState<Interval>('monthly')

  return (
    <section id="plans" className="px-6 py-4">
      <div className="mx-auto w-full max-w-7xl rounded-3xl bg-secondary/20 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h2 className="font-serif text-[1.8rem] leading-tight font-semibold tracking-tight text-foreground sm:text-[2.3rem]">
              {headline}
            </h2>
            <p className="mt-4 max-w-lg text-[0.92rem] leading-relaxed text-muted-foreground">
              {supporting}
            </p>
          </div>

          <div className="shrink-0 lg:text-right">
            <div className="inline-flex rounded-full border border-border bg-background p-1">
              {(['monthly', 'annual'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setInterval(option)}
                  aria-pressed={interval === option}
                  className={`rounded-full px-5 py-1.5 text-sm capitalize transition-colors ${
                    interval === option
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[0.75rem] text-muted-foreground">{savingNote}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} interval={interval} />
          ))}
        </div>
      </div>
    </section>
  )
}
