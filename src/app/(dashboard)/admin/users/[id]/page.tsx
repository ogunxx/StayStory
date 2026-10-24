import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getAdminClient, isAdminEmail } from '@/lib/admin'
import { journeysForUser, loadAdminSnapshot, type PropertyJourney } from '@/lib/admin-data'
import { reviewStatusLabel, usefulnessLabel } from '@/lib/feedback'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { AdminNav } from '../../admin-nav'
import AccountControls from './account-controls'
import RefundControl from './refund-control'
import { getBillingSummary } from '@/lib/billing-summary'

export const metadata: Metadata = { title: 'User — StayStory Admin' }

function when(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

/** A journey step, shown as a fact rather than a judgement. */
function Step({
  label,
  state,
  done,
}: {
  label: string
  state: string
  done: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-border py-2.5 first:border-t-0">
      <span className="text-sm text-foreground">{label}</span>
      <span className={cn('shrink-0 text-sm', done ? 'text-foreground' : 'text-muted-foreground')}>
        {done ? '✓ ' : ''}
        {state}
      </span>
    </div>
  )
}

function JourneyCard({ journey }: { journey: PropertyJourney }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {journey.propertyName ?? 'No property assigned'}
        </h3>
        {journey.propertyType && (
          <Badge variant="outline" className="capitalize">
            {journey.propertyType.replace('_', ' ')}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">{journey.stageLabel}</span>
      </div>

      {!journey.propertyName && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Work saved before a property existed. Shown so it is not mistaken for no activity.
        </p>
      )}

      <div className="mt-4">
        <Step
          label="Experience Audit"
          done={journey.auditDone}
          state={
            journey.auditDone
              ? 'Completed'
              : journey.auditStep !== null
                ? `In progress — step ${journey.auditStep + 1}`
                : 'Not started'
          }
        />
        <Step
          label="Experience Compass"
          done={journey.compassConfirmed}
          state={
            journey.compassConfirmed
              ? 'Confirmed'
              : journey.compassStarted
                ? 'Developing'
                : 'Not started'
          }
        />
        <Step
          label="Recommendations"
          done={journey.recommendations}
          state={journey.recommendations ? 'Generated' : 'Not generated'}
        />
        <Step
          label="Starter Playbook"
          done={journey.starterPlaybook}
          state={journey.starterPlaybook ? 'Created' : 'Not created'}
        />
        <Step
          label="Feedback"
          done={journey.feedback !== null}
          state={journey.feedback ? 'Submitted' : 'Not submitted'}
        />
      </div>

      {journey.feedback && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.06] p-4">
          <p className="text-sm text-foreground">
            {usefulnessLabel(journey.feedback.usefulness)} ({journey.feedback.usefulness}/5) ·{' '}
            {reviewStatusLabel(journey.feedback.review_status)}
          </p>
          <Link
            href={`/admin/feedback/${journey.feedback.id}`}
            className="mt-1.5 inline-block text-sm text-primary underline underline-offset-4"
          >
            View full feedback →
          </Link>
        </div>
      )}
    </section>
  )
}

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const { id } = await params
  const snapshot = await loadAdminSnapshot()
  const profile = snapshot.profiles.find((p) => p.id === id)
  if (!profile) notFound()

  const journeys = journeysForUser(snapshot, profile.id)

  // Deeper product activity, scoped to this user AND property. The known
  // /legend bug is that journey-state counts playbooks per user despite the
  // table having property_id, so that helper is deliberately not used here.
  const admin = getAdminClient()
  const [blueprints, moments, stories, fullPlaybooks, billingRow] = await Promise.all([
    admin.from('experience_blueprint').select('property_id').eq('user_id', profile.id),
    admin.from('suggestions').select('property_id, kind:content->>kind').eq('user_id', profile.id),
    admin.from('guest_stories').select('property_id').eq('user_id', profile.id),
    admin.from('playbooks').select('property_id').eq('user_id', profile.id),
    // Not part of the shared admin snapshot: only this page needs it, and it
    // is the key to a Stripe lookup rather than something to list in a table.
    admin.from('profiles').select('stripe_customer_id').eq('id', profile.id).single(),
  ])

  // Read from Stripe, not from our own tier column. On the one screen that
  // decides whether to give money back, the payment processor is the truth.
  const billing = await getBillingSummary(billingRow.data?.stripe_customer_id)

  const generatorCount = ((moments.data ?? []) as { kind: string | null }[]).filter(
    (m) => m.kind === null
  ).length

  const deeper = [
    { label: 'Experience Blueprint', count: (blueprints.data ?? []).length },
    { label: 'Generator moments', count: generatorCount },
    { label: 'Story Builder', count: (stories.data ?? []).length },
    { label: 'Guest Journey Playbook', count: (fullPlaybooks.data ?? []).length },
  ]

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <AdminNav active="/admin/users" />

      <div>
        <Link href="/admin/users" className="text-sm text-primary underline underline-offset-4">
          ← All users
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-foreground">
          {profile.full_name ?? profile.email ?? 'Unknown'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
              Plan
            </p>
            <p className="mt-1 text-[0.95rem] capitalize text-foreground">{profile.tier}</p>
            {profile.suspended_at && (
              <Badge variant="destructive" className="mt-1">
                Suspended
              </Badge>
            )}
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
              Joined
            </p>
            <p className="mt-1 text-[0.95rem] text-foreground">{when(profile.created_at)}</p>
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
              Last sign-in
            </p>
            <p className="mt-1 text-[0.95rem] text-foreground">
              {when(snapshot.lastSignIn.get(profile.id))}
            </p>
          </div>
        </div>
        <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
          Admin access:{' '}
          {isAdminEmail(profile.email) ? 'Yes' : 'No'} — set by the ADMIN_EMAILS environment
          variable, not editable from here. Plan and suspension are managed on the existing
          Members controls.
        </p>
      </section>

      <AccountControls
        userId={profile.id}
        tier={profile.tier}
        suspended={Boolean(profile.suspended_at)}
        isSelf={profile.id === user.id}
      />

      <RefundControl userId={profile.id} email={profile.email} billing={billing} />

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Focused journey{journeys.length > 1 ? ` · ${journeys.length} properties` : ''}
        </h2>
        {journeys.map((j) => (
          <JourneyCard key={j.propertyId ?? 'unassigned'} journey={j} />
        ))}
      </section>

      {/* Secondary on purpose: the focused launch journey is what Admin v1 is
          for, and the six-tool product should not dominate this page. */}
      <section className="rounded-2xl border border-dashed border-border p-5">
        <h2 className="font-serif text-base font-semibold text-foreground">
          Deeper StayStory activity
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {deeper.map((d) => (
            <div key={d.label}>
              <dt className="text-xs text-muted-foreground">{d.label}</dt>
              <dd className="font-serif text-lg font-semibold text-foreground">{d.count}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
