import { getJourneyState } from '@/lib/journey-state'

/**
 * The focused first-run path: a guidance layer over the existing product, not
 * a second product.
 *
 * It describes five stages a new host moves through, and derives where they
 * are from state StayStory already stores. It runs no queries of its own —
 * everything comes from getJourneyState, which is the same reader the
 * Dashboard uses, so the two can never disagree about a host's progress.
 *
 *   1  Tell us about the stay        → the existing Experience Audit
 *   2  See what we're learning       → the existing Experience Compass
 *   3  Three things you could create → not built yet
 *   4  Your starter playbook         → not built yet
 *   5  Tell us what was useful       → not built yet
 *
 * Stages 3 to 5 are declared here but marked unavailable. Declaring them is
 * the point: the shape of the path is settled, and each one becomes reachable
 * by building it and flipping `available`. Nothing here duplicates the Audit,
 * the Compass, the Generator or the Playbook — stages 1 and 2 link straight
 * at the real tools.
 */

export type FocusedStageId =
  | 'audit'
  | 'compass'
  | 'recommendations'
  | 'starter_playbook'
  | 'feedback'

export type FocusedStageStatus = 'done' | 'active' | 'upcoming'

export type FocusedStage = {
  id: FocusedStageId
  position: number
  /** What the host is being asked to do, in their language. */
  title: string
  summary: string
  status: FocusedStageStatus
  /** Where this stage goes. null while a stage has not been built. */
  href: string | null
  /** False until the stage exists. The path renders it, but doesn't link it. */
  available: boolean
}

export type FocusedPath = {
  stages: FocusedStage[]
  /** The stage the host should do next, or null when the built path is done. */
  active: FocusedStage | null
  /**
   * True when this host has not yet opened the tools beyond Audit and
   * Compass. Derived, not stored — no flag on the user, nothing to migrate.
   */
  isFirstRun: boolean
  /** Passed through so a caller can show the Compass without re-reading it. */
  pendingCount: number
  compassFilled: number
}

/** What the stage derivation depends on — all of it read from stored state. */
export type FocusedProgress = {
  auditDone: boolean
  compassConfirmed: boolean
  blueprintStarted: boolean
  storyStarted: boolean
  playbookBuilt: boolean
}

/**
 * Pure: given what the host has done, produce the five stages and whether
 * they're still in their first run. Separated from the database read so it
 * can be reasoned about and tested on its own.
 */
export function buildFocusedStages(p: FocusedProgress): {
  stages: FocusedStage[]
  isFirstRun: boolean
} {
  const { auditDone, compassConfirmed } = p

  // A host is in their first run until they've gone beyond the first two
  // tools. Nothing is written to decide this — it's read from what exists.
  const isFirstRun = !p.blueprintStarted && !p.storyStarted && !p.playbookBuilt

  const stages: FocusedStage[] = [
    {
      id: 'audit',
      position: 1,
      title: 'Tell us about the stay',
      summary:
        'Walk your property the way a guest would — arrival, light, sound, comfort, the details that carry meaning.',
      status: auditDone ? 'done' : 'active',
      href: '/audit',
      available: true,
    },
    {
      id: 'compass',
      position: 2,
      title: 'See what we’re learning',
      summary:
        'Review what StayStory understood about the experience you’re creating, and shape it until it sounds like you.',
      status: !auditDone ? 'upcoming' : compassConfirmed ? 'done' : 'active',
      href: '/compass',
      available: true,
    },
    {
      id: 'recommendations',
      position: 3,
      title: 'Discover three things you could create',
      summary:
        'Three specific ideas drawn from your own property and the experience you said you want guests to have.',
      status: 'upcoming',
      href: null,
      available: false,
    },
    {
      id: 'starter_playbook',
      position: 4,
      title: 'Leave with a starter playbook',
      summary:
        'What you want guests to feel, what they should remember, and the moments worth designing first — in one place.',
      status: 'upcoming',
      href: null,
      available: false,
    },
    {
      id: 'feedback',
      position: 5,
      title: 'Tell us what was useful',
      summary: 'A couple of questions about what helped and what you’d want next.',
      status: 'upcoming',
      href: null,
      available: false,
    },
  ]

  return { stages, isFirstRun }
}

/** Reads the host's state, then derives the path from it. */
export async function getFocusedPath(
  userId: string,
  propertyId: string | null,
  isLegendary: boolean
): Promise<FocusedPath> {
  const journey = await getJourneyState(userId, propertyId, isLegendary)
  const byId = Object.fromEntries(journey.steps.map((s) => [s.id, s]))

  const { stages, isFirstRun } = buildFocusedStages({
    auditDone: byId.audit?.status === 'completed',
    compassConfirmed: Boolean(journey.compass.confirmed_at),
    blueprintStarted: byId.blueprint?.status !== 'not_started',
    storyStarted: byId.story?.status !== 'not_started',
    playbookBuilt: byId.playbook?.status === 'completed',
  })

  return {
    stages,
    active: stages.find((s) => s.available && s.status === 'active') ?? null,
    isFirstRun,
    pendingCount: journey.pendingCount,
    compassFilled: journey.compassFilled,
  }
}

/**
 * The navigation a host sees while they're on the focused path: the two tools
 * the path actually uses, plus their account.
 *
 * Every other route stays exactly where it is and keeps working — this only
 * decides what the header lists. Nothing is removed, and the full navigation
 * in the dashboard layout is untouched and still the default.
 */
export const FOCUSED_NAV_HREFS = ['/dashboard', '/audit', '/compass', '/account']

export function focusedNav<T extends { href: string }>(items: T[]): T[] {
  return items.filter((item) => FOCUSED_NAV_HREFS.includes(item.href))
}
