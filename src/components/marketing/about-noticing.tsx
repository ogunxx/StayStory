/**
 * About — Section 4. What we started noticing.
 *
 * Five observations in a divided row. Each is one entry in NOTICINGS:
 *
 *   • the title       → `title` (an array, one line per row, as in the mockup)
 *   • the detail      → `detail`
 *   • the icon        → `icon`, one of the keys in ICONS
 *   • add / remove    → add or delete an entry; the grid follows the count
 *
 * These describe what guests told us at Laurel & Lore. They are observations,
 * not measured findings, and the copy says so.
 */

const ICONS = {
  heart:
    'M12 20s-7-4.6-7-9.4A3.9 3.9 0 0112 8.6a3.9 3.9 0 017 2c0 4.8-7 9.4-7 9.4z',
  spark: 'M12 3.5l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z',
  person:
    'M12 12a3.6 3.6 0 100-7.2A3.6 3.6 0 0012 12zM5 20c0-3.4 3.1-5.4 7-5.4s7 2 7 5.4',
  peak: 'M3 19l6-11 4 6.5 2.5-4L21 19z',
  message: 'M4.5 5.5h15v10h-9l-4 3.5v-3.5h-2z',
} as const

type IconKey = keyof typeof ICONS

export type Noticing = {
  id: string
  /** One line per entry, so the break point stays editable. */
  title: string[]
  detail: string
  icon: IconKey
}

export const NOTICINGS: Noticing[] = [
  {
    id: 'little-things',
    title: ['They talk about', 'the little things.'],
    detail: 'The thoughtful details made the biggest impression.',
    icon: 'heart',
  },
  {
    id: 'easy',
    title: ['They value how', 'you made it easy.'],
    detail: 'Clarity, guidance and anticipation created confidence.',
    icon: 'spark',
  },
  {
    id: 'connection',
    title: ['They crave connection', 'to the place.'],
    detail: 'Local recommendations and meaningful experiences matter.',
    icon: 'person',
  },
  {
    id: 'peaks',
    title: ['They remember', 'the emotional peaks.'],
    detail: 'The moments of joy, surprise and delight are what last.',
    icon: 'peak',
  },
  {
    id: 'care',
    title: ['They feel it', 'when you care.'],
    detail: 'Hospitality is more about intention than perfection.',
    icon: 'message',
  },
]

function Icon({ path }: { path: string }) {
  return (
    <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-card">
      <svg viewBox="0 0 24 24" fill="none" className="size-[1.1rem] text-primary" aria-hidden>
        <path
          d={path}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function AboutNoticing({
  eyebrow = 'What we started noticing',
  headline = 'Guests remember how you made them feel.',
  items = NOTICINGS,
}: {
  eyebrow?: string
  headline?: string
  items?: Noticing[]
}) {
  return (
    <section className="px-6 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h2 className="max-w-2xl font-serif text-[1.8rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2.3rem]">
          {headline}
        </h2>

        {/* Dividers sit between columns on desktop and between rows on mobile,
            so the reading order stays vertical on a phone. */}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:mt-12 lg:grid-cols-5 lg:gap-0">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`min-w-0 lg:px-6 ${
                i === 0 ? 'lg:pl-0' : 'lg:border-l lg:border-border/70'
              } ${i === items.length - 1 ? 'lg:pr-0' : ''}`}
            >
              <Icon path={ICONS[item.icon]} />
              <h3 className="mt-4 text-[0.95rem] font-semibold leading-snug text-foreground">
                {item.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h3>
              <span aria-hidden className="mt-3 block h-px w-8 bg-primary/40" />
              <p className="mt-3 text-[0.83rem] leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
