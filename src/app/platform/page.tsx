import type { Metadata } from 'next'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { PlatformHero } from '@/components/marketing/platform-hero'
import { PlatformSystem } from '@/components/marketing/platform-system'
import { PlatformDeepDives } from '@/components/marketing/platform-deep-dives'
import { PlatformConnected } from '@/components/marketing/platform-connected'
import { FinalCta } from '@/components/marketing/final-cta'
import { JsonLd, webPageSchema } from '@/lib/seo'

const DESCRIPTION =
  'One connected guest experience platform: Experience Audit, Compass, Blueprint, Generator, Story Builder and the Guest Journey Playbook, working as a single system.'

export const metadata: Metadata = {
  // Absolute on every page: each title already names StayStory where it
  // belongs, so letting the layout template append it again would read
  // "… — StayStory — StayStory".
  title: { absolute: 'Guest Experience Platform for Hosts — StayStory' },
  description: DESCRIPTION,
  alternates: { canonical: '/platform' },
  openGraph: {
    title: 'Guest Experience Platform for Hosts — StayStory',
    description: DESCRIPTION,
    url: '/platform',
  },
}

export default function PlatformPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <JsonLd
        data={webPageSchema({
          path: '/platform',
          name: 'Guest Experience Platform for Hosts — StayStory',
          description: DESCRIPTION,
        })}
      />
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
