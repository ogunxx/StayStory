'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

/**
 * The button that actually starts a purchase.
 *
 * /api/stripe/checkout already existed and worked — nothing in the app ever
 * called it. Every "Upgrade" link in the product pointed at the public
 * pricing page instead, whose buttons pointed back at /signup, which bounces
 * a signed-in host to the dashboard. This closes that loop.
 *
 * Checkout happens on Stripe, so success means leaving the app. Loading state
 * is never cleared on the success path — the page is on its way out, and
 * flicking the label back to its resting state would invite a second click
 * and a second session.
 */

type Props = {
  tier: 'legendary' | 'portfolio'
  interval: 'monthly' | 'annual'
  label: string
  variant?: 'default' | 'outline'
  className?: string
}

export function UpgradeButton({ tier, interval, label, variant = 'default', className }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval }),
      })
      const data = await response.json()

      if (!response.ok || !data.url) {
        // The route says plainly when a price isn't configured yet, which is
        // more useful than a generic failure — show what it said.
        setError(data.error ?? 'We could not open checkout just now. Please try again.')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('We could not reach checkout. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={cn(buttonVariants({ variant }), 'h-11 w-full disabled:opacity-70')}
      >
        {loading ? 'Opening checkout…' : label}
      </button>
      {error && (
        <p aria-live="polite" className="text-xs leading-relaxed text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
