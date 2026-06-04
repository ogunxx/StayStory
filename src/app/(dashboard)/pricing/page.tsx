'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type Interval = 'monthly' | 'annual'

type Plan = {
  key: 'free' | 'legendary' | 'portfolio'
  name: string
  promise: string
  priceMonthly: number
  priceAnnual: number
  outcomes: string[]
  cta: string
  disabled: boolean
  highlight: boolean
}

const PLANS: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    promise: 'Start seeing your stay the way your guests do.',
    priceMonthly: 0,
    priceAnnual: 0,
    outcomes: [
      'Build and edit your Experience Blueprint',
      'Run an Experience Audit',
      'A first taste of the Experience Generator',
      'Guest message auto-fill',
    ],
    cta: 'Current plan',
    disabled: true,
    highlight: false,
  },
  {
    key: 'legendary',
    name: 'Legendary',
    promise: 'The whole system, unlimited — for the place you pour yourself into.',
    priceMonthly: 29,
    priceAnnual: 290,
    outcomes: [
      'Unlimited moments, audits, and stories',
      'Advanced customization and saved blueprint variations',
      'Enhanced outputs across the system',
      'Your full Custom Guest Journey Playbook',
      'Priority support',
    ],
    cta: 'Become Legendary',
    disabled: false,
    highlight: true,
  },
  {
    key: 'portfolio',
    name: 'Portfolio',
    promise: 'Everything in Legendary — across every place you host.',
    priceMonthly: 79,
    priceAnnual: 790,
    outcomes: [
      'Everything in Legendary',
      'Up to 5 properties, each with its own blueprint & playbook',
      'Co-host and team access',
      'Priority support and onboarding',
    ],
    cta: 'Scale with Portfolio',
    disabled: false,
    highlight: false,
  },
]

const GROWTH = [
  {
    stage: 'You start free',
    detail:
      'You see your stay clearly — what it feels like to arrive, what guests remember, where the gaps are.',
  },
  {
    stage: 'You go Legendary',
    detail:
      'You stop rationing care. Every guest gets a designed moment, every place its own story, every detail intentional.',
  },
  {
    stage: 'You grow into Portfolio',
    detail:
      'You hand the system to your team and run it across every property — without losing what made the first one special.',
  },
]

const FAQ = [
  {
    q: 'What can I do for free?',
    a: 'Everything begins with the Experience Blueprint — and that\'s yours to build and edit on the free plan, along with an Experience Audit and a taste of the Experience Generator.',
  },
  {
    q: 'What changes when I upgrade?',
    a: 'Paid plans remove the limits: unlimited generation, advanced customization, saved blueprint variations, enhanced outputs, and your full Guest Journey Playbook.',
  },
  {
    q: 'When should I choose Portfolio?',
    a: 'When you host more than one place, or you have co-hosts. Portfolio gives each property its own blueprint and playbook, plus team access.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your account settings whenever you like. Everything you\'ve built stays with you.',
  },
]

export default function PricingPage() {
  const [interval, setInterval] = useState<Interval>('annual')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpgrade(tier: string) {
    setLoading(tier)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval }),
      })
      const text = await res.text()
      if (!text) throw new Error(`Server returned empty response (${res.status})`)
      const data = JSON.parse(text)
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`)
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(null)
    }
  }

  function priceLabel(plan: Plan) {
    if (plan.priceMonthly === 0) return '$0'
    if (interval === 'annual') {
      const perMonth = Math.round(plan.priceAnnual / 12)
      return `$${perMonth}`
    }
    return `$${plan.priceMonthly}`
  }

  return (
    <div className="flex flex-col gap-14 max-w-5xl">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-primary mb-3">Your plan</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground mb-4">
          Start where you are. Grow when you&apos;re ready.
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Every plan helps you turn a place to stay into a story worth remembering. The only question
          is how much of the system you want working for you — and across how many places.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-4">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          <button
            onClick={() => setInterval('monthly')}
            className={`px-4 py-1.5 text-sm rounded-full transition ${
              interval === 'monthly'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('annual')}
            className={`px-4 py-1.5 text-sm rounded-full transition ${
              interval === 'annual'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Annual
          </button>
        </div>
        <span className="text-sm text-primary">Two months free, billed yearly</span>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Tier cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`rounded-2xl p-7 flex flex-col gap-5 border ${
              plan.highlight ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-serif font-semibold text-lg text-foreground">{plan.name}</p>
                {plan.highlight && (
                  <span className="text-[10px] uppercase tracking-widest text-primary border border-primary/40 rounded-full px-2 py-0.5">
                    Most loved
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-semibold text-foreground">{priceLabel(plan)}</span>
                {plan.priceMonthly > 0 && (
                  <span className="text-sm text-muted-foreground">/mo</span>
                )}
              </div>
              {plan.priceMonthly > 0 && interval === 'annual' && (
                <p className="text-xs text-muted-foreground mt-1">
                  ${plan.priceAnnual} billed yearly
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{plan.promise}</p>
            </div>

            <ul className="flex flex-col gap-2.5 text-sm text-foreground/80 flex-1">
              {plan.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-2.5">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => !plan.disabled && handleUpgrade(plan.key)}
              disabled={plan.disabled || loading === plan.key}
              variant={plan.highlight ? 'default' : 'outline'}
              size="sm"
              className="w-full"
            >
              {loading === plan.key ? 'Redirecting…' : plan.cta}
            </Button>
          </div>
        ))}
      </div>

      {/* What changes as you grow */}
      <div className="border-t border-border pt-12">
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
          The same system, at every stage of your hosting.
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          You don&apos;t buy features. You unlock how far the system can carry you.
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {GROWTH.map((g, i) => (
            <div key={g.stage} className="flex flex-col gap-2">
              <span className="text-xs text-primary">{String(i + 1).padStart(2, '0')}</span>
              <p className="font-serif font-semibold text-foreground">{g.stage}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{g.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="border-t border-border pt-12">
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-8">Questions, answered.</h2>
        <div className="divide-y divide-border">
          {FAQ.map((item) => (
            <div key={item.q} className="py-5 grid sm:grid-cols-3 gap-4">
              <p className="font-medium text-foreground sm:col-span-1">{item.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed sm:col-span-2">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground border-t border-border pt-8">
        Payments are processed securely by Stripe. Cancel anytime from your account settings — everything
        you&apos;ve built stays with you.
      </p>
    </div>
  )
}
