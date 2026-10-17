import { getJourneyState } from '@/lib/journey-state'
import { AUDIT_STEPS } from '@/lib/audit-questions'

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
 *   3  Three things you could create → the Generator, fed Audit + Compass
 *   4  Your Starter Playbook         → /start/playbook
 *   5  Help shape StayStory          → /start/feedback (optional)
 *
 * Stage 5 is deliberately not a product stage. The journey StayStory promises
 * is the first four; the fifth is an invitation afterwards, marked `optional`
 * so it is never the host's "next step" and skipping it never reads as
 * unfinished work. Nothing here duplicates the Audit,
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
  /**
   * True for a stage that sits outside the product journey.
   *
   * Only Feedback. The product is four stages and ends at the Starter
   * Playbook; this stage is an invitation afterwards. Marking it rather than
   * appending it is what stops a host who skips it being shown as unfinished,
   * and keeps it out of `active`.
   */
  optional?: boolean
  /**
   * Overrides the generic Done/Next/Later wording where a stage has something
   * more useful to say — "Recommendations ready" tells a returning host their
   * three are waiting, which "Done" does not.
   */
  statusLabel?: string
  /**
   * Overrides the generic button wording while this stage is active.
   *
   * Only the Audit uses it so far, to say "Continue" rather than "Start" to
   * a host who already began one. It lives on the stage so /start renders
   * what the rule decided instead of re-deciding it from the position.
   */
  ctaLabel?: string
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
  /**
   * How far an unfinished Audit got, 0-based, or null. Already resolved
   * against a completed Audit upstream, so this is null whenever auditDone
   * is true — a leftover draft row never contradicts a finished Audit.
   */
  auditDraftStep?: number | null
  compassConfirmed: boolean
  recommendationsReady: boolean
  /** Those recommendations predate an Audit or Compass change. */
  recommendationsStale: boolean
  /** A Starter Playbook exists for this property. */
  starterPlaybookReady: boolean
  /** It was built from an older set of recommendations. */
  starterPlaybookStale: boolean
  /** The host has already left feedback for this property. */
  feedbackGiven: boolean
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

  // Completed beats draft. journey-state already nulls the step when an
  // Audit exists; the guard is repeated here so buildFocusedStages stays
  // correct for any caller, including the tests that call it directly.
  const draftStep = auditDone ? null : (p.auditDraftStep ?? null)
  const inProgress = draftStep !== null

  // A host is in their first run until they've gone beyond the first two
  // tools. Nothing is written to decide this — it's read from what exists.
  // getJourneyState derives the same thing from the same three counts; this
  // stays here so buildFocusedStages remains pure and testable on its own.
  const isFirstRun = !p.blueprintStarted && !p.storyStarted && !p.playbookBuilt

  const stages: FocusedStage[] = [
    {
      id: 'audit',
      position: 1,
      title: 'Tell us about the stay',
      summary: inProgress
        // Says plainly that the work is still there. A host who left halfway
        // and came back needs to know nothing was lost before they need to
        // know what the Audit is for.
        ? `Your answers are saved. Pick up at step ${draftStep! + 1} of ${AUDIT_STEPS.length}.`
        : 'Walk your property the way a guest would — arrival, light, sound, comfort, the details that carry meaning.',
      status: auditDone ? 'done' : 'active',
      href: '/audit',
      available: true,
      statusLabel: inProgress ? 'Audit in progress' : undefined,
      ctaLabel: inProgress ? 'Continue your Audit' : undefined,
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
      status: !auditDone || !compassConfirmed
        ? 'upcoming'
        : p.recommendationsReady
          ? 'done'
          : 'active',
      href: '/start/recommendations',
      available: true,
      statusLabel: p.recommendationsReady ? 'Recommendations ready' : undefined,
    },
    {
      id: 'starter_playbook',
      position: 4,
      // Built. Reachable, and it states its own condition rather than being a
      // generic "Later" — a host should be able to tell at a glance whether
      // theirs is ready, waiting to be made, or out of step with Stage 3.
      title: 'Leave with a Starter Playbook',
      summary:
        'Your three opportunities turned into a practical starting plan — what you are designing, ways to begin, and one first step for each.',
      status: !p.recommendationsReady
        ? 'upcoming'
        : p.starterPlaybookReady && !p.starterPlaybookStale
          ? 'done'
          : 'active',
      href: '/start/playbook',
      available: true,
      statusLabel: !p.recommendationsReady
        ? undefined
        : p.starterPlaybookStale
          ? 'Update available'
          : p.starterPlaybookReady
            ? 'Starter Playbook ready'
            : undefined,
    },
    {
      id: 'feedback',
      position: 5,
      // Outside the product journey — see `optional`. Offered once the host
      // has their Playbook and therefore has something to react to; asking
      // before that would be asking them to review something they have not
      // finished.
      title: 'Help shape StayStory',
      summary:
        'What worked, what didn’t, and what you’d want next. About a minute, and entirely up to you.',
      status: p.feedbackGiven ? 'done' : p.starterPlaybookReady ? 'active' : 'upcoming',
      href: '/start/feedback',
      available: true,
      optional: true,
      statusLabel: p.feedbackGiven
        ? 'Feedback shared'
        : p.starterPlaybookReady
          ? 'Optional'
          : undefined,
    },
  ]

  return { stages, isFirstRun }
}

/**
 * The stage the host should do next, or null when the journey is finished.
 *
 * Pure, and exported, because the rule has one subtlety worth stating in one
 * place: optional stages are skipped. Feedback must never present itself as
 * the next step, or a host who declines it would be shown unfinished work for
 * ever. This used to be an inline find() inside getFocusedPath, where it
 * could not be tested without a database.
 */
export function activeStage(stages: FocusedStage[]): FocusedStage | null {
  return stages.find((s) => s.available && !s.optional && s.status === 'active') ?? null
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
    auditDraftStep: journey.auditDraftStep,
    compassConfirmed: Boolean(journey.compass.confirmed_at),
    recommendationsReady: journey.focusedSetExists,
    recommendationsStale: journey.focusedStale,
    starterPlaybookReady: journey.starterPlaybookExists,
    starterPlaybookStale: journey.starterPlaybookStale,
    feedbackGiven: journey.feedbackGiven,
    blueprintStarted: byId.blueprint?.status !== 'not_started',
    storyStarted: byId.story?.status !== 'not_started',
    playbookBuilt: byId.playbook?.status === 'completed',
  })

  return {
    stages,
    active: activeStage(stages),
    isFirstRun,
    pendingCount: journey.pendingCount,
    compassFilled: journey.compassFilled,
  }
}

// The navigation and the FOCUSED_FIRST_RUN switch live in focused-nav.ts,
// which has no server imports and so can be used from client components.
export { FOCUSED_NAV, isFocusedRoute, shouldGuideToFocusedPath } from '@/lib/focused-nav'
