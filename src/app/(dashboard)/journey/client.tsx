'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Touchpoint {
  id: string
  phase: string
  label: string
  question: string
  guidara: string
  isKeyMoment?: 'start' | 'land' | 'pain' | 'overlooked'
}

interface TouchpointState {
  current: string
  ideas: { low: string; achievable: string; audacious: string } | null
  loading: boolean
  expanded: boolean
}

const TOUCHPOINTS: Touchpoint[] = [
  {
    id: 'booking_confirm',
    phase: 'Before Arrival',
    label: 'Booking confirmation message',
    question: 'What does your guest receive the moment they book? Is it warm and personal, or generic?',
    guidara: 'The guest experience starts here — weeks before they arrive.',
  },
  {
    id: 'pre_arrival',
    phase: 'Before Arrival',
    label: 'Pre-arrival message (3–7 days out)',
    question: 'What do you send a week before? Does it make them excited or is it just logistics?',
    guidara: 'This is your first chance to make them feel seen before they step through the door.',
    isKeyMoment: 'start',
  },
  {
    id: 'day_of',
    phase: 'Before Arrival',
    label: 'Day-of arrival message',
    question: 'Do they hear from you the day they arrive? What does that feel like?',
    guidara: 'A warm message on arrival day sets the emotional tone for everything that follows.',
  },
  {
    id: 'parking',
    phase: 'Arrival',
    label: 'Parking & finding the property',
    question: 'Is finding your place stressful? Confusing? What does that friction cost you?',
    guidara: 'This is a pain point — solve it by giving more, not less.',
    isKeyMoment: 'pain',
  },
  {
    id: 'entry',
    phase: 'Arrival',
    label: 'Entry moment — door, key, lock',
    question: 'What is the first physical thing they touch? What does that moment feel like?',
    guidara: 'Start Strong: the welcome moment is your single highest-ROI touchpoint.',
    isKeyMoment: 'start',
  },
  {
    id: 'first_impression',
    phase: 'Arrival',
    label: 'First impression walking in',
    question: 'What do they see, smell, and hear in the first 10 seconds? Is it intentional?',
    guidara: 'Design is the soul of a property. What does yours say?',
  },
  {
    id: 'bag_down',
    phase: 'Arrival',
    label: 'Where does the guest put their bag?',
    question: 'Is there an obvious, natural place? Or do they wander looking for somewhere to set down their things?',
    guidara: 'This overlooked moment tells guests whether the property was designed for them.',
    isKeyMoment: 'overlooked',
  },
  {
    id: 'first_morning',
    phase: 'The Stay',
    label: 'First morning',
    question: 'What is the guest\'s first morning like? Coffee? Light? Sound? Comfort?',
    guidara: 'Soniat House did two things brilliantly every morning. What\'s your version?',
  },
  {
    id: 'mid_stay',
    phase: 'The Stay',
    label: 'Mid-stay check-in',
    question: 'Do you reach out during the stay? If so, does it feel caring or intrusive?',
    guidara: 'A well-timed message mid-stay shows you\'re thinking about them — not just the review.',
  },
  {
    id: 'your_one_thing',
    phase: 'The Stay',
    label: 'Your property\'s signature moment',
    question: 'What\'s the one thing unique to your property that no one else can offer? When does it happen?',
    guidara: 'Every great stay has a signature. What\'s yours — the deck at sunset, the outdoor shower, the movie nights?',
    isKeyMoment: 'overlooked',
  },
  {
    id: 'checkout',
    phase: 'Departure',
    label: 'Checkout experience',
    question: 'What is checkout like for your guest? Rushed? Warm? Does it feel like an ending?',
    guidara: 'Most hosts end here. This is where your competitors stop caring.',
  },
  {
    id: 'farewell',
    phase: 'Departure',
    label: 'Farewell moment',
    question: 'Do you say goodbye? Is there anything waiting for them as they leave?',
    guidara: 'The last thing they experience becomes the story they tell. Make it count.',
    isKeyMoment: 'land',
  },
  {
    id: 'followup',
    phase: 'After the Stay',
    label: 'Follow-up message (2–3 days after)',
    question: 'Do you reach out after they\'ve left? Most hosts don\'t. That\'s an opportunity.',
    guidara: 'Stick the Landing: extend the emotional arc past checkout. They\'ll remember you.',
    isKeyMoment: 'land',
  },
  {
    id: 'discovered_later',
    phase: 'After the Stay',
    label: 'Something discovered after they leave',
    question: 'Is there anything they find later — in a pocket, a bag, a glove compartment — that reminds them of the stay?',
    guidara: 'The car dealership left a Starbucks card in the glove compartment. Weeks after the sale. What\'s your version?',
    isKeyMoment: 'land',
  },
]

const PHASE_ORDER = ['Before Arrival', 'Arrival', 'The Stay', 'Departure', 'After the Stay']

