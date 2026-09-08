/**
 * The one definition of how a call to action looks on the marketing site.
 *
 * Before this existed, a primary button was `rounded-lg` in some places,
 * `rounded-xl` in others and `rounded-full` on the homepage's closing CTA, at
 * three different heights. Same action, three shapes. Everything below now
 * imports from here, so the treatment can't drift again and changing it once
 * changes it everywhere.
 *
 * Two scales, deliberately:
 *
 *   • HERO   — the larger pair, for the opening statement of a page.
 *   • BODY   — the standard pair, for every CTA inside or closing a page.
 *
 * Colour is left to the caller where the surface changes (the closing CTA
 * sits on a dark panel and inverts), so these carry shape, size and focus
 * behaviour only.
 */

const BASE =
  'inline-flex items-center justify-center font-medium transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2'

/** Page hero, filled. */
export const ctaHeroPrimary = `${BASE} h-12 rounded-xl px-7 text-base bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-primary`

/** Page hero, outlined. */
export const ctaHeroSecondary = `${BASE} h-12 rounded-xl px-7 text-base border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-primary`

/** Anywhere in the body of a page, filled. */
export const ctaPrimary = `${BASE} h-11 rounded-lg px-6 text-sm bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-primary`

/** Anywhere in the body of a page, outlined. */
export const ctaSecondary = `${BASE} h-11 rounded-lg px-6 text-sm border border-border bg-transparent text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-primary`

/** On the dark closing panel: filled, inverted. */
export const ctaOnDarkPrimary = `${BASE} h-11 rounded-lg px-6 text-sm bg-background text-foreground hover:opacity-90 focus-visible:outline-background`

/** On the dark closing panel: outlined, inverted. */
export const ctaOnDarkSecondary = `${BASE} h-11 rounded-lg px-6 text-sm border border-background/35 text-background transition-colors hover:bg-background/10 focus-visible:outline-background`

/** The compact CTA in the header. */
export const ctaCompact = `${BASE} h-9 rounded-lg px-4 text-sm bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-primary`

/** A quiet text link, used for secondary journeys between pages. */
export const ctaTextLink =
  'rounded-sm text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
