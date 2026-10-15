import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { loadAdminSnapshot } from '@/lib/admin-data'
import { usersList } from '@/lib/admin-overview'
import { AdminNav } from '../admin-nav'
import UsersClient from './client'

export const metadata: Metadata = { title: 'Users — StayStory Admin' }

/**
 * The operational user list.
 *
 * Everything comes from one batched snapshot — see admin-data.ts — so the
 * number of queries does not grow with the number of users. Search,
 * filtering and paging happen on the already-loaded list, which is right at
 * this size and would move server-side before it isn't.
 */
export default async function AdminUsersPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const snapshot = await loadAdminSnapshot()

  return (
    <div className="flex flex-col gap-6">
      <AdminNav active="/admin/users" />
      <UsersClient
        rows={usersList(snapshot).map((r) => ({
          id: r.profile.id,
          email: r.profile.email,
          name: r.profile.full_name,
          tier: r.profile.tier,
          joined: r.profile.created_at,
          suspended: Boolean(r.profile.suspended_at),
          properties: r.properties,
          stage: r.furthest.stage,
          stageLabel: r.furthest.stageLabel,
          auditStep: r.furthest.auditStep,
          journeyCount: r.journeyCount,
          lastSignIn: r.lastSignIn,
          hasFeedback: r.furthest.feedback !== null,
        }))}
        adminEmail={user.email ?? ''}
      />
    </div>
  )
}
