import { createClient } from '@/lib/supabase/server'
import { getOrCreateCompass, getPendingContributions } from '@/lib/compass'
import { COMPASS_FIELD_LABELS } from '@/lib/compass-fields'
import { decideNextStep, type NextStep, type StepId, type StepStatus } from '@/lib/journey-sequence'
import type { CompassField, ExperienceCompass } from '@/types'

export { STATUS_LABEL } from '@/lib/journey-sequence'
export type { NextStep, StepId, StepStatus } from '@/lib/journey-sequence'

/**
 * What the host has actually done so far, and what they should do next.
 *
 * This reads existing state only — audits, the compass row and its pending
 * contributions, the blueprint's touchpoints, suggestions, guest stories and
 * playbooks. It introduces no progress table, no completion flags and no
 * second copy of anything. If a state can't be determined from data that's
 * already stored, it is reported as unknown rather than guessed.
 *
 * The order below is the StayStory sequence and the single place it's
 * defined:
 *
 *   Audit → Compass → Blueprint → Generator → Story Builder → Playbook
 *   ( share → define → design → deliver )
 */

export type JourneyStep = {
  id: StepId
  /** 01–06, shown to the host. Position in this array is the source of truth. */
  position: number
  name: string
  href: string
  /** One line on what this step is for. */
  description: string
  status: StepStatus
  /** True when the host's current plan limits this step rather than blocking it. */
  limitedOnFreePlan: boolean
}

/** A populated Compass field, for the dashboard preview. */
export type CompassHighlight = { field: CompassField; label: string; value: string }

export type JourneyState = {
  steps: JourneyStep[]
  next: NextStep
  compass: ExperienceCompass
  pendingCount: number
  highlights: CompassHighlight[]
  /** How many of the eight Compass fields have been answered. */
  compassFilled: number
  compassTotal: number
}

/**
 * The fields worth showing on a dashboard, most telling first. These are the
 * real columns on experience_compass — nothing here is invented.
 */
const HIGHLIGHT_PREFERENCE: CompassField[] = [
  'hospitality_promise',
  'signature_memory',
  'purpose',
  'story',
  'wonder',
  'story_theyll_tell',
]

const ALL_COMPASS_FIELDS: CompassField[] = [
  'wonder',
  'purpose',
  'story',
  'transformation_arrive',
  'transformation_leave',
  'hospitality_promise',
  'signature_memory',
  'story_theyll_tell',
]

function filled(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

export async function getJourneyState(
  userId: string,
  propertyId: string | null,
  isLegendary: boolean
): Promise<JourneyState> {
  const supabase = await createClient()

  const compass = await getOrCreateCompass(userId, propertyId)
  const pending = await getPendingContributions(compass.id)

  // Counts, scoped to the active property where the table carries
  // property_id. playbooks has no property_id column, so it is necessarily
  // user-scoped — don't read more precision into it than the schema supports.
  const countFor = (table: string) => {
    const q = supabase.from(table).select('id', { count: 'exact', head: true }).eq('user_id', userId)
    return propertyId ? q.eq('property_id', propertyId) : q.is('property_id', null)
  }
  const blueprintQuery = supabase
    .from('experience_blueprint')
    .select('touchpoints')
    .eq('user_id', userId)
    .limit(1)

  const [audits, suggestions, stories, playbooks, blueprint] = await Promise.all([
    countFor('audits'),
    countFor('suggestions'),
    countFor('guest_stories'),
    supabase.from('playbooks').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    propertyId
      ? blueprintQuery.eq('property_id', propertyId)
      : blueprintQuery.is('property_id', null),
  ])

  const auditCount = audits.count ?? 0
  const suggestionCount = suggestions.count ?? 0
  const storyCount = stories.count ?? 0
  const playbookCount = playbooks.count ?? 0

  const touchpoints = (blueprint.data?.[0]?.touchpoints ?? {}) as Record<string, unknown>
  const blueprintTouchpoints = Object.keys(touchpoints).length

  const compassFilled = ALL_COMPASS_FIELDS.filter((f) => filled(compass[f])).length
  const pendingCount = pending.length

  const highlights: CompassHighlight[] = HIGHLIGHT_PREFERENCE.filter((f) => filled(compass[f]))
    .slice(0, 3)
    .map((field) => ({
      field,
      label: COMPASS_FIELD_LABELS[field],
      value: (compass[field] as string).trim(),
    }))

  // ── Per-step status, from the counts above ──────────────────────────────
  const compassStatus: StepStatus =
    pendingCount > 0
      ? 'ready_to_review'
      : compass.confirmed_at
        ? 'confirmed'
        : compassFilled > 0
          ? 'in_progress'
          : 'not_started'

  const steps: JourneyStep[] = [
    {
      id: 'audit',
      position: 1,
      name: 'Experience Audit',
      href: '/audit',
      description: 'See the stay as your guests do — arrival, light, sound, smell, friction.',
      status: auditCount > 0 ? 'completed' : 'not_started',
      limitedOnFreePlan: false,
    },
    {
      id: 'compass',
      position: 2,
      name: 'Experience Compass',
      href: '/compass',
      description: 'What you want guests to feel, remember and carry home.',
      status: compassStatus,
      limitedOnFreePlan: false,
    },
    {
      id: 'blueprint',
      position: 3,
      name: 'Experience Blueprint',
      href: '/journey',
      description: 'Map the journey and decide where those intentions show up.',
      status: blueprintTouchpoints > 0 ? 'in_progress' : 'not_started',
      limitedOnFreePlan: !isLegendary,
    },
    {
      id: 'generator',
      position: 4,
      name: 'Generator',
      href: '/generator',
      description: 'Create the moments, details and touches for what you mapped.',
      status: suggestionCount > 0 ? 'in_progress' : 'not_started',
      limitedOnFreePlan: !isLegendary,
    },
    {
      id: 'story',
      position: 5,
      name: 'Story Builder',
      href: '/story',
      description: 'Put the experience into words guests understand and repeat.',
      status: storyCount > 0 ? 'in_progress' : 'not_started',
      limitedOnFreePlan: !isLegendary,
    },
    {
      id: 'playbook',
      position: 6,
      name: 'Guest Journey Playbook',
      href: '/legend',
      description: 'Everything you have designed, in one place you can work from.',
      status: playbookCount > 0 ? 'completed' : 'not_started',
      limitedOnFreePlan: !isLegendary,
    },
  ]

  const next = decideNextStep({
    auditCount,
    pendingCount,
    compassFilled,
    compassConfirmed: Boolean(compass.confirmed_at),
    blueprintTouchpoints,
    suggestionCount,
    storyCount,
    playbookCount,
  })

  return {
    steps,
    next,
    compass,
    pendingCount,
    highlights,
    compassFilled,
    compassTotal: ALL_COMPASS_FIELDS.length,
  }
}
