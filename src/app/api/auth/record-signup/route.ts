import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(request: Request) {
  // When the IP limit is disabled we don't record IPs, so the table stays clean
  // for when the guard is switched back on.
  if (process.env.SIGNUP_IP_LIMIT_ENABLED === 'false') {
    return NextResponse.json({ ok: true })
  }

  const ip = getIP(request)

  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') {
    return NextResponse.json({ ok: true })
  }

  await supabaseAdmin.from('signup_ips').insert({ ip })

  return NextResponse.json({ ok: true })
}
