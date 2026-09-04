import type { Metadata } from 'next'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { PlatformHero } from '@/components/marketing/platform-hero'
import { PlatformSystem } from '@/components/marketing/platform-system'
import { PlatformDeepDives } from '@/components/marketing/platform-deep-dives'
import { PlatformConnected } from '@/components/marketing/platform-connected'
import { FinalCta } from '@/components/marketing/final-cta'

export const metadata: Metadata = {
  title: 'The Platform — StayStory',
  description:
    'Design the experience. Deliver what guests remember. One connected system for understanding, designing, and delivering the guest experience.',
}

export default function PlatformPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav active="/platform" />
      <main className="flex-1">
        <PlatformHero />
        <PlatformSystem />
        <PlatformDeepDives />
        <PlatformConnected />
        <FinalCta
          layout="band"
          headline="Ready to design a stay guests remember?"
          supporting="Bring your guest experience into one connected system and start designing the moments, details, and stories that make a stay memorable."
          secondaryLabel="Explore the Method"
          secondaryHref="/method"
        />
      </main>
      <SiteFooter />
    </div>
  )
}
