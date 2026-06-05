'use client'

import { useState } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PLAN_PRICING } from '@/lib/config'

type Interval = 'monthly' | 'annual'

export function HomePricing() {
  const [billingInterval, setBillingInterval] = useState<Interval>('annual')

  const legend =
    billingInterval ==='annual'
      ? `$${Math.round(PLAN_PRICING.legendary.annual / 12)}`
      : `$${PLAN_PRICING.legendary.monthly}`
  const portfolio =
    billingInterval ==='annual'
      ? `$${Math.round(PLAN_PRICING.portfolio.annual / 12)}`
      : `$${PLAN_PRICING.portfolio.monthly}`

  const subLegend =
    billingInterval ==='annual'
      ? `$${PLAN_PRICING.legendary.annual} billed once a year`
      : `$${PLAN_PRICING.legendary.monthly} billed each month`
  const subPortfolio =
    billingInterval ==='annual'
      ? `$${PLAN_PRICING.portfolio.annual} billed once a year`
      : `$${PLAN_PRICING.portfolio.monthly} billed each month`

  const billingNote =
    billingInterval ==='annual'
      ? 'Pay once for the full year — two months free versus monthly. Cancel anytime before it renews, or turn off auto-renewal at checkout so you\'re never charged again automatically.'
      : 'Pay month to month. Cancel anytime — you keep access through the month you\'ve paid for. Turn off auto-renewal at checkout and your plan simply ends when the month is over.'

  return (
    <div className="max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 text-center">
        Where you are, where you&apos;re going
      </p>
      <h2 className="text-3xl font-serif font-semibold text-center mb-4 text-foreground">
        Start free. Grow when<br />you&apos;re ready.
      </h2>

      {/* Billing toggle */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <div className="inline-flex rounded-full border border-border bg-background p-1">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-4 py-1.5 text-sm rounded-full transition ${
              billingInterval ==='monthly'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('annual')}
            className={`px-4 py-1.5 text-sm rounded-full transition ${
              billingInterval ==='annual'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Annual
            <span className="ml-1.5 text-primary">2 months free</span>
          </button>
        </div>
      </div>

      <p className="text-center text-muted-foreground mb-14 text-sm max-w-2xl mx-auto leading-relaxed">
        {billingNote}
      </p>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Free */}
        <div className="rounded-2xl p-7 flex flex-col gap-5 border border-border bg-background">
          <div>
            <p className="font-serif font-semibold text-foreground text-lg">Free</p>
            <p className="text-3xl font-semibold text-foreground mt-2">$0</p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              See your stay the way your guests do. Build your blueprint, run an audit,
              and try the system.
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground flex-1">
            {[
              'Build & edit your Experience Blueprint',
              'Experience Audit',
              'A taste of the Experience Generator',
              'Guest message auto-fill',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">✓</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            Start free
          </Link>
        </div>

        {/* Legendary */}
        <div className="rounded-2xl p-7 flex flex-col gap-5 border border-primary bg-primary/5">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-serif font-semibold text-foreground text-lg">Legendary</p>
              <span className="text-[10px] uppercase tracking-widest text-primary border border-primary/40 rounded-full px-2 py-0.5">
                Most loved
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-semibold text-foreground">{legend}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{subLegend}</p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              The whole system, unlimited — for the place you pour yourself into.
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground flex-1">
            {[
              'Unlimited moments, audits & stories',
              'Advanced customization & saved variations',
              'Enhanced outputs across the system',
              'Your full Custom Guest Journey Playbook',
              'Priority support from Ogun & Evie',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">✓</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }))}>
            Become Legendary →
          </Link>
        </div>

        {/* Portfolio */}
        <div className="rounded-2xl p-7 flex flex-col gap-5 border border-border bg-background">
          <div>
            <p className="font-serif font-semibold text-foreground text-lg">Portfolio</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-semibold text-foreground">{portfolio}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{subPortfolio}</p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Everything in Legendary — across every place you host.
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground flex-1">
            {[
              'Everything in Legendary',
              'Up to 5 properties, each with its own blueprint',
              'Co-host & team access',
              'Priority support + onboarding',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">✓</span>{f}
              </li>
            ))}
          </ul>
          <Link href="/signup" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            Scale with Portfolio
          </Link>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-10">
        <Link href="/pricing" className="text-primary underline underline-offset-4">
          Compare plans and see what changes as you grow →
        </Link>
      </p>
    </div>
  )
}
