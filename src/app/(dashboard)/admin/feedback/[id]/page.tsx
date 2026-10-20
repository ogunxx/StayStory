import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { getFeedback, getJourneyContext } from '@/lib/admin-feedback'
import FeedbackDetail from './detail'

export const metadata: Metadata = { title: 'Feedback — StayStory Admin' }

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const { id } = await params
  const row = await getFeedback(id)
  if (!row) notFound()

  // Context for reading the comment, not analytics — scoped to the same
  // property the feedback is attached to.
  const journey = await getJourneyContext(row.user_id, row.property_id)

  return <FeedbackDetail row={row} journey={journey} />
}
