'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LEGENDARY_PRICE } from '@/lib/config'

interface PlaybookResult {
  executive_summary: string
  property_positioning: string
  signature_experience: string
  guest_archetypes: { type: string; what_they_need: string; wow_gesture: string }[]
  touchpoint_priorities: { touchpoint: string; current_gap: string; recommendation: string }[]
  monthly_rhythm: string
  your_one_thing: string
}

const SAMPLE_PLAYBOOK = {
  executive_summary: `Your property isn't competing with other short-term rentals. It's competing with the feeling guests get nowhere else. Your 4.99★ rating is the evidence — now the job is to make that experience repeatable, scalable, and impossible to replicate.\n\nThe biggest opportunity: you're already doing the right things instinctively. This playbook turns instinct into system.`,
  property_positioning: `You are not a short-term rental. You are a decompression chamber with a view. The outdoor shower, the deck at golden hour, the movie nights — these aren't amenities. They're the experience. Lead with feeling, not features. Your listing should answer one question before anything else: "How will I feel when I wake up here?"`,
  archetypes: [
    {
      type: 'The Reconnecting Couple',
      what_they_need: 'Space to exhale. To feel cared for without being managed. Two days where they remember who they were before the mortgage and the toddler schedule.',
      wow_gesture: 'A handwritten note that references something specific from their booking message. Nothing shows you listened like proving you listened.',
    },
    {
      type: 'The Solo Reset',
      what_they_need: 'Permission to do nothing. No itinerary, no social performance. A place where disappearing for 48 hours is the whole point.',
      wow_gesture: 'A "no plan" welcome kit: local coffee, a book recommendation, and a note that says "the only thing on your schedule is whatever you want."',
    },
  ],
  touchpoint: {
    touchpoint: 'Entry Moment — First 60 Seconds',
    current_gap: 'Most hosts leave arrival to logistics. The lock code works, the key is there. But the emotional experience of walking in for the first time is designed by accident, not intention.',
    recommendation: 'Design the first 60 seconds deliberately. What do they see, smell, and hear? Set a specific playlist. Light a candle. Have the temperature at their preference. Leave one personal touch where they\'ll find it immediately. This is your Start Strong moment — the highest-ROI touchpoint in the entire guest journey.',
  },
}

