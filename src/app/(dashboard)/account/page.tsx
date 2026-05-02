import { createClient } from '@/lib/supabase/server'
import AccountClient from './client'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: suggestions }, { data: stories }, { data: audits }] =
    await Promise.all([
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
        .limit(15),
      supabase
        .from('guest_stories')
        .select('id, created_at, narrative')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('audits')
        .select('id, created_at, score')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

  return (
    <AccountClient
      email={user!.email ?? ''}
      profile={profile ?? { tier: 'free', stripe_customer_id: null, created_at: null }}
      suggestions={suggestions ?? []}
      stories={stories ?? []}
      audits={audits ?? []}
    />
  )
}
