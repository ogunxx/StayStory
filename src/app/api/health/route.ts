import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Is StayStory actually working?
 *
 * Exists for two reasons, and the first is the less obvious one.
 *
 * ┌─ KEEPING THE DATABASE AWAKE ───────────────────────────────────────────┐
 * │ A free Supabase project pauses after about a week with no activity,    │
 * │ and a paused project takes the whole site down — not just the          │
 * │ dashboard. The homepage, signup, the research form: all of it needs    │
 * │ Postgres.                                                              │
 * │                                                                        │
 * │ A daily cron (see vercel.json) hits this route, which reads one row    │
 * │ from the database. That read is the thing that counts as activity. A   │
 * │ week of silence never arrives.                                         │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * Why not just load the homepage on a timer? Because it would prove
 * nothing. The homepage reads site_config too, but wraps it in a try/catch
 * and falls back to hardcoded figures — so it returns a cheerful 200 whether
 * Postgres answered or was never reached at all. A keep-alive you cannot
 * tell has failed is not a keep-alive.
 *
 * This route does the opposite: if the read fails it says so, loudly, with a
 * 503 that shows up red in Vercel's cron log.
 *
 * Second reason: it is a genuine health check. Point an uptime monitor at it
 * and you learn whether the database is reachable, not merely whether a web
 * server is listening.
 */

/**
 * The single most important line in this file.
 *
 * A GET route handler can be treated as static and served from cache. A
 * cached health check is worse than none: the cron would get a perfect 200
 * every day without a single byte reaching Postgres, and the project would
 * pause anyway — silently, while the dashboard claimed everything was fine.
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  // Vercel signs cron requests with CRON_SECRET when that variable is set.
  // Honoured when present and skipped when not, so the cron works the moment
  // it is deployed and can be locked down later without a code change.
  const secret = process.env.CRON_SECRET
  if (secret) {
    const header = request.headers.get('authorization')
    const fromCron = header === `Bearer ${secret}`
    // A browser or an uptime monitor can still ask; only the authenticated
    // caller is trusted to be the cron. Both reach the database either way,
    // which is the point — this check is about honesty in the response, not
    // about keeping people out of a route that returns two booleans.
    if (!fromCron && request.headers.get('user-agent')?.includes('vercel-cron')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  const startedAt = Date.now()

  try {
    const supabase = await createClient()

    // One row from the smallest table the public site already reads. Cheap,
    // and it exercises the same path a real visitor's request takes — so if
    // RLS or the keys ever broke for ordinary traffic, this notices.
    const { error } = await supabase.from('site_config').select('key').limit(1)

    if (error) {
      console.error('[health] database read failed:', error.message)
      return NextResponse.json(
        {
          ok: false,
          database: 'unreachable',
          // The message, not the connection details.
          error: error.message,
          checkedAt: new Date().toISOString(),
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        database: 'reachable',
        ms: Date.now() - startedAt,
        checkedAt: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('[health] check threw:', err)
    return NextResponse.json(
      {
        ok: false,
        database: 'unreachable',
        error: err instanceof Error ? err.message : 'Unknown error',
        checkedAt: new Date().toISOString(),
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
