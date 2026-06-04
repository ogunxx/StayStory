import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import PricingClient from './pricing-client'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Marketing nav — pricing is public so non-members can compare plans. */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <Link href="/" className="text-xl font-serif font-semibold tracking-tight text-foreground">
          StayStory
        </Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link href="/dashboard" className={cn(buttonVariants({ size: 'sm' }))}>
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }))}>
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 w-full px-6 py-12 sm:py-16">
        <PricingClient isLoggedIn={isLoggedIn} />
      </main>

      <footer className="py-8 px-6 text-center text-xs text-muted-foreground border-t border-border">
        © {new Date().getFullYear()} StayStory · Built by Ogun &amp; Evie ·{' '}
        <a
          href="https://laurelandlore.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          laurelandlore.com
        </a>
      </footer>
    </div>
  )
}
