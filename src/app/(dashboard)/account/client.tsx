'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
  free: ['1 generator use/month', 'Foundation Audit', '1 free preview of each tool'],
  host: ['All five tools — unlimited', 'Custom Guest Journey Playbook', 'Guest Story Builder', 'Journey Map', 'Priority support'],
  signature: ['All five tools — unlimited', 'Custom Guest Journey Playbook', 'Guest Story Builder', 'Journey Map', 'Priority support'],
  legend: ['All five tools — unlimited', 'Custom Guest Journey Playbook', 'Guest Story Builder', 'Journey Map', 'Priority support'],
  legendary: ['All five tools — unlimited', 'Custom Guest Journey Playbook', 'Guest Story Builder', 'Journey Map', 'Priority support'],
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface Props {
  email: string
  profile: { tier: string; stripe_customer_id: string | null; created_at: string | null }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  suggestions: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stories: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  audits: any[]
}

export default function AccountClient({ email, profile, suggestions, stories, audits }: Props) {
  const tier = profile.tier ?? 'free'
  const isPaid = tier !== 'free'
  const totalActivity = suggestions.length + stories.length + audits.length

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

      {/* Activity summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Generator uses', count: suggestions.length },
          { label: 'Stories built', count: stories.length },
          { label: 'Audits run', count: audits.length },
        ].map((s) => (
          <div key={s.label} className="bg-secondary rounded-xl p-4 text-center">
            <p className="text-2xl font-serif font-semibold text-foreground">{s.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* History */}
      {totalActivity === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">No activity yet. Start with the Generator or Foundation Audit.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {/* Generator history */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 pb-2 border-b border-border">
                Generator — {suggestions.length} {suggestions.length === 1 ? 'generation' : 'generations'}
              </h3>
              <ul className="flex flex-col gap-2">
                {suggestions.map((s, i) => {
                  const gesture = s.content?.gesture ?? s.content?.low_hanging ?? null
                  return (
                    <li key={s.id ?? i} className="flex items-start justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug line-clamp-2">
                          {gesture ?? 'Hospitality moment'}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground shrink-0 mt-0.5">{formatDate(s.created_at)}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Story builder history */}
          {stories.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 pb-2 border-b border-border">
                Story Builder — {stories.length} {stories.length === 1 ? 'story' : 'stories'}
              </h3>
              <ul className="flex flex-col gap-2">
                {stories.map((s, i) => (
                  <li key={s.id ?? i} className="flex items-start justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
                    <p className="text-sm text-foreground leading-snug line-clamp-2 flex-1">
                      {s.narrative ? s.narrative.slice(0, 120) + '…' : 'Guest story'}
                    </p>
                    <p className="text-xs text-muted-foreground shrink-0 mt-0.5">{formatDate(s.created_at)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Audit history */}
          {audits.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 pb-2 border-b border-border">
                Foundation Audit — {audits.length} {audits.length === 1 ? 'audit' : 'audits'}
              </h3>
              <ul className="flex flex-col gap-2">
                {audits.map((a, i) => (
                  <li key={a.id ?? i} className="flex items-center justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground">Foundation Audit</span>
                      {a.score != null && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Score: {a.score}/45
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">{formatDate(a.created_at)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
