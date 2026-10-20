/**
 * Has this password already appeared in a known data breach?
 *
 * Supabase Auth can do this check at the Auth layer, but only on the Pro plan
 * and above. This project is on the free plan, so the check lives here
 * instead. It closes the same gap — someone choosing a password that is
 * already on the lists attackers try first — without waiting on a plan change.
 *
 * ── The password is never sent anywhere ────────────────────────────────────
 *
 * This uses the k-anonymity model that the Pwned Passwords API is designed
 * for. We hash the password with SHA-1 locally, send only the first five
 * characters of that hash, and receive every known suffix sharing that prefix
 * — hundreds of them. The match is made here, in the browser. The password
 * never leaves the device, the full hash never leaves the device, and the
 * service cannot tell which of the suffixes it returned was the one we cared
 * about.
 *
 * SHA-1 is correct here and not a weakness: it is the index the Pwned
 * Passwords corpus is published under, and nothing is being protected by it.
 * The password is not being stored or transmitted, only looked up.
 *
 * ── It fails open, deliberately ────────────────────────────────────────────
 *
 * Every failure path reports `checked: false` and `pwned: false`. A service
 * outage, a blocked request, an unexpected response, a browser without Web
 * Crypto, a slow network — none of them should stop someone creating an
 * account. This is a guard that helps people choose a better password, not a
 * gate standing between them and the product. Locking a host out of signup to
 * enforce a password preference would be the worse failure by far.
 *
 * ── What this does and does not guarantee ──────────────────────────────────
 *
 * This runs in the browser, before the password is handed to Supabase, so it
 * is a guard on our own form rather than a policy enforced by the Auth
 * service. Someone calling the Supabase Auth API directly could still set a
 * breached password. That is an acceptable trade: the real risk is a host
 * picking a password they already use everywhere, and this catches that. If
 * the project moves to the Pro plan, turn on Supabase's own leaked-password
 * protection as well — that one is enforced server-side and also covers
 * password changes.
 */

/** Where the lookup is published. Only a five-character hash prefix is sent. */
const RANGE_API = 'https://api.pwnedpasswords.com/range'

/**
 * Long enough for a slow connection, short enough that nobody waits on it.
 * On timeout we fail open, so the cost of being wrong here is one unchecked
 * password, not a stalled form.
 */
const TIMEOUT_MS = 3500

export type PwnedResult = {
  /** True only when the password was positively found in the corpus. */
  pwned: boolean
  /**
   * Whether the check actually completed. False means we could not find out —
   * treat it as "no answer", never as "safe".
   */
  checked: boolean
  /** How many times it appears in the corpus, when known. */
  count?: number
}

const UNCHECKED: PwnedResult = { pwned: false, checked: false }

async function sha1Hex(input: string): Promise<string | null> {
  // Web Crypto is unavailable on insecure origins and in older browsers.
  const subtle = globalThis.crypto?.subtle
  if (!subtle) return null

  try {
    const digest = await subtle.digest('SHA-1', new TextEncoder().encode(input))
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  } catch {
    return null
  }
}

/**
 * Parse the range response.
 *
 * Each line is `SUFFIX:COUNT`, the suffix being the remaining 35 hex
 * characters of the SHA-1 and the count how many breaches it appears in.
 *
 * With padding requested, the response is topped up with decoy entries so its
 * size reveals nothing about the prefix. Those decoys carry a count of zero,
 * which is why a zero count is treated as absent rather than as a hit.
 */
export function findSuffix(body: string, suffix: string): number | null {
  for (const line of body.split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue

    if (line.slice(0, colon).trim().toUpperCase() !== suffix) continue

    const count = Number.parseInt(line.slice(colon + 1).trim(), 10)
    if (!Number.isFinite(count) || count <= 0) return null
    return count
  }
  return null
}

export async function checkPwnedPassword(password: string): Promise<PwnedResult> {
  if (!password) return UNCHECKED

  const hash = await sha1Hex(password)
  if (!hash) return UNCHECKED

  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)

  try {
    const response = await fetch(`${RANGE_API}/${prefix}`, {
      // Ask for decoy entries so response size can't narrow down the prefix.
      headers: { 'Add-Padding': 'true' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    })
    if (!response.ok) return UNCHECKED

    const count = findSuffix(await response.text(), suffix)
    return count === null
      ? { pwned: false, checked: true }
      : { pwned: true, checked: true, count }
  } catch {
    return UNCHECKED
  }
}
