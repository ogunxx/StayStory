import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { listProperties } from '@/lib/properties'
import { resolveActivePropertyId } from '@/lib/active-property'
import { isAdminEmail } from '@/lib/admin'
import { MobileNav } from './mobile-nav'
import { PropertySwitcher } from './property-switcher'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('suspended_at').eq('id', user.id).single()
  if (profile?.suspended_at) {
    await supabase.auth.signOut()
    redirect('/login')
  }

  const isAdmin = isAdminEmail(user.email)

  // Only surface the property switcher when there's more than one to switch to.
  const properties = await listProperties()
  const activePropertyId = properties.length > 1 ? await resolveActivePropertyId(user.id) : null

  const navItems = [
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
    ...(isAdmin ? [{ href: '/admin', label: 'Members' }] : []),
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
        <div className="hidden sm:flex items-center gap-4">
          {properties.length > 1 && (
            <PropertySwitcher properties={properties} activeId={activePropertyId} />
          )}
          <form action="/api/auth/signout" method="post">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign out
            </button>
          </form>
        </div>
        <MobileNav properties={properties} activePropertyId={activePropertyId} isAdmin={isAdmin} />
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {children}
      </main>
    </div>
  )
}
