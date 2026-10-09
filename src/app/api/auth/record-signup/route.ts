import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { signupIpLimitEnabled } from '@/lib/signup-guard'

function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(request: Request) {
  // Nothing is recorded where the guard doesn't apply, so preview and local
  // signups never leave rows that would block a real person later.
  if (!signupIpLimitEnabled()) {
    return NextResponse.json({ ok: true })
  }

  const ip = getIP(request)

  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') {
    return NextResponse.json({ ok: true })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabaseAdmin.from('signup_ips').insert({ ip })

  return NextResponse.json({ ok: true })
}
