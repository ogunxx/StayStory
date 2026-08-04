import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getAdminClient, isAdminEmail } from '@/lib/admin'
import AdminMembersTable from './client'

function countByUser(rows: { user_id: string | null }[] | null): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows ?? []) {
    if (!row.user_id) continue
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1)
  }
  return counts
}

export default async function AdminPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  // Reading every member's profile and usage requires bypassing RLS (which
  // otherwise scopes each table to auth.uid() = user_id) — only reachable
  // after the admin allowlist check above, never exposed to the browser.
  const admin = getAdminClient()

  const [{ data: profiles }, { data: audits }, { data: suggestions }, { data: stories }, { data: journeys }, { data: playbooks }] =
    await Promise.all([
      admin.from('profiles').select('id, email, full_name, tier, created_at, suspended_at').order('created_at', { ascending: false }),
      admin.from('audits').select('user_id'),
      admin.from('suggestions').select('user_id'),
      admin.from('guest_stories').select('user_id'),
      admin.from('journey_sessions').select('user_id'),
      admin.from('playbooks').select('user_id'),
    ])

  const auditCounts = countByUser(audits)
  const momentCounts = countByUser(suggestions)
  const storyCounts = countByUser(stories)
  const blueprintCounts = countByUser(journeys)
  const playbookCounts = countByUser(playbooks)

  const members = (profiles ?? []).map((p) => ({
    ...p,
    counts: {
      audits: auditCounts.get(p.id) ?? 0,
      moments: momentCounts.get(p.id) ?? 0,
      stories: storyCounts.get(p.id) ?? 0,
      blueprints: blueprintCounts.get(p.id) ?? 0,
      playbooks: playbookCounts.get(p.id) ?? 0,
    },
  }))

  return <AdminMembersTable initialMembers={members} currentAdminEmail={user.email ?? ''} />
}
