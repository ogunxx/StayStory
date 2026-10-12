'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { REVIEW_STATUSES, type ReviewStatus } from '@/lib/feedback'

/**
 * New / Reviewed / Follow up.
 *
 * Deliberately the whole workflow. No assignment, no comments, no tasks —
 * enough to tell what has been looked at and what needs a reply.
 *
 * Optimistic, then refreshed from the server, so the chosen state is visible
 * immediately but the page still reflects what was actually stored.
 */
export default function StatusControl({
  id,
  current,
}: {
  id: string
  current: ReviewStatus
}) {
  const [status, setStatus] = useState<ReviewStatus>(current)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  async function choose(next: ReviewStatus) {
    if (next === status) return
    const previous = status
    setStatus(next)
    setError(null)

    const response = await fetch('/api/admin/feedback-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: next }),
    }).catch(() => null)

    if (!response || !response.ok) {
      setStatus(previous)
      setError('Could not update the status. Try again.')
      return
    }

    startTransition(() => router.refresh())
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
        Review status
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {REVIEW_STATUSES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => void choose(option.value)}
            aria-pressed={status === option.value}
            disabled={pending}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors disabled:opacity-60',
              status === option.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
