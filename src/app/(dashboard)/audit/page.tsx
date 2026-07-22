'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Rating = 1 | 2 | 3 | 4 | 5

interface AuditState {
  stayed_yourself: boolean | null
  arrival_rating: Rating | null
  lighting_rating: Rating | null
  temperature_rating: Rating | null
  sleep_rating: Rating | null
  bathroom_rating: Rating | null
  kitchen_rating: Rating | null
  layout_rating: Rating | null
  sound_smell_rating: Rating | null
  instructions_rating: Rating | null
  pain_points: string
  one_thing: string
}

function RatingBar({ label, value, onChange }: { label: string; value: Rating | null; onChange: (v: Rating) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="flex gap-2">
        {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-lg text-sm font-medium border transition-colors ${
              value === n
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">1 = needs work · 5 = excellent</p>
    </div>
  )
}

export default function AuditPage() {
  const [audit, setAudit] = useState<AuditState>({
    stayed_yourself: null,
    arrival_rating: null,
    lighting_rating: null,
    temperature_rating: null,
    sleep_rating: null,
    bathroom_rating: null,
    kitchen_rating: null,
    layout_rating: null,
    sound_smell_rating: null,
    instructions_rating: null,
    pain_points: '',
    one_thing: '',
  })
  const [results, setResults] = useState<{ score: number; fixes: string[]; strengths: string[] } | null>(null)
  const [comparing, setComparing] = useState(false)
  const [observations, setObservations] = useState<
    { message: string; compass_field: string | null; suggested_refinement: string | null }[]
  >([])

  function setRating(field: keyof AuditState, value: Rating) {
    setAudit((prev) => ({ ...prev, [field]: value }))
  }

  async function calculateResults() {
    const ratings = [
      audit.arrival_rating, audit.lighting_rating, audit.temperature_rating,
      audit.sleep_rating, audit.bathroom_rating, audit.kitchen_rating,
      audit.layout_rating, audit.sound_smell_rating, audit.instructions_rating,
    ].filter(Boolean) as Rating[]

    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    const score = Math.round((avg / 5) * 100)

    const labelMap: [keyof AuditState, string][] = [
      ['arrival_rating', 'Arrival experience'],
      ['lighting_rating', 'Lighting & mood'],
      ['temperature_rating', 'Temperature control'],
      ['sleep_rating', 'Sleep quality'],
      ['bathroom_rating', 'Bathroom'],
      ['kitchen_rating', 'Kitchen usability'],
      ['layout_rating', 'Layout & flow'],
      ['sound_smell_rating', 'Sound & smell'],
      ['instructions_rating', 'Instructions & clarity'],
    ]

    const fixes = labelMap.filter(([k]) => (audit[k] as Rating | null) !== null && (audit[k] as Rating) <= 3).map(([, l]) => l)
    const strengths = labelMap.filter(([k]) => (audit[k] as Rating | null) !== null && (audit[k] as Rating) >= 4).map(([, l]) => l)

    setResults({ score, fixes, strengths })
    setObservations([])
    setComparing(true)

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, responses: audit }),
      })
      const data = await res.json()
      if (res.ok) setObservations(data.observations ?? [])
    } catch {
      // Saving/comparing quietly fails without blocking the score already shown.
    } finally {
      setComparing(false)
    }
  }

  const categories = [
    { field: 'arrival_rating' as keyof AuditState, label: 'Arrival experience (first 10 minutes)' },
    { field: 'lighting_rating' as keyof AuditState, label: 'Lighting — warm, layered, intentional?' },
    { field: 'temperature_rating' as keyof AuditState, label: 'Temperature control — easy for guests to use?' },
    { field: 'sleep_rating' as keyof AuditState, label: 'Sleep quality — bed, pillows, blackout, noise?' },
    { field: 'bathroom_rating' as keyof AuditState, label: 'Bathroom experience' },
    { field: 'kitchen_rating' as keyof AuditState, label: 'Kitchen / kitchenette usability' },
    { field: 'layout_rating' as keyof AuditState, label: 'Layout & flow — where does a guest put their bag?' },
    { field: 'sound_smell_rating' as keyof AuditState, label: 'Sound & smell — what does a fresh arrival notice?' },
    { field: 'instructions_rating' as keyof AuditState, label: 'Instructions & clarity — WiFi, check-out, etc.' },
  ]

  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Level 1</p>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">Experience Audit</h1>
        <p className="text-muted-foreground leading-relaxed">
          The first principle of great hosting: stay in your own rental before renting it out. This audit helps you see your stay through your guest&apos;s eyes — surfacing the emotional peaks, the missed moments, and the invisible things guests feel but rarely mention. It&apos;s where a stay they forget starts becoming one they never will.
        </p>
      </div>

      {/* First principle */}
      <div className="bg-accent rounded-2xl p-6">
        <Label className="text-sm font-semibold text-foreground mb-3 block">
          Have you stayed in this property as a guest yourself?
        </Label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setAudit((p) => ({ ...p, stayed_yourself: true }))}
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${audit.stayed_yourself === true ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setAudit((p) => ({ ...p, stayed_yourself: false }))}
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${audit.stayed_yourself === false ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}
          >
            Not yet
          </button>
        </div>
        {audit.stayed_yourself === false && (
          <p className="text-sm text-muted-foreground mt-3 italic">
            This is the most important thing you can do. Book a night in your own property before your next guest arrives.
          </p>
        )}
      </div>

      {/* Rating categories */}
      <div className="flex flex-col gap-8">
        {categories.map(({ field, label }) => (
          <RatingBar
            key={field}
            label={label}
            value={audit[field] as Rating | null}
            onChange={(v) => setRating(field, v)}
          />
        ))}
      </div>

      {/* Pain point */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="pain_points" className="text-sm font-medium">
          What's the biggest friction point in your property right now?
        </Label>
        <Textarea
          id="pain_points"
          value={audit.pain_points}
          onChange={(e) => setAudit((p) => ({ ...p, pain_points: e.target.value }))}
          placeholder="e.g. Guests always ask about the WiFi, parking is confusing, AC is hard to control..."
          rows={3}
        />
        <p className="text-xs text-muted-foreground">The best hosts solve pain points by giving MORE, not less.</p>
      </div>

      {/* One thing */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="one_thing" className="text-sm font-medium">
          What's the one thing your property does better than anywhere else?
        </Label>
        <Textarea
          id="one_thing"
          value={audit.one_thing}
          onChange={(e) => setAudit((p) => ({ ...p, one_thing: e.target.value }))}
          placeholder="e.g. The deck view at sunset, the outdoor movie setup, the wellness space..."
          rows={2}
        />
        <p className="text-xs text-muted-foreground">The principle: do one thing so brilliantly it becomes the reason guests never forget you.</p>
      </div>

      <Button onClick={calculateResults} size="lg" className="w-fit">
        See my audit results →
      </Button>

      {/* Results */}
      {results && (
        <div className="flex flex-col gap-6 bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-4">
            <div className="text-5xl font-serif font-bold text-foreground">{results.score}</div>
            <div>
              <p className="text-sm font-medium text-foreground">Hospitality Readiness Score</p>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </div>
          </div>

          {results.fixes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Priority fixes</p>
              <ul className="flex flex-col gap-1">
                {results.fixes.map((f) => (
                  <li key={f} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">→</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.strengths.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Your strengths</p>
              <ul className="flex flex-col gap-1">
                {results.strengths.map((s) => (
                  <li key={s} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {comparing && (
            <p className="text-xs text-muted-foreground italic">Comparing with your Experience Compass…</p>
          )}

          {observations.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-foreground">Worth noticing</p>
              {observations.map((o, i) => (
                <div key={i} className="bg-secondary rounded-xl p-4">
                  <p className="text-sm text-foreground leading-relaxed">{o.message}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Any suggested refinements from this are waiting for your review on your{' '}
                <a href="/compass" className="text-primary hover:underline">Experience Compass</a>.
              </p>
            </div>
          )}

          {audit.one_thing && (
            <div className="bg-accent rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-1">Your one thing</p>
              <p className="text-sm text-muted-foreground italic">"{audit.one_thing}"</p>
              <p className="text-xs text-muted-foreground mt-2">Make this the centerpiece of every guest experience.</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Foundation is solid enough? Head to the{' '}
            <a href="/generator" className="text-primary hover:underline">Experience Generator</a>{' '}
            to create meaningful moments for your next guest.
          </p>
        </div>
      )}
    </div>
  )
}
