import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserTier, hasAccess } from '@/lib/get-tier'
import { TierGate } from '@/components/tier-gate'
import StoryClient from './client'

export default async function StoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tier = await getUserTier()
  if (hasAccess(tier, 'legendary')) {
    return <StoryClient />
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('story_trial_used')
    .eq('id', user.id)
    .single()

  if (!profile?.story_trial_used) {
    await supabase
      .from('profiles')
      .update({ story_trial_used: true })
      .eq('id', user.id)
    return <StoryClient isTrial />
  }

  return <TierGate requiredTier="legendary" featureName="Guest Story Builder" />
}
