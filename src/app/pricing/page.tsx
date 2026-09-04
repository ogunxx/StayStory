import type { Metadata } from 'next'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { PricingHero } from '@/components/marketing/pricing-hero'
import { PricingPlans } from '@/components/marketing/pricing-plans'
import { PricingIncluded } from '@/components/marketing/pricing-included'
import { PricingAudience } from '@/components/marketing/pricing-audience'
import { PricingValue } from '@/components/marketing/pricing-value'
import { PricingFaq } from '@/components/marketing/pricing-faq'
import { FinalCta } from '@/components/marketing/final-cta'

export const metadata: Metadata = {
  title: 'Pricing — StayStory',
  description:
    'Start free. The tools, structure and guidance to design a more intentional guest journey — without the guesswork.',
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
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
