import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import { createStarterPlaybook } from '@/lib/focused-playbook'

/**
 * Build the Starter Playbook.
 *
 * The only thing in the product that generates one. The page reads, this
 * writes — so visiting or refreshing /start/playbook can never cost a model
 * call, and a playbook only ever appears because a host asked for it.
 *
 * A refresh is the same call: createStarterPlaybook always builds from the
 * current recommendation set and inserts a new row, leaving the previous
 * playbook in place.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const propertyId = await resolveActivePropertyId(user.id)
  const result = await createStarterPlaybook(user.id, propertyId)

  if (!result.ok) {
    // 502 when the model let us down and retrying may work; 409 when the
    // host's own state is what needs to change first.
    const status = result.reason === 'generation_failed' ? 502 : 409
    return NextResponse.json({ error: result.reason }, { status })
  }

  return NextResponse.json(result.playbook)
}
