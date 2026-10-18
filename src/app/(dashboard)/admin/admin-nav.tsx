import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Admin's own navigation.
 *
 * Admin sits inside the dashboard shell so it keeps StayStory's type and
 * colour, but this strip makes it clear you are in the back office rather
 * than the product.
 *
 * Feedback and Research are two different datasets and are deliberately two
 * entries. Feedback is signed-in hosts who finished the journey saying
 * whether it helped; Research is anyone on the public homepage saying what
 * they need. The labels are short so the strip still wraps cleanly on a
 * phone; each page says in full what it holds.
 */
const SECTIONS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/feedback', label: 'Feedback' },
  { href: '/admin/research', label: 'Research' },
] as const

export type AdminSection = (typeof SECTIONS)[number]['href']

export function AdminNav({ active }: { active: AdminSection }) {
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
