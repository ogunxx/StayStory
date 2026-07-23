import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/get-tier'
import { PROPERTY_LIMITS } from '@/lib/config'
import type { SubscriptionTier } from '@/types'

export interface Property {
  id: string
  user_id: string
  name: string
  type: string | null
  description: string | null
  created_at: string
  // True when the current user owns it; false when access is via a co-host seat.
  is_owner?: boolean
}

export interface PropertyMember {
  id: string
  property_id: string
  owner_id: string
  user_id: string | null
  email: string
  role: string
  status: string
  created_at: string
}

export function getPropertyLimit(tier: SubscriptionTier): number {
  return PROPERTY_LIMITS[tier] ?? 1
}

/** Whether this tier can add co-hosts / team members. Portfolio only. */
export function canManageTeam(tier: SubscriptionTier): boolean {
  return getPropertyLimit(tier) > 1
}

/** Properties the user owns, plus any they co-host (via property_members). */
export async function listProperties(): Promise<Property[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: owned } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const { data: memberships } = await supabase
    .from('property_members')
    .select('property_id')
    .eq('user_id', user.id)

  const ownedList: Property[] = (owned ?? []).map((p) => ({ ...p, is_owner: true }))

  const sharedIds = (memberships ?? [])
    .map((m) => m.property_id)
    .filter((id) => !ownedList.some((p) => p.id === id))

  let sharedList: Property[] = []
  if (sharedIds.length > 0) {
    const { data: shared } = await supabase
      .from('properties')
      .select('*')
      .in('id', sharedIds)
    sharedList = (shared ?? []).map((p) => ({ ...p, is_owner: false }))
  }

  return [...ownedList, ...sharedList]
}

export async function countOwnedProperties(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('properties')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count ?? 0
}

/**
 * Create a property for the current user, enforcing the tier's property limit.
 * Returns the created property or an error message.
 */
export async function createProperty(input: {
  name: string
  type?: string | null
  description?: string | null
}): Promise<{ property?: Property; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = input.name?.trim()
  if (!name) return { error: 'Please give your property a name.' }

  const tier = await getUserTier()
  const limit = getPropertyLimit(tier)
  const existing = await countOwnedProperties(user.id)

  if (existing >= limit) {
    return {
      error:
        limit === 1
          ? 'Your plan includes one property. Upgrade to Portfolio to run up to five.'
          : `Your plan includes up to ${limit} properties. You've reached the limit.`,
    }
  }

  const { data, error } = await supabase
    .from('properties')
    .insert({
      user_id: user.id,
      name,
      type: input.type?.trim() || null,
      description: input.description ?? null,
    })
    .select('*')
    .single()

  if (error) return { error: error.message }
  return { property: { ...data, is_owner: true } }
}

export async function listMembers(propertyId: string): Promise<PropertyMember[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('property_members')
    .select('*')
    .eq('property_id', propertyId)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })

  return data ?? []
}

/**
 * Invite a co-host to a property. Portfolio only, owner only.
 * If the invited email already has an account, we link their user_id so RLS
 * grants them read access immediately.
 */
export async function inviteCohost(
  propertyId: string,
  email: string
): Promise<{ member?: PropertyMember; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const tier = await getUserTier()
  if (!canManageTeam(tier)) {
    return { error: 'Co-host access is part of the Portfolio plan.' }
  }

  const cleanEmail = email?.trim().toLowerCase()
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }

  // Confirm the current user owns this property before inviting.
  const { data: property } = await supabase
    .from('properties')
    .select('id, user_id')
    .eq('id', propertyId)
    .eq('user_id', user.id)
    .single()
  if (!property) return { error: 'Property not found.' }

  // Link an existing account if one matches the invited email.
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', cleanEmail)
    .maybeSingle()

  const { data, error } = await supabase
    .from('property_members')
    .insert({
      property_id: propertyId,
      owner_id: user.id,
      email: cleanEmail,
      user_id: existingProfile?.id ?? null,
      status: existingProfile?.id ? 'active' : 'invited',
    })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'That person is already on this property.' }
    return { error: error.message }
  }
  return { member: data }
}

export async function removeMember(memberId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('property_members')
    .delete()
    .eq('id', memberId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }
  return {}
}
