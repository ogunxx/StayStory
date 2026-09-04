/**
 * Section 4 — Proof / Results.
 *
 * Everything here is content, not a graphic. To change what this section says:
 *
 *   • the reviews          → edit, reorder, add to or remove from REVIEWS
 *   • a quote or author    → `quote`, `author`, `source` on an entry
 *   • the editorial label  → `labelTitle` and `labelValue` on an entry
 *   • the icon             → `icon`, one of the keys in ICONS
 *   • the attribution line → ATTRIBUTION
 *   • the rating           → passed in as props from the page, which reads the
 *                            live figures from Supabase `site_config`; the
 *                            defaults below are only a fallback
 *
 * The layout follows the review count, so three is not baked in — add a
 * fourth and the grid adapts.
 */

export const ATTRIBUTION =
  'These are real guests’ words from Laurel & Lore, where the StayStory system was developed and tested.'

const ICONS = {
  heart: 'M10 16.5s-5.5-3.6-5.5-7.4A3.1 3.1 0 0110 7.3a3.1 3.1 0 015.5 1.8c0 3.8-5.5 7.4-5.5 7.4z',
  spark: 'M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z',
  grid: 'M4 4h5v5H4zM11 4h5v5h-5zM4 11h5v5H4zM11 11h5v5h-5z',
} as const

type IconKey = keyof typeof ICONS

export type Review = {
  id: string
  quote: string
  author: string
  source: string
  labelTitle: string
  labelValue: string
  icon: IconKey
}

export const REVIEWS: Review[] = [
  {
    id: 'jo',
    quote: 'This host had thought of everything.',
    author: 'Jo',
    source: 'July 2024 · 5★',
    labelTitle: 'What they noticed',
    labelValue: 'Anticipation',
    icon: 'heart',
  },
  {
    id: 'katie',
    quote: 'It made us feel very nurtured and safe.',
    author: 'Katie',
    source: 'Asheville, NC · October 2024 · 5★',
    labelTitle: 'What they remembered',
    labelValue: 'How the stay made them feel',
    icon: 'spark',
  },
  {
    id: 'carolina',
    quote: 'The little details made it super homey.',
    author: 'Carolina',
    source: 'Hollywood, FL · June 2025 · 5★',
    labelTitle: 'What created it',
    labelValue: 'Meaningful details',
    icon: 'grid',
  },
]

function Stars() {
  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="size-4 text-primary">
          <path d="M10 1.8l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.6-5 2.6.9-5.6-4-4 5.6-.8z" />
        </svg>
      ))}
    </span>
  )
}

function QuoteMark() {
  return (
    <svg viewBox="0 0 32 24" fill="currentColor" aria-hidden className="size-6 text-primary/35">
      <path d="M0 24V13.4C0 6.2 4 1.4 11.4 0l1.4 3.4C8.6 4.8 6.4 7.4 6.4 11h4.8v13zm19.2 0V13.4C19.2 6.2 23.2 1.4 30.6 0L32 3.4c-4.2 1.4-6.4 4-6.4 7.6h4.8v13z" />
    </svg>
  )
}

export function Proof({
  rating = '4.99',
  reviews = '136',
  sourceHref,
  sourceLabel = 'See them on Airbnb',
}: {
  rating?: string
  reviews?: string
  /** Optional link so a visitor can verify the reviews at the source. */
  sourceHref?: string
  sourceLabel?: string
}) {
  return (
    <section id="proof" className="border-y border-border bg-card px-6 py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        {/* ── Header: headline · attribution · rating ─────────────────── */}
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.9fr_auto] lg:items-start lg:gap-12">
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              The proof is in what guests remember
            </p>
            <h2 className="max-w-md font-serif text-[1.9rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl">
              When hospitality is intentional, guests talk differently.
            </h2>
          </div>

          <div className="max-w-sm lg:pt-9">
            <p className="text-[0.9rem] leading-relaxed text-muted-foreground">{ATTRIBUTION}</p>
            {sourceHref && (
              <a
                href={sourceHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-[0.82rem] font-medium text-primary hover:underline"
              >
                {sourceLabel} ↗
              </a>
            )}
          </div>

          <div className="flex items-center gap-5 lg:border-l lg:border-border lg:pl-12 lg:pt-8">
            <span className="font-serif text-5xl font-semibold tracking-tight text-foreground">
              {rating}
            </span>
            <span className="flex flex-col gap-1.5">
              <Stars />
              <span className="text-[0.78rem] text-muted-foreground">
                {reviews} guest reviews
              </span>
            </span>
          </div>
        </div>

        {/* ── Reviews ─────────────────────────────────────────────────── */}
        <ul className="mt-14 grid gap-4 lg:mt-16 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-background p-6 sm:p-7"
            >
              <QuoteMark />

              <blockquote className="font-serif text-xl leading-snug font-medium text-foreground sm:text-[1.35rem]">
                {r.quote}
              </blockquote>

              <div className="mt-auto flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                    {r.labelTitle}
                  </p>
                  <p className="mt-0.5 text-[0.85rem] leading-snug text-foreground">
                    {r.labelValue}
                  </p>
                  <p className="mt-3 text-[0.72rem] text-muted-foreground">
                    {r.author} · {r.source}
                  </p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden>
                    <path
                      d={ICONS[r.icon]}
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
