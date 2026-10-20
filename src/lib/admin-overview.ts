import {
  furthestJourney,
  journeysForUser,
  type AdminSnapshot,
} from '@/lib/admin-data'

/**
 * The numbers on /admin.
 *
 * All of it is counted from the single snapshot the Users page already
 * loads — no second set of queries, and no analytics events written just to
 * produce this view. If a figure cannot be derived from a record that
 * already exists, it is not shown.
 */

export type OverviewStats = {
  totalUsers: number
  newUsers7d: number
  properties: number
  auditsCompleted: number
  auditsInProgress: number
  recommendations: number
  starterPlaybooks: number
  feedbackTotal: number
  feedbackNew: number
  feedbackFollowUp: number
}

export type JourneyStep = { label: string; users: number }

export function overviewStats(s: AdminSnapshot): OverviewStats {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

  const feedback = [...s.feedback.values()]

  return {
    totalUsers: s.profiles.length,
    newUsers7d: s.profiles.filter((p) => new Date(p.created_at).getTime() >= weekAgo).length,
    properties: s.properties.length,
    // Completed Audits and unfinished drafts are different rows in different
    // tables, so these are counts of distinct property-scoped journeys, not
    // of one table split two ways.
    auditsCompleted: s.auditDone.size,
    auditsInProgress: [...s.auditDrafts.keys()].filter((k) => !s.auditDone.has(k)).length,
    recommendations: s.recommendations.size,
    starterPlaybooks: s.starterPlaybooks.size,
    feedbackTotal: feedback.length,
    feedbackNew: feedback.filter((f) => f.review_status === 'new').length,
    feedbackFollowUp: feedback.filter((f) => f.review_status === 'follow_up').length,
  }
}

/**
 * How far people are getting, counted in PEOPLE rather than rows.
 *
 * Each step counts distinct users who have reached it on at least one
 * property. Counting rows would let one busy host with three properties look
 * like three hosts, which is the opposite of what this is for.
 *
 * Cumulative by nature: someone with a Playbook also has an Audit, so the
 * numbers only ever fall as you go down. That is what makes a drop visible.
 */
export function journeySnapshot(s: AdminSnapshot): JourneyStep[] {
  const users = s.profiles.map((p) => journeysForUser(s, p.id))

  const reached = (test: (j: ReturnType<typeof journeysForUser>[number]) => boolean) =>
    users.filter((js) => js.some(test)).length

  return [
    { label: 'Signed up', users: s.profiles.length },
    { label: 'Audit started', users: reached((j) => j.auditDone || j.auditStep !== null) },
    { label: 'Audit completed', users: reached((j) => j.auditDone) },
    { label: 'Compass confirmed', users: reached((j) => j.compassConfirmed) },
    { label: 'Recommendations generated', users: reached((j) => j.recommendations) },
    { label: 'Starter Playbook created', users: reached((j) => j.starterPlaybook) },
    { label: 'Feedback submitted', users: reached((j) => j.feedback !== null) },
  ]
}

/** One line per user for the Users list, already grouped — no per-row queries. */
export function usersList(s: AdminSnapshot) {
  return s.profiles.map((profile) => {
    const journeys = journeysForUser(s, profile.id)
    const furthest = furthestJourney(journeys)
    const properties = journeys.filter((j) => j.propertyName).map((j) => j.propertyName as string)

    return {
      profile,
      properties,
      furthest,
      journeyCount: journeys.length,
      lastSignIn: s.lastSignIn.get(profile.id) ?? null,
    }
  })
}

export type AdminUserRow = ReturnType<typeof usersList>[number]
