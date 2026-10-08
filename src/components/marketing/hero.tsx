import Link from 'next/link'
import { ProductPreview } from './product-preview'
import { ctaHeroPrimary, ctaHeroSecondary } from './cta-styles'

const REASSURANCE = ['No credit card', 'Setup in minutes', 'Cancel anytime']

/**
 * The hero takes its copy as props so the same composition can carry a
 * different message, rather than a second hero being built beside it. Every
 * default below is the original homepage's wording, so <Hero /> with no props
 * renders exactly what it always did.
 *
 * `headline` is a list of lines because the hero breaks its own lines rather
 * than letting them fall where the viewport decides. The last line keeps the
 * hand-drawn underline.
 */
export type HeroProps = {
  headline?: string[]
  body?: string
  primary?: { label: string; href: string }
  secondary?: { label: string; href: string }
  reassurance?: string[]
  /** The panel beside the message. Defaults to the full platform preview. */
  preview?: React.ReactNode
}

function TickIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-3.5 shrink-0 text-primary" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.5 10.3l2.4 2.3 4.6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Hero({
  // Straight apostrophe, matching the &apos; the original markup rendered.
  headline = ['Design guest', "experiences they'll", 'remember.'],
  body = 'StayStory helps hosts design the whole guest journey — not just add another amenity. Uncover what makes your place meaningful, shape every moment around it, and deliver it consistently, stay after stay.',
  primary = { label: 'Start Free', href: '/signup' },
  secondary = { label: 'See the Platform', href: '/platform' },
  reassurance = REASSURANCE,
  preview = <ProductPreview />,
}: HeroProps = {}) {
  const lead = headline.slice(0, -1)
  const last = headline[headline.length - 1]

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pt-14 pb-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:pt-20 lg:pb-28">
        {/* ── Message ───────────────────────────────────────────────────── */}
        <div className="flex flex-col">
          <h1 className="font-serif text-[2.75rem] leading-[1.05] font-semibold tracking-tight text-foreground sm:text-6xl lg:text-[4.15rem]">
            {lead.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
            <span className="relative inline-block whitespace-nowrap">
              {last}
              <svg
                viewBox="0 0 240 12"
                preserveAspectRatio="none"
                aria-hidden
                className="absolute -bottom-1.5 left-0 h-2.5 w-full text-primary/45"
              >
                <path
                  d="M2 8.5C46 4 118 2.5 238 5.5"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            {body}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={primary.href} className={ctaHeroPrimary}>
              {primary.label}
              <span aria-hidden className="ml-1">→</span>
            </Link>
            {/* An anchor, not a Link: the focused hero points at an id on this
                same page, which Next's client router would not scroll to. */}
            <a href={secondary.href} className={ctaHeroSecondary}>
              {secondary.label}
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
            {reassurance.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-[0.8rem] text-muted-foreground">
                <TickIcon />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Product preview ───────────────────────────────────────────── */}
        <div className="lg:pl-4">{preview}</div>
      </div>
    </section>
  )
}
