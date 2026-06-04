import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserTier, hasAccess } from '@/lib/get-tier'
import JourneyClient from './client'

export default async function JourneyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tier = await getUserTier()
  const isPaid = hasAccess(tier, 'legendary')

  // Everyone can build & edit their full Blueprint. We only meter idea
  // generation for free accounts, so count how many they've already used.
  let generationsUsed = 0
  if (!isPaid) {
    const { count } = await supabase
      .from('journey_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    generationsUsed = count ?? 0
  }

  return <JourneyClient isPaid={isPaid} generationsUsed={generationsUsed} />
}
