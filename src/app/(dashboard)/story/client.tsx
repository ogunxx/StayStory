'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { LEGENDARY_PRICE } from '@/lib/config'

interface StoryResult {
  narrative: string
  host_perspective: string
  social_caption: string
  pre_arrival_message: string
  listing_improvements: string
}

const SAMPLE_STORY = {
  narrative: `Sarah and Marcus arrived on a Friday evening, five years into a marriage that had quietly become a marathon of mortgages, toddler schedules, and back-to-back work trips. They didn't need a vacation. They needed to remember who they were before all of it.\n\nThe deck was set when they walked in — local wine, two glasses, the fire already going. No instructions, no welcome packet. Just the unmistakable feeling that someone had thought about them specifically. Marcus found the handwritten note on the counter. Three lines. He didn't read it aloud. He didn't need to.\n\nOn Sunday morning they sat outside until noon. Neither of them checked their phones.`,
  host_perspective: `I saw their booking message and noticed Marcus mentioned it was their first trip alone in three years. I didn't do anything extravagant — a bottle of local wine from the town fifteen minutes away, the deck fire ready to go, a note that said I hoped they'd leave remembering why they chose each other. That's all it took. The review they left three days later was the best I've ever received.`,
  social_caption: `Five years together. First trip alone in three. They sat on the deck until noon on Sunday and didn't check their phones once.\n\nThat's the whole point. ✦`,
  pre_arrival_message: `Hi Sarah & Marcus — so excited to welcome you this weekend.\n\nA few things I've set up for you: the outdoor shower is best at golden hour (trust me on this one). The deck fire takes about 10 minutes — lighter's on the side table. And there's something cold waiting in the fridge.\n\nCan't wait to host you. Safe travels. — [Your name]`,
  listing_improvements: `Consider adding to your listing description:\n\n"Guests tell us the deck at sunset is the moment they didn't know they needed. Set aside your first evening for it — just that."\n\nAlso: your review mentions the handwritten note more than any other detail. Make that explicit in your hosting approach — guests want to feel seen, and one personal line does more than any amenity.`,
}

export default function StoryClient({ isTrial = false, isPreview = false }: { isTrial?: boolean; isPreview?: boolean }) {
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

  if (isPreview) {
    return (
      <div className="flex flex-col gap-10 max-w-2xl">
        <div className="bg-primary text-primary-foreground rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Your free preview is complete</p>
            <p className="text-xs text-primary-foreground/70 mt-0.5">Here's an example of what Story Builder produces — for every guest you host.</p>
          </div>
          <Link href="/pricing" className="bg-primary-foreground text-primary px-4 py-2 rounded-lg text-xs font-semibold shrink-0 hover:bg-primary-foreground/90 transition-colors">
            Upgrade to Legendary →
          </Link>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Level 4</p>
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">Story Builder</h1>
          <p className="text-muted-foreground leading-relaxed">
            Every guest has a story. This is what it looks like when you tell it well. The example below was built from a single guest: Sarah & Marcus, 5-year anniversary, first trip alone in three years.
          </p>
        </div>

        <div className="relative">
          <div className="flex flex-col gap-4">
            <div className="bg-secondary rounded-xl p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">The story — guest's perspective</p>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{SAMPLE_STORY.narrative}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Host's perspective</p>
              <p className="text-foreground leading-relaxed italic">{SAMPLE_STORY.host_perspective}</p>
            </div>
            <div className="bg-accent rounded-xl p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">The moment, in words you could share</p>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{SAMPLE_STORY.social_caption}</p>
            </div>
            <div className="flex flex-col gap-4" style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Pre-arrival message</p>
                <p className="text-foreground leading-relaxed whitespace-pre-line">{SAMPLE_STORY.pre_arrival_message}</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">What future guests should feel before they book</p>
                <p className="text-foreground leading-relaxed whitespace-pre-line">{SAMPLE_STORY.listing_improvements}</p>
              </div>
            </div>
          </div>

          {/* Lock overlay on last 2 sections */}
          <div className="absolute bottom-0 left-0 right-0 h-80 flex flex-col items-center justify-end pb-8 bg-gradient-to-t from-background via-background/90 to-transparent">
            <div className="text-center px-6 mb-5">
              <p className="text-lg font-serif font-semibold text-foreground mb-1">Pre-arrival message + what future guests feel — locked</p>
              <p className="text-sm text-muted-foreground max-w-sm">Upgrade to Legendary to generate every section for every guest you host — unlimited.</p>
            </div>
            <Link href="/pricing" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Unlock Story Builder — {LEGENDARY_PRICE} →
            </Link>
          </div>
        </div>

        <div className="bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col gap-4 text-center items-center">
          <p className="text-xs uppercase tracking-widest text-primary-foreground/60">Legendary</p>
          <h2 className="text-2xl font-serif font-semibold">Every guest leaves a story. Start telling them.</h2>
          <p className="text-primary-foreground/80 text-sm max-w-sm leading-relaxed">
            Guest narrative, host perspective, a moment worth sharing, pre-arrival message, and what future guests feel before they book — all from a 5-field form. Unlimited, for every guest.
          </p>
          <Link href="/pricing" className="bg-primary-foreground text-primary px-8 py-3 rounded-xl font-semibold hover:bg-primary-foreground/90 transition-colors">
            Become Legendary →
          </Link>
        </div>
      </div>
    )
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
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">Story Builder</h1>
        <p className="text-muted-foreground leading-relaxed">
          The host is the guide, the guest is the hero. Express what you created as a story — so guests can anticipate it, feel it, and carry it home.
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
          <Label htmlFor="whyItWorked">What made you feel like it worked? <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Textarea
            id="whyItWorked"
            value={form.whyItWorked}
            onChange={(e) => update('whyItWorked', e.target.value)}
            placeholder="Something they said, a reaction you noticed, a review they left..."
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
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">The moment, in words you could share</p>
            <p className="text-foreground leading-relaxed">{result.social_caption}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Pre-arrival message</p>
            <p className="text-foreground leading-relaxed whitespace-pre-line">{result.pre_arrival_message}</p>
          </div>

          <div className="bg-primary/10 rounded-xl p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">What future guests should feel before they book</p>
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
