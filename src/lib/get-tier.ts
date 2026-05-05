import { createClient } from '@/lib/supabase/server'
import type { SubscriptionTier } from '@/types'

// Legacy tiers (host, signature, legend) map to legendary rank for backward compat
const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  host: 1,
  signature: 1,
  legend: 1,
  legendary: 1,
}

export async function getUserTier(): Promise<SubscriptionTier> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  return (profile?.tier as SubscriptionTier) ?? 'free'
}

export function hasAccess(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier]
}
