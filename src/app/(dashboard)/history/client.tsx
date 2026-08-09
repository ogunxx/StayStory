'use client'

import { useState } from 'react'
import type {
  AuditResponses,
  SuggestionContent,
} from '@/types'

type AuditRow = {
  id: string
  created_at: string
  property_id: string | null
  score: number | null
  responses: AuditResponses | null
}
type MomentRow = {
  id: string
  created_at: string
  property_id: string | null
  content: SuggestionContent | null
}
type StoryRow = {
  id: string
  created_at: string
  property_id: string | null
  narrative: string | null
  host_perspective: string | null
  social_caption: string | null
  pre_arrival_message: string | null
  listing_improvements: string | null
}
type BlueprintRow = {
  id: string
  created_at: string
  property_id: string | null
  touchpoint: string | null
  ideas: { low?: string; achievable?: string; audacious?: string } | null
}
type PlaybookRow = {
  id: string
  created_at: string
  property_id: string | null
  property_name: string | null
  executive_summary: string | null
}

type Props = {
  hasMultipleProperties: boolean
  activePropertyName: string | null
  audits: AuditRow[]
  moments: MomentRow[]
  stories: StoryRow[]
  blueprints: BlueprintRow[]
  playbooks: PlaybookRow[]
}

type TabKey = 'audits' | 'moments' | 'blueprints' | 'stories' | 'playbooks'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function UnassignedBadge() {
  return (
    <span className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border rounded-full px-2 py-0.5">
      Unassigned
    </span>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  )
}

export default function HistoryClient({
  hasMultipleProperties,
  activePropertyName,
  audits,
  moments,
  stories,
  blueprints,
  playbooks,
}: Props) {
  const [tab, setTab] = useState<TabKey>('audits')
  const [open, setOpen] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'audits', label: 'Audits', count: audits.length },
    { key: 'moments', label: 'Moments', count: moments.length },
    { key: 'blueprints', label: 'Blueprints', count: blueprints.length },
    { key: 'stories', label: 'Stories', count: stories.length },
    { key: 'playbooks', label: 'Playbooks', count: playbooks.length },
  ]

  const EmptyState = () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="text-sm text-muted-foreground">
        No saved work yet{hasMultipleProperties && activePropertyName ? ` for ${activePropertyName}` : ''}.
      </p>
    </div>
  )

  function Card({
    id,
    title,
    subtitle,
    propertyId,
    children,
  }: {
    id: string
    title: string
    subtitle: string
    propertyId: string | null
    children: React.ReactNode
  }) {
    const isOpen = open.has(id)
    return (
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <button
          onClick={() => toggle(id)}
          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-card transition-colors"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-foreground truncate">{title}</p>
              {propertyId === null && <UnassignedBadge />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <span className="text-muted-foreground shrink-0 text-sm">{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && <div className="px-5 pb-5 flex flex-col gap-4 border-t border-border pt-4">{children}</div>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground">History</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Everything you&apos;ve created
          {hasMultipleProperties && activePropertyName ? ` for ${activePropertyName}` : ''}.
          {hasMultipleProperties && ' Switch properties from the header to see another place.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-sm rounded-full border transition ${
              tab === t.key
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            <span className="ml-1.5 opacity-70">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="flex flex-col gap-3">
        {tab === 'audits' &&
          (audits.length === 0 ? (
            <EmptyState />
          ) : (
            audits.map((a) => (
              <Card
                key={a.id}
                id={a.id}
                title={`Experience Audit — score ${a.score ?? '—'}`}
                subtitle={formatDate(a.created_at)}
                propertyId={a.property_id}
              >
                <Field label="Guests arrive feeling" value={a.responses?.transformation_arrive} />
                <Field label="Guests leave feeling" value={a.responses?.transformation_leave} />
                <Field label="Pain points" value={a.responses?.pain_points} />
                <Field label="One thing to change" value={a.responses?.one_thing} />
              </Card>
            ))
          ))}

        {tab === 'moments' &&
          (moments.length === 0 ? (
            <EmptyState />
          ) : (
            moments.map((m) => (
              <Card
                key={m.id}
                id={m.id}
                title={m.content?.touchpoint_focus || 'Guest Moment'}
                subtitle={formatDate(m.created_at)}
                propertyId={m.property_id}
              >
                <Field label="Why it works" value={m.content?.why_it_works} />
                {m.content?.setup_plan?.length ? (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Setup plan</p>
                    <ul className="text-sm text-foreground flex flex-col gap-1">
                      {m.content.setup_plan.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary">·</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <Field label="Welcome note" value={m.content?.messages?.welcome_note} />
              </Card>
            ))
          ))}

        {tab === 'blueprints' &&
          (blueprints.length === 0 ? (
            <EmptyState />
          ) : (
            blueprints.map((b) => (
              <Card
                key={b.id}
                id={b.id}
                title={b.touchpoint || 'Experience Blueprint'}
                subtitle={formatDate(b.created_at)}
                propertyId={b.property_id}
              >
                <Field label="Low effort" value={b.ideas?.low} />
                <Field label="Achievable" value={b.ideas?.achievable} />
                <Field label="Audacious" value={b.ideas?.audacious} />
              </Card>
            ))
          ))}

        {tab === 'stories' &&
          (stories.length === 0 ? (
            <EmptyState />
          ) : (
            stories.map((s) => (
              <Card
                key={s.id}
                id={s.id}
                title="Guest Story"
                subtitle={formatDate(s.created_at)}
                propertyId={s.property_id}
              >
                <Field label="Narrative" value={s.narrative} />
                <Field label="Host perspective" value={s.host_perspective} />
                <Field label="Social caption" value={s.social_caption} />
                <Field label="Pre-arrival message" value={s.pre_arrival_message} />
                <Field label="Listing improvements" value={s.listing_improvements} />
              </Card>
            ))
          ))}

        {tab === 'playbooks' &&
          (playbooks.length === 0 ? (
            <EmptyState />
          ) : (
            playbooks.map((p) => (
              <Card
                key={p.id}
                id={p.id}
                title={p.property_name || 'Guest Journey Playbook'}
                subtitle={formatDate(p.created_at)}
                propertyId={p.property_id}
              >
                <Field label="Executive summary" value={p.executive_summary} />
              </Card>
            ))
          ))}
      </div>
    </div>
  )
}
