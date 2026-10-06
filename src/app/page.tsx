import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { JsonLd, webPageSchema } from '@/lib/seo'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { FullHomepage, FocusedHomepage } from '@/components/marketing/home-compositions'
import { FOCUSED_HOMEPAGE } from '@/lib/config'

/**
 * The homepage.
 *
 * Two compositions of the same sections live in home-compositions.tsx — the
 * original full-platform story and the focused MVP one — and FOCUSED_HOMEPAGE
 * decides which renders. Both are permanent; neither was built by taking
 * anything away from the other, so flipping the switch restores the full
 * homepage with nothing to rebuild.
 *
 * Nav, footer, metadata and the guest figures are shared by both, which is
 * why they stay here.
 */

const DESCRIPTION =
  'StayStory helps hosts design the guest journey on purpose — uncover what makes your place meaningful, shape every moment, and deliver stays guests remember.'

export const metadata: Metadata = {
  // Absolute, so the root layout's "— StayStory" template doesn't double the
  // brand name on the page that already carries it.
  title: { absolute: 'StayStory — Guest Experience Design for Hospitality' },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'StayStory — Guest Experience Design for Hospitality',
    description: DESCRIPTION,
    url: '/',
  },
}

/** The live guest figures, shared by the proof section and the closing CTA. */
async function getAirbnbStats() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_config')
      .select('key, value')
      .in('key', ['airbnb_rating', 'airbnb_review_count'])
    const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
    return {
      rating: map['airbnb_rating'] ?? '4.99',
      reviews: map['airbnb_review_count'] ?? '136',
    }
  } catch {
    return { rating: '4.99', reviews: '136' }
  }
}

export default async function LandingPage() {
  const { rating, reviews } = await getAirbnbStats()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <JsonLd
        data={webPageSchema({
          path: '/',
          name: 'StayStory — Guest Experience Design for Hospitality',
          description: DESCRIPTION,
        })}
      />

      <SiteNav />

      {FOCUSED_HOMEPAGE ? (
        <FocusedHomepage rating={rating} reviews={reviews} />
      ) : (
        <FullHomepage rating={rating} reviews={reviews} />
      )}

      <SiteFooter />

    </div>
  )
}
