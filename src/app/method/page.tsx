import type { Metadata } from 'next'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { MethodHero } from '@/components/marketing/method-hero'

export const metadata: Metadata = {
  title: 'The StayStory Method — StayStory',
  description:
    'Great hospitality isn’t accidental. It’s designed. A repeatable way to shape what guests notice, feel, and remember.',
}

export default function MethodPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav active="/method" />
      <main className="flex-1">
        <MethodHero />
      </main>
      <SiteFooter />
    </div>
  )
}
