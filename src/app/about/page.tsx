import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { AboutHero } from '@/components/marketing/about-hero'
import { AboutOrigin } from '@/components/marketing/about-origin'
import { AboutLaurel } from '@/components/marketing/about-laurel'
import { AboutNoticing } from '@/components/marketing/about-noticing'
import { AboutPhilosophy } from '@/components/marketing/about-philosophy'
import { AboutInfluences } from '@/components/marketing/about-influences'
import { AboutWhyNow } from '@/components/marketing/about-why-now'
import { AboutTrust } from '@/components/marketing/about-trust'
import { FinalCta } from '@/components/marketing/final-cta'
import { JsonLd, webPageSchema } from '@/lib/seo'

const DESCRIPTION =
  'StayStory was built inside our own property, Laurel & Lore. Why we exist, and the hospitality thinking behind designing stays guests remember.'

export const metadata: Metadata = {
  title: { absolute: 'About StayStory — Guest Experience Design for Hosts' },
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About StayStory — Guest Experience Design for Hosts',
    description: DESCRIPTION,
    url: '/about',
  },
}

/** The live guest figures, so every page states the same numbers. */
async function getGuestFigures() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_config')
      .select('key, value')
      .in('key', ['airbnb_rating', 'airbnb_review_count'])
    const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
    return {
      rating: map['airbnb_rating'] ?? '4.99',
      reviews: map['airbnb_review_count'] ?? '136',
    }
  } catch {
    return { rating: '4.99', reviews: '136' }
  }
}

export default async function AboutPage() {
  const { rating, reviews } = await getGuestFigures()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* AboutPage rather than WebPage — this page genuinely is the account
          of what StayStory is, why it was created and what it believes. */}
      <JsonLd
        data={webPageSchema({
          path: '/about',
          name: 'About StayStory — Our Story',
          description: DESCRIPTION,
          type: 'AboutPage',
        })}
      />
      <SiteNav active="/about" />
      <main className="flex-1">
        <AboutHero />
        <AboutOrigin />
        <AboutLaurel rating={rating} reviews={reviews} />
        <AboutNoticing />
        <AboutPhilosophy />
        <AboutInfluences />
        <AboutWhyNow />
        <AboutTrust rating={rating} reviews={reviews} />
        <FinalCta
          layout="band"
          headline="Ready to design stays that stay with your guests?"
          supporting="Bring your guest experience into one connected system, and start designing the moments, details and stories that make a stay unforgettable."
          primaryLabel="Explore the Platform"
          primaryHref="/platform"
          secondaryLabel="Start Free"
          secondaryHref="/signup"
        />
      </main>
      <SiteFooter />
    </div>
  )
}
