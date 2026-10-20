import Link from 'next/link'
import { SiteNav } from './site-nav'
import { SiteFooter } from './site-footer'
import { ENTITY, LAST_UPDATED, CONTACT_EMAIL } from '@/lib/legal'

/**
 * The shell every legal page sits in.
 *
 * Narrower than the marketing pages and plainer, because these are read
 * rather than scanned — a comfortable measure matters more than composition.
 * Same nav, same footer, same type and colour, so a visitor never feels
 * dropped onto a different website at the moment they're checking whether to
 * trust you.
 *
 * The entity line is here rather than in each page: every one of them has to
 * say who is contracting, and saying it three slightly different ways is how
 * that goes wrong.
 */

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-serif text-[1.35rem] leading-snug font-semibold text-foreground">
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[0.95rem] leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-medium [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  )
}

/** A plain bulleted list, styled once so the pages don't each do their own. */
export function LegalList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-primary/50">{children}</ul>
  )
}

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string
  /** One sentence under the heading saying what this page is for. */
  intro: string
  children: React.ReactNode
}) {
  return (
    <>
      <SiteNav />
      <main className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="font-serif text-[2rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2.5rem]">
            {title}
          </h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground">{intro}</p>

          <p className="mt-6 border-y border-border/70 py-4 text-[0.85rem] leading-relaxed text-muted-foreground">
            {ENTITY.tradingAs} is a product of <strong className="font-medium text-foreground">{ENTITY.legalName}</strong>,{' '}
            {ENTITY.descriptor}. On this page, &ldquo;{ENTITY.tradingAs}&rdquo;, &ldquo;we&rdquo; and
            &ldquo;us&rdquo; mean {ENTITY.legalName}.
            <br />
            Last updated: {LAST_UPDATED}.
          </p>

          <div className="mt-10 flex flex-col gap-9">{children}</div>

          <div className="mt-12 border-t border-border pt-6 text-[0.9rem] leading-relaxed text-muted-foreground">
            <p>
              Questions about this page? Write to{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-primary underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>{' '}
              and a person will reply.
            </p>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
              <Link href="/terms" className="text-primary underline underline-offset-4">
                Terms
              </Link>
              <Link href="/privacy" className="text-primary underline underline-offset-4">
                Privacy
              </Link>
              <Link href="/refunds" className="text-primary underline underline-offset-4">
                Refunds
              </Link>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
