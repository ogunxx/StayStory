import { createClient } from '@/lib/supabase/server'
import { getAdminClient, isAdminEmail, logAdminAction } from '@/lib/admin'
import { NextResponse } from 'next/server'
import type { SubscriptionTier } from '@/types'

const ASSIGNABLE_TIERS: SubscriptionTier[] = ['free', 'legendary', 'portfolio']

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { targetUserId, newTier } = await request.json()

  if (!targetUserId || !ASSIGNABLE_TIERS.includes(newTier)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const admin = getAdminClient()

  const { data: before } = await admin.from('profiles').select('tier').eq('id', targetUserId).single()

  const { data: updated, error } = await admin
    .from('profiles')
    .update({ tier: newTier })
    .eq('id', targetUserId)
    .select('id, email, full_name, tier, created_at, suspended_at')
    .single()

  if (error || !updated) {
    return NextResponse.json({ error: error?.message ?? 'Could not update tier.' }, { status: 500 })
  }

  await logAdminAction({
    adminUserId: user.id,
    targetUserId,
    action: 'tier_change',
    previousValue: before?.tier ?? null,
    newValue: newTier,
  })

  return NextResponse.json({ member: updated })
}
