import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MobileNav } from './mobile-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const navItems = [
    { href: '/dashboard', label: 'Home' },
    { href: '/account', label: 'Account' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/audit', label: 'Audit' },
    { href: '/generator', label: 'Hospitality Generator' },
    { href: '/journey', label: 'Journey Map' },
    { href: '/story', label: 'Story Builder' },
    { href: '/legend', label: 'Guest Journey Playbook' },
    { href: '/pricing', label: 'Upgrade' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-serif font-semibold text-lg text-foreground">
          StayStory
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden sm:block">
          <form action="/api/auth/signout" method="post">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign out
            </button>
          </form>
        </div>
        <MobileNav />
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {children}
      </main>
    </div>
  )
}
