import type { Metadata } from 'next'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { MethodHero } from '@/components/marketing/method-hero'
import { MethodProblem } from '@/components/marketing/method-problem'
import { MethodShift } from '@/components/marketing/method-shift'
import { MethodWhy } from '@/components/marketing/method-why'
import { MethodSteps } from '@/components/marketing/method-steps'
import { MethodThread } from '@/components/marketing/method-thread'
import { MethodOutcome } from '@/components/marketing/method-outcome'
import { MethodProof } from '@/components/marketing/method-proof'
import { FinalCta } from '@/components/marketing/final-cta'
import { JsonLd, webPageSchema } from '@/lib/seo'

const DESCRIPTION =
  'Great hospitality isn’t accidental. It’s designed. The StayStory Method is a repeatable way to design the guest journey and shape what guests notice, feel and remember.'

export const metadata: Metadata = {
  title: { absolute: 'The StayStory Method — Guest Experience Design' },
  description: DESCRIPTION,
  alternates: { canonical: '/method' },
  openGraph: {
    title: 'The StayStory Method — Guest Experience Design',
    description: DESCRIPTION,
    url: '/method',
  },
}

export default function MethodPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <JsonLd
        data={webPageSchema({
          path: '/method',
          name: 'The StayStory Method — Guest Experience Design',
          description: DESCRIPTION,
        })}
      />
      <SiteNav active="/method" />
      <main className="flex-1">
        <MethodHero />
        <MethodProblem />
        <MethodShift />
        <MethodWhy />
        <MethodSteps />
        <MethodThread />
        <MethodOutcome />
        <MethodProof />
        <FinalCta
          layout="band"
          headline="Ready to design the experience intentionally?"
          supporting="Turn what you want guests to feel, remember, and talk about into an experience you can design on purpose and deliver consistently."
          secondaryLabel="Explore the Platform"
          secondaryHref="/platform"
        />
      </main>
      <SiteFooter />
    </div>
  )
}