const KEY_MOMENT_LABELS: Record<string, { label: string; color: string }> = {
  start: { label: 'Start Strong', color: 'bg-primary/10 text-primary border-primary/20' },
  land: { label: 'Stick the Landing', color: 'bg-secondary text-secondary-foreground border-secondary' },
  pain: { label: 'Transform a Pain Point', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  overlooked: { label: 'Overlooked Moment', color: 'bg-accent text-accent-foreground border-accent' },
}

export default function JourneyClient({ isTrial = false }: { isTrial?: boolean }) {
  const [states, setStates] = useState<Record<string, TouchpointState>>(() =>
    Object.fromEntries(
      TOUCHPOINTS.map((t) => [t.id, { current: '', ideas: null, loading: false, expanded: false }])
    )
  )
  const [propertyContext, setPropertyContext] = useState('')

  function toggle(id: string) {
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], expanded: !prev[id].expanded } }))
  }

  function setCurrent(id: string, value: string) {
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], current: value } }))
  }

  async function generateIdeas(touchpoint: Touchpoint) {
    setStates((prev) => ({ ...prev, [touchpoint.id]: { ...prev[touchpoint.id], loading: true } }))

    try {
      const res = await fetch('/api/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touchpoint: touchpoint.label,
          question: touchpoint.question,
          guidara: touchpoint.guidara,
          current: states[touchpoint.id].current,
          propertyContext,
          keyMoment: touchpoint.isKeyMoment,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStates((prev) => ({
        ...prev,
        [touchpoint.id]: { ...prev[touchpoint.id], ideas: data.ideas, loading: false },
      }))
    } catch {
      setStates((prev) => ({ ...prev, [touchpoint.id]: { ...prev[touchpoint.id], loading: false } }))
    }
  }

  const grouped = PHASE_ORDER.map((phase) => ({
    phase,
    items: TOUCHPOINTS.filter((t) => t.phase === phase),
  }))

  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      {isTrial && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Free preview — 1 use only</p>
            <p className="text-xs text-muted-foreground mt-0.5">You have one free session on Journey Map. Upgrade to Host to keep full access.</p>
          </div>
          <Link href="/pricing" className="text-xs font-medium text-primary underline underline-offset-2 shrink-0">Upgrade →</Link>
        </div>
      )}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Level 1.5</p>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">Guest Journey Map</h1>
        <p className="text-muted-foreground leading-relaxed">
          Map every moment your guest experiences — from booking confirmation to what they discover after checkout. Get ridiculously granular. No touchpoint is too small.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(KEY_MOMENT_LABELS).map(([, { label, color }]) => (
          <div key={label} className={`text-xs px-3 py-2 rounded-lg border ${color} text-center font-medium`}>
            {label}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Your property (optional context)</label>
        <Textarea
          value={propertyContext}
          onChange={(e) => setPropertyContext(e.target.value)}
          placeholder="e.g. RV + wellness office on a big deck, outdoor shower, movie nights, 4.99★. Guests tend to be couples looking to disconnect..."
          rows={2}
        />
        <p className="text-xs text-muted-foreground">Helps the AI generate ideas specific to your property.</p>
      </div>

      {grouped.map(({ phase, items }) => (
        <div key={phase} className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
            {phase}
          </h2>
          {items.map((t) => {
            const s = states[t.id]
            return (
              <div key={t.id} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggle(t.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="font-medium text-foreground text-sm">{t.label}</span>
                    {t.isKeyMoment && (
                      <Badge variant="outline" className={`text-xs shrink-0 ${KEY_MOMENT_LABELS[t.isKeyMoment].color}`}>
                        {KEY_MOMENT_LABELS[t.isKeyMoment].label}
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground ml-3 shrink-0">{s.expanded ? '↑' : '↓'}</span>
                </button>

                {s.expanded && (
                  <div className="px-4 pb-5 flex flex-col gap-4 border-t border-border bg-card/50">
                    <p className="text-sm text-muted-foreground italic mt-4">"{t.guidara}"</p>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-foreground uppercase tracking-widest">What you currently do</label>
                      <Textarea
                        value={s.current}
                        onChange={(e) => setCurrent(t.id, e.target.value)}
                        placeholder={t.question}
                        rows={2}
                      />
                    </div>

                    <Button
                      onClick={() => generateIdeas(t)}
                      disabled={s.loading}
                      variant="outline"
                      size="sm"
                      className="w-fit"
                    >
                      {s.loading ? 'Generating ideas…' : 'Generate Low-Hanging / Achievable / Audacious ideas →'}
                    </Button>

                    {s.ideas && (
                      <div className="flex flex-col gap-3 mt-1">
                        {[
                          { label: 'Low-Hanging', value: s.ideas.low, bg: 'bg-secondary' },
                          { label: 'Achievable', value: s.ideas.achievable, bg: 'bg-accent' },
                          { label: 'Audacious', value: s.ideas.audacious, bg: 'bg-primary/10' },
                        ].map((idea) => (
                          <div key={idea.label} className={`${idea.bg} rounded-lg p-4`}>
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{idea.label}</p>
                            <p className="text-sm text-foreground leading-relaxed">{idea.value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
