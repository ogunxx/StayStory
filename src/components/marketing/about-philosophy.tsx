/**
 * About — Section 5. Our philosophy.
 *
 * Copy left, a two-by-two grid of principles right. Each principle is one
 * entry in PRINCIPLES — edit `title`, `body` or `icon`, reorder them, or add a
 * fifth and the grid absorbs it.
 */

const ICONS = {
  compass: 'M12 21a9 9 0 100-18 9 9 0 000 18zM15 9l-1.8 4.2L9 15l1.8-4.2z',
  guide: 'M9 11a2.6 2.6 0 100-5.2A2.6 2.6 0 009 11zm7 0a2.2 2.2 0 100-4.4A2.2 2.2 0 0016 11zM3.5 18.5c0-2.7 2.5-4.2 5.5-4.2s5.5 1.5 5.5 4.2M16 14.5c2.6.2 4.5 1.6 4.5 4',
  heart: 'M12 20s-7-4.6-7-9.4A3.9 3.9 0 0112 8.6a3.9 3.9 0 017 2c0 4.8-7 9.4-7 9.4z',
  leaf: 'M5 19c0-7 4.5-11 14-11 0 9-4.5 12-10 12-2.4 0-4-1-4-1zm2-2c2.5-3.5 5.5-5.5 9-6.8',
} as const

type IconKey = keyof typeof ICONS

export type Principle = {
  id: string
  title: string
  body: string
  icon: IconKey
}

export const PRINCIPLES: Principle[] = [
  {
    id: 'intentional',
    title: 'Intentional over accidental',
    body: 'Great experiences are designed, not left to chance.',
    icon: 'compass',
  },
  {
    id: 'guide',
    title: 'Guide, don’t be the hero',
    body: 'Your role is to create the conditions for their best story.',
    icon: 'guide',
  },
  {
    id: 'meaningful',
    title: 'Meaningful over more',
    body: 'It’s not about adding more. It’s about what matters.',
    icon: 'heart',
  },
  {
    id: 'everyone',
    title: 'Better for everyone',
    body: 'Great experiences are good for guests, hosts and communities.',
    icon: 'leaf',
  },
]

function PrincipleCard({ principle }: { principle: Principle }) {
  return (
    <div className="flex min-w-0 gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
        <svg viewBox="0 0 24 24" fill="none" className="size-[1.15rem] text-primary" aria-hidden>
          <path
            d={ICONS[principle.icon]}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="min-w-0">
        <h3 className="text-[0.92rem] font-semibold leading-snug text-foreground">
          {principle.title}
        </h3>
        <p className="mt-1.5 text-[0.83rem] leading-relaxed text-muted-foreground">
          {principle.body}
        </p>
      </div>
    </div>
  )
}

export function AboutPhilosophy({
  eyebrow = 'Our philosophy',
  headline = ['Hospitality is a story.', 'The guest is the hero.'],
  paragraphs = [
    'We believe every stay has the potential to be transformational when it’s designed with intention.',
    'You are the guide. We help you create the journey. Your guest gets to live the story.',
  ],
  principles = PRINCIPLES,
}: {
  eyebrow?: string
  headline?: string[]
  paragraphs?: string[]
  principles?: Principle[]
}) {
  return (
    <section className="px-6 py-4">
      <div className="mx-auto w-full max-w-7xl rounded-3xl bg-accent/25 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="min-w-0">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h2 className="font-serif text-[1.7rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2.1rem]">
              {headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <div className="mt-5 flex flex-col gap-3">
              {paragraphs.map((p) => (
                <p key={p} className="max-w-sm text-[0.92rem] leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {principles.map((p) => (
              <PrincipleCard key={p.id} principle={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
