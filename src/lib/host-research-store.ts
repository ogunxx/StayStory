import 'server-only'
import { getAdminClient } from '@/lib/admin'
import {
  ADMIN_STATUSES,
  type AdminStatus,
  type HostResearchRecord,
  type ResearchSubmission,
  type TestingInterest,
} from '@/lib/host-research'

/**
 * Reading and writing host_research. Server only — `server-only` above makes
 * importing this from a client component a build error rather than a leak.
 *
 * host_research has RLS enabled and no policies, and anon and authenticated
 * hold no privileges on it at all. Nothing can touch it except the
 * service-role client, which lives here and in the admin helpers. The browser
 * never gets a key and never needs one: the public form POSTs to a route
 * which validates, then calls insertResearch below.
 */

export type InsertResult =
  | { ok: true; id: string; duplicate: boolean }
  | { ok: false; error: string }

/**
 * Insert one validated submission.
 *
 * The row is built field by field from the validated value — the request body
 * is never spread in. That is what makes it impossible for a caller to set
 * admin_status, id or the timestamps, whatever they put in the JSON: those
 * names simply have nowhere to land.
 *
 * Idempotency is the unique index on idempotency_key doing the work. A double
 * click, a retry or a flaky network replays the same key; Postgres raises
 * 23505; we look the existing row up and report success with duplicate: true.
 * The caller cannot tell the difference, which is the point — a retry should
 * look like it worked, because it did.
 */
export async function insertResearch(submission: ResearchSubmission): Promise<InsertResult> {
  const admin = getAdminClient()

  const row = {
    property_type: submission.property_type,
    property_type_other: submission.property_type_other,
    biggest_challenge: submission.biggest_challenge,
    desired_support: submission.desired_support,
    testing_interest: submission.testing_interest,
    name: submission.name,
    email: submission.email,
    idempotency_key: submission.idempotency_key,
    // Set here, never accepted from the request. Submitting the form IS the
    // permission — the form says so above the button — and this records it
    // rather than inferring it later.
    contact_permission: true,
    submission_source: 'homepage',
    // admin_status, id, created_at and updated_at are left to their column
    // defaults. Deliberately absent from this object.
  }

  const { data, error } = await admin.from('host_research').insert(row).select('id').single()

  if (!error && data) return { ok: true, id: data.id, duplicate: false }

  // 23505 — unique_violation on idempotency_key. The same interaction,
  // arriving twice.
  if (error?.code === '23505') {
    const { data: existing } = await admin
      .from('host_research')
      .select('id')
      .eq('idempotency_key', submission.idempotency_key)
      .maybeSingle()

    if (existing) return { ok: true, id: existing.id, duplicate: true }
  }

  console.error('[host-research] insert failed:', error?.message)
  return { ok: false, error: 'We could not save that just now. Please try again.' }
}

export type ResearchFilters = {
  status?: AdminStatus | null
  interest?: TestingInterest | null
}

export type ResearchSummary = {
  total: number
  newCount: number
  interestedCount: number
}

/** The inbox, newest first. Admin-gated by the caller before this runs. */
export async function listResearch(filters: ResearchFilters = {}): Promise<HostResearchRecord[]> {
  const admin = getAdminClient()
  let query = admin.from('host_research').select('*').order('created_at', { ascending: false })

  if (filters.status) query = query.eq('admin_status', filters.status)
  if (filters.interest) query = query.eq('testing_interest', filters.interest)

  const { data, error } = await query
  if (error) {
    console.error('[host-research] list failed:', error.message)
    return []
  }
  return (data ?? []) as HostResearchRecord[]
}

/**
 * Counts over everything, never over the filtered view — a filtered list
 * showing filtered totals tells you nothing you did not already know.
 */
export function summarise(rows: HostResearchRecord[]): ResearchSummary {
  return {
    total: rows.length,
    newCount: rows.filter((r) => r.admin_status === 'new').length,
    // The number this form mainly exists to produce.
    interestedCount: rows.filter(
      (r) => r.testing_interest === 'yes' || r.testing_interest === 'maybe'
    ).length,
  }
}

export async function getResearch(id: string): Promise<HostResearchRecord | null> {
  const admin = getAdminClient()
  const { data } = await admin.from('host_research').select('*').eq('id', id).maybeSingle()
  return (data as HostResearchRecord) ?? null
}

export async function setAdminStatus(id: string, status: AdminStatus): Promise<boolean> {
  if (!ADMIN_STATUSES.some((s) => s.value === status)) return false

  const admin = getAdminClient()
  const { error } = await admin
    .from('host_research')
    .update({ admin_status: status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) console.error('[host-research] status update failed:', error.message)
  return !error
}

/** Just the counts, for the Admin overview. One query, no rows pulled back. */
export async function researchCounts(): Promise<{ total: number; interested: number }> {
  const admin = getAdminClient()
  const [total, interested] = await Promise.all([
    admin.from('host_research').select('id', { count: 'exact', head: true }),
    admin
      .from('host_research')
      .select('id', { count: 'exact', head: true })
      .in('testing_interest', ['yes', 'maybe']),
  ])
  return { total: total.count ?? 0, interested: interested.count ?? 0 }
}
