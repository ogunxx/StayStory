/**
 * One place for the facts search engines and social cards read about
 * StayStory, so no two pages can disagree about them.
 *
 * Everything here is real and checkable. Nothing about founding dates,
 * awards, ratings, customer counts or social profiles is asserted, because
 * none of that has been supplied — add a value below only when it's true.
 */

/** The canonical origin. Every canonical and OG URL is built from this. */
export const SITE_URL = 'https://staystory.co'

export const SITE_NAME = 'StayStory'

/** Used as the template for page titles: "Pricing — StayStory". */
export const TITLE_TEMPLATE = '%s — StayStory'

/**
 * Social accounts, for the Organization `sameAs` field. Left empty on
 * purpose: asserting a profile we don't have is a false claim about the
 * organization. Add a real profile URL and it's picked up automatically.
 */
export const SOCIAL_PROFILES: string[] = []

/** Absolute URL for a path, for canonicals and structured data. */
export function absoluteUrl(path: string): string {
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`
}

/**
 * Organization and WebSite, emitted once in the root layout.
 *
 * `sameAs` is omitted entirely when no profiles are known, rather than
 * shipped empty.
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    // `logo` is deliberately absent: the site has no logo image asset yet,
    // only a favicon, and pointing Google at a URL that 404s is worse than
    // omitting the field. Add a square PNG or SVG (112px or larger) to
    // /public, then add: logo: `${SITE_URL}/logo.png`.
    description:
      'StayStory helps hosts and hospitality teams intentionally design the guest journey and create stays guests remember.',
    ...(SOCIAL_PROFILES.length > 0 ? { sameAs: SOCIAL_PROFILES } : {}),
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

/**
 * A page. `type` is 'WebPage' for most pages and 'AboutPage' for /about,
 * which is what that page genuinely is.
 */
export function webPageSchema({
  path,
  name,
  description,
  type = 'WebPage',
}: {
  path: string
  name: string
  description: string
  type?: 'WebPage' | 'AboutPage' | 'CollectionPage'
}) {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
  }
}

/**
 * FAQPage, built from the questions actually rendered on the page — the
 * markup and the structured data come from the same array, so they can't
 * drift apart, which is what search engines require.
 */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

/** Renders a JSON-LD block. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