export default function LegendClient({ isTrial = false, isPreview = false, userEmail }: { isTrial?: boolean; isPreview?: boolean; userEmail?: string }) {
  const [form, setForm] = useState({
    propertyName: '',
    propertyType: '',
    location: '',
    uniqueFeatures: '',
    typicalGuest: '',
    currentRating: '',
    biggestChallenge: '',
    hostPhilosophy: '',
    budget: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playbook, setPlaybook] = useState<PlaybookResult | null>(null)

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function generatePlaybook(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPlaybook(null)

    try {
      const res = await fetch('/api/legend/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlaybook(data.playbook)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (isPreview) {
    return (
      <div className="flex flex-col gap-10 max-w-3xl">
        <div className="bg-primary text-primary-foreground rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Your free preview is complete</p>
            <p className="text-xs text-primary-foreground/70 mt-0.5">Below is a sample of the full playbook Legendary generates for your specific property.</p>
          </div>
          <Link href="/pricing" className="bg-primary-foreground text-primary px-4 py-2 rounded-lg text-xs font-semibold shrink-0 hover:bg-primary-foreground/90 transition-colors">
            Upgrade to Legendary →
          </Link>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Level 5</p>
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">Guest Journey Playbook</h1>
          <p className="text-muted-foreground leading-relaxed">Your complete hosting intelligence document — built for your property, your guests, your style. Here's what it looks like.</p>
        </div>

        {/* Sample playbook — executive summary fully visible */}
        <div className="bg-primary text-primary-foreground rounded-xl p-6">
          <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-2">Executive Summary</p>
          <p className="leading-relaxed whitespace-pre-line">{SAMPLE_PLAYBOOK.executive_summary}</p>
        </div>

        {/* Property positioning — fully visible */}
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Property Positioning</p>
          <p className="text-foreground leading-relaxed">{SAMPLE_PLAYBOOK.property_positioning}</p>
        </div>

        {/* First archetype — visible */}
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Guest Archetypes</p>
          <div className="bg-secondary rounded-xl p-5 flex flex-col gap-2">
            <p className="font-semibold text-foreground">{SAMPLE_PLAYBOOK.archetypes[0].type}</p>
            <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">What they need:</span> {SAMPLE_PLAYBOOK.archetypes[0].what_they_need}</p>
            <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Wow gesture:</span> {SAMPLE_PLAYBOOK.archetypes[0].wow_gesture}</p>
          </div>
        </div>

        {/* Touchpoint priority — visible */}
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Touchpoint Priority (sample)</p>
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
            <p className="font-semibold text-foreground">{SAMPLE_PLAYBOOK.touchpoint.touchpoint}</p>
            <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Gap:</span> {SAMPLE_PLAYBOOK.touchpoint.current_gap}</p>
            <p className="text-sm text-foreground leading-relaxed">{SAMPLE_PLAYBOOK.touchpoint.recommendation}</p>
          </div>
        </div>

        {/* Remaining sections — locked */}
        <div className="relative">
          <div className="flex flex-col gap-4 pointer-events-none select-none" style={{ filter: 'blur(3px)', opacity: 0.5 }}>
            <div className="bg-secondary rounded-xl p-5 flex flex-col gap-2">
              <p className="font-semibold text-foreground">{SAMPLE_PLAYBOOK.archetypes[1].type}</p>
              <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">What they need:</span> {SAMPLE_PLAYBOOK.archetypes[1].what_they_need}</p>
              <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Wow gesture:</span> {SAMPLE_PLAYBOOK.archetypes[1].wow_gesture}</p>
            </div>
            <div className="bg-primary/10 rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Monthly Hosting Rhythm</p>
              <p className="text-foreground leading-relaxed">Week 1: Review upcoming arrivals and personalize pre-arrival messages. Week 2: Audit one touchpoint and implement one quick win. Week 3: Follow up with recent guests and capture stories. Week 4: Review your score and update your signature moment if needed.</p>
            </div>
            <div className="bg-primary text-primary-foreground rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-2">Your One Thing</p>
              <p className="text-xl font-serif font-semibold">The deck at golden hour — designed, not accidental.</p>
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="text-center px-6">
              <p className="text-lg font-serif font-semibold text-foreground mb-2">3 more sections — locked</p>
              <p className="text-sm text-muted-foreground max-w-sm">Your full archetype set, monthly hosting rhythm, and Your One Thing — all generated for your specific property.</p>
            </div>
            <Link href="/pricing" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Unlock your full playbook — {LEGENDARY_PRICE} →
            </Link>
          </div>
        </div>

        <div className="bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col gap-4 text-center items-center">
          <p className="text-xs uppercase tracking-widest text-primary-foreground/60">Legendary</p>
          <h2 className="text-2xl font-serif font-semibold">Your property. Your guests. Your playbook.</h2>
          <p className="text-primary-foreground/80 text-sm max-w-sm leading-relaxed">
            Custom-built for your specific property — executive summary, property positioning, guest archetypes, touchpoint priorities, monthly rhythm, and your one signature moment.
          </p>
          <Link href="/pricing" className="bg-primary-foreground text-primary px-8 py-3 rounded-xl font-semibold hover:bg-primary-foreground/90 transition-colors">
            Become Legendary →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12 max-w-3xl">
      {isTrial && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Free preview — 1 use only</p>
            <p className="text-xs text-muted-foreground mt-0.5">You have one free session on Guest Journey Playbook. Upgrade to Legendary to keep full access.</p>
          </div>
          <Link href="/pricing" className="text-xs font-medium text-primary underline underline-offset-2 shrink-0">Upgrade →</Link>
        </div>
      )}

      {/* Legendary header */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-8">
        <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-2">Level 5 · Legendary Member</p>
        <h1 className="text-3xl font-serif font-semibold mb-3">Your full hospitality experience</h1>
        <p className="text-primary-foreground/80 leading-relaxed">
          Every tool, unlimited. Your custom guest journey playbook — built for your property, your guests, your hosting style.
        </p>
      </div>

      {/* 3 pillars */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { n: '1', title: 'All Five Tools — Unlimited', desc: 'Foundation Audit, Hospitality Generator, Journey Map, Guest Story Builder, and your custom Guest Journey Playbook. No limits, no resets.' },
          { n: '2', title: 'Custom Guest Journey Playbook', desc: 'Your complete hosting intelligence document — guest archetypes, touchpoint priorities, signature experience, and monthly rhythm.' },
          { n: '3', title: 'Priority Support', desc: 'Direct access to Ogun & Evie for questions, new guest situations, and anything that comes up. Real answers from people who\'ve lived it.' },
        ].map((item) => (
          <div key={item.n} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
            <span className="text-xs font-mono text-muted-foreground">{item.n}</span>
            <h3 className="font-serif font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Playbook builder */}
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Your custom playbook</p>
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">Generate your custom playbook</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your complete hosting intelligence document — guest archetypes, touchpoint priorities, signature experience design, and monthly rhythm. Built for your specific property.
          </p>
        </div>

        <form onSubmit={generatePlaybook} className="flex flex-col gap-6">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="propertyName">Property name</Label>
              <Input id="propertyName" value={form.propertyName} onChange={(e) => update('propertyName', e.target.value)} placeholder="e.g. The Wellness Deck" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="propertyType">Property type</Label>
              <Input id="propertyType" value={form.propertyType} onChange={(e) => update('propertyType', e.target.value)} placeholder="RV, tiny house, cabin, wellness space..." required />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Location / setting</Label>
              <Input id="location" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Rural Texas, near a lake, outdoor lifestyle..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentRating">Current rating & reviews</Label>
              <Input id="currentRating" value={form.currentRating} onChange={(e) => update('currentRating', e.target.value)} placeholder="e.g. 4.99★ / 134 reviews" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="uniqueFeatures">What makes your property unique?</Label>
            <Textarea id="uniqueFeatures" value={form.uniqueFeatures} onChange={(e) => update('uniqueFeatures', e.target.value)} placeholder="Big deck, outdoor shower, movie nights, RV + wellness office, all on one property..." rows={3} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="typicalGuest">Who is your typical guest?</Label>
            <Textarea id="typicalGuest" value={form.typicalGuest} onChange={(e) => update('typicalGuest', e.target.value)} placeholder="Couples reconnecting, families, wellness seekers, remote workers..." rows={2} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hostPhilosophy">Your hosting philosophy in one sentence</Label>
            <Input id="hostPhilosophy" value={form.hostPhilosophy} onChange={(e) => update('hostPhilosophy', e.target.value)} placeholder="e.g. Every guest should leave feeling more rested than when they arrived" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="biggestChallenge">Your biggest hosting challenge right now</Label>
            <Textarea id="biggestChallenge" value={form.biggestChallenge} onChange={(e) => update('biggestChallenge', e.target.value)} placeholder="Consistency, standing out, getting 5-star reviews, mid-week bookings..." rows={2} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget">Monthly hospitality budget</Label>
            <Input id="budget" value={form.budget} onChange={(e) => update('budget', e.target.value)} placeholder="e.g. $50/month, $200/month, flexible..." />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" disabled={loading} className="w-fit">
            {loading ? 'Building your playbook…' : 'Generate my custom playbook →'}
          </Button>
        </form>

        {/* Playbook result */}
        {playbook && (
          <div className="flex flex-col gap-6 border-t border-border pt-8">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-serif font-semibold text-foreground">Your Guest Journey Playbook</h2>
            </div>

            <div className="bg-primary text-primary-foreground rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-2">Executive Summary</p>
              <p className="leading-relaxed">{playbook.executive_summary}</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Property Positioning</p>
              <p className="text-foreground leading-relaxed">{playbook.property_positioning}</p>
            </div>

            <div className="bg-accent rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Your Signature Experience</p>
              <p className="text-foreground leading-relaxed">{playbook.signature_experience}</p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Guest Archetypes</p>
              {playbook.guest_archetypes?.map((g, i) => (
                <div key={i} className="bg-secondary rounded-xl p-5 flex flex-col gap-2">
                  <p className="font-semibold text-foreground">{g.type}</p>
                  <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">What they need:</span> {g.what_they_need}</p>
                  <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Wow gesture:</span> {g.wow_gesture}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Touchpoint Priorities</p>
              {playbook.touchpoint_priorities?.map((t, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-2">
                  <p className="font-semibold text-foreground">{t.touchpoint}</p>
                  <p className="text-sm text-muted-foreground"><span className="text-foreground font-medium">Gap:</span> {t.current_gap}</p>
                  <p className="text-sm text-foreground leading-relaxed">{t.recommendation}</p>
                </div>
              ))}
            </div>

            <div className="bg-primary/10 rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Monthly Hosting Rhythm</p>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{playbook.monthly_rhythm}</p>
            </div>

            <div className="bg-primary text-primary-foreground rounded-xl p-6">
              <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-2">Your One Thing</p>
              <p className="text-xl font-serif font-semibold">{playbook.your_one_thing}</p>
              <p className="text-primary-foreground/70 text-sm mt-2">Do this so brilliantly that guests never forget it.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
