import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import { savePropertyContext, saveTouchpointState } from '@/lib/blueprint'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const property_id = await resolveActivePropertyId(user.id)

  try {
    if (body.field === 'property_context') {
      const blueprint = await savePropertyContext(user.id, property_id, body.value ?? '')
      return NextResponse.json({ blueprint })
    }

    if (body.field === 'touchpoint' && body.touchpointId) {
      const blueprint = await saveTouchpointState(user.id, property_id, body.touchpointId, {
        current: body.current,
      })
      return NextResponse.json({ blueprint })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not save.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
