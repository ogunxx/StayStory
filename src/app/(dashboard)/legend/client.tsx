'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function StayBonusCard() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ dates: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/legend/stay-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-7 flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">Request received — thank you.</p>
        <p className="text-sm text-muted-foreground">Ogun and Evie will confirm your dates by email within 48 hours. We can't wait to host you.</p>
      </div>
    )
  }

  return (
    <div className="border border-primary/30 bg-primary/5 rounded-2xl overflow-hidden">
      <div className="p-7 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Legend member exclusive · First 10 only</p>
            <h3 className="text-xl font-serif font-semibold text-foreground">You're invited to stay with us — free.</h3>
          </div>
          <span className="text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-full shrink-0 font-medium">Limited</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The first 10 Legend members get 2 nights at Laurel & Lore — Ogun and Evie's property. Experience the full hospitality system from the inside. Dinner together, full walkthrough, ask us anything.
        </p>
        <div className="grid sm:grid-cols-2 gap-2 text-xs text-foreground">
          {['2 nights at Laurel & Lore — complimentary', 'Private dinner with Ogun & Evie', 'Hands-on system walkthrough', 'Valid within 1 year of your purchase'].map(f => (
            <p key={f} className="flex items-start gap-1.5"><span className="text-primary mt-0.5 shrink-0">✓</span>{f}</p>
          ))}
        </div>
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="text-sm font-medium text-primary hover:underline w-fit"
          >
            Request your dates →
          </button>
        ) : (
          <form onSubmit={handleRequest} className="flex flex-col gap-4 border-t border-primary/20 pt-5 mt-1">
            <div className="flex flex-col gap-1.5">
              <Label>Preferred dates or time of year</Label>
              <Input
                value={form.dates}
                onChange={e => setForm(p => ({ ...p, dates: e.target.value }))}
                placeholder="e.g. Spring 2027 — any weekend, or June 5–7"
                required
              />
              <p className="text-xs text-muted-foreground">Your stay must be within 1 year of your Legend purchase date.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Anything you'd like us to know <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Questions you want answered, topics to cover, dietary needs, anything personal..."
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading || !form.dates.trim()} size="sm">
                {loading ? 'Sending…' : 'Send request →'}
              </Button>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

interface PlaybookResult {
  executive_summary: string
  property_positioning: string
  signature_experience: string
  guest_archetypes: { type: string; what_they_need: string; wow_gesture: string }[]
  touchpoint_priorities: { touchpoint: string; current_gap: string; recommendation: string }[]
  monthly_rhythm: string
  your_one_thing: string
}

export default function LegendClient({ isTrial = false }: { isTrial?: boolean }) {
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
  const [auditBooked, setAuditBooked] = useState(false)

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

  return (
    <div className="flex flex-col gap-12 max-w-3xl">
      {isTrial && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Free preview — 1 use only</p>
            <p className="text-xs text-muted-foreground mt-0.5">You have one free session on Guest Journey Playbook. Upgrade to Legend to keep full access.</p>
          </div>
          <Link href="/pricing" className="text-xs font-medium text-primary underline underline-offset-2 shrink-0">Upgrade →</Link>
        </div>
      )}

      {/* Stay bonus offer */}
      {!isTrial && <StayBonusCard />}

      {/* Legend header */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-8">
        <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-2">Legend Member</p>
        <h1 className="text-3xl font-serif font-semibold mb-3">Your done-with-you experience</h1>
        <p className="text-primary-foreground/80 leading-relaxed">
          This is where we go deep. Your property audit, your custom guest journey playbook, and direct access to everything that makes a Legend host.
        </p>
      </div>

      {/* 3 pillars */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { n: '1', title: 'Property Audit Call', desc: 'A 1-on-1 call to walk through your property, identify friction points, and unlock your signature experience.', action: 'Book your call' },
          { n: '2', title: 'Custom Playbook', desc: 'Your complete guest journey playbook — built specifically for your property, your guests, and your hosting style.', action: 'Generate playbook below' },
          { n: '3', title: 'Priority Support', desc: 'Direct access for questions, new guest situations, and anything that comes up.', action: 'Email us' },
        ].map((item) => (
          <div key={item.n} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
            <span className="text-xs font-mono text-muted-foreground">{item.n}</span>
            <h3 className="font-serif font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
            <p className="text-xs text-primary font-medium">{item.action}</p>
          </div>
        ))}
      </div>

      {/* Book audit call */}
      <div className="border border-border rounded-2xl p-8 flex flex-col gap-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Step 1</p>
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">Book your property audit call</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            A 60-minute deep dive into your property. We'll walk through your guest journey, identify what guests feel but never say, and design your signature hosting moment.
          </p>
        </div>
        {!auditBooked ? (
          <div className="flex flex-col gap-3">
            <div className="bg-accent rounded-xl p-5 text-sm text-foreground leading-relaxed">
              <p className="font-medium mb-2">What we cover:</p>
              <ul className="flex flex-col gap-1 text-muted-foreground">
                <li>→ Full touchpoint audit (arrival through post-checkout)</li>
                <li>→ Your property's signature moment — what makes it unrepeatable</li>
                <li>→ Guest archetype mapping — who your best guests are and how to attract more</li>
                <li>→ Quick wins you can implement this week</li>
                <li>→ Your "one thing" — the Soniat House principle applied to your property</li>
              </ul>
            </div>
            <Button onClick={() => setAuditBooked(true)} size="lg" className="w-fit">
              Schedule my audit call →
            </Button>
          </div>
        ) : (
          <div className="bg-secondary rounded-xl p-6 text-center">
            <p className="font-serif font-semibold text-foreground text-lg mb-2">You're on the list</p>
            <p className="text-sm text-muted-foreground">We'll reach out to <strong>oguncananoglu@gmail.com</strong> within 24 hours to schedule your audit call.</p>
          </div>
        )}
      </div>

      {/* Playbook builder */}
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Step 2</p>
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
              <p className="text-primary-foreground/70 text-sm mt-2">The Soniat House principle — do this so brilliantly that guests never forget it.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
