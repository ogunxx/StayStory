'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ADMIN_STATUSES, type AdminStatus } from '@/lib/host-research'

/**
 * New / Reviewed / Follow up — the same three states, and the same optimistic
 * then refreshed behaviour, as the Feedback inbox. Deliberately the whole
 * workflow: no assignment, no comments, no sequences. Enough to tell what
 * has been read and who is worth replying to.
 */
export function ResearchStatusControl({ id, status: initial }: { id: string; status: AdminStatus }) {
  const [status, setStatus] = useState<AdminStatus>(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  async function choose(next: AdminStatus) {
    if (next === status) return
    const previous = status
    setStatus(next)
    setError(null)

    const response = await fetch('/api/admin/research-status', {
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
    <div>
      <div className="flex flex-wrap gap-2">
        {ADMIN_STATUSES.map((option) => (
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
