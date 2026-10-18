/**
 * Light spam protection for the public research form.
 *
 * Deliberately small. No CAPTCHA — there is no evidence of abuse yet, and a
 * CAPTCHA on a "tell us about your hosting" form costs real responses from
 * real hosts to prevent a problem we have not had. No external dependency
 * either. If this proves insufficient, the honest next step is to look at
 * what actually arrived and respond to that.
 *
 * Two measures:
 *
 *   • A honeypot field. Hidden from people and from screen readers, so only
 *     something filling every input finds it.
 *   • A per-instance, in-memory count per IP. The signup path uses a
 *     `signup_ips` table because a signup must be countable across
 *     instances; this is a research form, and giving it a table would mean
 *     storing visitors' IP addresses to prevent an inconvenience. The
 *     cheaper, more private option is the right trade here, and its limits
 *     are stated plainly below rather than overclaimed.
 */

/**
 * The hidden input's name. Deliberately plausible — a bot filling "website"
 * is the behaviour we are detecting.
 */
export const HONEYPOT_FIELD = 'website'

/** True when the honeypot was filled, which no person can do. */
export function looksAutomated(body: unknown): boolean {
  if (typeof body !== 'object' || body === null) return false
  const value = (body as Record<string, unknown>)[HONEYPOT_FIELD]
  return typeof value === 'string' && value.trim().length > 0
}

export const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 } as const

/**
 * In memory, so it resets on deploy and is not shared between serverless
 * instances. That is a real limitation and it is fine for what this is: a
 * speed bump against one source submitting repeatedly, not a security
 * boundary. The security boundary is the table's own permissions.
 */
const seen = new Map<string, number[]>()

function ipOf(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

/** Drop timestamps that have aged out, and stop the map growing forever. */
function recent(key: string, now: number): number[] {
  const kept = (seen.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs)
  if (kept.length === 0) seen.delete(key)
  else seen.set(key, kept)
  return kept
}

export function tooManyFrom(request: Request, now = Date.now()): boolean {
  const ip = ipOf(request)
  // Local and unknown addresses are not a meaningful key, and blocking them
  // would break development and anyone behind a proxy we cannot read.
  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') return false
  return recent(ip, now).length >= RATE_LIMIT.max
}

/** Called only after a successful save, so failures do not count against them. */
export function remember(request: Request, now = Date.now()): void {
  const ip = ipOf(request)
  if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') return
  seen.set(ip, [...recent(ip, now), now])
}

/** Test seam. Never called by the application. */
export function __resetGuard(): void {
  seen.clear()
}
