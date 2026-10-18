'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  ADMIN_STATUSES,
  TESTING_INTERESTS,
  adminStatusLabel,
  propertyTypeLabel,
  testingInterestLabel,
  type AdminStatus,
  type HostResearchRecord,
  type TestingInterest,
} from '@/lib/host-research'
import type { ResearchSummary } from '@/lib/host-research-store'

/**
 * The research inbox.
 *
 * Same shape as the Feedback inbox so the two read as one back office:
 * filters are links, so a filtered view can be shared and survives a reload;
 * search is client-side over an already-loaded list, which is instant at
 * early-access volumes and would need moving server-side before this grows
 * past a page or two.
 *
 * The interest filter is the one that matters most. Finding people willing
 * to test is the main reason this form exists, so "Yes" and "Maybe" are one
 * click from here.
 */

const STATUS_STYLE: Record<AdminStatus, string> = {
  new: 'bg-primary/10 text-primary border-primary/20',
  reviewed: 'bg-secondary text-foreground border-border',
  follow_up: 'bg-accent/20 text-foreground border-accent/40',
}

const INTEREST_STYLE: Record<TestingInterest, string> = {
  yes: 'bg-primary/10 text-primary border-primary/20',
  maybe: 'bg-accent/20 text-foreground border-accent/40',
  not_right_now: 'bg-muted text-muted-foreground border-border',
}

function Pill({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[0.68rem] font-medium',
        className
      )}
    >
      {children}
    </span>
  )
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-[0.8rem] transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </Link>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function preview(row: HostResearchRecord) {
  const t = row.biggest_challenge
  return t.length > 150 ? `${t.slice(0, 150)}…` : t
}

/** Keeps the other filter when one changes, so they compose. */
function withParam(current: { status: AdminStatus | null; interest: TestingInterest | null }, patch: Partial<typeof current>) {
  const next = { ...current, ...patch }
  const q = new URLSearchParams()
  if (next.status) q.set('status', next.status)
  if (next.interest) q.set('interest', next.interest)
  const s = q.toString()
  return s ? `/admin/research?${s}` : '/admin/research'
}

export default function ResearchInbox({
  rows,
  summary,
  activeStatus,
  activeInterest,
}: {
  rows: HostResearchRecord[]
  summary: ResearchSummary
  activeStatus: AdminStatus | null
  activeInterest: TestingInterest | null
}) {
  const [query, setQuery] = useState('')
  const current = { status: activeStatus, interest: activeInterest }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      [r.name, r.email, r.biggest_challenge]
        .filter(Boolean)
        .some((f) => (f as string).toLowerCase().includes(q))
    )
  }, [rows, query])

  return (
    <div className="flex flex-col gap-5">
      {/* Always over everything, never the filtered view. */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Responses', value: summary.total },
          { label: 'New', value: summary.newCount },
          { label: 'Open to testing', value: summary.interestedCount },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="font-serif text-2xl font-semibold text-foreground">{s.value}</p>
            <p className="mt-1 text-[0.7rem] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">
            Testing
          </span>
          <FilterLink href={withParam(current, { interest: null })} active={!activeInterest}>
            All
          </FilterLink>
          {TESTING_INTERESTS.map((t) => (
            <FilterLink
              key={t.value}
              href={withParam(current, { interest: t.value })}
              active={activeInterest === t.value}
            >
              {t.label}
            </FilterLink>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">
            Status
          </span>
          <FilterLink href={withParam(current, { status: null })} active={!activeStatus}>
            All
          </FilterLink>
          {ADMIN_STATUSES.map((s) => (
            <FilterLink
              key={s.value}
              href={withParam(current, { status: s.value })}
              active={activeStatus === s.value}
            >
              {s.label}
            </FilterLink>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex-1">
          <span className="sr-only">Search by name, email or challenge</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or challenge"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <a
          href="/api/admin/research-export"
          className="shrink-0 rounded-xl border border-border px-4 py-2.5 text-center text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Export CSV
        </a>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          {rows.length === 0 ? 'No responses yet.' : 'Nothing matches that search.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/research/${r.id}`}
                className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="min-w-0 truncate font-medium text-foreground">
                    {r.name || r.email}
                  </span>
                  <Pill className={INTEREST_STYLE[r.testing_interest]}>
                    {testingInterestLabel(r.testing_interest)}
                  </Pill>
                  <Pill className={STATUS_STYLE[r.admin_status]}>
                    {adminStatusLabel(r.admin_status)}
                  </Pill>
                  <span className="ml-auto shrink-0 text-[0.75rem] text-muted-foreground">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                <p className="text-[0.75rem] text-muted-foreground">
                  {propertyTypeLabel(r.property_type)}
                  {r.name ? ` · ${r.email}` : ''}
                </p>
                <p className="text-[0.88rem] leading-relaxed text-foreground">{preview(r)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
