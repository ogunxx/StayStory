/**
 * Host Research — what hosts need, asked before or independently of using
 * StayStory.
 *
 * ┌─ NOT THE SAME THING AS FEEDBACK ───────────────────────────────────────┐
 * │ focused_feedback answers "did StayStory actually help?" and comes from │
 * │ a signed-in host who has finished the Starter Playbook.                │
 * │                                                                        │
 * │ This answers "what do hospitality hosts need?" and comes from an       │
 * │ anonymous visitor on the public homepage who may never have used the   │
 * │ product at all.                                                        │
 * │                                                                        │
 * │ Two questions, two moments, two datasets. They are deliberately not    │
 * │ merged, and nothing here writes to focused_feedback.                   │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * This module is imported by the browser, so it holds only the question
 * definitions, the limits and the pure rules. The insert lives in
 * host-research-store.ts, which is server-only.
 */

export const PROPERTY_TYPES = [
  { value: 'vacation_rental', label: 'Vacation rental / Airbnb' },
  { value: 'cabin_tiny_home', label: 'Cabin or tiny home' },
  { value: 'boutique', label: 'Boutique accommodation' },
  { value: 'bed_and_breakfast', label: 'Bed and breakfast' },
  { value: 'other', label: 'Other' },
  { value: 'preparing', label: "I'm preparing to become a host" },
] as const

export type PropertyType = (typeof PROPERTY_TYPES)[number]['value']

/** The one choice that opens a text field. */
export const PROPERTY_TYPE_OTHER: PropertyType = 'other'

export const TESTING_INTERESTS = [
  { value: 'yes', label: 'Yes' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'not_right_now', label: 'Not right now' },
] as const

export type TestingInterest = (typeof TESTING_INTERESTS)[number]['value']

export const ADMIN_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'follow_up', label: 'Follow up' },
] as const

export type AdminStatus = (typeof ADMIN_STATUSES)[number]['value']

/**
 * Generous but finite. Long enough that nobody with something real to say is
 * cut off mid-thought, short enough that the column cannot be used as free
 * storage.
 */
export const LIMITS = {
  propertyTypeOther: 200,
  biggestChallenge: 4000,
  desiredSupport: 4000,
  name: 200,
  email: 320,
  idempotencyKey: 100,
} as const

export function propertyTypeLabel(value: string): string {
  return PROPERTY_TYPES.find((t) => t.value === value)?.label ?? value
}

export function testingInterestLabel(value: string): string {
  return TESTING_INTERESTS.find((t) => t.value === value)?.label ?? value
}

export function adminStatusLabel(value: string): string {
  return ADMIN_STATUSES.find((s) => s.value === value)?.label ?? value
}

/** A row as Admin reads it. The public never sees this shape. */
export type HostResearchRecord = {
  id: string
  property_type: PropertyType
  property_type_other: string | null
  biggest_challenge: string
  desired_support: string | null
  testing_interest: TestingInterest
  name: string | null
  email: string
  contact_permission: boolean
  submission_source: string
  admin_status: AdminStatus
  created_at: string
  updated_at: string
}

/** Exactly the fields a public submission may carry. Nothing else. */
export type ResearchSubmission = {
  property_type: PropertyType
  property_type_other: string | null
  biggest_challenge: string
  desired_support: string | null
  testing_interest: TestingInterest
  name: string | null
  email: string
  idempotency_key: string
}

/**
 * Deliberately simple. Real address validity is decided by whether a reply
 * arrives, not by a regular expression, and an over-clever pattern mostly
 * turns away people with unusual but valid addresses.
 */
export function isValidEmail(value: string): boolean {
  if (value.length > LIMITS.email) return false
  if (/\s/.test(value)) return false
  const at = value.indexOf('@')
  if (at < 1 || at !== value.lastIndexOf('@')) return false
  const domain = value.slice(at + 1)
  return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.') && domain.length > 2
}

type Validated =
  | { ok: true; value: ResearchSubmission }
  | { ok: false; error: string; field?: string }

/**
 * Server-side validation. The client validates too, for a better experience,
 * but this is the one that counts — the endpoint is public and unauthenticated,
 * so nothing from the request is trusted.
 *
 * Note what this CANNOT return: admin_status, id, created_at, updated_at,
 * contact_permission or submission_source. Those are the server's to set,
 * and a caller who sends them is simply ignored rather than refused — an
 * error would tell a prober which field names exist.
 */
