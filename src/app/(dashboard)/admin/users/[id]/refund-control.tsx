'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CONFIRM_WORD, confirmationMatches } from '@/lib/refunds'
import type { BillingSummary } from '@/lib/billing-summary'

/**
 * Give the last payment back, end the subscription, drop to Free.
 *
 * The only control in the admin area that spends money, and the only one
 * that cannot be undone by clicking something else. Everything about how it
 * is presented follows from that:
 *
 *   • it says what it will do, in full, before offering the button
 *   • it names the amount and the date, read from Stripe, not from our table
 *   • it is closed until deliberately opened
 *   • it asks for a typed word, because a dialog is dismissed by reflex
 *   • it refuses to render a button at all when there is nothing to refund
 *
 * None of this is in the way of someone who means it. It takes about five
 * seconds. It is in the way of someone who clicked the wrong row.
 */

export default function RefundControl({
  userId,
  email,
  billing,
}: {
  userId: string
  email: string | null
  billing: BillingSummary
}) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ refunded: string; warnings: string[] } | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmationMatches(typed)) return
    setBusy(true)
    setError(null)

    const response = await fetch('/api/admin/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: userId, confirmation: typed }),
    }).catch(() => null)

    const data = await response?.json().catch(() => ({}))
    setBusy(false)

    if (!response || !response.ok) {
      setError(data?.error ?? 'That did not work, and no money was moved.')
      return
    }

    setDone({ refunded: data.refunded, warnings: data.warnings ?? [] })
    setTyped('')
    setOpen(false)
    startTransition(() => router.refresh())
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-serif text-base font-semibold text-foreground">Billing</h2>

      {/* What Stripe says, not what our table says. */}
      {billing.unavailable ? (
        <p className="mt-1 text-xs text-muted-foreground">{billing.blockedReason}</p>
      ) : billing.lastPayment ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Last payment <strong className="text-foreground">{billing.lastPayment.amount}</strong>,{' '}
          {billing.lastPayment.daysAgo === 0
            ? 'today'
            : `${billing.lastPayment.daysAgo} day${billing.lastPayment.daysAgo === 1 ? '' : 's'} ago`}
          {billing.lastPayment.refunded && ' — already refunded'}
          {!billing.lastPayment.refunded &&
            (billing.lastPayment.withinWindow
              ? ' — inside the refund window'
              : ' — outside the refund window')}
          .
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">{billing.blockedReason}</p>
      )}

      {done && (
        <div role="status" className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Refunded {done.refunded}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            The subscription has been cancelled and the account is on Free. Their Audit, Compass
            and Playbooks are untouched.
          </p>
          {done.warnings.map((w) => (
            <p key={w} className="mt-2 text-xs font-medium leading-relaxed text-destructive">
              {w}
            </p>
          ))}
        </div>
      )}

      {billing.refundable && !done && (
        <div className="mt-4">
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="h-9 rounded-lg border border-destructive/30 px-4 text-sm text-destructive transition-colors hover:bg-destructive/5"
            >
              Refund last payment…
            </button>
          ) : (
            <form onSubmit={submit} className="rounded-xl border border-destructive/30 bg-destructive/[0.03] p-4">
              <p className="text-sm font-semibold text-foreground">
                Refund {billing.lastPayment?.amount} to {email ?? 'this account'}?
              </p>
              <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-xs leading-relaxed text-muted-foreground">
                <li>The full amount goes back to the card they paid with.</li>
                <li>Their subscription is cancelled immediately.</li>
                <li>The account drops to Free. Their saved work is not touched.</li>
                <li className="font-medium text-destructive">
                  This cannot be undone. Stripe will not reverse a refund.
                </li>
              </ul>

              <label htmlFor="refund-confirm" className="mt-4 block text-xs text-muted-foreground">
                Type <strong className="text-foreground">{CONFIRM_WORD}</strong> to confirm
              </label>
              <input
                id="refund-confirm"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="mt-1.5 h-9 w-full max-w-[12rem] rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={busy || !confirmationMatches(typed)}
                  className="h-9 rounded-lg bg-destructive px-4 text-sm font-medium text-white transition-opacity disabled:opacity-40"
                >
                  {busy ? 'Refunding…' : `Refund ${billing.lastPayment?.amount}`}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setOpen(false)
                    setTyped('')
                    setError(null)
                  }}
                  className="h-9 rounded-lg border border-border px-4 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <p className="mt-4 text-[0.7rem] leading-relaxed text-muted-foreground">
        Partial refunds, older charges and anything unusual live in the Stripe dashboard. Every
        refund issued here is written to the admin audit log.
      </p>
    </section>
  )
}
