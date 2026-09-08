import Link from 'next/link'

/**
 * The one global footer for the whole public site.
 *
 * Structured from the approved mockup — brand block left, link columns right,
 * a quiet bottom bar — and rendered in the warm StayStory palette rather than
 * the mockup's navy, per the palette note in the website brief.
 *
 * Everything is data below:
 *
 *   • the tagline and description → TAGLINE, DESCRIPTION
 *   • the columns and their links → FOOTER_COLUMNS (add, remove, reorder)
 *   • the social icons            → SOCIAL_LINKS
 *   • the closing line            → SIGN_OFF
 *
 * ┌─ LINKS DELIBERATELY LEFT OUT ──────────────────────────────────────────┐
 * │ The mockup's footer also lists Resources, Contact, Support, Privacy    │
 * │ Policy, Terms of Service, Cookie Policy and Accessibility, plus four   │
 * │ social accounts. None of those pages or accounts exist yet, and the    │
 * │ brief is explicit about not shipping dead links or social icons for    │
 * │ accounts we don't have. Each is listed in FOOTER_COLUMNS below,        │
 * │ commented out with its intended position — uncomment and add the real  │
 * │ href when the destination exists. The Legal column appears the moment  │
 * │ it has at least one link.                                              │
 * └────────────────────────────────────────────────────────────────────────┘
 */

export const TAGLINE = 'Design guest experiences they’ll remember.'
export const DESCRIPTION =
  'StayStory helps hosts intentionally design more connected, meaningful guest experiences.'
export const SIGN_OFF = 'A more intentional way to host.'

export type FooterLink = { label: string; href: string; external?: boolean }
export type FooterColumn = { title: string; links: FooterLink[] }

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Platform', href: '/platform' },
      { label: 'The StayStory Method', href: '/method' },
      { label: 'About', href: '/about' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Laurel & Lore', href: 'https://laurelandlore.com', external: true },
      // { label: 'Resources', href: '/resources' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Log in', href: '/login' },
      { label: 'Start Free', href: '/signup' },
      // { label: 'Contact', href: '/contact' },
      // { label: 'Support', href: '/support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      // { label: 'Privacy Policy', href: '/privacy' },
      // { label: 'Terms of Service', href: '/terms' },
      // { label: 'Cookie Policy', href: '/cookies' },
      // { label: 'Accessibility', href: '/accessibility' },
    ],
  },
]

/**
 * Social accounts. Add an entry only for an account that actually exists —
 * an icon linking nowhere is worse than no icon. `icon` is one of the keys
 * in SOCIAL_ICONS below.
 */
export const SOCIAL_LINKS: { label: string; href: string; icon: SocialKey }[] = []

const SOCIAL_ICONS = {
  instagram:
    'M12 8.6a3.4 3.4 0 100 6.8 3.4 3.4 0 000-6.8zM3.5 8.2A4.7 4.7 0 018.2 3.5h7.6a4.7 4.7 0 014.7 4.7v7.6a4.7 4.7 0 01-4.7 4.7H8.2a4.7 4.7 0 01-4.7-4.7zM17 7.4h.01',
  pinterest: 'M12 3.5a8.5 8.5 0 00-3.1 16.4c-.1-.7-.1-1.8.02-2.6l1.1-4.6s-.28-.56-.28-1.4c0-1.3.76-2.3 1.7-2.3.8 0 1.2.6 1.2 1.3 0 .8-.5 2-.77 3.1-.22.94.47 1.7 1.4 1.7 1.7 0 2.9-2.2 2.9-4.7 0-1.95-1.3-3.4-3.7-3.4a4.2 4.2 0 00-4.4 4.2c0 .8.3 1.4.8 1.8.08.1.1.18.07.3l-.2.8c-.04.2-.16.24-.35.14-1.1-.5-1.6-1.9-1.6-3.4 0-2.5 2.1-5.5 6.3-5.5 3.3 0 5.5 2.4 5.5 5 0 3.4-1.9 6-4.7 6-.94 0-1.8-.5-2.1-1.1l-.6 2.3c-.2.75-.6 1.5-1 2.1A8.5 8.5 0 1012 3.5z',
  youtube:
    'M21.2 8.2a2.5 2.5 0 00-1.7-1.8C18 6 12 6 12 6s-6 0-7.5.4A2.5 2.5 0 002.8 8.2 26 26 0 002.4 12c0 1.3.1 2.6.4 3.8a2.5 2.5 0 001.7 1.8C6 18 12 18 12 18s6 0 7.5-.4a2.5 2.5 0 001.7-1.8c.3-1.2.4-2.5.4-3.8s-.1-2.6-.4-3.8zM10.2 14.6V9.4l4.4 2.6z',
  linkedin:
    'M4.5 9.3h3v10.2h-3zM6 4.5a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6zM10.2 9.3h2.9v1.4c.4-.8 1.4-1.6 3-1.6 3.2 0 3.8 2 3.8 4.7v5.7h-3v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7v5.1h-3z',
} as const

