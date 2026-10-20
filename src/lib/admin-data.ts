import { getAdminClient } from '@/lib/admin'
import {
  FOCUSED_RECOMMENDATIONS_KIND,
  FOCUSED_STARTER_PLAYBOOK_KIND,
} from '@/lib/focused-kinds'
import type { SubscriptionTier } from '@/types'

/**
 * The data behind Admin v1.
 *
 * Every function here uses the service-role client, so every caller must
 * already have passed isAdminEmail(). That check stays in the pages and
 * routes, as it does everywhere else in Admin.
 *
 * ── Why everything is fetched in bulk ─────────────────────────────────────
 *
 * The obvious way to build a user list is to loop over users and ask about
 * each one, which is one query per user per stage — forty round trips for ten
 * users, and unusable well before a hundred. Instead each table is read once,
 * whole, and grouped in memory. The number of queries is fixed no matter how
 * many users there are.
 *
 * That trades round trips for memory, which is the right trade at this size
 * and stops being so somewhere in the thousands. The columns selected are
 * deliberately narrow for that reason — never `select('*')` on suggestions,
 * whose `content` holds entire playbooks.
 *
 * ── Property scoping ──────────────────────────────────────────────────────
 *
 * Every journey fact is keyed by `${user_id}:${property_id}`, so one
 * property's progress can never be read as another's. The known /legend bug
 * is exactly this mistake — playbooks counted per user despite having a
 * property_id — so the deeper-activity query here scopes by both and the
 * broken helper in journey-state is not used.
 */

/** Rows keyed by user, then by property (null property becomes ''). */
export function scopeKey(userId: string, propertyId: string | null): string {
  return `${userId}:${propertyId ?? ''}`
}

export type AdminProfile = {
  id: string
  email: string | null
  full_name: string | null
  tier: SubscriptionTier
  created_at: string
  suspended_at: string | null
}

export type AdminProperty = { id: string; user_id: string; name: string; type: string | null }

/** Everything the list and the overview are derived from, read once. */
export type AdminSnapshot = {
  profiles: AdminProfile[]
  properties: AdminProperty[]
  /** Scope keys that have a completed Audit. */
  auditDone: Set<string>
  /** Scope keys with an unfinished draft, and how far it got. */
  auditDrafts: Map<string, { stepIndex: number; updatedAt: string }>
  /** Scope keys whose Compass is confirmed. */
  compassConfirmed: Set<string>
  /** Scope keys whose Compass row exists but is not confirmed. */
  compassStarted: Set<string>
  recommendations: Set<string>
  starterPlaybooks: Set<string>
  /** Scope key → the feedback row id, so Admin can link straight to it. */
  feedback: Map<string, { id: string; usefulness: number; review_status: string }>
  /** Last sign-in per user, from Supabase Auth. Empty if unavailable. */
  lastSignIn: Map<string, string>
}

export async function loadAdminSnapshot(): Promise<AdminSnapshot> {
  const admin = getAdminClient()

  const [
    profiles,
    properties,
    audits,
    drafts,
    compasses,
    focused,
    feedback,
  ] = await Promise.all([
    admin
      .from('profiles')
      .select('id, email, full_name, tier, created_at, suspended_at')
      .order('created_at', { ascending: false }),
    admin.from('properties').select('id, user_id, name, type'),
    admin.from('audits').select('user_id, property_id'),
    admin.from('audit_drafts').select('user_id, property_id, step_index, updated_at'),
    admin.from('experience_compass').select('user_id, property_id, confirmed_at'),
    // Narrow on purpose: `content` holds whole recommendation sets and
    // playbooks, and none of it is needed to know a row exists.
    admin.from('suggestions').select('user_id, property_id, kind:content->>kind'),
    admin.from('focused_feedback').select('id, user_id, property_id, usefulness, review_status'),
  ])

  const auditDone = new Set<string>()
  for (const r of audits.data ?? []) auditDone.add(scopeKey(r.user_id, r.property_id))

  const auditDrafts = new Map<string, { stepIndex: number; updatedAt: string }>()
  for (const r of drafts.data ?? []) {
    auditDrafts.set(scopeKey(r.user_id, r.property_id), {
      stepIndex: r.step_index ?? 0,
      updatedAt: r.updated_at,
    })
  }

  const compassConfirmed = new Set<string>()
  const compassStarted = new Set<string>()
  for (const r of compasses.data ?? []) {
    const key = scopeKey(r.user_id, r.property_id)
    if (r.confirmed_at) compassConfirmed.add(key)
    else compassStarted.add(key)
  }

  const recommendations = new Set<string>()
  const starterPlaybooks = new Set<string>()
  for (const r of (focused.data ?? []) as { user_id: string; property_id: string | null; kind: string | null }[]) {
    const key = scopeKey(r.user_id, r.property_id)
    if (r.kind === FOCUSED_RECOMMENDATIONS_KIND) recommendations.add(key)
    else if (r.kind === FOCUSED_STARTER_PLAYBOOK_KIND) starterPlaybooks.add(key)
  }

  const feedbackMap = new Map<string, { id: string; usefulness: number; review_status: string }>()
  for (const r of feedback.data ?? []) {
    feedbackMap.set(scopeKey(r.user_id, r.property_id), {
      id: r.id,
      usefulness: r.usefulness,
      review_status: r.review_status,
    })
  }

  return {
    profiles: (profiles.data ?? []) as AdminProfile[],
    properties: (properties.data ?? []) as AdminProperty[],
    auditDone,
    auditDrafts,
    compassConfirmed,
    compassStarted,
    recommendations,
    starterPlaybooks,
    feedback: feedbackMap,
    lastSignIn: await loadLastSignIn(),
  }
}

