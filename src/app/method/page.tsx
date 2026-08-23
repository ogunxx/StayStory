import type { Metadata } from 'next'
import { SiteNav } from '@/components/marketing/site-nav'
import { SiteFooter } from '@/components/marketing/site-footer'
import { MethodHero } from '@/components/marketing/method-hero'
import { MethodProblem } from '@/components/marketing/method-problem'
import { MethodShift } from '@/components/marketing/method-shift'
import { MethodWhy } from '@/components/marketing/method-why'
import { MethodSteps } from '@/components/marketing/method-steps'

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
        <MethodProblem />
        <MethodShift />
        <MethodWhy />
        <MethodSteps />
      </main>
      <SiteFooter />
    </div>
  )
}
