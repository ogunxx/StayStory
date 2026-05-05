'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

interface StoryResult {
  narrative: string
  host_perspective: string
  social_caption: string
  pre_arrival_message: string
  listing_improvements: string
}

export default function StoryClient({ isTrial = false }: { isTrial?: boolean }) {
  const [form, setForm] = useState({
    guestName: '',
    whyVisiting: '',
    occasion: '',
    gesture: '',
    whyItWorked: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<StoryResult | null>(null)

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.whyVisiting.trim() || !form.gesture.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Story generation failed')
      setResult(data.story)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      {isTrial && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Free preview — 1 use only</p>
            <p className="text-xs text-muted-foreground mt-0.5">You have one free session on Story Builder. Upgrade to Legendary to keep full access.</p>
          </div>
          <Link href="/pricing" className="text-xs font-medium text-primary underline underline-offset-2 shrink-0">Upgrade →</Link>
        </div>
      )}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Level 4</p>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">Guest Story Builder</h1>
        <p className="text-muted-foreground leading-relaxed">
          The host is the guide, the guest is the hero. Turn what you did into a story — for your brand, your listing, and the memory they carry home.
        </p>
      </div>

      <div className="bg-accent rounded-xl p-5">
        <p className="text-sm text-foreground font-medium mb-2">The three questions to ask yourself first:</p>
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          <li>→ Who is this guest, really? What are they escaping from?</li>
          <li>→ What do they want to feel?</li>
          <li>→ What detail would make them say "they really thought of me"?</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="guestName">Guest name <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="guestName" value={form.guestName} onChange={(e) => update('guestName', e.target.value)} placeholder="Sarah & Tom" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="occasion">Occasion <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="occasion" value={form.occasion} onChange={(e) => update('occasion', e.target.value)} placeholder="Anniversary, birthday..." />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="whyVisiting">Why were they visiting? <span className="text-destructive">*</span></Label>
          <Textarea
            id="whyVisiting"
            value={form.whyVisiting}
            onChange={(e) => update('whyVisiting', e.target.value)}
            placeholder="Their story — what were they escaping from, looking for, or celebrating?"
            rows={3}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="gesture">What did you do for them? <span className="text-destructive">*</span></Label>
          <Textarea
            id="gesture"
            value={form.gesture}
            onChange={(e) => update('gesture', e.target.value)}
            placeholder="Describe the gesture — what you set up, what you left, what you sent them..."
            rows={3}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="whyItWorked">Why did it work? <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Textarea
            id="whyItWorked"
            value={form.whyItWorked}
            onChange={(e) => update('whyItWorked', e.target.value)}
            placeholder="Did they mention it? Leave a review? What feedback did you get?"
            rows={2}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" disabled={loading || !form.whyVisiting.trim() || !form.gesture.trim()} className="w-fit">
          {loading ? 'Building your story…' : 'Build the story →'}
        </Button>
      </form>

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-6 mt-4 border-t border-border pt-8">
          <h2 className="text-2xl font-serif font-semibold text-foreground">Your guest story</h2>

          <div className="bg-secondary rounded-xl p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">The story — guest's perspective</p>
            <p className="text-foreground leading-relaxed">{result.narrative}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Host's perspective</p>
            <p className="text-foreground leading-relaxed italic">{result.host_perspective}</p>
          </div>

          <div className="bg-accent rounded-xl p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Social caption</p>
            <p className="text-foreground leading-relaxed">{result.social_caption}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Pre-arrival message</p>
            <p className="text-foreground leading-relaxed whitespace-pre-line">{result.pre_arrival_message}</p>
          </div>

          <div className="bg-primary/10 rounded-xl p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Listing copy improvements</p>
            <p className="text-foreground leading-relaxed whitespace-pre-line">{result.listing_improvements}</p>
          </div>

          <Button onClick={() => { setResult(null); setForm({ guestName: '', whyVisiting: '', occasion: '', gesture: '', whyItWorked: '' }) }} variant="outline" className="w-fit">
            Build another story
          </Button>
        </div>
      )}
    </div>
  )
}
