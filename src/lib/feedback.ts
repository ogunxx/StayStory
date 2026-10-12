/**
 * The optional closing feedback on the focused journey.
 *
 * Client-safe — no server imports — so the form, the API route's validation
 * and the admin inbox all read the same definitions. The labels a host sees
 * and the labels an admin reads are the same strings, which is the point:
 * nothing is translated twice.
 *
 * Feedback is NOT a fifth product stage. The product ends at the Starter
 * Playbook. This is an invitation afterwards, and skipping it costs the host
 * nothing.
 */

export const USEFULNESS_OPTIONS = [
  { value: 1, label: 'Not useful' },
  { value: 2, label: 'A little useful' },
  { value: 3, label: 'Useful' },
  { value: 4, label: 'Very useful' },
  { value: 5, label: 'Extremely useful' },
] as const

export type Usefulness = (typeof USEFULNESS_OPTIONS)[number]['value']

export const MOST_VALUABLE_OPTIONS = [
  { value: 'audit', label: 'Experience Audit' },
  { value: 'compass', label: 'Experience Compass' },
  { value: 'opportunities', label: 'Personalized Opportunities' },
  { value: 'starter_playbook', label: 'Starter Playbook' },
  { value: 'whole_journey', label: 'The whole journey' },
  { value: 'something_else', label: 'Something else' },
] as const

export type MostValuable = (typeof MOST_VALUABLE_OPTIONS)[number]['value']

/** The one option that opens a text field. */
export const MOST_VALUABLE_OTHER: MostValuable = 'something_else'

export const REVIEW_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'follow_up', label: 'Follow up' },
] as const

export type ReviewStatus = (typeof REVIEW_STATUSES)[number]['value']

/** Matches the CHECK constraints on focused_feedback. Enforced server-side. */
export const LIMITS = {
  mostValuableOther: 500,
  improvement: 4000,
  additional: 4000,
} as const

export type FeedbackRecord = {
  id: string
  user_id: string
  property_id: string | null
  usefulness: Usefulness
  most_valuable: MostValuable | null
  most_valuable_other: string | null
  improvement_feedback: string | null
  additional_feedback: string | null
  open_to_followup: boolean
  review_status: ReviewStatus
  created_at: string
  updated_at: string
}

/** What a host may send. Everything but the rating is optional. */
export type FeedbackSubmission = {
  usefulness: number
  most_valuable?: string | null
  most_valuable_other?: string | null
  improvement_feedback?: string | null
  additional_feedback?: string | null
  open_to_followup?: boolean
}

export function usefulnessLabel(value: number | null | undefined): string {
  return USEFULNESS_OPTIONS.find((o) => o.value === value)?.label ?? '—'
}

export function mostValuableLabel(value: string | null | undefined): string {
  return MOST_VALUABLE_OPTIONS.find((o) => o.value === value)?.label ?? '—'
}

export function reviewStatusLabel(value: string | null | undefined): string {
  return REVIEW_STATUSES.find((o) => o.value === value)?.label ?? 'New'
}

/**
 * Validate and normalise a submission.
 *
 * Server-side, because client validation only protects people who are using
 * the form. Returns the row fields to write, or the first problem found.
 *
 * Empty strings become null rather than being stored as blanks, so "they left
 * it empty" and "they typed and deleted" look the same in the inbox.
 */
export function validateSubmission(
  input: unknown
):
  | { ok: true; value: Required<Omit<FeedbackSubmission, 'most_valuable' | 'most_valuable_other' | 'improvement_feedback' | 'additional_feedback'>> & {
      most_valuable: MostValuable | null
      most_valuable_other: string | null
      improvement_feedback: string | null
      additional_feedback: string | null
    } }
  | { ok: false; error: string } {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: 'Invalid submission.' }
  }
  const body = input as Record<string, unknown>

  const usefulness = Number(body.usefulness)
  if (!Number.isInteger(usefulness) || usefulness < 1 || usefulness > 5) {
    return { ok: false, error: 'Please choose how useful the experience was.' }
  }

  const text = (value: unknown, limit: number, field: string) => {
    if (value === null || value === undefined) return { ok: true as const, value: null }
    if (typeof value !== 'string') return { ok: false as const, error: `Invalid ${field}.` }
    const trimmed = value.trim()
    if (trimmed.length === 0) return { ok: true as const, value: null }
    if (trimmed.length > limit) {
      return { ok: false as const, error: `That answer is a little long — please keep it under ${limit} characters.` }
    }
    return { ok: true as const, value: trimmed }
  }

  let mostValuable: MostValuable | null = null
  if (body.most_valuable !== null && body.most_valuable !== undefined && body.most_valuable !== '') {
    const match = MOST_VALUABLE_OPTIONS.find((o) => o.value === body.most_valuable)
    if (!match) return { ok: false, error: 'Invalid answer.' }
    mostValuable = match.value
  }

  const other = text(body.most_valuable_other, LIMITS.mostValuableOther, 'answer')
  if (!other.ok) return { ok: false, error: other.error }
  const improvement = text(body.improvement_feedback, LIMITS.improvement, 'answer')
  if (!improvement.ok) return { ok: false, error: improvement.error }
  const additional = text(body.additional_feedback, LIMITS.additional, 'answer')
  if (!additional.ok) return { ok: false, error: additional.error }

  return {
    ok: true,
    value: {
      usefulness,
      // Only meaningful alongside "Something else" — dropped otherwise so a
      // stale draft can't be stored against an option it no longer explains.
      most_valuable: mostValuable,
      most_valuable_other: mostValuable === MOST_VALUABLE_OTHER ? other.value : null,
      improvement_feedback: improvement.value,
      additional_feedback: additional.value,
      open_to_followup: body.open_to_followup === true,
    },
  }
}
