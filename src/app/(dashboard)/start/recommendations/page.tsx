import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import { getOrCreateFocusedSet } from '@/lib/focused-recommendations'
import RecommendationsClient from './recommendations-client'

export const metadata: Metadata = { title: 'Three opportunities — StayStory' }

/**
 * Stage 3 of the focused path.
 *
 * Everything happens on the server: a saved set is read back instantly, and a
 * first visit generates one while loading.tsx streams a placeholder. That
 * keeps the client presentational — no fetch on mount, no effect, and no way
 * for a refresh to race into a second generation.
 */
export default async function RecommendationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const propertyId = await resolveActivePropertyId(user.id)
  const result = await getOrCreateFocusedSet(user.id, propertyId)

  return result.ok ? (
    <RecommendationsClient set={result.set} />
  ) : (
    <RecommendationsClient blocked={result.reason} />
  )
}
