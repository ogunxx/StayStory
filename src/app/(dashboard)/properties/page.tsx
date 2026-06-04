import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/get-tier'
import {
  listProperties,
  listMembers,
  getPropertyLimit,
  canManageTeam,
  type PropertyMember,
} from '@/lib/properties'
import PropertiesClient from './client'

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tier = await getUserTier()
  const limit = getPropertyLimit(tier)
  const teamEnabled = canManageTeam(tier)
  const properties = await listProperties()

  // Load co-host members for each property the user owns (Portfolio only).
  const membersByProperty: Record<string, PropertyMember[]> = {}
  if (teamEnabled) {
    for (const p of properties) {
      if (p.is_owner) {
        membersByProperty[p.id] = await listMembers(p.id)
      }
    }
  }

  return (
    <PropertiesClient
      properties={properties}
      membersByProperty={membersByProperty}
      limit={limit}
      teamEnabled={teamEnabled}
    />
  )
}
