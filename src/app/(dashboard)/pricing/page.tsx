'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LEGENDARY_PRICE } from '@/lib/config'

const PLAN_DETAILS = [
  {
    key: 'free' as const,
    name: 'Free',
    price: '$0',
    desc: 'Get started with the basics.',
    features: [
      'Foundation Audit',
      '1 generator use/month',
      '1 free preview of Journey Map, Story Builder & Playbook',
      'Guest message auto-fill',
    ],
    cta: 'Current plan',
    disabled: true,
    highlight: false,
  },
  {
    key: 'legendary' as const,
    name: 'Legendary',
    price: LEGENDARY_PRICE,
    desc: 'Every tool, unlimited. No limits, no resets.',
    features: [
      'All five tools — unlimited',
      'Custom Guest Journey Playbook',
      'Guest Story Builder',
      'Journey Map (all 14 touchpoints)',
      'Foundation Audit (unlimited)',
      'Priority support',
    ],
    cta: 'Upgrade to Legendary',
    disabled: false,
    highlight: true,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpgrade(tier: string) {
    setLoading(tier)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
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

  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">Upgrade your plan</h1>
        <p className="text-muted-foreground">Start free. Upgrade to Legendary when you're ready. Cancel anytime.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-5">
        {PLAN_DETAILS.map((plan) => (
          <div
            key={plan.key}
            className={`rounded-2xl p-6 flex flex-col gap-4 border ${
              plan.highlight ? 'border-primary bg-primary/5' : 'border-border bg-card'
            }`}
          >
            <div>
              <p className="font-serif font-semibold text-foreground">{plan.name}</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{plan.price}</p>
              <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>{f}
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

      <p className="text-xs text-muted-foreground">
        Payments are processed securely by Stripe. Cancel anytime from your account settings.
      </p>
    </div>
  )
}
