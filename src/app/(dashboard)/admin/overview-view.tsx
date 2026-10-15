import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { OverviewStats, JourneyStep } from '@/lib/admin-overview'
import { AdminNav } from './admin-nav'
import { SiteFigures } from './site-figures'

/**
 * The Overview's presentation.
 *
 * Split from page.tsx — which does the admin gate and the reads — so the
 * layout can be rendered against fixtures during QA without a live admin
 * session, and cannot drift from a copy made for that purpose. Same split
 * the feedback detail page uses.
 */

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function OverviewView({
  stats,
  journey,
  configMap,
}: {
  stats: OverviewStats
  journey: JourneyStep[]
  configMap: Record<string, string>
}) {
  const attention = [
    { label: 'new feedback', count: stats.feedbackNew, href: '/admin/feedback?status=new' },
    { label: 'marked follow up', count: stats.feedbackFollowUp, href: '/admin/feedback?status=follow_up' },
  ].filter((a) => a.count > 0)

  const widest = Math.max(...journey.map((s) => s.users), 1)

  return (
    <div className="flex flex-col gap-8">
      <AdminNav active="/admin" />

      {/* ── Needs attention ─────────────────────────────────────────────
          Only the things we can state as fact from a record. No guesses
          about which users are "at risk". */}
      {attention.length > 0 && (
        <section className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-5 sm:p-6">
          <h2 className="font-serif text-lg font-semibold text-foreground">Needs attention</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {attention.map((a) => (
              <li key={a.label}>
                <Link href={a.href} className="text-sm text-primary underline underline-offset-4">
                  {a.count} {a.label} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">Right now</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Stat label="Users" value={stats.totalUsers} hint={`${stats.newUsers7d} in the last 7 days`} />
          <Stat label="Properties" value={stats.properties} />
          <Stat
            label="Audits"
            value={stats.auditsCompleted}
            hint={`${stats.auditsInProgress} in progress`}
          />
          <Stat label="Recommendations" value={stats.recommendations} />
          <Stat label="Starter Playbooks" value={stats.starterPlaybooks} />
          <Stat
            label="Feedback"
            value={stats.feedbackTotal}
            hint={stats.feedbackNew > 0 ? `${stats.feedbackNew} new` : 'none new'}
          />
        </div>
      </section>

      {/* ── Journey snapshot ────────────────────────────────────────────
          People, not rows: one host with three properties is one person at
          each stage. Counts fall as you go down, so a drop is visible. */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl font-semibold text-foreground">
            How far people are getting
          </h2>
          <p className="text-xs text-muted-foreground">
            Distinct people who reached each stage on at least one property
          </p>
        </div>
        <ol className="flex flex-col gap-2">
          {journey.map((step) => (
            <li
              key={step.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <span className="w-32 shrink-0 text-xs text-foreground sm:w-56 sm:text-sm">{step.label}</span>
              <span className="min-w-0 flex-1">
                <span
                  aria-hidden
                  className={cn('block h-2 rounded-full bg-primary/70')}
                  style={{ width: `${Math.round((step.users / widest) * 100)}%` }}
                />
              </span>
              <span className="w-10 shrink-0 text-right font-serif text-lg font-semibold tabular-nums text-foreground">
                {step.users}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/admin/users"
          className="rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          View all users →
        </Link>
        <Link
          href="/admin/feedback"
          className="rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          View feedback →
        </Link>
      </section>

      <SiteFigures
        initialRating={configMap['airbnb_rating'] ?? '4.99'}
        initialReviews={configMap['airbnb_review_count'] ?? '136'}
      />
    </div>
  )
}
