import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getAdminClient, isAdminEmail } from '@/lib/admin'
import { loadAdminSnapshot } from '@/lib/admin-data'
import { journeySnapshot, overviewStats } from '@/lib/admin-overview'
import { OverviewView } from './overview-view'

export const metadata: Metadata = { title: 'Overview — StayStory Admin' }

export default async function AdminOverviewPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  // One read, shared by every number on this page.
  const snapshot = await loadAdminSnapshot()

  const { data: config } = await getAdminClient()
    .from('site_config')
    .select('key, value')
    .in('key', ['airbnb_rating', 'airbnb_review_count'])

  return (
    <OverviewView
      stats={overviewStats(snapshot)}
      journey={journeySnapshot(snapshot)}
      configMap={Object.fromEntries((config ?? []).map((r) => [r.key, r.value]))}
    />
  )
}
