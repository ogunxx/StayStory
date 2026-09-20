import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import { getOrCreateFocusedSet } from '@/lib/focused-recommendations'

/**
 * The focused path's three recommendations.
 *
 * The page renders these server-side; this route exists for asking again —
 * a retry after a failure, or an explicit regenerate. Both go through
 * getOrCreateFocusedSet, so "reuse before generating" is decided in one place.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const propertyId = await resolveActivePropertyId(user.id)

  let regenerate = false
  try {
    const body = await request.json()
    regenerate = body?.regenerate === true
  } catch {
    // No body is fine — it means "generate if needed".
  }

  const result = await getOrCreateFocusedSet(user.id, propertyId, { regenerate })

  if (!result.ok) {
    const status = result.reason === 'generation_failed' ? 502 : 409
    return NextResponse.json({ error: result.reason }, { status })
  }

  return NextResponse.json({ ...result.set, reused: result.reused })
}
