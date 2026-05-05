import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserTier, hasAccess } from '@/lib/get-tier'
import { TierGate } from '@/components/tier-gate'
import LegendClient from './client'

export default async function LegendPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tier = await getUserTier()
  if (hasAccess(tier, 'legendary')) {
    return <LegendClient userEmail={user.email} />
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('legend_trial_used')
    .eq('id', user.id)
    .single()

  if (!profile?.legend_trial_used) {
    await supabase
      .from('profiles')
      .update({ legend_trial_used: true })
      .eq('id', user.id)
    return <LegendClient isTrial />
  }

  return <TierGate requiredTier="legendary" featureName="Guest Journey Playbook" />
}