export function validateSubmission(input: unknown): Validated {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }
  const body = input as Record<string, unknown>

  const text = (
    value: unknown,
    limit: number,
    field: string,
    message: string
  ): { ok: true; value: string | null } | { ok: false; error: string; field: string } => {
    if (value === null || value === undefined) return { ok: true, value: null }
    if (typeof value !== 'string') return { ok: false, error: message, field }
    const trimmed = value.trim()
    if (trimmed.length === 0) return { ok: true, value: null }
    if (trimmed.length > limit) {
      return {
        ok: false,
        field,
        error: `That answer is a little long — please keep it under ${limit} characters.`,
      }
    }
    return { ok: true, value: trimmed }
  }

  // 1 — what they host
  const propertyType = body.property_type
  if (!PROPERTY_TYPES.some((t) => t.value === propertyType)) {
    return { ok: false, error: 'Please choose the kind of place you host.', field: 'property_type' }
  }

  const other = text(body.property_type_other, LIMITS.propertyTypeOther, 'property_type_other', 'Invalid answer.')
  if (!other.ok) return other
  // Only meaningful alongside "Other". Dropped rather than refused, so
  // switching the radio after typing does not block the form.
  const propertyTypeOther = propertyType === PROPERTY_TYPE_OTHER ? other.value : null

  // 2 — their biggest challenge. The one open question we require.
  const challenge = text(body.biggest_challenge, LIMITS.biggestChallenge, 'biggest_challenge', 'Invalid answer.')
  if (!challenge.ok) return challenge
  if (!challenge.value) {
    return {
      ok: false,
      field: 'biggest_challenge',
      error: 'Please tell us a little about your biggest challenge.',
    }
  }

  // 3 — what would help
  const support = text(body.desired_support, LIMITS.desiredSupport, 'desired_support', 'Invalid answer.')
  if (!support.ok) return support

  // 4 — would they test it
  const interest = body.testing_interest
  if (!TESTING_INTERESTS.some((t) => t.value === interest)) {
    return { ok: false, error: 'Please let us know if you would like to test StayStory.', field: 'testing_interest' }
  }

  // 5 — name
  const name = text(body.name, LIMITS.name, 'name', 'Invalid name.')
  if (!name.ok) return name

  // 6 — email
  const emailRaw = text(body.email, LIMITS.email, 'email', 'Invalid email address.')
  if (!emailRaw.ok) return emailRaw
  if (!emailRaw.value) {
    return { ok: false, field: 'email', error: 'Please add an email address so we can reply.' }
  }
  const email = emailRaw.value.toLowerCase()
  if (!isValidEmail(email)) {
    return { ok: false, field: 'email', error: 'That email address does not look right.' }
  }

  const key = text(body.idempotency_key, LIMITS.idempotencyKey, 'idempotency_key', 'Invalid request.')
  if (!key.ok) return key
  if (!key.value) return { ok: false, error: 'Something went wrong. Please try again.' }

  return {
    ok: true,
    value: {
      property_type: propertyType as PropertyType,
      property_type_other: propertyTypeOther,
      biggest_challenge: challenge.value,
      desired_support: support.value,
      testing_interest: interest as TestingInterest,
      name: name.value,
      email,
      idempotency_key: key.value,
    },
  }
}

/**
 * Whether to offer the optional fifteen-minute conversation after someone
 * submits.
 *
 * Two conditions, and both matter. Someone who said "not right now" has
 * answered the question already, and asking again is pressure. And a booking
 * button with nowhere to go is worse than no button, so it never renders
 * without a configured destination.
 *
 * Pure and exported so the rule is stated once and can be tested without a
 * browser.
 */
export function shouldOfferConversation(input: {
  testingInterest: TestingInterest
  callUrl: string | null | undefined
}): boolean {
  if (!isUsableCallUrl(input.callUrl)) return false
  return input.testingInterest === 'yes' || input.testingInterest === 'maybe'
}

/**
 * Whether the configured booking link is something we can actually send a
 * person to.
 *
 * A missing variable is the expected state and already handled. This also
 * catches the one that is easier to get wrong: a value that is set but
 * mistyped — a bare domain, a placeholder someone left behind, a `javascript:`
 * string. All of those would render a button that fails after the click,
 * which is the worst moment to fail, because the person has already agreed
 * to talk to us. Hiding the invitation loses a conversation; a broken link
 * loses it too, and looks careless doing it.
 */
export function isUsableCallUrl(value: string | null | undefined): boolean {
  if (!value) return false
  const trimmed = value.trim()
  if (trimmed.length === 0) return false
  try {
    // Only https. An http booking page would hand a stranger's name and
    // email to the network in clear text.
    return new URL(trimmed).protocol === 'https:'
  } catch {
    return false
  }
}
