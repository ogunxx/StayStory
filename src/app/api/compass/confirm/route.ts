import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import { confirmCompass, getPendingContributions } from '@/lib/compass'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const property_id = await resolveActivePropertyId(user.id)
    const compass = await confirmCompass(user.id, property_id)
    const pending = await getPendingContributions(compass.id)
    return NextResponse.json({ compass, pending })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
