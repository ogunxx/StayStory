import { Hero } from './hero'
import { PlatformOverview } from './platform-overview'
import { HomeJourney } from './home-journey'
import { Benefits } from './benefits'
import { Proof } from './proof'
import { Audiences } from './audiences'
import { FinalCta } from './final-cta'
import { AIRBNB_URL } from './laurel-images'

/**
 * The two homepages.
 *
 * Both are orderings of the same section components — there is one design
 * system, one set of sections, and two stories told with them. Nothing was
 * duplicated to make the focused homepage, and nothing was removed to make
 * room for it: FullHomepage below is the original composition, unchanged, and
 * src/app/page.tsx picks between them on FOCUSED_HOMEPAGE.
 *
 * Benefits, Proof and Audiences are shared verbatim. Hero and FinalCta are the
 * same components with different copy passed in. Only the second section
 * genuinely differs: the full homepage shows all six tools, the focused one
 * shows the four-step first journey and then points at /platform for the rest.
 */

type Stats = { rating: string; reviews: string }

/* ── The original full-platform homepage ─────────────────────────────────── */

export function FullHomepage({ rating, reviews }: Stats) {
  return (
    <>
      <Hero />
      <PlatformOverview />
      <Benefits />
      <Proof rating={rating} reviews={reviews} sourceHref={AIRBNB_URL} />
      <Audiences />
      <FinalCta rating={rating} reviews={reviews} />
    </>
  )
}

/* ── The focused MVP homepage ────────────────────────────────────────────── */

/**
 * Copy that differs from the full homepage, kept together so it can be edited
 * without reading the composition.
 */
export const FOCUSED_HERO = {
  headline: ['See your guest', 'experience', 'differently.'],
  body: 'StayStory helps hospitality hosts step into the guest experience, uncover what matters, define how they want the stay to feel, and discover thoughtful opportunities to make it more memorable.',
  // Signup, not a parallel flow: the existing auth takes a host to the product,
  // where the focused journey already begins with the Audit.
  primary: { label: 'Start Your Experience Audit', href: '/signup' },
  // An id on this page, so "see how it works" shows the journey rather than
  // sending someone away to find out.
  secondary: { label: 'See How It Works', href: '#how-it-works' },
}

export const FOCUSED_FINAL_CTA = {
  headline: 'Ready to see your stay through your guest’s eyes?',
  supporting:
    'Start with the Experience Audit. StayStory will help you uncover what matters, shape the direction of the experience, and discover where the stay could become more memorable.',
  primaryLabel: 'Start Your Experience Audit',
  primaryHref: '/signup',
  secondaryLabel: 'Explore the Platform',
  secondaryHref: '/platform',
}

export function FocusedHomepage({ rating, reviews }: Stats) {
  return (
    <>
      <Hero {...FOCUSED_HERO} />
      <HomeJourney />
      <Benefits />
      <Proof rating={rating} reviews={reviews} sourceHref={AIRBNB_URL} />
      {/* The focused first experience is built around a single property, so the
          two audiences it genuinely serves lead. Hospitality Teams stays —
          it is part of where StayStory is going — but it does not go first,
          because team functionality is not part of this first experience. */}
      <Audiences order={['independent', 'boutique', 'teams']} />
      <FinalCta {...FOCUSED_FINAL_CTA} rating={rating} reviews={reviews} />
    </>
  )
}