/**
 * Last sign-in per user, from Supabase Auth rather than anything we store.
 *
 * It is a real timestamp Auth already keeps, so nothing new is tracked to
 * produce it. It lives in auth.users, which PostgREST does not expose, so it
 * comes through the Admin API instead.
 *
 * Degrades to empty rather than failing the page: a missing "last seen"
 * column is a far smaller problem than an Admin area that will not load.
 */
async function loadLastSignIn(): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  try {
    const admin = getAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (error) throw error
    for (const u of data.users) {
      if (u.last_sign_in_at) map.set(u.id, u.last_sign_in_at)
    }
  } catch (err) {
    console.error('[admin] could not read last sign-in:', err)
  }
  return map
}

/* ── Journey status ───────────────────────────────────────────────────────
 *
 * One readable state per property, taken from the furthest point reached.
 * Ordered, so the precedence is the array itself rather than a chain of ifs
 * that could disagree with the labels.
 */

export const JOURNEY_STAGES = [
  { id: 'feedback', label: 'Feedback shared' },
  { id: 'playbook', label: 'Starter Playbook ready' },
  { id: 'recommendations', label: 'Recommendations ready' },
  { id: 'compass_confirmed', label: 'Compass confirmed' },
  { id: 'audit_done', label: 'Audit completed' },
  { id: 'audit_draft', label: 'Audit in progress' },
  { id: 'none', label: 'Not started' },
] as const

export type JourneyStageId = (typeof JOURNEY_STAGES)[number]['id']

export type PropertyJourney = {
  propertyId: string | null
  propertyName: string | null
  propertyType: string | null
  stage: JourneyStageId
  stageLabel: string
  /** Present only while an Audit draft is unfinished. */
  auditStep: number | null
  auditDone: boolean
  compassConfirmed: boolean
  compassStarted: boolean
  recommendations: boolean
  starterPlaybook: boolean
  feedback: { id: string; usefulness: number; review_status: string } | null
}

export function journeyFor(
  snapshot: AdminSnapshot,
  userId: string,
  property: { id: string; name: string; type: string | null } | null
): PropertyJourney {
  const key = scopeKey(userId, property?.id ?? null)
  const draft = snapshot.auditDrafts.get(key)
  const feedback = snapshot.feedback.get(key) ?? null

  const facts = {
    feedback: Boolean(feedback),
    playbook: snapshot.starterPlaybooks.has(key),
    recommendations: snapshot.recommendations.has(key),
    compass_confirmed: snapshot.compassConfirmed.has(key),
    audit_done: snapshot.auditDone.has(key),
    audit_draft: Boolean(draft),
    none: true,
  } as const

  const stage = JOURNEY_STAGES.find((s) => facts[s.id])!

  return {
    propertyId: property?.id ?? null,
    propertyName: property?.name ?? null,
    propertyType: property?.type ?? null,
    stage: stage.id,
    stageLabel: stage.label,
    // Only meaningful while the Audit is unfinished — a completed Audit
    // leaves its draft behind, and showing "Step 3" beside "Completed" would
    // read as a contradiction.
    auditStep: draft && !snapshot.auditDone.has(key) ? draft.stepIndex : null,
    auditDone: snapshot.auditDone.has(key),
    compassConfirmed: snapshot.compassConfirmed.has(key),
    compassStarted: snapshot.compassStarted.has(key),
    recommendations: snapshot.recommendations.has(key),
    starterPlaybook: snapshot.starterPlaybooks.has(key),
    feedback,
  }
}

/** Every journey for a user: one per property, plus their unassigned work. */
export function journeysForUser(snapshot: AdminSnapshot, userId: string): PropertyJourney[] {
  const owned = snapshot.properties.filter((p) => p.user_id === userId)
  const journeys = owned.map((p) => journeyFor(snapshot, userId, p))

  // Work done before any property existed is stored against a null
  // property_id. Surfaced rather than hidden, so nobody looks "Not started"
  // when they have in fact completed an Audit.
  const unassigned = journeyFor(snapshot, userId, null)
  if (unassigned.stage !== 'none') journeys.push(unassigned)

  return journeys.length > 0 ? journeys : [journeyFor(snapshot, userId, null)]
}

/** The furthest stage this user has reached on any one property. */
export function furthestJourney(journeys: PropertyJourney[]): PropertyJourney {
  const rank = (s: JourneyStageId) => JOURNEY_STAGES.findIndex((x) => x.id === s)
  return journeys.reduce((best, j) => (rank(j.stage) < rank(best.stage) ? j : best), journeys[0])
}
