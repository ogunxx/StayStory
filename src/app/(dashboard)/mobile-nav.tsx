'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PropertySwitcher } from './property-switcher'
import type { Property } from '@/lib/properties'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/account', label: 'Account' },
  { href: '/properties', label: 'Properties' },
  { href: '/compass', label: 'Experience Compass' },
  { href: '/audit', label: 'Experience Audit' },
  { href: '/generator', label: 'Experience Generator' },
  { href: '/journey', label: 'Experience Blueprint' },
  { href: '/story', label: 'Story Builder' },
  { href: '/legend', label: 'Guest Journey Playbook' },
  { href: '/history', label: 'History' },
  { href: '/pricing', label: 'Upgrade' },
]

export function MobileNav({
  properties = [],
  activePropertyId = null,
  isAdmin = false,
}: {
  properties?: Property[]
  activePropertyId?: string | null
  isAdmin?: boolean
}) {
  const [open, setOpen] = useState(false)
  const navItems = isAdmin ? [...NAV_ITEMS, { href: '/admin', label: 'Members' }] : NAV_ITEMS

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="text-muted-foreground hover:text-foreground transition-colors p-1"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-[57px] left-0 right-0 bg-card border-b border-border z-50 px-6 py-4 flex flex-col gap-1">
          {properties.length > 1 && (
            <div className="pb-3 mb-1 border-b border-border/50">
              <PropertySwitcher properties={properties} activeId={activePropertyId} />
            </div>
          )}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 border-b border-border/50 last:border-0"
            >
              {item.label}
            </Link>
          ))}
          <form action="/api/auth/signout" method="post" className="pt-2">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
