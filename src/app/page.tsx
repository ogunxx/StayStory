import { createClient } from '@/lib/supabase/server'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { Hero } from '@/components/marketing/hero'
import { PlatformOverview } from '@/components/marketing/platform-overview'
import { Benefits } from '@/components/marketing/benefits'
import { Proof } from '@/components/marketing/proof'
import { Audiences } from '@/components/marketing/audiences'
import { FinalCta } from '@/components/marketing/final-cta'
import { AIRBNB_URL } from '@/components/marketing/laurel-images'

/**
 * The homepage — six sections, hero to closing CTA.
 *
 * Each section is its own component in components/marketing, so copy, order
 * and imagery are edited there rather than here. This file only decides which
 * sections appear and in what order.
 */

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

      <SiteNav />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ─── Platform Overview ────────────────────────────────────────────── */}
      <PlatformOverview />

      {/* ─── Why hosts choose StayStory ───────────────────────────────────── */}
      <Benefits />

      {/* ─── Proof ────────────────────────────────────────────────────────── */}
      <Proof rating={rating} reviews={reviews} sourceHref={AIRBNB_URL} />

      {/* ─── Built for the way you host ───────────────────────────────────── */}
      <Audiences />

      {/* ─── Final CTA ────────────────────────────────────────────────────── */}
      <FinalCta rating={rating} reviews={reviews} />

      <SiteFooter />

    </div>
  )
}
