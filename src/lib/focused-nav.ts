import { FOCUSED_FIRST_RUN } from '@/lib/config'

/**
 * The focused path's navigation, and the switch that turns the path on.
 *
 * Deliberately separate from focused-path.ts: that module reads the database
 * through journey-state, so importing it from a client component would pull
 * server-only code into the browser bundle. Same reasoning as
 * compass-fields.ts and journey-sequence.ts — the pure part lives on its own
 * so both sides can use it.
 */
/**
 * The navigation a host sees while they're inside the focused path: the three
 * stages that exist, plus their account.
 *
 * This is hierarchy, not access. Every other route stays exactly where it is
 * and keeps working — a host can type /journey or /generator and land there as
 * always. This only decides what the header offers as an equal choice, so
 * someone who came to walk the path isn't handed twelve alternatives.
 */
export const FOCUSED_NAV: { href: string; label: string }[] = [
  { href: '/start', label: 'Your journey' },
  { href: '/audit', label: 'Experience Audit' },
  { href: '/compass', label: 'Experience Compass' },
  { href: '/start/recommendations', label: 'Recommendations' },
  { href: '/account', label: 'Account' },
]

/** True for any route inside the focused path. */
export function isFocusedRoute(pathname: string): boolean {
  return pathname === '/start' || pathname.startsWith('/start/')
}

/**
 * Whether this host should be guided along the focused path rather than
 * dropped into the full six-tool product.
 *
 * The switch and the qualification live together so there is one answer to
 * the question. With FOCUSED_FIRST_RUN off this returns false for everyone,
 * whatever their state — which is exactly today's behaviour.
 */
export function shouldGuideToFocusedPath(isFirstRun: boolean): boolean {
  return FOCUSED_FIRST_RUN && isFirstRun
}
