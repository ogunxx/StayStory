import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import { getMyFeedback } from '@/lib/focused-feedback'
import FeedbackClient from './feedback-client'

export const metadata: Metadata = { title: 'Help shape StayStory' }

/**
 * Optional feedback, after the four-step journey.
 *
 * Deliberately reachable but not required, and not in the focused nav — a
 * host arrives here from the end of their Starter Playbook or the closing
 * section of /start, having already got what they came for.
 *
 * Existing answers are read on the server so a returning host edits what they
 * said rather than starting again.
 */
export default async function FeedbackPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const propertyId = await resolveActivePropertyId(user.id)
  const existing = await getMyFeedback(user.id, propertyId)

  return <FeedbackClient existing={existing} />
}
