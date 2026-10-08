import { Hero } from './hero'
import { ProductPreview, type PreviewModule } from './product-preview'
import type { Benefit } from './benefits'
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

/**
 * The preview beside the focused hero shows the journey a visitor can start,
 * not the whole architecture. Same component, different list.
 */
export const FOCUSED_MODULES: PreviewModule[] = [
  { label: 'Audit', state: 'done' },
  { label: 'Compass', state: 'done' },
  { label: 'Opportunities', state: 'active' },
  { label: 'Playbook', state: 'upcoming' },
]

/**
 * The same three benefit stories, told in terms of what a host can do now.
 * The full homepage's wording names the Compass and Blueprint together, and
 * the Generator and Story Builder together — true of the platform, but it
 * asks a first-time visitor to hold four tools in their head before they
 * understand the value. These say the same things without the inventory.
 */
export const FOCUSED_BENEFITS: Benefit[] = [
  {
    id: 'see',
    title: 'See what your guests experience.',
    description:
      'Walk the stay the way a guest does and notice what you have stopped noticing — the friction, the overlooked moments, the details that are already working.',
    ctaLabel: 'Start your Experience Audit',
    ctaHref: '/signup',
    preview: 'audit',
  },
  {
    id: 'feel',
    title: 'Design around how the stay should feel.',
    description:
      'Decide what guests should feel, remember and tell someone about afterwards. That direction is what every later decision gets measured against.',
    ctaLabel: 'See how the Compass works',
    ctaHref: '/signup',
    preview: 'compass',
  },
  {
    id: 'act',
    title: 'Turn instinct into something you can act on.',
    description:
      'Three opportunities drawn from your own property and the experience you said you want — specific enough to picture, and few enough to actually do.',
    ctaLabel: 'See your three opportunities',
    ctaHref: '/signup',
    preview: 'opportunities',
  },
]

export const FOCUSED_FINAL_CTA = {
  headline: 'Ready to see your stay through your guest’s eyes?',
  supporting:
    'Start with your Experience Audit. StayStory will help you uncover what matters, shape the direction of the experience, and discover where it could become more memorable.',
  primaryLabel: 'Start Your Experience Audit',
  primaryHref: '/signup',
  // Empty on purpose: the decision at the bottom of this page is whether to
  // start, not which of two things to read next. Platform stays in the nav
  // for anyone who wants it.
  secondaryLabel: '',
  secondaryHref: '/platform',
}

export function FocusedHomepage({ rating, reviews }: Stats) {
  return (
    <>
      <Hero {...FOCUSED_HERO} preview={<ProductPreview modules={FOCUSED_MODULES} />} />
      {/* bridge={null}: the journey is the whole of this section. The copy
          about the broader system is preserved in home-journey.tsx and is
          where it belongs — on /platform, for someone who asked. */}
      <HomeJourney bridge={null} />
      <Benefits benefits={FOCUSED_BENEFITS} />
      <Proof rating={rating} reviews={reviews} sourceHref={AIRBNB_URL} />
      {/* Hospitality Teams is left out here, not removed: its panel shows
          shared playbooks and co-hosts, which this experience does not
          include. It stays in AUDIENCES and on the full homepage. */}
      <Audiences only={['independent', 'boutique']} panels={{ boutique: 'compass' }} />
      <FinalCta {...FOCUSED_FINAL_CTA} rating={rating} reviews={reviews} />
    </>
  )
}
