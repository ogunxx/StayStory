import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { setReviewStatus } from '@/lib/admin-feedback'
import { REVIEW_STATUSES, type ReviewStatus } from '@/lib/feedback'

/**
 * Move a feedback submission between New, Reviewed and Follow up.
 *
 * Same gate as every other admin route: the allowlist check happens here,
 * before anything touches the service-role client. A host cannot reach this
 * even with a valid session, and could not set the column directly either —
 * review_status is not in their column grants.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { id?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const valid = REVIEW_STATUSES.some((s) => s.value === body.status)
  if (!body.id || !valid) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const ok = await setReviewStatus(body.id, body.status as ReviewStatus)
  if (!ok) return NextResponse.json({ error: 'Could not update status' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
