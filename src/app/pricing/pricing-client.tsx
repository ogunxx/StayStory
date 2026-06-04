'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PLAN_PRICING } from '@/lib/config'

type Interval = 'monthly' | 'annual'

type Plan = {
  key: 'free' | 'legendary' | 'portfolio'
  name: string
  promise: string
  priceMonthly: number
  priceAnnual: number
  outcomes: string[]
  cta: string
  highlight: boolean
  paid: boolean
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
    cta: 'Start free',
    highlight: false,
    paid: false,
  },
  {
    key: 'legendary',
    name: 'Legendary',
    promise: 'The whole system, unlimited — for the place you pour yourself into.',
    priceMonthly: PLAN_PRICING.legendary.monthly,
    priceAnnual: PLAN_PRICING.legendary.annual,
    outcomes: [
      'Unlimited moments, audits, and stories',
      'Advanced customization and saved blueprint variations',
      'Enhanced outputs across the system',
      'Your full Custom Guest Journey Playbook',
      'Priority support',
    ],
    cta: 'Become Legendary',
    highlight: true,
    paid: true,
  },
  {
    key: 'portfolio',
    name: 'Portfolio',
    promise: 'Everything in Legendary — across every place you host.',
    priceMonthly: PLAN_PRICING.portfolio.monthly,
    priceAnnual: PLAN_PRICING.portfolio.annual,
    outcomes: [
      'Everything in Legendary',
      'Up to 5 properties, each with its own blueprint & playbook',
      'Co-host and team access',
      'Priority support and onboarding',
    ],
    cta: 'Scale with Portfolio',
    highlight: false,
    paid: true,
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
    q: 'How does monthly billing work?',
    a: 'You pay for one month at a time. On a monthly plan you\'re charged at the start of each month and you can cancel anytime — your access stays active until the end of the month you\'ve already paid for.',
  },
  {
    q: 'How does annual billing work?',
    a: 'You pay once, up front, for the whole year — and that price already includes two months free versus paying monthly. Your access runs for the full year. You can cancel anytime before it renews.',
  },
  {
    q: 'Can I stop it from renewing automatically?',
    a: 'Yes. Uncheck "Renew automatically" at checkout and your plan simply ends when the period you paid for is over — we will never charge you again without you choosing to. You can also turn renewal on or off later from your account settings.',
  },
  {
    q: 'What can I do for free?',
    a: 'Everything begins with the Experience Blueprint — and that\'s yours to build and edit on the free plan, along with an Experience Audit and a taste of the Experience Generator.',
  },
  {
    q: 'When should I choose Portfolio?',
    a: 'When you host more than one place, or you have co-hosts. Portfolio gives each property its own blueprint and playbook, plus team access.',
  },
]

export default function PricingClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter()
  const [interval, setInterval] = useState<Interval>('annual')
  const [autoRenew, setAutoRenew] = useState(true)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSelect(plan: Plan) {
    // Free plan, or anyone not signed in yet, goes through signup first.
    if (!plan.paid) {
      router.push(isLoggedIn ? '/dashboard' : '/signup')
      return
    }
    if (!isLoggedIn) {
      router.push('/signup')
      return
    }

    setLoading(plan.key)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: plan.key, interval, autoRenew }),
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
    if (interval === 'annual') return `$${Math.round(plan.priceAnnual / 12)}`
    return `$${plan.priceMonthly}`
  }

  // Plain-language explanation of exactly how the charge works, given the
  // current interval + auto-renew choice.
  const billingNote =
    interval === 'monthly'
      ? autoRenew
        ? 'On a paid monthly plan you\'re charged at the start of each month. Cancel anytime — you keep access until the end of the month you\'ve paid for.'
        : 'You\'ll be charged once for a single month. Your plan won\'t renew — access ends when the month is over and you won\'t be charged again.'
      : autoRenew
        ? 'You\'ll be charged once for the full year (two months free versus monthly). It renews yearly — cancel anytime before it renews.'
        : 'You\'ll be charged once for the full year (two months free versus monthly). It won\'t renew — access ends when the year is over and you won\'t be charged again.'

  return (
    <div className="flex flex-col gap-14 max-w-5xl mx-auto w-full">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-primary mb-3">Plans &amp; pricing</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-foreground mb-4">
          Start where you are. Grow when you&apos;re ready.
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Every plan helps you turn a place to stay into a story worth remembering. The only question
          is how much of the system you want working for you — and across how many places.
        </p>
      </div>

      {/* Billing controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
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

        {/* Auto-renew opt-out */}
        <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer max-w-xl">
          <input
            type="checkbox"
            checked={autoRenew}
            onChange={(e) => setAutoRenew(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-[var(--primary)]"
          />
          <span>
            <span className="font-medium">Renew automatically</span>
            <span className="text-muted-foreground">
              {' '}— keep my plan going so I don&apos;t lose access. Uncheck it and your plan simply
              ends when the period you paid for is over; we&apos;ll never charge you automatically.
            </span>
          </span>
        </label>

        <p className="text-sm text-muted-foreground bg-secondary rounded-xl px-4 py-3 max-w-xl">
          {billingNote}
        </p>
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
                {plan.paid && <span className="text-sm text-muted-foreground">/mo</span>}
              </div>
              {plan.paid && (
                <p className="text-xs text-muted-foreground mt-1">
                  {interval === 'annual'
                    ? `$${plan.priceAnnual} billed once a year`
                    : `$${plan.priceMonthly} billed each month`}
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
              onClick={() => handleSelect(plan)}
              disabled={loading === plan.key}
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
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-8">Billing, answered.</h2>
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
        Payments are processed securely by Stripe. Cancel anytime — everything you&apos;ve built stays
        with you.
      </p>
    </div>
  )
}
