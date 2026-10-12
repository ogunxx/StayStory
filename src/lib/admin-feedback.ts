import { getAdminClient } from '@/lib/admin'
import type { FeedbackRecord, ReviewStatus } from '@/lib/feedback'

/**
 * Reading feedback as an admin.
 *
 * Every function here uses the service-role client, which bypasses RLS — so
 * every caller must already have passed isAdminEmail(). That check lives in
 * the route and the page, never here, matching how the rest of Admin works.
 *
 * Server-only: importing this into a client component would be a build error
 * before it could ever be a leak, because getAdminClient reads
 * SUPABASE_SERVICE_ROLE_KEY, which has no NEXT_PUBLIC prefix.
 */

export type FeedbackWithContext = FeedbackRecord & {
  user_name: string | null
  user_email: string | null
  property_name: string | null
}

/** Attach the name, email and property each submission belongs to. */
async function decorate(rows: FeedbackRecord[]): Promise<FeedbackWithContext[]> {
  if (rows.length === 0) return []
  const admin = getAdminClient()

  const userIds = [...new Set(rows.map((r) => r.user_id))]
  const propertyIds = [...new Set(rows.map((r) => r.property_id).filter(Boolean))] as string[]

  const [{ data: profiles }, { data: properties }] = await Promise.all([
    admin.from('profiles').select('id, full_name, email').in('id', userIds),
    propertyIds.length
      ? admin.from('properties').select('id, name').in('id', propertyIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ])

  const byUser = new Map((profiles ?? []).map((p) => [p.id, p]))
  const byProperty = new Map((properties ?? []).map((p) => [p.id, p]))

  return rows.map((row) => ({
    ...row,
    user_name: byUser.get(row.user_id)?.full_name ?? null,
    user_email: byUser.get(row.user_id)?.email ?? null,
    property_name: row.property_id ? (byProperty.get(row.property_id)?.name ?? null) : null,
  }))
}

export type FeedbackSummary = {
  total: number
  newCount: number
  followUpCount: number
  /** Null when there is nothing to average. */
  averageUsefulness: number | null
}

export async function listFeedback(options: { status?: ReviewStatus } = {}): Promise<{
  rows: FeedbackWithContext[]
  summary: FeedbackSummary
}> {
  const admin = getAdminClient()

  // Everything, once. The volume here is early-access feedback, so filtering
  // and counting in memory is cheaper and simpler than four round trips —
  // and it keeps the summary consistent with the list being shown.
  const { data } = await admin
    .from('focused_feedback')
    .select('*')
    .order('created_at', { ascending: false })

  const all = (data ?? []) as FeedbackRecord[]

  const summary: FeedbackSummary = {
    total: all.length,
    newCount: all.filter((r) => r.review_status === 'new').length,
    followUpCount: all.filter((r) => r.review_status === 'follow_up').length,
    averageUsefulness: all.length
      ? Math.round((all.reduce((sum, r) => sum + r.usefulness, 0) / all.length) * 10) / 10
      : null,
  }

  const filtered = options.status ? all.filter((r) => r.review_status === options.status) : all
  return { rows: await decorate(filtered), summary }
}

export async function getFeedback(id: string): Promise<FeedbackWithContext | null> {
  const admin = getAdminClient()
  const { data } = await admin.from('focused_feedback').select('*').eq('id', id).maybeSingle()
  if (!data) return null
  return (await decorate([data as FeedbackRecord]))[0] ?? null
}

/**
 * What this host had done when they wrote their feedback.
 *
 * Context for reading a comment, not analytics — "the Compass felt vague" is
 * a different remark from someone who confirmed theirs than from someone who
 * never did. Derived from rows that already exist, scoped to the same
 * property the feedback is attached to.
 */
export type JourneyContext = {
  auditCompleted: boolean
  compassConfirmed: boolean
  recommendationsGenerated: boolean
  starterPlaybookCreated: boolean
}

export async function getJourneyContext(
  userId: string,
  propertyId: string | null
): Promise<JourneyContext> {
  const admin = getAdminClient()

  const scoped = (table: string, columns = 'id') => {
    const q = admin.from(table).select(columns, { count: 'exact', head: true }).eq('user_id', userId)
    return propertyId ? q.eq('property_id', propertyId) : q.is('property_id', null)
  }
  const kindCount = (kind: string) => {
    const q = admin
      .from('suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('content->>kind', kind)
    return propertyId ? q.eq('property_id', propertyId) : q.is('property_id', null)
  }

  const compassQuery = admin
    .from('experience_compass')
    .select('confirmed_at')
    .eq('user_id', userId)
    .limit(1)

  const [audits, compass, recommendations, playbook] = await Promise.all([
    scoped('audits'),
    propertyId ? compassQuery.eq('property_id', propertyId) : compassQuery.is('property_id', null),
    kindCount('focused_recommendations'),
    kindCount('focused_starter_playbook'),
  ])

  return {
    auditCompleted: (audits.count ?? 0) > 0,
    compassConfirmed: Boolean(compass.data?.[0]?.confirmed_at),
    recommendationsGenerated: (recommendations.count ?? 0) > 0,
    starterPlaybookCreated: (playbook.count ?? 0) > 0,
  }
}

export async function setReviewStatus(id: string, status: ReviewStatus): Promise<boolean> {
  const admin = getAdminClient()
  const { error } = await admin
    .from('focused_feedback')
    .update({ review_status: status })
    .eq('id', id)

  if (error) {
    console.error('[admin] could not set feedback status:', error)
    return false
  }
  return true
}
