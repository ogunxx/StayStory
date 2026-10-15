import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Admin's own navigation.
 *
 * Three sections, deliberately. Admin sits inside the dashboard shell so it
 * keeps StayStory's type and colour, but this strip makes it clear you are
 * in the back office rather than the product.
 */
const SECTIONS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/feedback', label: 'Feedback' },
] as const

export function AdminNav({ active }: { active: '/admin' | '/admin/users' | '/admin/feedback' }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">StayStory Admin</p>
      <nav aria-label="Admin" className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active === s.href ? 'page' : undefined}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              active === s.href
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {s.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
