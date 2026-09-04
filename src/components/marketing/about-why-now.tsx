/**
 * About — Section 7. Why guest experience design matters now.
 *
 * Copy left, a row of figures right.
 *
 * ┌─ TO FILL IN LATER ─────────────────────────────────────────────────────┐
 * │ All four figures below are placeholders, held with `placeholder: true`. │
 * │ Nothing renders on the page while that flag is set — no numbers, no    │
 * │ sources, no empty boxes; the section shows its copy on its own and     │
 * │ reads as finished.                                                     │
 * │                                                                        │
 * │ To publish a figure: fill in `value`, `body` and `source`, then delete │
 * │ that entry's `placeholder: true` line. The panel comes back the moment │
 * │ one entry is real, and lays out for however many you turn on.          │
 * │                                                                        │
 * │ The values sitting here now came from the mockup and no source has     │
 * │ been checked. Treat them as prompts for what to look up, not as facts. │
 * │ Note the homepage cites PwC at 86% for a closely related claim — the   │
 * │ two should not contradict each other once verified.                    │
 * └────────────────────────────────────────────────────────────────────────┘
 */

const ICONS = {
  people:
    'M9 11a2.6 2.6 0 100-5.2A2.6 2.6 0 009 11zm7 0a2.2 2.2 0 100-4.4A2.2 2.2 0 0016 11zM3.5 18.5c0-2.7 2.5-4.2 5.5-4.2s5.5 1.5 5.5 4.2M16 14.5c2.6.2 4.5 1.6 4.5 4',
  star: 'M12 3.8l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.6-5 2.6.9-5.6-4-4 5.6-.8z',
  heart: 'M12 20s-7-4.6-7-9.4A3.9 3.9 0 0112 8.6a3.9 3.9 0 017 2c0 4.8-7 9.4-7 9.4z',
  chart: 'M4 20h16M7 20v-6m4.5 6V8m4.5 12v-9M7.5 9.5l4-4 3 3 4.5-4.5',
} as const

type IconKey = keyof typeof ICONS

export type Stat = {
  id: string
  value: string
  body: string
  /** Who published it. Add the report title once verified. */
  source: string
  icon: IconKey
  /** While true, this figure is not published. Delete the line to show it. */
  placeholder?: boolean
}

export const STATS: Stat[] = [
  {
    id: 'as-important',
    value: '80%',
    body: 'of guests say the experience is as important as the property itself.',
    source: 'PwC',
    icon: 'people',
    placeholder: true,
  },
  {
    id: 'reviews',
    value: '79%',
    body: 'of guests say reviews influence their booking decision most.',
    source: 'BrightLocal',
    icon: 'star',
    placeholder: true,
  },
  {
    id: 'pay-more',
    value: '70%',
    body: 'of guests will pay more for a stay that feels personal and thoughtful.',
    source: 'Skift',
    icon: 'heart',
    placeholder: true,
  },
  {
    id: 'rebook',
    value: '3×',
    body: 'more likely for guests to rebook a stay when they feel an emotional connection.',
    source: 'Deloitte',
    icon: 'chart',
    placeholder: true,
  },
]

export function AboutWhyNow({
  eyebrow = 'Why guest experience design matters for today’s hosts',
  headline = 'Today’s guests have more choices than ever. What earns their loyalty is how you make them feel.',
  paragraphs = [
    'More amenities won’t create a more memorable stay. A thoughtfully designed guest experience will.',
    'StayStory gives independent hosts the clarity, tools and confidence to design guest journeys that stand out — and to succeed on their own terms.',
  ],
  stats = STATS,
}: {
  eyebrow?: string
  headline?: string
  paragraphs?: string[]
  stats?: Stat[]
}) {
  // Placeholders stay off the page until someone fills them in.
  const published = stats.filter((stat) => !stat.placeholder)

  return (
    <section className="px-6 py-4">
      <div
        className={
          published.length > 0
            ? 'mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-center lg:gap-14'
            : 'mx-auto w-full max-w-7xl'
        }
      >
        <div className="min-w-0">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h2
            className={`font-serif text-[1.6rem] leading-[1.2] font-semibold tracking-tight text-foreground sm:text-[1.95rem] ${
              published.length > 0 ? 'max-w-md' : 'max-w-2xl'
            }`}
          >
            {headline}
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            {paragraphs.map((p) => (
              <p
                key={p}
                className={`text-[0.92rem] leading-relaxed text-muted-foreground ${
                  published.length > 0 ? 'max-w-sm' : 'max-w-xl'
                }`}
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        {published.length === 0 ? null : (
        <div className="rounded-3xl bg-secondary/25 px-6 py-10 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {published.map((stat, i) => (
              <div
                key={stat.id}
                className={`min-w-0 text-center lg:px-4 ${
                  i === 0 ? 'lg:pl-0' : 'lg:border-l lg:border-border/60'
                } ${i === published.length - 1 ? 'lg:pr-0' : ''}`}
              >
                <span className="mx-auto flex size-9 items-center justify-center rounded-xl border border-border bg-card">
                  <svg viewBox="0 0 24 24" fill="none" className="size-[1.1rem] text-primary" aria-hidden>
                    <path
                      d={ICONS[stat.icon]}
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="mt-4 font-serif text-[1.9rem] font-semibold text-foreground">
                  {stat.value}
                </p>
                <p className="mt-2 text-[0.8rem] leading-relaxed text-muted-foreground">
                  {stat.body}
                </p>
                <p className="mt-2 text-[0.72rem] text-muted-foreground/70">— {stat.source}</p>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  )
}
