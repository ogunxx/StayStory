/**
 * Microsoft Clarity — the one place the project ID and the "should this run"
 * decision live.
 *
 * Clarity gives us behaviour, not identity: page views, clicks, scroll depth,
 * dead clicks, rage clicks, recordings and heatmaps. Nothing here sends an
 * email, a name, a Supabase user id, a property name or a billing detail, and
 * there is deliberately no call to Clarity's `identify` API anywhere in the
 * codebase. If that ever changes it is a privacy decision, not a wiring one,
 * and it belongs in the Privacy page before it belongs in code.
 */

/**
 * The Clarity project. One constant, read in exactly one place, so a second
 * installation cannot quietly appear beside the first — two copies would
 * double every recording and split the heatmaps.
 */
export const CLARITY_PROJECT_ID = 'z38zp21q3g'

/**
 * Whether to load Clarity at all.
 *
 * `VERCEL_ENV` rather than `NODE_ENV`, which is the whole point of this
 * function: a Vercel PREVIEW build also reports NODE_ENV as 'production', so
 * gating on it would file every preview deploy and every automated run into
 * the same project as real host sessions — with no way to separate them
 * afterwards. VERCEL_ENV is 'production' | 'preview' | 'development' and is
 * absent locally, so local work is excluded by having no value at all.
 */
export function shouldLoadClarity(vercelEnv: string | undefined | null): boolean {
  return vercelEnv === 'production'
}

/**
 * The attribute that masks an element and everything inside it.
 *
 * Clarity's own masking mode is a dashboard setting, and its default
 * ("Balanced") already hides form input values. This attribute is stronger in
 * the one way that matters: Microsoft documents it as overriding whatever the
 * dashboard says, so a well-meant toggle months from now cannot start
 * recording someone's password. That is why the sensitive regions carry it in
 * code rather than relying on the default.
 *
 * Masking replaces TEXT in recordings. Clicks, scroll depth, rage clicks,
 * dead clicks and heatmaps are unaffected — we still learn how a page is
 * used, we just don't read what was typed into it.
 *
 * Capital "True" is what Microsoft's documentation specifies.
 */
export const CLARITY_MASK = 'True'
