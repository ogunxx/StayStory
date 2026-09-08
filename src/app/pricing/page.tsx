import type { Metadata } from 'next'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { PricingHero } from '@/components/marketing/pricing-hero'
import { PricingPlans } from '@/components/marketing/pricing-plans'
import { PricingIncluded } from '@/components/marketing/pricing-included'
import { PricingAudience } from '@/components/marketing/pricing-audience'
import { PricingValue } from '@/components/marketing/pricing-value'
import { FAQS, PricingFaq } from '@/components/marketing/pricing-faq'
import { FinalCta } from '@/components/marketing/final-cta'
import { JsonLd, faqSchema, webPageSchema } from '@/lib/seo'

const DESCRIPTION =
  'StayStory pricing. Start free, then choose the plan that fits — a guest experience platform for independent hosts, boutique stays and small hospitality teams.'

export const metadata: Metadata = {
  title: { absolute: 'Pricing — StayStory Guest Experience Platform' },
  description: DESCRIPTION,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing — StayStory Guest Experience Platform',
    description: DESCRIPTION,
    url: '/pricing',
  },
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <JsonLd
        data={webPageSchema({
          path: '/pricing',
          name: 'Pricing — StayStory Guest Experience Platform',
          description: DESCRIPTION,
        })}
      />
      {/* Built from the same FAQS array the page renders, so the markup and
          the structured data can never describe different questions. */}
      <JsonLd data={faqSchema(FAQS)} />
      <SiteNav active="/pricing" />
      <main className="flex-1">
        <PricingHero />
        <PricingPlans />
        <PricingIncluded />
        <PricingAudience />
        <PricingValue />
        <PricingFaq />
        <FinalCta
          layout="band"
          headline="Ready to create a stay that feels like yours?"
          supporting="Start designing a guest experience that’s intentional, memorable and unmistakably yours."
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
