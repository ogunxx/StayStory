import Link from 'next/link'
import { mostValuableLabel, usefulnessLabel } from '@/lib/feedback'
import type { FeedbackWithContext, JourneyContext } from '@/lib/admin-feedback'
import StatusControl from './status-control'

/**
 * The presentation half of a feedback submission.
 *
 * Separated from page.tsx — which does the admin gate and the reads — so the
 * layout can be rendered against fixtures during QA without a live admin
 * session, and so it cannot drift from a copy made for that purpose. Same
 * page/presentation split the rest of these routes use.
 */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-4">
      <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 text-[0.95rem] leading-relaxed whitespace-pre-wrap text-foreground">
        {children}
      </div>
    </div>
  )
}

export default function FeedbackDetail({
  row,
  journey,
}: {
  row: FeedbackWithContext
  journey: JourneyContext
}) {
  const context: [string, boolean][] = [
    ['Audit completed', journey.auditCompleted],
    ['Compass confirmed', journey.compassConfirmed],
    ['Recommendations generated', journey.recommendationsGenerated],
    ['Starter Playbook created', journey.starterPlaybookCreated],
  ]

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/admin/feedback"
          className="text-sm text-primary underline underline-offset-4"
        >
          ← All feedback
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-foreground">
          {row.user_name ?? row.user_email ?? 'Unknown host'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{row.user_email}</p>
      </div>

      <StatusControl id={row.id} current={row.review_status} />

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
              Property
            </p>
            <p className="mt-1 text-[0.95rem] text-foreground">
              {row.property_name ?? 'No property assigned'}
            </p>
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
              Dates
            </p>
            <p className="mt-1 text-[0.95rem] text-foreground">
              Submitted {new Date(row.created_at).toLocaleString()}
            </p>
            {row.updated_at !== row.created_at && (
              <p className="text-[0.85rem] text-muted-foreground">
                Updated {new Date(row.updated_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
            Journey context
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
            {context.map(([label, done]) => (
              <li key={label} className="flex items-center gap-1.5 text-[0.85rem]">
                <span aria-hidden className={done ? 'text-primary' : 'text-muted-foreground'}>
                  {done ? '✓' : '·'}
                </span>
                <span className={done ? 'text-foreground' : 'text-muted-foreground'}>
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-serif text-lg font-semibold text-foreground">Feedback</h2>

        <div className="mt-4 flex flex-col gap-4">
          <Field label="How useful was the experience">
            {usefulnessLabel(row.usefulness)} ({row.usefulness}/5)
          </Field>

          <Field label="Most valuable">
            {mostValuableLabel(row.most_valuable)}
            {row.most_valuable_other ? ` — ${row.most_valuable_other}` : ''}
          </Field>

          <Field label="What felt confusing, missing or less useful">
            {row.improvement_feedback ?? <span className="text-muted-foreground">—</span>}
          </Field>

          <Field label="Anything else">
            {row.additional_feedback ?? <span className="text-muted-foreground">—</span>}
          </Field>

          <Field label="Open to follow-up">
            {row.open_to_followup ? (
              <>
                Yes — {row.user_email}
              </>
            ) : (
              <span className="text-muted-foreground">No</span>
            )}
          </Field>
        </div>
      </section>
    </div>
  )
}
