'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Context for a focused host who has arrived at one of the deeper tools.
 *
 * They have no navigation to these routes during the focused launch, so
 * reaching one means an old link, a bookmark or a typed URL. The route still
 * works — nothing is blocked and nothing returns 404 — but without a word of
 * explanation it reads as a tool they were supposed to use and somehow
 * missed.
 *
 * Deliberately not shown to established hosts: for them these are simply
 * their tools, and a notice would be noise.
 *
 * The language is about scope, never readiness. Every one of these is built
 * and works; they are just not part of the four steps we are launching.
 */

const DEEPER_ROUTES: Record<string, string> = {
  '/journey': 'Experience Blueprint',
  '/generator': 'Generator',
  '/story': 'Story Builder',
  '/legend': 'Guest Journey Playbook',
}

export function DeeperToolNotice({ focused }: { focused: boolean }) {
  const pathname = usePathname()
  if (!focused) return null

  const name = DEEPER_ROUTES[pathname]
  if (!name) return null

  return (
    <aside className="mb-8 rounded-2xl border border-dashed border-border p-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
        Beyond the guided journey
      </p>
      <p className="mt-2 text-[0.92rem] leading-relaxed text-foreground">
        The {name} is one of StayStory&apos;s deeper tools. It works, and you&apos;re welcome to
        explore it — it just sits outside the four-step experience, and you don&apos;t need it to
        finish that.
      </p>
      <Link
        href="/start"
        className="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-4"
      >
        Return to my journey →
      </Link>
    </aside>
  )
}
