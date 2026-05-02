'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CalendarEvent } from '@/lib/ical-parser'

interface Props {
  airbnbUrl: string | null
  vrboUrl: string | null
  initialEvents: (CalendarEvent & { platform: string })[]
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(d: Date | string) {
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  if (diff <= 0) return 'Checked in'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} days`
}

function PlatformCard({
  platform,
  label,
  savedUrl,
  hint,
  onSynced,
}: {
  platform: 'airbnb' | 'vrbo'
  label: string
  savedUrl: string | null
  hint: string
  onSynced: () => void
}) {
  const [url, setUrl] = useState(savedUrl ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const connected = !!savedUrl

  async function handleSync() {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onSynced()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect() {
    setLoading(true)
    try {
      await fetch('/api/calendar/sync', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      })
      onSynced()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">{label}</h3>
          {connected && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Connected</span>
          )}
        </div>
        {connected && (
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>

      {!connected && (
        <p className="text-xs text-muted-foreground leading-relaxed">{hint}</p>
      )}

      <div className="flex flex-col gap-2">
        <Label className="text-xs">{connected ? 'iCal URL' : 'Paste your iCal export URL'}</Label>
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder={platform === 'airbnb' ? 'https://www.airbnb.com/calendar/ical/...' : 'https://www.vrbo.com/icalendar/...'}
            className="text-xs"
          />
          <Button onClick={handleSync} disabled={loading || !url.trim()} size="sm" className="shrink-0">
            {loading ? '…' : connected ? 'Re-sync' : 'Connect'}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  )
}

export default function CalendarClient({ airbnbUrl, vrboUrl, initialEvents }: Props) {
  const router = useRouter()

  function refresh() {
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-10 max-w-2xl">

      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Calendar</p>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">Calendar Sync</h1>
        <p className="text-muted-foreground leading-relaxed text-sm">
          Connect your Airbnb and VRBO calendars to see all upcoming bookings in one place. Both platforms let you export an iCal link — paste it here and StayStory stays in sync.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Connected platforms</h2>

        <PlatformCard
          platform="airbnb"
          label="Airbnb"
          savedUrl={airbnbUrl}
          hint="In Airbnb: go to Calendar → Availability settings → Export Calendar. Copy the .ics link."
          onSynced={refresh}
        />

        <PlatformCard
          platform="vrbo"
          label="VRBO"
          savedUrl={vrboUrl}
          hint="In VRBO: go to your property → Calendar → Import / Export. Copy the Export URL."
          onSynced={refresh}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
          Upcoming bookings {initialEvents.length > 0 && `— ${initialEvents.length} found`}
        </h2>

        {!airbnbUrl && !vrboUrl && (
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">Connect a platform above to see your upcoming bookings here.</p>
          </div>
        )}

        {(airbnbUrl || vrboUrl) && initialEvents.length === 0 && (
          <div className="border border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No upcoming bookings found in your calendar.</p>
          </div>
        )}

        {initialEvents.length > 0 && (
          <ul className="flex flex-col gap-3">
            {initialEvents.map((event, i) => (
              <li key={event.uid || i} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">
                        {event.guestName ?? event.summary}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        event.platform === 'airbnb'
                          ? 'bg-rose-500/10 text-rose-600'
                          : 'bg-blue-500/10 text-blue-600'
                      }`}>
                        {event.platform === 'airbnb' ? 'Airbnb' : 'VRBO'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.start)} → {formatDate(event.end)} · {event.nights} night{event.nights !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-primary shrink-0 mt-0.5">{daysUntil(event.start)}</span>
                </div>

                {(event.adults != null || (event.children ?? 0) > 0 || (event.pets ?? 0) > 0 || event.bookingCode) && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {event.adults != null && <span>{event.adults} adult{event.adults !== 1 ? 's' : ''}</span>}
                    {(event.children ?? 0) > 0 && <span>{event.children} child{event.children !== 1 ? 'ren' : ''}</span>}
                    {(event.pets ?? 0) > 0 && <span>{event.pets} pet{event.pets !== 1 ? 's' : ''}</span>}
                    {event.bookingCode && <span className="font-mono">{event.bookingCode}</span>}
                  </div>
                )}

                <Link href="/generator" className="text-xs text-primary font-medium hover:underline w-fit">
                  Plan a moment for this guest →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}
