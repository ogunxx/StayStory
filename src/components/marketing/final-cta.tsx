import Link from 'next/link'

/**
 * Section 6 — the closing call to action.
 *
 * Everything here is content. To change what it says, edit the props passed
 * from the page (or the defaults below):
 *
 *   • headline / supporting copy   → `headline`, `supporting`
 *   • primary CTA                  → `primaryLabel`, `primaryHref`
 *   • secondary CTA                → `secondaryLabel`, `secondaryHref`
 *   • reassurance points           → `reassurance` (each item independent)
 *
 * On the supporting line: the mockup reads "Join thousands of hosts…", which
 * StayStory can't yet substantiate. Per the brief, this uses true wording
 * instead — the real, verifiable Laurel & Lore figures, passed in from the
 * page so they track the live numbers.
 */

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-3.5 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M6.5 10.3l2.4 2.3 4.6-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Corner line-art, matching the mockup's heart and star marks. */
function Decor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="absolute left-8 top-8 size-6 text-background/25 sm:left-10 sm:top-10"
      >
        <path
          d="M12 20s-7-4.6-7-9.4A3.9 3.9 0 0112 8.6a3.9 3.9 0 017 2c0 4.8-7 9.4-7 9.4z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="absolute right-8 top-8 size-6 text-background/25 sm:right-10 sm:top-10"
      >
        <path
          d="M12 3.5l2.4 6.1 6.1 2.4-6.1 2.4L12 20.5l-2.4-6.1L3.5 12l6.1-2.4z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        viewBox="0 0 600 300"
        fill="none"
        preserveAspectRatio="none"
        className="absolute -bottom-16 left-0 h-56 w-full text-background/[0.07]"
      >
        <path d="M-40 250C120 120 380 120 640 250" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 7" />
        <path d="M-40 290C120 160 380 160 640 290" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 7" />
      </svg>
    </div>
  )
}

function Reassurance({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item} className="flex items-center gap-1.5 text-[0.78rem] text-background/60">
          <Check />
          {item}
        </li>
      ))}
    </ul>
  )
}

/** The open-book mark that anchors the band layout, per the mockup. */
function BookGlyph() {
  return (
    <span aria-hidden className="relative hidden shrink-0 text-background/70 lg:block">
      <svg viewBox="0 0 24 24" fill="none" className="size-14">
        <path
          d="M4 4.8h5.5A2.5 2.5 0 0112 7.3v12a2 2 0 00-2-2H4zM20 4.8h-5.5A2.5 2.5 0 0012 7.3v12a2 2 0 012-2h6z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        viewBox="0 0 12 12"
        fill="currentColor"
        className="absolute -right-1.5 top-0 size-3 text-background/45"
      >
        <path d="M6 0l1.2 3.3L10.5 4.5 7.2 5.7 6 9 4.8 5.7 1.5 4.5l3.3-1.2z" />
      </svg>
      <svg
        viewBox="0 0 12 12"
        fill="currentColor"
        className="absolute -left-2 top-7 size-2.5 text-background/30"
      >
        <path d="M6 0l1.2 3.3L10.5 4.5 7.2 5.7 6 9 4.8 5.7 1.5 4.5l3.3-1.2z" />
      </svg>
    </span>
  )
}

export function FinalCta({
  headline = 'Ready to design stays your guests could never forget?',
  supporting,
  primaryLabel = 'Start Free',
  primaryHref = '/signup',
  secondaryLabel = 'See the Platform',
  secondaryHref = '#platform',
  reassurance = ['No credit card', 'Setup in minutes', 'Cancel anytime'],
  rating = '4.99',
  reviews = '136',
  layout = 'split',
}: {
  headline?: string
  supporting?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  reassurance?: string[]
  rating?: string
  reviews?: string
  /**
   * 'split'  — homepage: message left, CTA stack right.
   * 'band'   — Method page: glyph left, message centred, both buttons right.
   * Same panel, decor and tokens either way; only the arrangement differs.
   */
  layout?: 'split' | 'band'
}) {
  const supportingCopy =
    supporting ??
    `Start with the same system we built on our own property — now ${rating}★ across ${reviews} guest reviews.`

  if (layout === 'band') {
    return (
      <section id="get-started" className="px-6 pb-20 lg:pb-28">
        <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-foreground px-8 py-12 text-background sm:px-12 lg:px-14">
          <Decor />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
            <BookGlyph />

            <div className="flex-1 lg:text-center">
              <h2 className="font-serif text-[1.7rem] leading-[1.15] font-semibold tracking-tight sm:text-[2rem]">
                {headline}
              </h2>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-background/70 lg:mx-auto lg:max-w-xl">
                {supportingCopy}
              </p>
              {/* Desktop: sits under the headline, as in the mockup. */}
              <Reassurance items={reassurance} className="mt-4 hidden flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:flex" />
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href={primaryHref}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-background px-6 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
              >
                {primaryLabel}
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-background/35 px-6 text-sm font-medium text-background transition-colors hover:bg-background/10"
              >
                {secondaryLabel}
              </Link>
            </div>

            {/* Mobile keeps the brief's order: CTAs, then reassurance. */}
            <Reassurance items={reassurance} className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:hidden" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="get-started" className="px-6 pb-20 lg:pb-28">
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-foreground px-8 py-14 text-background sm:px-12 lg:px-16 lg:py-16">
        <Decor />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
          <div>
            <h2 className="max-w-lg font-serif text-[1.9rem] leading-[1.15] font-semibold tracking-tight sm:text-4xl lg:text-[2.6rem]">
              {headline}
            </h2>
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-background/70">
              {supportingCopy}
            </p>
          </div>

          <div className="flex flex-col items-start gap-5 lg:items-center">
            <Link
              href={primaryHref}
              className="inline-flex h-12 items-center justify-center rounded-full bg-background px-8 text-base font-medium text-foreground transition-opacity hover:opacity-90"
            >
              {primaryLabel}
              <span aria-hidden className="ml-2">→</span>
            </Link>

            <a
              href={secondaryHref}
              className="text-sm font-medium text-background/80 underline underline-offset-4 transition-colors hover:text-background"
            >
              {secondaryLabel}
            </a>

            <ul className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-center">
              {reassurance.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-[0.78rem] text-background/60"
                >
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
