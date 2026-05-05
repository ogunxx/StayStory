import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TIER_LABELS: Record<string, string> = {
  host: 'Legendary ($499/mo)',
  signature: 'Legendary ($499/mo)',
  legend: 'Legendary ($499/mo)',
  legendary: 'Legendary ($499/mo)',
}

const TIER_DESCRIPTIONS: Record<string, string> = {
  host: 'Unlock every tool unlimited, plus 1 complimentary night at Laurel & Lore per year.',
  signature: 'Unlock every tool unlimited, plus 1 complimentary night at Laurel & Lore per year.',
  legend: 'Unlock every tool unlimited, plus 1 complimentary night at Laurel & Lore per year.',
  legendary: 'Unlock every tool unlimited, plus 1 complimentary night at Laurel & Lore per year.',
}

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
            {featureName} is a {TIER_LABELS[requiredTier]} feature
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {TIER_DESCRIPTIONS[requiredTier]}
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
