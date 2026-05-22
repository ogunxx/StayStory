import { createClient } from '@/lib/supabase/server'
import AccountClient from './client'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    profileResult,
    suggestionsResult,
    storiesResult,
    auditsResult,
    journeysResult,
    playbooksResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('tier, stripe_customer_id, created_at')
      .eq('id', user!.id)
      .single(),
    supabase
      .from('suggestions')
      .select('id, created_at, content')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('guest_stories')
      .select('id, created_at, narrative, host_perspective, social_caption, pre_arrival_message, listing_improvements')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('audits')
      .select('id, created_at, score, responses')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('journey_sessions')
      .select('id, created_at, touchpoint, ideas')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('playbooks')
      .select('id, created_at, property_name, executive_summary')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return (
    <AccountClient
      email={user!.email ?? ''}
      profile={profileResult.data ?? { tier: 'free', stripe_customer_id: null, created_at: null }}
      suggestions={suggestionsResult.data ?? []}
      stories={storiesResult.data ?? []}
      audits={auditsResult.data ?? []}
      journeys={journeysResult.data ?? []}
      playbooks={playbooksResult.data ?? []}
    />
  )
}
