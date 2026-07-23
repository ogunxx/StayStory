import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { isAdminEmail } from '@/lib/admin'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

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
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: profiles }, { data: audits }, { data: suggestions }, { data: stories }, { data: journeys }, { data: playbooks }] =
    await Promise.all([
      admin.from('profiles').select('id, email, full_name, tier, created_at').order('created_at', { ascending: false }),
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold">Members</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View-only — {profiles?.length ?? 0} accounts. For support and account health, not for making changes here.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Tier</th>
              <th className="pb-2 pr-4">Signed up</th>
              <th className="pb-2 pr-4">Audits</th>
              <th className="pb-2 pr-4">Moments</th>
              <th className="pb-2 pr-4">Stories</th>
              <th className="pb-2 pr-4">Blueprints</th>
              <th className="pb-2 pr-4">Playbooks</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="py-2 pr-4 text-foreground">{p.email}</td>
                <td className="py-2 pr-4 text-muted-foreground">{p.full_name ?? '—'}</td>
                <td className="py-2 pr-4 text-muted-foreground">{p.tier}</td>
                <td className="py-2 pr-4 text-muted-foreground">{formatDate(p.created_at)}</td>
                <td className="py-2 pr-4 text-muted-foreground">{auditCounts.get(p.id) ?? 0}</td>
                <td className="py-2 pr-4 text-muted-foreground">{momentCounts.get(p.id) ?? 0}</td>
                <td className="py-2 pr-4 text-muted-foreground">{storyCounts.get(p.id) ?? 0}</td>
                <td className="py-2 pr-4 text-muted-foreground">{blueprintCounts.get(p.id) ?? 0}</td>
                <td className="py-2 pr-4 text-muted-foreground">{playbookCounts.get(p.id) ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
