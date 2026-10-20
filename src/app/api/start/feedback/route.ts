import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import { saveMyFeedback } from '@/lib/focused-feedback'

/**
 * Save the host's optional closing feedback.
 *
 * Validation is server-side (see validateSubmission) because client checks
 * only protect people using the form. The write uses the user-scoped client,
 * so RLS and the column grants apply on top — a host cannot reach another
 * host's row, and cannot set review_status.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 })
  }

  const propertyId = await resolveActivePropertyId(user.id)
  const result = await saveMyFeedback(user.id, propertyId, body)

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json({ ok: true })
}
