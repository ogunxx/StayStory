import { createClient } from '@/lib/supabase/server'
import { getAdminClient, isAdminEmail, logAdminAction } from '@/lib/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { targetUserId, action } = await request.json()

  if (!targetUserId || (action !== 'suspend' && action !== 'reactivate')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (action === 'suspend' && targetUserId === user.id) {
    return NextResponse.json({ error: "You can't suspend your own account." }, { status: 400 })
  }

  const admin = getAdminClient()
  const suspended_at = action === 'suspend' ? new Date().toISOString() : null

  const { data: updated, error } = await admin
    .from('profiles')
    .update({ suspended_at })
    .eq('id', targetUserId)
    .select('id, email, full_name, tier, created_at, suspended_at')
    .single()

  if (error || !updated) {
    return NextResponse.json({ error: error?.message ?? 'Could not update account status.' }, { status: 500 })
  }

  await logAdminAction({
    adminUserId: user.id,
    targetUserId,
    action,
    previousValue: action === 'suspend' ? 'active' : 'suspended',
    newValue: action === 'suspend' ? 'suspended' : 'active',
  })

  return NextResponse.json({ member: updated })
}
