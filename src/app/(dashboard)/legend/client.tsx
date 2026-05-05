'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface PlaybookResult {
  executive_summary: string
  property_positioning: string
  signature_experience: string
  guest_archetypes: { type: string; what_they_need: string; wow_gesture: string }[]
  touchpoint_priorities: { touchpoint: string; current_gap: string; recommendation: string }[]
  monthly_rhythm: string
  your_one_thing: string
}

export default function LegendClient({ isTrial = false, userEmail }: { isTrial?: boolean; userEmail?: string }) {
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

  const [stayOpen, setStayOpen] = useState(false)
  const [stayForm, setStayForm] = useState({ dates: '', notes: '' })
  const [stayLoading, setStayLoading] = useState(false)
  const [staySubmitted, setStaySubmitted] = useState(false)
  const [stayError, setStayError] = useState<string | null>(null)

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

  async function handleStayRequest(e: React.FormEvent) {
    e.preventDefault()
    setStayLoading(true)
    setStayError(null)
    try {
      const res = await fetch('/api/legend/stay-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stayForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStaySubmitted(true)
    } catch (err) {
      setStayError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setStayLoading(false)
    }
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
          Every tool, unlimited. Your custom guest journey playbook. And one complimentary night at Laurel & Lore — so you can experience the full system from the inside.
        </p>
      </div>

      {/* 3 pillars */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { n: '1', title: 'All Five Tools — Unlimited', desc: 'Foundation Audit, Hospitality Generator, Journey Map, Guest Story Builder, and your custom Guest Journey Playbook. No limits, no resets.' },
          { n: '2', title: 'Custom Guest Journey Playbook', desc: 'Your complete hosting intelligence document — guest archetypes, touchpoint priorities, signature experience, and monthly rhythm.' },
          { n: '3', title: '1 Night Free Stay per Year', desc: 'Every Legendary member gets one complimentary night at Laurel & Lore annually — to experience the hospitality system firsthand, with Ogun and Evie.' },
        ].map((item) => (
          <div key={item.n} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
            <span className="text-xs font-mono text-muted-foreground">{item.n}</span>
            <h3 className="font-serif font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Schedule complimentary stay */}
      {!isTrial && (
        <div className="border border-primary/30 bg-primary/5 rounded-2xl overflow-hidden">
          <div className="p-7 flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Legendary member benefit · Every year</p>
              <h3 className="text-xl font-serif font-semibold text-foreground">Your complimentary night at Laurel & Lore</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All Legendary members get one complimentary night at Laurel & Lore per year — Ogun and Evie's property. Experience the full hospitality system from the inside. Breakfast on the deck, outdoor shower at sunrise, a movie night under the stars. Ask us anything. Leave with a blueprint for your own property.
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-xs text-foreground">
              {[
                '1 night at Laurel & Lore — complimentary',
                'Private dinner with Ogun & Evie',
                'Hands-on walkthrough of the full system',
                'Renewed annually with your membership',
              ].map(f => (
                <p key={f} className="flex items-start gap-1.5"><span className="text-primary mt-0.5 shrink-0">✓</span>{f}</p>
              ))}
            </div>

            {staySubmitted ? (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 flex flex-col gap-2">
                <p className="text-sm font-semibold text-foreground">Request received — thank you.</p>
                <p className="text-sm text-muted-foreground">Ogun and Evie will confirm your dates by email within 48 hours. We can't wait to host you.</p>
              </div>
            ) : !stayOpen ? (
              <button
                onClick={() => setStayOpen(true)}
                className="text-sm font-medium text-primary hover:underline w-fit"
              >
                Schedule my complimentary stay →
              </button>
            ) : (
              <form onSubmit={handleStayRequest} className="flex flex-col gap-4 border-t border-primary/20 pt-5 mt-1">
                <div className="flex flex-col gap-1.5">
                  <Label>Preferred dates or time of year</Label>
                  <Input
                    value={stayForm.dates}
                    onChange={e => setStayForm(p => ({ ...p, dates: e.target.value }))}
                    placeholder="e.g. Spring 2027 — any weekend, or June 5–7"
                    required
                  />
                  <p className="text-xs text-muted-foreground">We'll check our Airbnb and VRBO calendar and confirm your dates within 48 hours.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Anything you'd like us to know <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Textarea
                    value={stayForm.notes}
                    onChange={e => setStayForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Questions, topics to cover, dietary needs, anything personal..."
                    rows={3}
                  />
                </div>
                {stayError && <p className="text-sm text-destructive">{stayError}</p>}
                <div className="flex gap-3">
                  <Button type="submit" disabled={stayLoading || !stayForm.dates.trim()} size="sm">
                    {stayLoading ? 'Sending…' : 'Send request →'}
                  </Button>
                  <button type="button" onClick={() => setStayOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">We'll reach out to <strong>{userEmail ?? 'you'}</strong> to confirm availability.</p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Playbook builder */}
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{isTrial ? 'Your playbook' : 'Step 2'}</p>
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
