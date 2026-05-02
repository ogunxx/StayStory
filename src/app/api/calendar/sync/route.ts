import { createClient } from '@/lib/supabase/server'
import { parseIcal } from '@/lib/ical-parser'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { platform, url } = await request.json()

  if (!url || !['airbnb', 'vrbo'].includes(platform)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  if (parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'URL must use HTTPS' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'StayStory/1.0 Calendar Sync' },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) throw new Error(`Could not fetch calendar (${res.status})`)

    const icsContent = await res.text()
    if (!icsContent.includes('BEGIN:VCALENDAR')) {
      throw new Error('This URL does not look like a valid iCal feed. Check that you copied the correct export link.')
    }

    const events = parseIcal(icsContent)

    const column = platform === 'airbnb' ? 'airbnb_ical_url' : 'vrbo_ical_url'
    await supabase.from('profiles').update({ [column]: url }).eq('id', user.id)

    return NextResponse.json({ events, count: events.length })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { platform } = await request.json()
  const column = platform === 'airbnb' ? 'airbnb_ical_url' : 'vrbo_ical_url'
  await supabase.from('profiles').update({ [column]: null }).eq('id', user.id)

  return NextResponse.json({ ok: true })
}
