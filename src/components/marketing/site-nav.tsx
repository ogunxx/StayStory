import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

/**
 * The marketing header, shared by every public page so the nav can't drift
 * between them.
 *
 * Links point only at destinations that exist. The mockups show Platform and
 * Why StayStory as separate pages; neither is built, so they're absent rather
 * than dead. Add them here once those pages exist and every page picks them up.
 *
 * `active` highlights the current page — pass the href of the item to mark.
 */

export const NAV_ITEMS: { href: string; label: string }[] = [
  { href: '/method', label: 'The StayStory Method' },
  { href: '/#origin', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/login', label: 'Login' },
]

export function SiteNav({ active }: { active?: string }) {
  return (
    <header className="border-b border-border/60">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5" aria-hidden>
              <path d="M10 1.5l1.9 5.1 5.1 1.9-5.1 1.9L10 15.5l-1.9-5.1L3 8.5l5.1-1.9z" />
            </svg>
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            StayStory
          </span>
        </Link>

        <div className="hidden items-center gap-8 sm:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm transition-colors hover:text-foreground',
                active === item.href
                  ? 'font-medium text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground sm:hidden"
          >
            Login
          </Link>
          <Link href="/signup" className={cn(buttonVariants(), 'h-9 rounded-lg px-4')}>
            Start Free
          </Link>
        </div>
      </nav>
    </header>
  )
}
