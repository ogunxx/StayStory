/**
 * Whether the one-account-per-IP guard applies to this request.
 *
 * The guard stops one person opening many free accounts from the same
 * connection. That is worth having in production and actively unhelpful
 * anywhere else: on a preview build, the second person to try signing up from
 * a household or an office is refused before they reach the form, and it
 * looks like the product is broken rather than defended.
 *
 * So it is decided by where the code is running, not by remembering to set a
 * variable:
 *
 *   production → on
 *   preview    → off
 *   local dev  → off
 *
 * VERCEL_ENV is set by Vercel to 'production', 'preview' or 'development',
 * and is absent when running locally. Treating anything that is not
 * 'production' as off means a preview can never accidentally be guarded, and
 * — more importantly — production can never accidentally be left open,
 * including when this branch is merged.
 *
 * SIGNUP_IP_LIMIT_ENABLED still overrides both ways, so production can be
 * opened briefly ('false') or a preview locked down ('true') without a deploy.
 */
export function signupIpLimitEnabled(): boolean {
  const override = process.env.SIGNUP_IP_LIMIT_ENABLED
  if (override === 'false') return false
  if (override === 'true') return true

  return process.env.VERCEL_ENV === 'production'
}
