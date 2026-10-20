'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PAID_PLANS } from '@/lib/plans'
import { REFUND_WINDOW_DAYS } from '@/lib/legal'
import { UpgradeButton } from '@/components/billing/upgrade-button'
import { cn } from '@/lib/utils'

/**
 * The plan chooser. Lives in the dashboard shell, so a host upgrading stays
 * inside the product with their own navigation around them, rather than being
 * dropped onto the public marketing page as a stranger.
 */

type Interval = 'monthly' | 'annual'

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden>
      <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function UpgradePlans({
  currentTier,
  highlight,
}: {
  /** Normalised: 'free', 'legendary' or 'portfolio'. */
  currentTier: 'free' | 'legendary' | 'portfolio'
  /** The plan the host arrived intending to buy, if any. */
  highlight?: 'legendary' | 'portfolio'
}) {
  const [interval, setInterval] = useState<Interval>('monthly')

  const rank = { free: 0, legendary: 1, portfolio: 2 }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          {(['monthly', 'annual'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setInterval(option)}
              aria-pressed={interval === option}
              className={cn(
                'rounded-full px-5 py-1.5 text-sm capitalize transition-colors',
                interval === option
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Two months free with annual billing</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-stretch">
        {PAID_PLANS.map((plan) => {
          const paid = plan.id as 'legendary' | 'portfolio'
          const isCurrent = currentTier === plan.id
          const isBelowCurrent = rank[plan.id as keyof typeof rank] < rank[currentTier]
          const featured = highlight ? highlight === plan.id : plan.featured

          const perMonth =
            interval === 'annual' ? Math.round(plan.annual / 12) : plan.monthly
          const billingNote =
            interval === 'annual' ? `$${plan.annual} billed once a year` : 'billed each month'

          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-2xl border p-7',
                featured && !isCurrent
                  ? 'border-primary bg-primary/[0.06]'
                  : 'border-border bg-card'
              )}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-7 rounded-full bg-secondary px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-foreground">
                  Your current plan
                </span>
              )}

              <h2 className="font-serif text-xl font-semibold text-foreground">{plan.name}</h2>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
                {plan.promise}
              </p>

              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-serif text-[2.1rem] font-semibold text-foreground">
                  ${perMonth}
                </span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <p className="mt-1 text-[0.72rem] text-muted-foreground">{billingNote}</p>

              <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t border-border/70 pt-5">
                {plan.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[0.83rem] leading-snug text-foreground"
                  >
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {isCurrent ? (
                  <form action="/api/stripe/portal" method="post">
                    <button
                      type="submit"
                      className="h-11 w-full rounded-lg border border-border text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      Manage subscription
                    </button>
                  </form>
                ) : isBelowCurrent ? (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Already included in your plan.
                  </p>
                ) : (
                  <UpgradeButton
                    tier={paid}
                    interval={interval}
                    label={`Continue to payment — $${perMonth}/mo`}
                    // Both filled. An outlined Portfolio button beside a
                    // filled Legendary one read as disabled rather than as
                    // the quieter of two choices — the card's frame already
                    // says which plan is featured.
                    variant="default"
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Beside the payment button, not buried in the footer: the refund
          window is the thing someone wants to know at the moment they are
          deciding whether to risk a first payment. */}
      <div className="flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
        <p>
          Payment is handled by Stripe — we never see your card details. You can change or cancel
          your plan at any time from{' '}
          <Link href="/account" className="text-primary underline underline-offset-4">
            your account
          </Link>
          .
        </p>
        <p>
          Full refund within {REFUND_WINDOW_DAYS} days, no questions asked — see{' '}
          <Link href="/refunds" className="text-primary underline underline-offset-4">
            Refunds
          </Link>
          . By subscribing you agree to our{' '}
          <Link href="/terms" className="text-primary underline underline-offset-4">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary underline underline-offset-4">
            Privacy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
