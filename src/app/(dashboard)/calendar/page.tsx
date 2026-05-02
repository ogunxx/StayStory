import { createClient } from '@/lib/supabase/server'
import { parseIcal, type CalendarEvent } from '@/lib/ical-parser'
import CalendarClient from './client'

async function fetchEvents(url: string, platform: string): Promise<(CalendarEvent & { platform: string })[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'StayStory/1.0 Calendar Sync' },
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    const text = await res.text()
    if (!text.includes('BEGIN:VCALENDAR')) return []
    return parseIcal(text).map(e => ({ ...e, platform }))
  } catch {
    return []
  }
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('airbnb_ical_url, vrbo_ical_url')
    .eq('id', user!.id)
    .single()

  const airbnbUrl = profile?.airbnb_ical_url ?? null
  const vrboUrl = profile?.vrbo_ical_url ?? null

  const [airbnbEvents, vrboEvents] = await Promise.all([
    airbnbUrl ? fetchEvents(airbnbUrl, 'airbnb') : [],
    vrboUrl ? fetchEvents(vrboUrl, 'vrbo') : [],
  ])

  const events = [...airbnbEvents, ...vrboEvents].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  return (
    <CalendarClient
      airbnbUrl={airbnbUrl}
      vrboUrl={vrboUrl}
      initialEvents={events}
    />
  )
}
