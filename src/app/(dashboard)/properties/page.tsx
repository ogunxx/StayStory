import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/get-tier'
import { getLaunchAudience } from '@/lib/launch-mode'
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
  // This page is not in the focused navigation, but it is reachable by typing
  // and by finishing an invite. A host who has not been shown a plan anywhere
  // else should not meet one here — the limit is stated, the tier is not sold.
  const focused = (await getLaunchAudience(user.id, tier)) === 'focused'
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
      focused={focused}
    />
  )
}
