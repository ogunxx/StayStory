'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { COMPASS_FIELDS, type CompassTier } from '@/lib/compass-fields'
import type { CompassContribution, CompassField, CompassStatus, ExperienceCompass } from '@/types'

const STATUS_LABEL: Record<CompassStatus, string> = {
  preliminary: 'Preliminary',
  developing: 'Developing',
  confirmed: 'Confirmed',
  evolving: 'Evolving',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

type Props = {
  initialCompass: ExperienceCompass
  initialPending: CompassContribution[]
}

export default function CompassClient({ initialCompass, initialPending }: Props) {
  const [compass, setCompass] = useState(initialCompass)
  const [pending, setPending] = useState(initialPending)
  const [confirming, setConfirming] = useState(false)
  const [justConfirmed, setJustConfirmed] = useState(false)

  function applyResult(data: { compass: ExperienceCompass; pending: CompassContribution[] }) {
    setCompass(data.compass)
    setPending(data.pending)
  }

  async function handleConfirm() {
    const isFirstConfirm = !compass.confirmed_at
    setConfirming(true)
    try {
      const res = await fetch('/api/compass/confirm', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        applyResult(data)
        if (isFirstConfirm) setJustConfirmed(true)
      }
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-serif font-semibold">Experience Compass</h1>
          <Badge variant={compass.status === 'preliminary' ? 'outline' : 'secondary'}>
            {STATUS_LABEL[compass.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          This is what StayStory understood about the experience you&apos;re creating — in your own
          words, drawn from your Audit. Read it, change anything that doesn&apos;t sound like you,
          and leave the rest. <span className="text-foreground">You don&apos;t need to complete
          every field before continuing.</span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">Last updated {formatDate(compass.updated_at)}</p>
      </div>

      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Suggested for your review
          </h2>
          {pending.map((contribution) => (
            <PendingContributionCard key={contribution.id} contribution={contribution} onReviewed={applyResult} />
          ))}
        </div>
      )}

      {/* Two groups, so nobody assumes every card is a prerequisite. The
          split is by tier in compass-fields.ts, not hard-coded here. */}
      <FieldGroup
        heading="Enough to continue"
        blurb="These come from your Audit. Together they’re a strong enough direction for StayStory to work from."
        tier="core"
        compass={compass}
        onSaved={applyResult}
      />

      <FieldGroup
        heading="Deepens over time"
        blurb="Nothing here blocks you. These are the parts that usually become clearer after a few more stays, or when you sit down with Story Builder."
        tier="evolving"
        compass={compass}
        onSaved={applyResult}
      />

      {justConfirmed ? (
        <ConfirmedNextStep />
      ) : (
        <div className="flex flex-col gap-4 border-t border-border pt-6">
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">What confirming does.</span> It tells
            StayStory this is a strong enough direction to guide what comes next. Your Compass
            isn’t locked — you can change any of it whenever you like, and it’s meant to keep
            evolving as you learn from real guests.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button onClick={handleConfirm} disabled={confirming} className="sm:self-start">
              {confirming ? 'Saving…' : compass.confirmed_at ? 'Re-confirm my Compass' : 'Confirm my Compass'}
            </Button>
            {/* A host who confirmed on an earlier visit still needs a way
                forward from this page — otherwise the only route to their
                recommendations is knowing the URL. */}
            {compass.confirmed_at && (
              <Link
                href="/start/recommendations"
                className="text-sm font-medium text-primary underline underline-offset-4"
              >
                See my recommendations →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * The moment after a first confirmation. Previously this said something
 * encouraging and then left the host on the page with nothing to do — the
 * clearest failure in the user test. The encouragement stays; a way forward
 * is now attached to it.
 */
function ConfirmedNextStep() {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-primary/25 bg-primary/[0.06] p-6 sm:p-7">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden>
            <circle cx="10" cy="10" r="8.2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6.4 10.3l2.4 2.3 4.7-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Compass confirmed
        </p>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground">
          StayStory can now use this direction to shape recommendations for your stay. You can
          come back and evolve your Compass any time — confirming doesn’t lock anything.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link href="/start/recommendations">
          <Button className="h-11 w-full px-6 sm:w-auto">See my recommendations →</Button>
        </Link>
        <Button
          variant="ghost"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="h-11 px-4 text-muted-foreground sm:w-auto"
        >
          Keep refining my Compass
        </Button>
      </div>
    </div>
  )
}

function FieldGroup({
  heading,
  blurb,
  tier,
  compass,
  onSaved,
}: {
  heading: string
  blurb: string
  tier: CompassTier
  compass: ExperienceCompass
  onSaved: (data: { compass: ExperienceCompass; pending: CompassContribution[] }) => void
}) {
  const fields = COMPASS_FIELDS.filter((f) => f.tier === tier && f.field !== 'transformation_leave')

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {heading}
        </h2>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">{blurb}</p>
      </div>
      {fields.map(({ field, label, prompt }) =>
        field === 'transformation_arrive' ? (
          <TransformationCard key="transformation" compass={compass} onSaved={onSaved} />
        ) : (
          <FieldCard key={field} field={field} label={label} prompt={prompt} compass={compass} onSaved={onSaved} />
        )
      )}
    </section>
  )
}

function provenanceCaption(compass: ExperienceCompass, field: CompassField): string | null {
  const provenance = compass.field_provenance?.[field]
  if (!provenance) return null
  const when = formatDate(provenance.updated_at)
  return provenance.source_module === 'host'
    ? `Edited by you on ${when}`
    : `Suggested by ${provenance.source_module.replace('_', ' ')}, applied ${when}`
}

function FieldCard({
  field,
  label,
  prompt,
  compass,
  onSaved,
}: {
  field: CompassField
  label: string
  prompt: string
  compass: ExperienceCompass
  onSaved: (data: { compass: ExperienceCompass; pending: CompassContribution[] }) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(compass[field] ?? '')
  const [saving, setSaving] = useState(false)
  const currentValue = compass[field]

  async function handleSave() {
    if (!value.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/compass/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      })
      const data = await res.json()
      if (res.ok) {
        onSaved(data)
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const caption = provenanceCaption(compass, field)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>{prompt}</CardDescription>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="flex flex-col gap-2">
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} autoFocus />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setValue(currentValue ?? '') }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : currentValue ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentValue}</p>
            <div className="flex items-center gap-3 mt-1">
              {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
              <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline">
                Edit
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-muted-foreground hover:text-foreground text-left"
          >
            Not yet defined — this can also come from your Audit or Story Builder answers. Click to add it now.
          </button>
        )}
      </CardContent>
    </Card>
  )
}

function TransformationCard({
  compass,
  onSaved,
}: {
  compass: ExperienceCompass
  onSaved: (data: { compass: ExperienceCompass; pending: CompassContribution[] }) => void
}) {
  const [editing, setEditing] = useState(false)
  const [arrive, setArrive] = useState(compass.transformation_arrive ?? '')
  const [leave, setLeave] = useState(compass.transformation_leave ?? '')
  const [saving, setSaving] = useState(false)

  async function saveField(field: CompassField, value: string) {
    const res = await fetch('/api/compass/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, value }),
    })
    return { ok: res.ok, data: await res.json() }
  }

  async function handleSave() {
    setSaving(true)
    try {
      let last: { compass: ExperienceCompass; pending: CompassContribution[] } | null = null
      if (arrive.trim()) {
        const { ok, data } = await saveField('transformation_arrive', arrive)
        if (ok) last = data
      }
      if (leave.trim()) {
        const { ok, data } = await saveField('transformation_leave', leave)
        if (ok) last = data
      }
      if (last) {
        onSaved(last)
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const hasValue = compass.transformation_arrive || compass.transformation_leave
  const arriveCaption = provenanceCaption(compass, 'transformation_arrive')
  const leaveCaption = provenanceCaption(compass, 'transformation_leave')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transformation</CardTitle>
        <CardDescription>Guests arrive feeling ___. Guests leave feeling ___.</CardDescription>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Arrive feeling</p>
              <Textarea value={arrive} onChange={(e) => setArrive(e.target.value)} rows={1} autoFocus />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Leave feeling</p>
              <Textarea value={leave} onChange={(e) => setLeave(e.target.value)} rows={1} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false)
                  setArrive(compass.transformation_arrive ?? '')
                  setLeave(compass.transformation_leave ?? '')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : hasValue ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm leading-relaxed">
              Arrive feeling <span className="font-medium">{compass.transformation_arrive || '—'}</span>, leave
              feeling <span className="font-medium">{compass.transformation_leave || '—'}</span>.
            </p>
            <div className="flex items-center gap-3">
              {(arriveCaption || leaveCaption) && (
                <p className="text-xs text-muted-foreground">{arriveCaption ?? leaveCaption}</p>
              )}
              <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline">
                Edit
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-muted-foreground hover:text-foreground text-left"
          >
            Not yet defined. Click to add it now.
          </button>
        )}
      </CardContent>
    </Card>
  )
}

function PendingContributionCard({
  contribution,
  onReviewed,
}: {
  contribution: CompassContribution
  onReviewed: (data: { compass: ExperienceCompass; pending: CompassContribution[] }) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(contribution.suggested_value)
  const [busy, setBusy] = useState(false)
  const label = COMPASS_FIELDS.find((f) => f.field === contribution.field)?.label ?? contribution.field

  async function review(decision: 'accept' | 'reject', editedValue?: string) {
    setBusy(true)
    try {
      const res = await fetch('/api/compass/contributions/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contributionId: contribution.id, decision, editedValue }),
      })
      const data = await res.json()
      if (res.ok) onReviewed(data)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>
          Suggested from your {contribution.source_module.replace('_', ' ')}
          {contribution.rationale ? ` — ${contribution.rationale}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="flex flex-col gap-2">
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} autoFocus />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => review('accept', value)} disabled={busy || !value.trim()}>
                Save &amp; accept
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{contribution.suggested_value}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => review('accept')} disabled={busy}>
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={busy}>
                Edit &amp; accept
              </Button>
              <Button size="sm" variant="ghost" onClick={() => review('reject')} disabled={busy}>
                Reject
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
