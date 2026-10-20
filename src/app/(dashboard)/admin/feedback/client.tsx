'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  REVIEW_STATUSES,
  mostValuableLabel,
  usefulnessLabel,
  type ReviewStatus,
} from '@/lib/feedback'
import type { FeedbackSummary, FeedbackWithContext } from '@/lib/admin-feedback'

/**
 * The inbox list.
 *
 * Status filtering is a link, not local state, so a filtered view can be
 * shared and survives a reload — the counts come from the server either way,
 * over all feedback rather than the filtered subset.
 *
 * Search is client-side over an already-loaded list. At early-access volumes
 * that is instant and costs no round trip; it would need moving server-side
 * before this list grows past a page or two.
 */

const STATUS_STYLE: Record<ReviewStatus, string> = {
  new: 'bg-primary/10 text-primary border-primary/20',
  reviewed: 'bg-secondary text-foreground border-border',
  follow_up: 'bg-accent/20 text-foreground border-accent/40',
}

function StatusPill({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[0.68rem] font-medium',
        STATUS_STYLE[status]
      )}
    >
      {REVIEW_STATUSES.find((s) => s.value === status)?.label}
    </span>
  )
}

function preview(row: FeedbackWithContext): string {
  const text = row.improvement_feedback ?? row.additional_feedback ?? row.most_valuable_other
  if (!text) return 'No written feedback'
  return text.length > 140 ? `${text.slice(0, 140)}…` : text
}

export default function FeedbackInbox({
  rows,
  summary,
  activeStatus,
}: {
  rows: FeedbackWithContext[]
  summary: FeedbackSummary
  activeStatus: ReviewStatus | null
}) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      [r.user_name, r.user_email, r.property_name]
        .filter(Boolean)
        .some((field) => (field as string).toLowerCase().includes(q))
    )
  }, [rows, query])

  return (
    <div className="flex flex-col gap-5">
      {/* Summary — always over all feedback, never the filtered view. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: summary.total },
          { label: 'New', value: summary.newCount },
          { label: 'Follow up', value: summary.followUpCount },
          {
            label: 'Avg. usefulness',
            value: summary.averageUsefulness === null ? '—' : `${summary.averageUsefulness} / 5`,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-serif text-2xl font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/feedback"
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              activeStatus === null
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            All
          </Link>
          {REVIEW_STATUSES.map((s) => (
            <Link
              key={s.value}
              href={`/admin/feedback?status=${s.value}`}
              className={cn(
                'rounded-full border px-3 py-1 text-sm transition-colors',
                activeStatus === s.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="feedback-search" className="sr-only">
            Search by name, email or property
          </label>
          <input
            id="feedback-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or property"
            className="h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-64"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {rows.length === 0
              ? 'No feedback yet. It will appear here as hosts finish their journey.'
              : 'Nothing matches that search.'}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((row) => (
            <li key={row.id}>
              <Link
                href={`/admin/feedback/${row.id}`}
                onMouseEnter={() => router.prefetch(`/admin/feedback/${row.id}`)}
                className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <p className="min-w-0 font-medium text-foreground">
                    {row.user_name ?? row.user_email ?? 'Unknown host'}
                  </p>
                  <StatusPill status={row.review_status} />
                  {row.open_to_followup && (
                    <span className="text-[0.68rem] font-medium text-primary">
                      Open to follow-up
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {row.user_email}
                  {row.property_name ? ` · ${row.property_name}` : ''} ·{' '}
                  {new Date(row.created_at).toLocaleDateString()}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    <span className="text-foreground">{usefulnessLabel(row.usefulness)}</span>{' '}
                    ({row.usefulness}/5)
                  </span>
                  {row.most_valuable && (
                    <span>
                      Most valuable:{' '}
                      <span className="text-foreground">
                        {mostValuableLabel(row.most_valuable)}
                      </span>
                    </span>
                  )}
                </div>

                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {preview(row)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
