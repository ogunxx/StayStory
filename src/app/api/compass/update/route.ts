import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import { getPendingContributions, updateCompassField } from '@/lib/compass'
import { COMPASS_FIELDS } from '@/lib/compass-fields'
import { NextResponse } from 'next/server'
import type { CompassField } from '@/types'

const VALID_FIELDS = new Set<CompassField>(COMPASS_FIELDS.map((f) => f.field))

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { field, value } = await request.json()

  if (!VALID_FIELDS.has(field) || typeof value !== 'string' || !value.trim()) {
    return NextResponse.json({ error: 'Invalid field or value' }, { status: 400 })
  }

  try {
    const property_id = await resolveActivePropertyId(user.id)
    const compass = await updateCompassField({ userId: user.id, propertyId: property_id, field, value: value.trim() })
    const pending = await getPendingContributions(compass.id)
    return NextResponse.json({ compass, pending })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
