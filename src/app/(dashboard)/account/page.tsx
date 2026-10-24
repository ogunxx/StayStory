import { createClient } from '@/lib/supabase/server'
import AccountClient from './client'
import { getUserTier } from '@/lib/get-tier'
import { getLaunchAudience } from '@/lib/launch-mode'
import { isPortalNotice, PORTAL_NOTICES } from '@/lib/billing-portal'

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>
}) {
  const { billing } = await searchParams
  // Set by the portal route when it could not send someone to Stripe. Read
  // through isPortalNotice so only our own keys can reach the page — a query
  // string is not a place to take display text from.
  const billingNotice = isPortalNotice(billing) ? PORTAL_NOTICES[billing] : null

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

  const focused = (await getLaunchAudience(user!.id, await getUserTier())) === 'focused'

  return (
    <AccountClient
      focused={focused}
      billingNotice={billingNotice}
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
