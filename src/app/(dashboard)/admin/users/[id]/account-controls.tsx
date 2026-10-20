'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { SubscriptionTier } from '@/types'

/**
 * Plan and suspension, for one person.
 *
 * These two operations already existed on the old Members table and are
 * carried over rather than rebuilt: the same /api/admin/update-tier and
 * /api/admin/suspend routes, with the same admin gate and the same
 * admin_actions audit log behind them. Nothing new is possible here that was
 * not possible before — the controls simply now sit beside the person they
 * act on instead of in a row of a wide table.
 *
 * Both are reversible, which is why they are the only account controls here.
 * Deleting, banning, impersonating and anything that touches Stripe are
 * deliberately absent.
 */

const ASSIGNABLE: SubscriptionTier[] = ['free', 'legendary', 'portfolio']

export default function AccountControls({
  userId,
  tier,
  suspended,
  isSelf,
}: {
  userId: string
  tier: SubscriptionTier
  suspended: boolean
  /** Suspending yourself is refused server-side; don't offer it either. */
  isSelf: boolean
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  async function call(url: string, body: Record<string, unknown>) {
    setBusy(true)
    setError(null)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null)

    const data = await response?.json().catch(() => ({}))
    setBusy(false)

    if (!response || !response.ok) {
      setError(data?.error ?? 'That did not work. Try again.')
      return
    }
    startTransition(() => router.refresh())
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-serif text-base font-semibold text-foreground">Account</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Plan changes affect access in StayStory only — they do not touch Stripe or any billing
        record. Every change is written to the admin audit log.
      </p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
            Plan
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ASSIGNABLE.map((t) => (
              <button
                key={t}
                type="button"
                disabled={busy || t === tier}
                onClick={() => void call('/api/admin/update-tier', { targetUserId: userId, newTier: t })}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs capitalize transition-colors disabled:cursor-default',
                  t === tier
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground disabled:opacity-50'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {!isSelf && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void call('/api/admin/suspend', {
                targetUserId: userId,
                action: suspended ? 'reactivate' : 'suspend',
              })
            }
            className={cn(
              'h-9 shrink-0 rounded-lg border px-4 text-sm transition-colors disabled:opacity-50',
              suspended
                ? 'border-border text-foreground hover:border-primary hover:text-primary'
                : 'border-destructive/30 text-destructive hover:bg-destructive/5'
            )}
          >
            {suspended ? 'Reactivate account' : 'Suspend account'}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  )
}
