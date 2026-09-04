/**
 * About — Section 7. Why guest experience design matters now.
 *
 * Copy left, a row of four figures right. Each figure is one entry in STATS.
 *
 * ⚠️ VERIFY BEFORE LAUNCH. These four figures and their attributions come from
 * the approved mockup, not from a source we've checked. The brief is explicit
 * that we don't publish unverified numbers, so either confirm each against the
 * cited report and add the report name to `source`, or replace it here. Note
 * that the homepage currently cites PwC at 86% for a closely related claim —
 * the two should not contradict each other once verified.
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
}

export const STATS: Stat[] = [
  {
    id: 'as-important',
    value: '80%',
    body: 'of guests say the experience is as important as the property itself.',
    source: 'PwC',
    icon: 'people',
  },
  {
    id: 'reviews',
    value: '79%',
    body: 'of guests say reviews influence their booking decision most.',
    source: 'BrightLocal',
    icon: 'star',
  },
  {
    id: 'pay-more',
    value: '70%',
    body: 'of guests will pay more for a stay that feels personal and thoughtful.',
    source: 'Skift',
    icon: 'heart',
  },
  {
    id: 'rebook',
    value: '3×',
    body: 'more likely for guests to rebook a stay when they feel an emotional connection.',
    source: 'Deloitte',
    icon: 'chart',
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
  return (
    <section className="px-6 py-4">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-center lg:gap-14">
        <div className="min-w-0">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h2 className="max-w-md font-serif text-[1.6rem] leading-[1.2] font-semibold tracking-tight text-foreground sm:text-[1.95rem]">
            {headline}
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            {paragraphs.map((p) => (
              <p key={p} className="max-w-sm text-[0.92rem] leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-secondary/25 px-6 py-10 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {stats.map((stat, i) => (
              <div
                key={stat.id}
                className={`min-w-0 text-center lg:px-4 ${
                  i === 0 ? 'lg:pl-0' : 'lg:border-l lg:border-border/60'
                } ${i === stats.length - 1 ? 'lg:pr-0' : ''}`}
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
      </div>
    </section>
  )
}
