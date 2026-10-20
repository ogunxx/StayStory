import { FOCUSED_LAUNCH_MODE } from '@/lib/config'

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

/**
 * The header pair.
 *
 * Both are buttons, deliberately. Login used to be muted grey text sitting
 * flush against the wordmark, which read as part of it — "StayStory Login" —
 * and a returning host could barely find it. It is now an outlined button in
 * the same terracotta, so the two read as a pair: one quiet, one filled,
 * obviously both clickable.
 *
 * whitespace-nowrap matters here and nowhere else: the header is the one
 * place a CTA gets squeezed, and without it "Start Free" broke onto two
 * lines inside its own button on a phone.
 */
export const ctaCompact = `${BASE} h-9 shrink-0 rounded-lg px-4 text-sm whitespace-nowrap bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-primary`

/** The header's quieter half: same shape and weight, outlined. */
export const ctaCompactSecondary = `${BASE} h-9 shrink-0 rounded-lg px-4 text-sm whitespace-nowrap border border-primary/40 text-primary transition-colors hover:border-primary hover:bg-primary/[0.06] focus-visible:outline-primary`

/** A quiet text link, used for secondary journeys between pages. */
export const ctaTextLink =
  'rounded-sm text-sm font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/**
 * The link that answers "and what does this cost?".
 *
 * Three pages ask that question — Platform, the Method and the audience
 * section — and all three must give the same answer. During the focused
 * launch /pricing shows early access rather than a tier comparison, so
 * "Explore StayStory pricing" would promise a price list that isn't on the
 * page. The destination doesn't change; the invitation does.
 *
 * Both the label and the href are here so a single edit moves all three.
 */
export const COMMERCIAL_LINK: { href: string; label: string } = FOCUSED_LAUNCH_MODE
  ? { href: '/pricing', label: 'See how early access works' }
  : { href: '/pricing', label: 'Explore StayStory pricing' }

/**
 * The small print under a call to action.
 *
 * The hero, the closing CTA and the Platform hero all carried their own copy
 * of the same three items, which is how two of them went on saying "Cancel
 * anytime" after there was nothing to cancel. They read this instead.
 *
 * During the focused launch both of the old items are wrong rather than
 * merely odd: "Cancel anytime" implies a subscription the host does not
 * have, and "Setup in minutes" is a timing claim nobody has measured. The
 * focused line states only what is true — it is free, no card is needed, and
 * the Audit is where it begins.
 *
 * The full-mode wording is preserved exactly and returns with the flag.
 */
export const FULL_REASSURANCE = ['No credit card', 'Setup in minutes', 'Cancel anytime']
export const FOCUSED_REASSURANCE = [
  'Free to start',
  'No credit card required',
  'Begin with your Experience Audit',
]
export const REASSURANCE = FOCUSED_LAUNCH_MODE ? FOCUSED_REASSURANCE : FULL_REASSURANCE
