import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { listProperties } from '@/lib/properties'
import { resolveActivePropertyId } from '@/lib/active-property'
import { isAdminEmail } from '@/lib/admin'
import { getUserTier } from '@/lib/get-tier'
import { getLaunchAudience } from '@/lib/launch-mode'
import { MobileNav } from './mobile-nav'
import { PropertySwitcher } from './property-switcher'
import { DashboardNav } from './dashboard-nav'
import { DeeperToolNotice } from './deeper-tool-notice'
import { FOCUSED_NAV } from '@/lib/focused-nav'

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

  // Decided once here and passed down, so the header and the mobile menu
  // can never disagree about the same person. See launch-mode.ts for the
  // rule; a host with deeper work or a paid plan is always 'established'.
  const audience = await getLaunchAudience(user.id, await getUserTier())

  // Only surface the property switcher when there's more than one to switch to.
  const properties = await listProperties()
  const activePropertyId = properties.length > 1 ? await resolveActivePropertyId(user.id) : null

  // The focused launch offers the four stages, not twelve tools. Admin
  // entries are appended either way — an admin on the free plan is still an
  // admin, and must not lose their own navigation to this rule.
  const adminItems = isAdmin
    ? [
        { href: '/admin', label: 'Admin' },
        { href: '/admin/feedback', label: 'Feedback' },
      ]
    : []

  const fullNavItems = [
    { href: '/dashboard', label: 'Home' },
    { href: '/account', label: 'Account' },
    { href: '/properties', label: 'Properties' },
    { href: '/compass', label: 'Experience Compass' },
    { href: '/audit', label: 'Experience Audit' },
    { href: '/generator', label: 'Generator' },
    { href: '/journey', label: 'Experience Blueprint' },
    { href: '/story', label: 'Story Builder' },
    { href: '/legend', label: 'Guest Journey Playbook' },
    { href: '/history', label: 'History' },
    { href: '/upgrade', label: 'Upgrade' },
    ...adminItems,
  ]

  const navItems = audience === 'focused' ? [...FOCUSED_NAV, ...adminItems] : fullNavItems

  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-serif font-semibold text-lg text-foreground">
          StayStory
        </Link>
        <DashboardNav items={navItems} audience={audience} />
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
        <MobileNav
          properties={properties}
          activePropertyId={activePropertyId}
          isAdmin={isAdmin}
          items={navItems}
        />
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {/* Renders only for a focused host, and only on a deeper tool route. */}
        <DeeperToolNotice focused={audience === 'focused'} />
        {children}
      </main>
    </div>
  )
}
