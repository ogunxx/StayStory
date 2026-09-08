'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ctaCompact, ctaPrimary } from './cta-styles'

/**
 * The one global header for the whole public site.
 *
 * Every page renders this same component — there is no per-page variant — so
 * a change here reaches the homepage, Platform, Method, About and Pricing at
 * once. Everything a person would want to change is data below:
 *
 *   • the links and their order  → NAV_ITEMS (add, remove or reorder freely)
 *   • the quiet login link       → LOGIN
 *   • the primary CTA            → CTA (label and destination)
 *   • the wordmark               → WORDMARK, or replace <Mark /> with a logo
 *   • the current-page treatment → ACTIVE_CLASS / INACTIVE_CLASS
 *
 * The nav is sticky and gets quieter, not heavier, as you scroll: it loses a
 * little height and picks up a blurred background and a hairline border, and
 * nothing animates dramatically.
 */

export const NAV_ITEMS: { href: string; label: string }[] = [
  { href: '/platform', label: 'Platform' },
  { href: '/method', label: 'The StayStory Method' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
]

export const LOGIN = { href: '/login', label: 'Login' }
export const CTA = { href: '/signup', label: 'Start Free' }
export const WORDMARK = 'StayStory'

/** Current page: a touch darker, with a restrained underline. No tab bar. */
const ACTIVE_CLASS = 'font-medium text-foreground underline decoration-primary decoration-2 underline-offset-[10px]'
const INACTIVE_CLASS = 'text-muted-foreground hover:text-foreground'

function Mark() {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5" aria-hidden>
        <path d="M10 1.5l1.9 5.1 5.1 1.9-5.1 1.9L10 15.5l-1.9-5.1L3 8.5l5.1-1.9z" />
      </svg>
    </span>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  )
}

export function SiteNav({ active }: { active?: string }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Escape closes the menu, and the page behind it doesn't scroll while it's open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200',
        scrolled || open
          ? 'border-b border-border/60 bg-background/85 backdrop-blur-md'
          : 'border-b border-transparent bg-background'
      )}
    >
      <nav
        aria-label="Main"
        className={cn(
          'mx-auto flex w-full max-w-7xl items-center justify-between px-6 transition-[padding] duration-200',
          scrolled ? 'py-3' : 'py-5'
        )}
      >
        <Link href="/" className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <Mark />
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            {WORDMARK}
          </span>
        </Link>

        {/* ── Desktop links ─────────────────────────────────────────────── */}
        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active === item.href ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center rounded-md py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary',
                  active === item.href ? ACTIVE_CLASS : INACTIVE_CLASS
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href={LOGIN.href}
            aria-current={active === LOGIN.href ? 'page' : undefined}
            className={cn(
              'hidden items-center rounded-md py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary lg:inline-flex',
              active === LOGIN.href ? ACTIVE_CLASS : INACTIVE_CLASS
            )}
          >
            {LOGIN.label}
          </Link>

          <Link
            href={CTA.href}
            className={ctaCompact}
          >
            {CTA.label}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="-mr-2 flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ───────────────────────────────────────────────────
          Same links in the same order as desktop. Generous tap targets, and
          it fills the screen below the header rather than compressing the
          desktop row. */}
      <div
        id="site-menu"
        hidden={!open}
        className="border-t border-border/60 bg-background lg:hidden"
      >
        <ul className="mx-auto flex w-full max-w-7xl flex-col px-6 py-2">
          {[...NAV_ITEMS, LOGIN].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active === item.href ? 'page' : undefined}
                className={cn(
                  'flex min-h-[3.25rem] items-center border-b border-border/50 text-[0.95rem] transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
                  active === item.href ? 'font-medium text-primary' : 'text-foreground'
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mx-auto w-full max-w-7xl px-6 pb-6 pt-3">
          <Link
            href={CTA.href}
            onClick={() => setOpen(false)}
            className={`${ctaPrimary} h-12 w-full`}
          >
            {CTA.label}
          </Link>
        </div>
      </div>
    </header>
  )
}
