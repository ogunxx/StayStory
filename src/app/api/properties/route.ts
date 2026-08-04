import { NextResponse } from 'next/server'
import {
  createProperty,
  inviteCohost,
  removeMember,
  updateProperty,
} from '@/lib/properties'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const action = body.action as string

    if (action === 'create') {
      const { property, error } = await createProperty({
        name: body.name,
        type: body.type,
        description: body.description,
      })
      if (error) return NextResponse.json({ error }, { status: 400 })
      return NextResponse.json({ property })
    }

    if (action === 'update') {
      const { property, error } = await updateProperty(body.propertyId, {
        name: body.name,
        type: body.type,
        description: body.description,
      })
      if (error) return NextResponse.json({ error }, { status: 400 })
      return NextResponse.json({ property })
    }

    if (action === 'invite') {
      const { member, error } = await inviteCohost(body.propertyId, body.email)
      if (error) return NextResponse.json({ error }, { status: 400 })
      return NextResponse.json({ member })
    }

    if (action === 'remove') {
      const { error } = await removeMember(body.memberId)
      if (error) return NextResponse.json({ error }, { status: 400 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[api/properties]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
