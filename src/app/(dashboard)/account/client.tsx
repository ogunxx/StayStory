'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SuggestionContent } from '@/types'

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  host: 'Legendary',
  signature: 'Legendary',
  legend: 'Legendary',
  legendary: 'Legendary',
}

const TIER_COLORS: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  host: 'bg-primary text-primary-foreground',
  signature: 'bg-primary text-primary-foreground',
  legend: 'bg-primary text-primary-foreground',
  legendary: 'bg-primary text-primary-foreground',
}

const TIER_FEATURES: Record<string, string[]> = {
  free: ['1 designed moment/month', 'Experience Audit', '1 free preview of each part'],
  host: ['The whole system — unlimited', 'Custom Guest Journey Playbook', 'Story Builder', 'Experience Blueprint', 'Priority support'],
  signature: ['The whole system — unlimited', 'Custom Guest Journey Playbook', 'Story Builder', 'Experience Blueprint', 'Priority support'],
  legend: ['The whole system — unlimited', 'Custom Guest Journey Playbook', 'Story Builder', 'Experience Blueprint', 'Priority support'],
  legendary: ['The whole system — unlimited', 'Custom Guest Journey Playbook', 'Story Builder', 'Experience Blueprint', 'Priority support'],
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface Suggestion {
  id: string
  created_at: string
  content: SuggestionContent
}

interface Story {
  id: string
  created_at: string
  narrative: string
  host_perspective: string | null
  social_caption: string | null
  pre_arrival_message: string | null
  listing_improvements: string | null
}

interface AuditRecord {
  id: string
  created_at: string
  score: number
  responses?: {
    pain_points?: string | null
    one_thing?: string | null
  } | null
}

interface JourneySession {
  id: string
  created_at: string
  touchpoint: string
  ideas?: { low: string; achievable: string; audacious: string } | null
}

interface Playbook {
  id: string
  created_at: string
  property_name: string | null
  executive_summary: string | null
}

interface Props {
  email: string
  profile: { tier: string; stripe_customer_id: string | null; created_at: string | null }
  suggestions: Suggestion[]
  stories: Story[]
  audits: AuditRecord[]
  journeys: JourneySession[]
  playbooks: Playbook[]
}

function ToolSection({
  label,
  href,
  count,
  children,
}: {
  label: string
  href: string
  count: number
  children: ReactNode
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-border mb-1">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {count} {count === 1 ? 'use' : 'uses'}
          </span>
        </div>
        <Link href={href} className="text-xs text-primary hover:underline underline-offset-2 shrink-0">
          Open tool →
        </Link>
      </div>
      {children}
    </div>
  )
}

function EmptyState({ href }: { href: string }) {
  return (
    <div className="py-5 text-center">
      <p className="text-xs text-muted-foreground mb-1">No uses yet.</p>
      <Link href={href} className="text-xs text-primary hover:underline underline-offset-2">
        Try it now →
      </Link>
    </div>
  )
}

export default function AccountClient({ email, profile, suggestions, stories, audits, journeys, playbooks }: Props) {
  const tier = profile.tier ?? 'free'
  const isPaid = tier !== 'free'

  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-10 max-w-2xl">

      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Account</p>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-1">Your StayStory account</h1>
        <p className="text-muted-foreground text-sm">{email}</p>
      </div>

      {/* Plan card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Current plan</p>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-xl font-serif font-semibold text-foreground">{TIER_LABELS[tier]}</h2>
              <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', TIER_COLORS[tier])}>
                {TIER_LABELS[tier]}
              </span>
            </div>
            {profile.created_at && (
              <p className="text-xs text-muted-foreground mt-1">Member since {formatDate(profile.created_at)}</p>
            )}
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 bg-secondary/40">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">What's included</p>
          <ul className="flex flex-col gap-1.5">
            {TIER_FEATURES[tier]?.map((f) => (
              <li key={f} className="text-sm text-foreground flex gap-2">
                <span className="text-primary mt-0.5">✓</span>{f}
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border px-6 py-4 flex flex-wrap gap-3">
          {!isPaid && (
            <Link href="/pricing" className={cn(buttonVariants({ size: 'sm' }))}>
              Upgrade plan →
            </Link>
          )}
          {isPaid && tier !== 'legendary' && (
            <Link href="/pricing" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Upgrade plan
            </Link>
          )}
          {isPaid && (
            <form action="/api/stripe/portal" method="post">
              <button
                type="submit"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'text-destructive border-destructive/30 hover:bg-destructive/5')}
              >
                Manage / cancel subscription
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 5-tool stats */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: 'Audits', count: audits.length, href: '/audit' },
          { label: 'Generator', count: suggestions.length, href: '/generator' },
          { label: 'Blueprints', count: journeys.length, href: '/journey' },
          { label: 'Stories', count: stories.length, href: '/story' },
          { label: 'Playbooks', count: playbooks.length, href: '/legend' },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="bg-secondary rounded-xl p-3 text-center hover:bg-secondary/60 transition-colors">
            <p className="text-xl font-serif font-semibold text-foreground">{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Usage history */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-5">Usage History</h2>

        <div className="flex flex-col gap-8">

          {/* Experience Audit */}
          <ToolSection label="Experience Audit" href="/audit" count={audits.length}>
            {audits.length === 0 ? <EmptyState href="/audit" /> : (
              <ul className="flex flex-col">
                {audits.map((a) => (
                  <li key={a.id} className="border-b border-border/50 last:border-0">
                    <button
                      onClick={() => toggle(a.id)}
                      className="w-full flex items-center justify-between gap-4 py-3 text-left hover:bg-muted/30 -mx-2 px-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-sm text-foreground">
                          Score: <strong>{a.score}/100</strong>
                        </span>
                        {a.responses?.pain_points && (
                          <span className="text-xs text-muted-foreground truncate hidden sm:block">
                            {a.responses.pain_points.slice(0, 60)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground">{formatDate(a.created_at)}</span>
                        <span className="text-muted-foreground text-xs">{expanded.has(a.id) ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {expanded.has(a.id) && (
                      <div className="pb-4 px-2 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl font-serif font-bold text-foreground">{a.score}</div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Hospitality Readiness Score</p>
                            <p className="text-xs text-muted-foreground">out of 100</p>
                          </div>
                        </div>
                        {a.responses?.pain_points && (
                          <div className="bg-secondary rounded-lg p-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Biggest friction point</p>
                            <p className="text-sm text-foreground">{a.responses.pain_points}</p>
                          </div>
                        )}
                        {a.responses?.one_thing && (
                          <div className="bg-primary/10 rounded-lg p-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Your one thing</p>
                            <p className="text-sm text-foreground italic">"{a.responses.one_thing}"</p>
                          </div>
                        )}
                        <Link href="/audit" className="text-xs text-primary hover:underline underline-offset-2 w-fit">
                          Run another audit →
                        </Link>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ToolSection>

          {/* Experience Generator */}
          <ToolSection label="Experience Generator" href="/generator" count={suggestions.length}>
            {suggestions.length === 0 ? <EmptyState href="/generator" /> : (
              <ul className="flex flex-col">
                {suggestions.map((s) => {
                  const preview = s.content?.touchpoint_focus
                    ?? s.content?.gestures?.zero
                    ?? 'Hospitality moment'
                  return (
                    <li key={s.id} className="border-b border-border/50 last:border-0">
                      <button
                        onClick={() => toggle(s.id)}
                        className="w-full flex items-center justify-between gap-4 py-3 text-left hover:bg-muted/30 -mx-2 px-2 rounded transition-colors"
                      >
                        <p className="text-sm text-foreground leading-snug line-clamp-1 flex-1">{preview}</p>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-muted-foreground">{formatDate(s.created_at)}</span>
                          <span className="text-muted-foreground text-xs">{expanded.has(s.id) ? '▲' : '▼'}</span>
                        </div>
                      </button>
                      {expanded.has(s.id) && s.content && (
                        <div className="pb-4 px-2 flex flex-col gap-3">
                          {s.content.touchpoint_focus && (
                            <div className="bg-accent rounded-lg p-3">
                              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Touchpoint focus</p>
                              <p className="text-sm text-foreground">{s.content.touchpoint_focus}</p>
                            </div>
                          )}
                          {s.content.gestures && (
                            <div className="flex flex-col gap-2">
                              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Gestures</p>
                              {[
                                { label: '$0', value: s.content.gestures.zero },
                                { label: 'Under $10', value: s.content.gestures.under_10 },
                                { label: 'Under $25', value: s.content.gestures.under_25 },
                                { label: 'Premium', value: s.content.gestures.premium },
                              ].map((g) => (
                                <div key={g.label} className="bg-secondary rounded-lg p-3">
                                  <p className="text-xs font-semibold text-muted-foreground mb-0.5">{g.label}</p>
                                  <p className="text-sm text-foreground">{g.value}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {s.content.messages?.pre_arrival && (
                            <div className="bg-card border border-border rounded-lg p-3">
                              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Pre-arrival message</p>
                              <p className="text-sm text-foreground whitespace-pre-line">{s.content.messages.pre_arrival}</p>
                            </div>
                          )}
                          {s.content.why_it_works && (
                            <div className="bg-primary/10 rounded-lg p-3">
                              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Why it works</p>
                              <p className="text-sm text-foreground">{s.content.why_it_works}</p>
                            </div>
                          )}
                          <Link href="/generator" className="text-xs text-primary hover:underline underline-offset-2 w-fit">
                            Generate another →
                          </Link>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </ToolSection>

          {/* Experience Blueprint */}
          <ToolSection label="Experience Blueprint" href="/journey" count={journeys.length}>
            {journeys.length === 0 ? <EmptyState href="/journey" /> : (
              <ul className="flex flex-col">
                {journeys.map((j) => (
                  <li key={j.id} className="border-b border-border/50 last:border-0">
                    <button
                      onClick={() => toggle(j.id)}
                      className="w-full flex items-center justify-between gap-4 py-3 text-left hover:bg-muted/30 -mx-2 px-2 rounded transition-colors"
                    >
                      <p className="text-sm text-foreground line-clamp-1 flex-1">{j.touchpoint}</p>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground">{formatDate(j.created_at)}</span>
                        <span className="text-muted-foreground text-xs">{expanded.has(j.id) ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {expanded.has(j.id) && (
                      <div className="pb-4 px-2 flex flex-col gap-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          {j.touchpoint}
                        </p>
                        {j.ideas ? (
                          <>
                            {[
                              { label: 'Low-Hanging', value: j.ideas.low, bg: 'bg-secondary' },
                              { label: 'Achievable', value: j.ideas.achievable, bg: 'bg-accent' },
                              { label: 'Audacious', value: j.ideas.audacious, bg: 'bg-primary/10' },
                            ].map((idea) => (
                              <div key={idea.label} className={`${idea.bg} rounded-lg p-3`}>
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{idea.label}</p>
                                <p className="text-sm text-foreground">{idea.value}</p>
                              </div>
                            ))}
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">Ideas not recorded for this session.</p>
                        )}
                        <Link href="/journey" className="text-xs text-primary hover:underline underline-offset-2 w-fit">
                          Open Experience Blueprint →
                        </Link>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ToolSection>

          {/* Story Builder */}
          <ToolSection label="Story Builder" href="/story" count={stories.length}>
            {stories.length === 0 ? <EmptyState href="/story" /> : (
              <ul className="flex flex-col">
                {stories.map((s) => (
                  <li key={s.id} className="border-b border-border/50 last:border-0">
                    <button
                      onClick={() => toggle(s.id)}
                      className="w-full flex items-center justify-between gap-4 py-3 text-left hover:bg-muted/30 -mx-2 px-2 rounded transition-colors"
                    >
                      <p className="text-sm text-foreground leading-snug line-clamp-1 flex-1">
                        {s.narrative?.slice(0, 80) ?? 'Guest story'}
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground">{formatDate(s.created_at)}</span>
                        <span className="text-muted-foreground text-xs">{expanded.has(s.id) ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {expanded.has(s.id) && (
                      <div className="pb-4 px-2 flex flex-col gap-3">
                        <div className="bg-secondary rounded-lg p-4">
                          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">The story</p>
                          <p className="text-sm text-foreground leading-relaxed">{s.narrative}</p>
                        </div>
                        {s.host_perspective && (
                          <div className="bg-card border border-border rounded-lg p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Host's perspective</p>
                            <p className="text-sm text-foreground leading-relaxed italic">{s.host_perspective}</p>
                          </div>
                        )}
                        {s.social_caption && (
                          <div className="bg-accent rounded-lg p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Social caption</p>
                            <p className="text-sm text-foreground leading-relaxed">{s.social_caption}</p>
                          </div>
                        )}
                        {s.pre_arrival_message && (
                          <div className="bg-card border border-border rounded-lg p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Pre-arrival message</p>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{s.pre_arrival_message}</p>
                          </div>
                        )}
                        {s.listing_improvements && (
                          <div className="bg-primary/10 rounded-lg p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Listing improvements</p>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{s.listing_improvements}</p>
                          </div>
                        )}
                        <Link href="/story" className="text-xs text-primary hover:underline underline-offset-2 w-fit">
                          Build another story →
                        </Link>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ToolSection>

          {/* Guest Journey Playbook */}
          <ToolSection label="Guest Journey Playbook" href="/legend" count={playbooks.length}>
            {playbooks.length === 0 ? <EmptyState href="/legend" /> : (
              <ul className="flex flex-col">
                {playbooks.map((p) => (
                  <li key={p.id} className="border-b border-border/50 last:border-0">
                    <button
                      onClick={() => toggle(p.id)}
                      className="w-full flex items-center justify-between gap-4 py-3 text-left hover:bg-muted/30 -mx-2 px-2 rounded transition-colors"
                    >
                      <p className="text-sm text-foreground line-clamp-1 flex-1">
                        {p.property_name ? `Playbook — ${p.property_name}` : 'Guest Journey Playbook'}
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground">{formatDate(p.created_at)}</span>
                        <span className="text-muted-foreground text-xs">{expanded.has(p.id) ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {expanded.has(p.id) && (
                      <div className="pb-4 px-2 flex flex-col gap-3">
                        {p.property_name && (
                          <p className="text-sm font-semibold text-foreground">{p.property_name}</p>
                        )}
                        {p.executive_summary && (
                          <div className="bg-primary text-primary-foreground rounded-lg p-4">
                            <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-2">Executive Summary</p>
                            <p className="text-sm leading-relaxed">{p.executive_summary}</p>
                          </div>
                        )}
                        <Link href="/legend" className="text-xs text-primary hover:underline underline-offset-2 w-fit">
                          Generate another playbook →
                        </Link>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ToolSection>

        </div>
      </div>

    </div>
  )
}
