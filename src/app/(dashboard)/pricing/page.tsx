'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PLANS } from '@/lib/stripe'

const PLAN_DETAILS = [
  {
    key: 'free' as const,
    name: 'Free',
    price: '$0',
    desc: 'Get started with the basics.',
    features: [
      'Foundation Audit',
      '3 generator uses/month',
      'Airbnb & VRBO calendar sync',
      'Guest message auto-fill',
      '1 free preview of Journey Map, Story Builder & Playbook',
    ],
    cta: 'Current plan',
    disabled: true,
  },
  {
    key: 'host' as const,
    name: 'Host',
    price: '$12/mo',
    desc: 'For hosts ready to go deeper.',
    features: [
      'Unlimited generator',
      'Shopping lists & message templates',
      'Journey Map (unlimited)',
      'Airbnb & VRBO calendar sync',
      'Guest message auto-fill',
    ],
    cta: 'Upgrade to Host',
    disabled: false,
  },
  {
    key: 'signature' as const,
    name: 'Signature',
    price: '$29/mo',
    desc: 'For hosts building a brand.',
    features: [
      'Everything in Host',
      'Guest Story Builder (unlimited)',
      'Listing copy & social captions',
      'Airbnb & VRBO calendar sync',
      'Guest message auto-fill',
    ],
    cta: 'Upgrade to Signature',
    disabled: false,
    highlight: true,
  },
  {
    key: 'legend' as const,
    name: 'Legend',
    price: '$79/mo',
    desc: 'Done-with-you experience design.',
    features: [
      'Everything in Signature',
      'Guest Journey Playbook (unlimited)',
      'Property audit call',
      'Done-with-you experience design',
      'Airbnb & VRBO calendar sync',
      'Guest message auto-fill',
    ],
    cta: 'Upgrade to Legend',
    disabled: false,
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
    <div className="flex flex-col gap-10 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">Upgrade your plan</h1>
        <p className="text-muted-foreground">Unlock more tools as you grow. Cancel anytime.</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
