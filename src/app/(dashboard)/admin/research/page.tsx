import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { listResearch, summarise } from '@/lib/host-research-store'
import { ADMIN_STATUSES, TESTING_INTERESTS, type AdminStatus, type TestingInterest } from '@/lib/host-research'
import { AdminNav } from '../admin-nav'
import ResearchInbox from './client'

export const metadata: Metadata = { title: 'Host Research — StayStory Admin' }

/**
 * Host Research — customer discovery from the public homepage.
 *
 * Separate from Feedback on purpose. Feedback is a signed-in host who
 * finished the Starter Playbook telling us whether StayStory helped. This is
 * anyone, including people who have never used it, telling us what they
 * need. The page says so out loud, because two inboxes that look alike get
 * read as one.
 */
export default async function AdminResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const params = await searchParams
  const rawStatus = params.status
  const rawInterest = params.interest

  const status = ADMIN_STATUSES.some((s) => s.value === rawStatus)
    ? (rawStatus as AdminStatus)
    : null
  const interest = TESTING_INTERESTS.some((t) => t.value === rawInterest)
    ? (rawInterest as TestingInterest)
    : null

  // Summary counts come from everything, never the filtered view — a
  // filtered total only tells you what you already filtered for.
  const [all, rows] = await Promise.all([
    listResearch(),
    status || interest ? listResearch({ status, interest }) : Promise.resolve(null),
  ])

  return (
    <div className="flex flex-col gap-6">
      <AdminNav active="/admin/research" />

      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Host Research</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          People answering the customer-discovery questions on the homepage. Most have not used
          StayStory — this is what hosts say they need. For what hosts said{' '}
          <em>after</em> finishing the journey, see Feedback.
        </p>
      </div>

      <ResearchInbox
        rows={rows ?? all}
        summary={summarise(all)}
        activeStatus={status}
        activeInterest={interest}
      />
    </div>
  )
}
