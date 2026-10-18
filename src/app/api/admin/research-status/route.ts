import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { setAdminStatus } from '@/lib/host-research-store'
import { ADMIN_STATUSES, type AdminStatus } from '@/lib/host-research'

/**
 * Move a research response between New, Reviewed and Follow up.
 *
 * The same gate as every other admin route: the allowlist check happens here,
 * before anything touches the service-role client. A visitor could not reach
 * admin_status by any other route either — host_research grants nothing to
 * anon or authenticated, and the public endpoint builds its insert field by
 * field without ever reading that name from the request.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { id?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const valid = ADMIN_STATUSES.some((s) => s.value === body.status)
  if (!body.id || !valid) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const ok = await setAdminStatus(body.id, body.status as AdminStatus)
  if (!ok) return NextResponse.json({ error: 'Could not update status' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
