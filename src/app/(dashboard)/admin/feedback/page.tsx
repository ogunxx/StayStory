import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { listFeedback } from '@/lib/admin-feedback'
import { REVIEW_STATUSES, type ReviewStatus } from '@/lib/feedback'
import FeedbackInbox from './client'

export const metadata: Metadata = { title: 'Feedback — StayStory Admin' }

/**
 * The feedback inbox.
 *
 * Deliberately small: a list, a detail view and a three-state status. The
 * broader Admin dashboard is a separate piece of work, and this exists so
 * early feedback does not sit unread in a table.
 */
export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const raw = (await searchParams).status
  const status = REVIEW_STATUSES.some((s) => s.value === raw) ? (raw as ReviewStatus) : undefined

  const { rows, summary } = await listFeedback({ status })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin" className="text-sm text-primary underline underline-offset-4">
          ← Members
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-foreground">Feedback</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Optional closing feedback from the focused journey, newest first.
        </p>
      </div>

      <FeedbackInbox rows={rows} summary={summary} activeStatus={status ?? null} />
    </div>
  )
}
