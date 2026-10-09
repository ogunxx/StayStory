import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { signupIpLimitEnabled } from '@/lib/signup-guard'

function getIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(request: Request) {
  // Production only — see signup-guard.ts. On a preview the second person in
  // a household would otherwise be refused before reaching the form.
  if (!signupIpLimitEnabled()) {
    return NextResponse.json({ allowed: true })
  }

  const ip = getIP(request)

  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') {
    return NextResponse.json({ allowed: true })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { count } = await supabaseAdmin
    .from('signup_ips')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { allowed: false, error: 'An account already exists from this device or network.' },
      { status: 429 }
    )
  }

  return NextResponse.json({ allowed: true })
}
