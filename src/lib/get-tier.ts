import { createClient } from '@/lib/supabase/server'
import type { SubscriptionTier } from '@/types'

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  host: 1,
  signature: 2,
  legend: 3,
}

export async function getUserTier(): Promise<SubscriptionTier> {
  // TESTING OVERRIDE — revert before launch
  return 'legend' as SubscriptionTier
}

export function hasAccess(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier]
}
