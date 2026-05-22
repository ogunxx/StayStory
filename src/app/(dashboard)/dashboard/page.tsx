import { createClient } from '@/lib/supabase/server'
import { getUserTier, hasAccess } from '@/lib/get-tier'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tier = await getUserTier()

  const name = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'
  const isLegendary = hasAccess(tier, 'legendary')

  // Monthly generator usage for free users
  let monthlyUsed = 0
  if (!isLegendary) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .gte('created_at', startOfMonth.toISOString())
    monthlyUsed = count ?? 0
  }

  const remaining = Math.max(0, 1 - monthlyUsed)

  return (
    <div className="flex flex-col gap-10">

      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">
          Welcome back, {name}.
        </h1>
        <p className="text-muted-foreground">
          Every great stay starts with intention. What are you working on today?
        </p>
      </div>

      {/* Free tier usage banner */}
      {!isLegendary && (
        <div className={cn(
          'rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4',
          remaining === 0 ? 'bg-destructive/10 border border-destructive/20' : 'bg-primary/10 border border-primary/20'
        )}>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">
              {remaining === 0
                ? 'You\'ve used your 1 free generation this month'
                : `${remaining} free generation remaining this month`}
            </p>
            <p className="text-xs text-muted-foreground">
              {remaining === 0
                ? 'Upgrade to Legendary for unlimited generation — every tool, no limits.'
                : 'Free plan includes 1 generation/month. Upgrade to Legendary for unlimited.'}
            </p>
          </div>
          <Link href="/pricing" className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}>
            Upgrade to Legendary →
          </Link>
        </div>
      )}

      {/* Active tools */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Your tools</p>
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Audit — always available */}
          <div className="bg-secondary rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <span className="text-xs text-muted-foreground font-mono">1</span>
              <h2 className="font-serif font-semibold text-foreground mt-1">Foundation Audit</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">Fix what guests feel but never say — arrival, lighting, smell, sound, warmth.</p>
            </div>
            <Link href="/audit" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-auto w-fit')}>Run audit →</Link>
          </div>

          {/* Generator */}
          <div className="bg-accent rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">2</span>
                {!isLegendary && (
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    remaining === 0 ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary'
                  )}>
                    {remaining === 0 ? 'Limit reached' : `${remaining} left`}
                  </span>
                )}
                {isLegendary && (
                  <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">Unlimited</span>
                )}
              </div>
              <h2 className="font-serif font-semibold text-foreground mt-1">Hospitality Generator</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">Tell us about your guest. Get tiered gesture ideas, setup plan, shopping list, and messages.</p>
            </div>
            <Link
              href={remaining === 0 && !isLegendary ? '/pricing' : '/generator'}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-auto w-fit')}
            >
              {remaining === 0 && !isLegendary ? 'Upgrade to generate →' : 'Generate moment →'}
            </Link>
          </div>

          {/* Journey Map */}
          {isLegendary ? (
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">3</span>
                  <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">Unlimited</span>
                </div>
                <h2 className="font-serif font-semibold text-foreground mt-1">Journey Map</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">Map every touchpoint — from booking to what they find in the car weeks later.</p>
              </div>
              <Link href="/journey" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-auto w-fit')}>Open map →</Link>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs text-muted-foreground font-mono">3</span>
                  <h2 className="font-serif font-semibold text-foreground mt-1">Journey Map</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">Map every touchpoint across the guest experience — 14 moments across 5 phases.</p>
                  <p className="text-xs text-muted-foreground mt-2">Start Strong → Stick the Landing → Transform Pain Points</p>
                </div>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full shrink-0">Legendary</span>
              </div>
              <Link href="/journey" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-fit')}>Preview free →</Link>
            </div>
          )}

          {/* Story Builder */}
          {isLegendary ? (
            <div className="bg-primary/10 rounded-2xl p-6 flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">4</span>
                  <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">Unlimited</span>
                </div>
                <h2 className="font-serif font-semibold text-foreground mt-1">Guest Story Builder</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">Turn what you did into a story — for your brand, listing, and the memory they carry home.</p>
              </div>
              <Link href="/story" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-auto w-fit')}>Build story →</Link>
            </div>
          ) : (
            <div className="bg-primary/5 border border-border rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs text-muted-foreground font-mono">4</span>
                  <h2 className="font-serif font-semibold text-foreground mt-1">Guest Story Builder</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">Turn a moment into a narrative guests retell. Brand story, social caption, listing copy.</p>
                  <p className="text-xs text-muted-foreground italic mt-2">"They left a note on the guest book we didn't expect…"</p>
                </div>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full shrink-0">Legendary</span>
              </div>
              <Link href="/story" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-fit')}>Preview free →</Link>
            </div>
          )}

        </div>
      </div>

      {/* Guest Journey Playbook */}
      {isLegendary ? (
        <div className="bg-primary text-primary-foreground rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-1">Legendary</p>
            <h2 className="font-serif font-semibold text-lg">Guest Journey Playbook</h2>
            <p className="text-sm text-primary-foreground/80 mt-1">Your full property playbook — positioning, archetypes, touchpoint priorities, monthly rhythm.</p>
          </div>
          <Link href="/legend" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10')}>
            Open playbook →
          </Link>
        </div>
      ) : (
        <div className="bg-primary/5 border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Legendary</p>
            <h2 className="font-serif font-semibold text-lg text-foreground">Guest Journey Playbook</h2>
            <p className="text-sm text-muted-foreground mt-1">Executive summary, 3 guest archetypes, touchpoint priorities, monthly hosting rhythm — all in one doc.</p>
          </div>
          <Link href="/legend" className={cn(buttonVariants({ size: 'sm' }), 'shrink-0')}>Preview free →</Link>
        </div>
      )}

      {/* Legendary upgrade nudge for free users */}
      {!isLegendary && (
        <div className="bg-secondary rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Upgrade</p>
            <p className="text-sm font-semibold text-foreground">Go Legendary — $17/mo</p>
            <p className="text-xs text-muted-foreground mt-1">Every tool unlimited, your custom playbook, and priority support — $17/mo.</p>
          </div>
          <Link href="/pricing" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0')}>
            See Legendary →
          </Link>
        </div>
      )}

      {/* Philosophy */}
      <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-border">
        {[
          { role: 'The Foundation', idea: 'Fix the invisible things. Stay in your own rental. Design is the soul of a property.' },
          { role: 'The Wow', idea: 'Service does the job. Hospitality makes people feel something. Spend a little foolishly on what matters most.' },
          { role: 'The Story', idea: 'The host is the guide. The guest is the hero. Every moment is a story waiting to be told.' },
        ].map((p) => (
          <div key={p.role} className="flex flex-col gap-1 pt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.role}</p>
            <p className="text-muted-foreground leading-relaxed italic text-xs">"{p.idea}"</p>
          </div>
        ))}
      </div>

    </div>
  )
}
