import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserTier, hasAccess } from '@/lib/get-tier'
import { TierGate } from '@/components/tier-gate'
import JourneyClient from './client'

export default async function JourneyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tier = await getUserTier()
  if (hasAccess(tier, 'host')) {
    return <JourneyClient />
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('journey_trial_used')
    .eq('id', user.id)
    .single()

  if (!profile?.journey_trial_used) {
    await supabase
      .from('profiles')
      .update({ journey_trial_used: true })
      .eq('id', user.id)
    return <JourneyClient isTrial />
  }

  return <TierGate requiredTier="host" featureName="Journey Map" />
}
