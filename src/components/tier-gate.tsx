import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LEGENDARY_PRICE } from '@/lib/config'

const TIER_DESCRIPTION = 'Unlock every tool — unlimited. No resets, no limits.'

export function TierGate({
  requiredTier,
  featureName,
}: {
  requiredTier: 'host' | 'signature' | 'legend' | 'legendary'
  featureName: string
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="max-w-md flex flex-col gap-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <span className="text-2xl">✦</span>
        </div>
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
            {featureName} is a Legendary ({LEGENDARY_PRICE}) feature
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {TIER_DESCRIPTION}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pricing"
            className={cn(buttonVariants({ size: 'lg' }), 'px-8')}
          >
            Upgrade to Legendary
          </Link>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
