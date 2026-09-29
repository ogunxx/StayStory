'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FOCUSED_NAV, isFocusedRoute } from '@/lib/focused-nav'

export type NavItem = { href: string; label: string }

/**
 * The header's links.
 *
 * A host inside the focused path (/start and below) sees the four things that
 * path uses. Everywhere else the full product navigation is shown, exactly as
 * before. Nothing is removed and no route is blocked — this is only what the
 * header offers as an equal choice, and it's decided from the pathname rather
 * than from anything stored.
 *
 * A client component because the layout above it is a server component and
 * cannot read the current path.
 */
export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const visible = isFocusedRoute(pathname) ? FOCUSED_NAV : items

  return (
    <nav className="hidden sm:flex items-center gap-6">
      {visible.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'text-sm transition-colors',
              active ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

/** The same decision for the mobile menu, so the two never disagree. */
export function useNavItems(items: NavItem[]): NavItem[] {
  const pathname = usePathname()
  return isFocusedRoute(pathname) ? FOCUSED_NAV : items
}
