/**
 * The StayStory Method page — Section 2, The Problem.
 *
 * The comparison does the work, so the copy stays short. Both columns are
 * data: rename a question, edit the takeaway, or add, remove and reorder any
 * example without touching the layout.
 */

export const PROBLEM = {
  label: 'The Problem',
  headline: 'Most hosts ask the wrong question.',
  supporting:
    'The instinct when a stay could be better is to add something to it. The more useful question is what experience all of it is adding up to.',
  takeaway: 'The goal isn’t more. It’s more meaning.',
  nuance:
    'None of this means amenities don’t matter. A better coffee machine is genuinely good — the question is what part it plays in the experience you’re designing.',
}

const ICONS = {
  question: 'M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01M12 21a9 9 0 100-18 9 9 0 000 18z',
  heart: 'M12 20s-7-4.4-7-9.2A3.9 3.9 0 0112 8.6a3.9 3.9 0 017 2.2c0 4.8-7 9.2-7 9.2z',
} as const

export type Side = {
  id: string
  question: string
  items: string[]
  icon: keyof typeof ICONS
}

export const TYPICAL: Side = {
  id: 'typical',
  question: 'What else should I add?',
  items: ['More amenities', 'Bigger TV', 'Better coffee machine', 'More towels', 'Higher thread count'],
  icon: 'question',
}

export const INTENTIONAL: Side = {
  id: 'intentional',
  question: 'What do I want guests to remember?',
  items: [
    'Feeling welcomed',
    'Feeling cared for',
    'Feeling at home',
    'Feeling connected',
    'Feeling inspired',
  ],
  icon: 'heart',
}

function SideIcon({ icon, emphasis }: { icon: keyof typeof ICONS; emphasis?: boolean }) {
  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
        emphasis ? 'bg-primary/12 text-primary' : 'bg-muted text-muted-foreground'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
        <path
          d={ICONS[icon]}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function ComparisonCard({ side, emphasis }: { side: Side; emphasis?: boolean }) {
  return (
    <div
      className={`h-full rounded-2xl border p-6 ${
        emphasis ? 'border-primary/25 bg-primary/[0.05]' : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center gap-3">
        <SideIcon icon={side.icon} emphasis={emphasis} />
        <h3
          className={`font-serif text-[0.98rem] leading-snug font-semibold ${
            emphasis ? 'text-foreground' : 'text-foreground'
          }`}
        >
          {side.question}
        </h3>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {side.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[0.85rem] leading-snug">
            <span
              aria-hidden
              className={emphasis ? 'text-primary' : 'text-muted-foreground/60'}
            >
              +
            </span>
            <span className={emphasis ? 'text-foreground' : 'text-muted-foreground'}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MethodProblem() {
  return (
    <section id="the-problem" className="px-6 py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.85fr_2fr] lg:gap-14">
        {/* ── The framing ──────────────────────────────────────────────── */}
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {PROBLEM.label}
          </p>
          <h2 className="font-serif text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2rem]">
            {PROBLEM.headline}
          </h2>
          <p className="mt-4 max-w-sm text-[0.9rem] leading-relaxed text-muted-foreground">
            {PROBLEM.supporting}
          </p>
        </div>

        {/* ── The comparison ───────────────────────────────────────────── */}
        <div>
          <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
            <ComparisonCard side={TYPICAL} />

            {/* The pivot between the two questions. */}
            <div className="flex items-center justify-center lg:px-5">
              <span aria-hidden className="hidden h-px w-5 bg-border lg:block" />
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[0.7rem] font-semibold text-muted-foreground">
                vs.
              </span>
              <span aria-hidden className="hidden h-px w-5 bg-border lg:block" />
            </div>

            <ComparisonCard side={INTENTIONAL} emphasis />
          </div>

          <div className="mt-8">
            <p className="font-serif text-lg leading-snug font-semibold text-foreground">
              {PROBLEM.takeaway}
            </p>
            <p className="mt-2 max-w-2xl text-[0.85rem] leading-relaxed text-muted-foreground">
              {PROBLEM.nuance}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
