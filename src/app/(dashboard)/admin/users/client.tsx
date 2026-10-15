'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { JOURNEY_STAGES, type JourneyStageId } from '@/lib/admin-data'
import type { SubscriptionTier } from '@/types'

/**
 * The Users list.
 *
 * Cards, not a table. A ten-column table at 390px either overflows
 * horizontally or shrinks to unreadable, and Admin gets opened on a phone
 * often enough to matter. The same card reflows into columns on wider
 * screens, so nothing is lost on desktop.
 */

export type UserRow = {
  id: string
  email: string | null
  name: string | null
  tier: SubscriptionTier
  joined: string
  suspended: boolean
  properties: string[]
  stage: JourneyStageId
  stageLabel: string
  auditStep: number | null
  journeyCount: number
  lastSignIn: string | null
  hasFeedback: boolean
}

const PAGE_SIZE = 25

const STAGE_STYLE: Record<JourneyStageId, string> = {
  feedback: 'border-primary/30 bg-primary/10 text-primary',
  playbook: 'border-primary/30 bg-primary/10 text-primary',
  recommendations: 'border-border bg-secondary text-foreground',
  compass_confirmed: 'border-border bg-secondary text-foreground',
  audit_done: 'border-border bg-secondary text-foreground',
  audit_draft: 'border-accent/40 bg-accent/15 text-foreground',
  none: 'border-border bg-transparent text-muted-foreground',
}

function when(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function UsersClient({
  rows,
  adminEmail,
}: {
  rows: UserRow[]
  adminEmail: string
}) {
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState<JourneyStageId | 'all'>('all')
  const [tier, setTier] = useState<SubscriptionTier | 'all'>('all')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (stage !== 'all' && r.stage !== stage) return false
      if (tier !== 'all' && r.tier !== tier) return false
      if (!q) return true
      return [r.name, r.email, ...r.properties]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q))
    })
  }, [rows, query, stage, tier])

  // Reset to the first page whenever the result set changes underneath.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

  const tiers: (SubscriptionTier | 'all')[] = ['all', 'free', 'legendary', 'portfolio']

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? 'person' : 'people'} · journey state is the furthest
          stage reached on any one property
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="user-search" className="sr-only">
          Search by name, email or property
        </label>
        <input
          id="user-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(0)
          }}
          placeholder="Search name, email or property"
          className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:max-w-sm"
        />

        <div className="flex flex-wrap gap-1.5">
          {(['all', ...JOURNEY_STAGES.map((s) => s.id)] as (JourneyStageId | 'all')[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setStage(id)
                setPage(0)
              }}
              aria-pressed={stage === id}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                stage === id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {id === 'all' ? 'All stages' : JOURNEY_STAGES.find((s) => s.id === id)!.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tiers.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTier(t)
                setPage(0)
              }}
              aria-pressed={tier === t}
              className={cn(
                'rounded-full border px-3 py-1 text-xs capitalize transition-colors',
                tier === t
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {t === 'all' ? 'All plans' : t}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {rows.length === 0
              ? 'No users yet. They will appear here as people sign up.'
              : 'Nobody matches those filters.'}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/users/${r.id}`}
                className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <p className="font-medium text-foreground">{r.name ?? r.email ?? 'Unknown'}</p>
                  <Badge variant="secondary" className="capitalize">
                    {r.tier}
                  </Badge>
                  {r.suspended && <Badge variant="destructive">Suspended</Badge>}
                  {r.email === adminEmail && <Badge variant="outline">You</Badge>}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">{r.email}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.68rem] font-medium',
                      STAGE_STYLE[r.stage]
                    )}
                  >
                    {r.stageLabel}
                    {r.auditStep !== null ? ` — step ${r.auditStep + 1}` : ''}
                  </span>
                  {r.hasFeedback && (
                    <span className="text-[0.68rem] font-medium text-primary">Gave feedback</span>
                  )}
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                  <div>
                    <dt className="text-muted-foreground">Property</dt>
                    <dd className="truncate text-foreground">
                      {r.properties.length === 0
                        ? '—'
                        : r.properties.length === 1
                          ? r.properties[0]
                          : `${r.properties[0]} +${r.properties.length - 1}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Joined</dt>
                    <dd className="text-foreground">{when(r.joined)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last sign-in</dt>
                    <dd className="text-foreground">{when(r.lastSignIn)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Journeys</dt>
                    <dd className="text-foreground">{r.journeyCount}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            {current * PAGE_SIZE + 1}–{Math.min((current + 1) * PAGE_SIZE, filtered.length)} of{' '}
            {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={current >= pageCount - 1}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