export type SocialKey = keyof typeof SOCIAL_ICONS

function Mark() {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background/15">
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5 text-background" aria-hidden>
        <path d="M10 1.5l1.9 5.1 5.1 1.9-5.1 1.9L10 15.5l-1.9-5.1L3 8.5l5.1-1.9z" />
      </svg>
    </span>
  )
}

const LINK_CLASS =
  'inline-flex min-h-11 items-center rounded-sm text-[0.85rem] text-background/65 transition-colors hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background/60'

function ColumnLink({ link }: { link: FooterLink }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        {link.label}
        <span aria-hidden className="ml-1 text-background/40">
          ↗
        </span>
      </a>
    )
  }
  return (
    <Link href={link.href} className={LINK_CLASS}>
      {link.label}
    </Link>
  )
}

export function SiteFooter() {
  // A column with nothing in it never renders, so commenting a link back in
  // is all it takes to bring its column along with it.
  const columns = FOOTER_COLUMNS.filter((c) => c.links.length > 0)

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr] lg:gap-16">
          {/* ── Brand ───────────────────────────────────────────────────── */}
          <div className="min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-background/60"
            >
              <Mark />
              <span className="font-serif text-xl font-semibold tracking-tight">StayStory</span>
            </Link>
            <p className="mt-5 max-w-xs font-serif text-[1.05rem] leading-snug">{TAGLINE}</p>
            <p className="mt-3 max-w-xs text-[0.83rem] leading-relaxed text-background/60">
              {DESCRIPTION}
            </p>
          </div>

          {/* ── Link columns, desktop ───────────────────────────────────── */}
          {/* Flex rather than a fixed column count, so removing or adding a
              column doesn't leave a gap where one used to be. */}
          <div className="hidden lg:flex lg:flex-wrap lg:gap-x-16 lg:gap-y-10">
            {columns.map((column) => (
              // A nav landmark with its own label, rather than an <h2> — these
              // are navigation groups, not sections of the page's content, and
              // as headings they sat at the same level as real page sections.
              <nav key={column.title} aria-label={column.title} className="min-w-[9rem]">
                <p className="mb-4 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-background/45">
                  {column.title}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <ColumnLink link={link} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* ── Link columns, mobile ────────────────────────────────────────
              Accordions rather than three squeezed columns, as in the mockup.
              Native <details>, so they open without JavaScript and are
              keyboard-operable by default. */}
          <div className="lg:hidden">
            {columns.map((column) => (
              <details key={column.title} className="group border-b border-background/15 last:border-b-0">
                <summary className="flex min-h-[3.25rem] cursor-pointer list-none items-center justify-between text-[0.9rem] font-medium marker:content-none">
                  {column.title}
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden
                    className="size-4 text-background/50 transition-transform duration-200 group-open:rotate-180"
                  >
                    <path
                      d="M5 8l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <ul className="flex flex-col gap-1 pb-4">
                  {column.links.map((link) => (
                    <li key={link.label} className="flex min-h-11 items-center">
                      <ColumnLink link={link} />
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div className="mt-12 flex flex-col gap-5 border-t border-background/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.78rem] text-background/55">
            © {new Date().getFullYear()} StayStory. All rights reserved.
          </p>

          {SOCIAL_LINKS.length > 0 ? (
            <ul className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-10 items-center justify-center rounded-lg text-background/60 transition-colors hover:bg-background/10 hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background/60"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="size-[1.15rem]" aria-hidden>
                      <path
                        d={SOCIAL_ICONS[social.icon]}
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          <p className="font-serif text-[0.82rem] italic text-background/55">{SIGN_OFF}</p>
        </div>
      </div>
    </footer>
  )
}
