import { createClient } from '@/lib/supabase/server'
import { getPendingContributions, reviewContribution } from '@/lib/compass'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { contributionId, decision, editedValue } = await request.json()

  if (!contributionId || (decision !== 'accept' && decision !== 'reject')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  try {
    const compass = await reviewContribution({
      userId: user.id,
      contributionId,
      decision,
      editedValue: typeof editedValue === 'string' && editedValue.trim() ? editedValue.trim() : undefined,
    })
    const pending = await getPendingContributions(compass.id)
    return NextResponse.json({ compass, pending })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
