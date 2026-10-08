import type { Metadata } from 'next'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { PlatformHero } from '@/components/marketing/platform-hero'
import { PlatformToday, PlatformDirection } from '@/components/marketing/platform-today'
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

        {/* What a visitor can use today, answered first. */}
        <PlatformToday />

        {/* Everything below is the broader direction. Saying so once is what
            lets the original sections stay exactly as they were written. */}
        <PlatformDirection />
        <PlatformSystem />
        <PlatformDeepDives />
        <PlatformConnected />
        <FinalCta
          layout="band"
          headline="Ready to design a stay guests remember?"
          supporting="Begin with the Experience Audit — the guided journey available today — and build from there as StayStory grows."
          primaryLabel="Start Your Experience Audit"
          secondaryLabel="Explore the Method"
          secondaryHref="/method"
        />
      </main>
      <SiteFooter />
    </div>
  )
}
