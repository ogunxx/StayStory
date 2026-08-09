'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { CompassField, GeneratorFormData, SuggestionContent } from '@/types'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LEGENDARY_PRICE } from '@/lib/config'
import { COMPASS_FIELD_LABELS } from '@/lib/compass-fields'

export default function GeneratorPage() {
  const [form, setForm] = useState<GeneratorFormData>({
    guestName: '',
    whyVisiting: '',
    hostNotes: '',
    occasion: '',
    emotionalState: '',
    hasKids: false,
    hasPets: false,
    interests: '',
    budget: 'under_10',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [result, setResult] = useState<SuggestionContent | null>(null)
  const [compassUsed, setCompassUsed] = useState<CompassField[]>([])

  const [importMessage, setImportMessage] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [imported, setImported] = useState(false)

  async function handleImport() {
    if (!importMessage.trim()) return
    setImportLoading(true)
    setImportError(null)
    try {
      const res = await fetch('/api/extract-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: importMessage }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const r = data.result
      setForm(prev => ({
        ...prev,
        guestName: r.guestName ?? prev.guestName,
        whyVisiting: r.whyVisiting ?? prev.whyVisiting,
        occasion: r.occasion ?? prev.occasion,
        emotionalState: r.emotionalState ?? prev.emotionalState,
        hasKids: r.hasKids ?? prev.hasKids,
        hasPets: r.hasPets ?? prev.hasPets,
        interests: r.interests ?? prev.interests,
        hostNotes: r.hostNotes ?? prev.hostNotes,
      }))
      setImported(true)
      setImportOpen(false)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Could not analyze message')
    } finally {
      setImportLoading(false)
    }
  }

  function update(field: keyof GeneratorFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.whyVisiting.trim()) return
    setLoading(true)
    setError(null)
    setLimitReached(false)
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.status === 429 && data.error === 'limit_reached') {
        setLimitReached(true)
        return
      }
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data.suggestion)
      setCompassUsed(data.compassElementsUsed ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Level 2</p>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">Experience Generator</h1>
        <p className="text-muted-foreground leading-relaxed">
          Tell us about your guest. The more specific you are, the more meaningful the moments — every detail unlocks a way to make them feel seen.
        </p>
      </div>

      {/* Message import */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setImportOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/40 transition-colors"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">
              Import from guest message
              {imported && <span className="ml-2 text-xs text-primary font-normal">✓ Form filled</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Paste a guest's Airbnb/VRBO message and Claude will auto-fill the form below</p>
          </div>
          <span className="text-muted-foreground ml-4 shrink-0">{importOpen ? '↑' : '↓'}</span>
        </button>

        {importOpen && (
          <div className="border-t border-border px-5 pb-5 pt-4 flex flex-col gap-3 bg-card/50">
            <Textarea
              value={importMessage}
              onChange={e => setImportMessage(e.target.value)}
              placeholder="Paste the guest's booking message or inquiry here — the more they shared, the better the output..."
              rows={4}
            />
            {importError && <p className="text-xs text-destructive">{importError}</p>}
            <Button
              type="button"
              onClick={handleImport}
              disabled={importLoading || !importMessage.trim()}
              size="sm"
              className="w-fit"
            >
              {importLoading ? 'Analyzing…' : 'Auto-fill form from message →'}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleGenerate} className="flex flex-col gap-7">
        {/* Guest basics */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guestName">Guest name <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="guestName" value={form.guestName} onChange={(e) => update('guestName', e.target.value)} placeholder="Sarah" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="occasion">Occasion <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="occasion" value={form.occasion} onChange={(e) => update('occasion', e.target.value)} placeholder="Anniversary, birthday, work trip..." />
          </div>
        </div>

        {/* Why visiting — required */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="whyVisiting">Why are they visiting? <span className="text-destructive">*</span></Label>
          <Textarea
            id="whyVisiting"
            value={form.whyVisiting}
            onChange={(e) => update('whyVisiting', e.target.value)}
            placeholder="e.g. Couple coming to reconnect after a stressful year. She mentioned it's their first trip alone since having kids."
            rows={3}
            required
          />
        </div>

        {/* Host notes from messages */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hostNotes">Notes from guest messages</Label>
          <Textarea
            id="hostNotes"
            value={form.hostNotes}
            onChange={(e) => update('hostNotes', e.target.value)}
            placeholder="Copy anything they mentioned — food preferences, hobbies, plans, anything personal..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">This is your Dream Weaving material. The more you give, the more specific the output.</p>
        </div>

        {/* Emotional state + interests */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emotionalState">Their emotional state</Label>
            <Input id="emotionalState" value={form.emotionalState} onChange={(e) => update('emotionalState', e.target.value)} placeholder="Stressed, excited, grieving, celebrating..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="interests">Interests</Label>
            <Input id="interests" value={form.interests} onChange={(e) => update('interests', e.target.value)} placeholder="Nature, wine, cooking, hiking, yoga..." />
          </div>
        </div>

        {/* Kids / pets */}
        <div className="flex flex-col gap-2">
          <Label>Traveling with</Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => update('hasKids', !form.hasKids)}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${form.hasKids ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}
            >
              Kids
            </button>
            <button
              type="button"
              onClick={() => update('hasPets', !form.hasPets)}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${form.hasPets ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}
            >
              Pets
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {limitReached && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-foreground">You've used your 1 free generation this month</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upgrade to Legendary for unlimited generation and every tool — {LEGENDARY_PRICE}.
            </p>
            <Link href="/pricing" className={cn(buttonVariants({ size: 'sm' }), 'w-fit')}>
              Upgrade to Legendary →
            </Link>
          </div>
        )}

        <Button type="submit" size="lg" disabled={loading || !form.whyVisiting.trim()} className="w-fit">
          {loading ? 'Creating your moment…' : 'Generate hospitality moment →'}
        </Button>
      </form>

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-6 mt-4">
          <div className="border-t border-border pt-8">
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-1">Your hospitality moment</h2>
            <p className="text-sm text-muted-foreground">
              Focus: <span className="text-foreground font-medium">{result.touchpoint_focus}</span>
            </p>
          </div>

          {/* Principle — teach before recommend */}
          <div className="flex flex-col gap-2">
            <p className="text-sm text-foreground leading-relaxed">{result.principle}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.why_it_matters}</p>
          </div>

          {/* Tiered gestures */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground">Gesture options</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: '$0 — Low-Hanging', value: result.gestures.zero, bg: 'bg-secondary' },
                { label: 'Under $10 — Achievable', value: result.gestures.under_10, bg: 'bg-accent' },
                { label: 'Under $25', value: result.gestures.under_25, bg: 'bg-primary/10' },
                { label: 'Premium — Audacious', value: result.gestures.premium, bg: 'bg-card border border-border' },
              ].map((g) => (
                <div key={g.label} className={`${g.bg} rounded-xl p-4 flex flex-col gap-2`}>
                  <Badge variant="outline" className="w-fit text-xs">{g.label}</Badge>
                  <p className="text-sm text-foreground leading-relaxed">{g.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Setup plan */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Setup plan</h3>
            <ol className="flex flex-col gap-2">
              {result.setup_plan.map((step, i) => (
                <li key={i} className="text-sm text-foreground flex gap-3">
                  <span className="text-muted-foreground font-mono text-xs mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Shopping list */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-3">Shopping list</h3>
            <ul className="flex flex-col gap-2">
              {result.shopping_list.map((item, i) => (
                <li key={i} className="text-sm text-foreground flex gap-2">
                  <span className="text-muted-foreground mt-0.5">□</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Message templates */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground">Message templates</h3>
            {[
              { label: 'Pre-arrival', value: result.messages.pre_arrival },
              { label: 'Welcome note', value: result.messages.welcome_note },
              { label: 'Follow-up (2–3 days after checkout)', value: result.messages.follow_up },
            ].map((msg) => (
              <div key={msg.label} className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{msg.label}</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{msg.value}</p>
              </div>
            ))}
          </div>

          {/* Compass traceability */}
          {compassUsed.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Informed by your Compass:</span>
              {compassUsed.map((field) => (
                <Badge key={field} variant="outline">
                  {COMPASS_FIELD_LABELS[field] ?? field}
                </Badge>
              ))}
            </div>
          )}

          {/* Expected guest impact + story it reinforces */}
          <div className="bg-secondary rounded-xl p-5 flex flex-col gap-3">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Expected guest impact</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.expected_guest_impact}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">The story it reinforces</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.story_it_reinforces}</p>
            </div>
          </div>

          {/* Guardrail */}
          <div className="bg-accent rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-2">Don't overdo it</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.dont_overdo_it}</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => { setResult(null); setCompassUsed([]); setForm({ guestName: '', whyVisiting: '', hostNotes: '', occasion: '', emotionalState: '', hasKids: false, hasPets: false, interests: '', budget: 'under_10' }) }} variant="outline">
              Generate for another guest
            </Button>
            <a href="/story" className={cn(buttonVariants({ variant: 'outline' }))}>Turn this into a story →</a>
          </div>
        </div>
      )}
    </div>
  )
}
