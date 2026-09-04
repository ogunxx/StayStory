/**
 * The StayStory Method page — Section 6, The Guiding Thread.
 *
 * The Compass sits at the centre with the principles around it, because the
 * point of the section is that it isn't a step that happens once — it's the
 * thing every later decision is checked against.
 *
 * PRINCIPLES splits itself down the middle for the two columns, so adding,
 * removing or reordering one rebalances the diagram on its own.
 */

export const THREAD = {
  label: 'The Guiding Thread',
  headline: 'Every decision comes back to what you want guests to feel.',
  supporting:
    'The Experience Compass sets the emotional direction of the stay, and then gives you a way to weigh everything that comes after it. New amenity, new message, new ritual — the question is the same: does this support the experience we said we wanted to create?',
  takeaway: 'When the feeling is clear, the details get easier to choose.',
  /** Named beneath the diagram to show the Compass keeps working after Define. */
  guides: ['Audit', 'Blueprint', 'Generator', 'Story Builder', 'Playbook'],
}

export const EXAMPLE = {
  heading: 'What it looks like in practice',
  decision: 'Adding a welcome gift.',
  before: 'What should we give them?',
  after: 'What welcome gesture would feel warm, local, and thoughtful?',
  result:
    'Which is how you end up with coffee from the roaster two streets away instead of a fruit basket.',
}

const ICONS = {
  leaf: 'M5 19c0-8 6-13 14-13 0 9-5 14-11 14-1.5 0-3 0-3-1zM5 19c2-3.5 4.5-6 8-8',
  heart: 'M12 20s-7-4.4-7-9.2A3.9 3.9 0 0112 8.6a3.9 3.9 0 017 2.2c0 4.8-7 9.2-7 9.2z',
  pin: 'M12 21s6.5-6 6.5-11a6.5 6.5 0 10-13 0c0 5 6.5 11 6.5 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  gift: 'M4 11h16v9H4zM3 7.5h18V11H3zM12 7.5V20M12 7.5S10.5 3.5 8 3.5a2 2 0 100 4zM12 7.5s1.5-4 4-4a2 2 0 110 4z',
} as const

type IconKey = keyof typeof ICONS

export type Principle = { id: string; label: string; icon: IconKey }

export const PRINCIPLES: Principle[] = [
  { id: 'effortless', label: 'Effortless', icon: 'leaf' },
  { id: 'local', label: 'Local & Immersive', icon: 'pin' },
  { id: 'warm', label: 'Warm', icon: 'heart' },
  { id: 'thoughtful', label: 'Thoughtful', icon: 'gift' },
]

function Chip({ principle }: { principle: Principle }) {
  return (
    <span className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
          <path
            d={ICONS[principle.icon]}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[0.85rem] leading-snug font-medium text-foreground">
        {principle.label}
      </span>
    </span>
  )
}

/** Sits between a chip and the compass; DOM order decides which side. */
function Connector() {
  return <span aria-hidden className="hidden h-px w-8 shrink-0 bg-border sm:block" />
}

function Compass() {
  return (
    <span className="flex size-28 shrink-0 items-center justify-center rounded-full border border-border bg-card sm:size-32">
      <svg viewBox="0 0 96 96" className="size-20 sm:size-24" aria-hidden>
        <circle cx="48" cy="48" r="34" fill="none" stroke="var(--border)" strokeWidth="1" />
        {/* Tick marks at the cardinal points. */}
        {[0, 90, 180, 270].map((deg) => (
          <line
            key={deg}
            x1="48"
            y1="10"
            x2="48"
            y2="16"
            stroke="var(--border)"
            strokeWidth="1.5"
            strokeLinecap="round"
            transform={`rotate(${deg} 48 48)`}
          />
        ))}
        {/* Needle. */}
        <path d="M48 20 L55 48 L48 76 L41 48 Z" fill="var(--primary)" opacity="0.9" />
        <path d="M20 48 L48 41 L76 48 L48 55 Z" fill="var(--primary)" opacity="0.35" />
        <circle cx="48" cy="48" r="3.5" fill="var(--background)" stroke="var(--primary)" strokeWidth="1.5" />
      </svg>
    </span>
  )
}

export function MethodThread() {
  const half = Math.ceil(PRINCIPLES.length / 2)
  const left = PRINCIPLES.slice(0, half)
  const right = PRINCIPLES.slice(half)

  return (
    <section id="the-guiding-thread" className="px-6 py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {THREAD.label}
          </p>
          <h2 className="font-serif text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2rem]">
            {THREAD.headline}
          </h2>
          <p className="mt-5 max-w-xl text-[0.9rem] leading-relaxed text-muted-foreground">
            {THREAD.supporting}
          </p>
        </div>

        {/* ── The Compass and its principles ───────────────────────────── */}
        <div className="mt-14 flex flex-col items-center gap-6 sm:mt-16 sm:flex-row sm:justify-center sm:gap-4">
          <div className="flex w-full flex-col gap-4 sm:w-auto sm:items-end">
            {left.map((p) => (
              <span key={p.id} className="flex items-center gap-0 sm:gap-0">
                <Chip principle={p} />
                <Connector />
              </span>
            ))}
          </div>

          <Compass />

          <div className="flex w-full flex-col gap-4 sm:w-auto sm:items-start">
            {right.map((p) => (
              <span key={p.id} className="flex items-center gap-0">
                <Connector />
                <Chip principle={p} />
              </span>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-[0.8rem] text-muted-foreground">
          Guides your{' '}
          <span className="text-foreground">{THREAD.guides.join(' · ')}</span>
        </p>

        {/* ── What it changes ──────────────────────────────────────────── */}
        <div className="mt-14 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-12">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
              {EXAMPLE.heading}
            </p>
            <p className="mt-2 text-[0.9rem] font-medium text-foreground">{EXAMPLE.decision}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/60 p-3.5">
                <p className="text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground">
                  Without it
                </p>
                <p className="mt-1 text-[0.82rem] leading-snug text-muted-foreground">
                  “{EXAMPLE.before}”
                </p>
              </div>
              <div className="rounded-xl bg-primary/[0.07] p-3.5">
                <p className="text-[0.58rem] uppercase tracking-[0.12em] text-primary">With it</p>
                <p className="mt-1 text-[0.82rem] leading-snug text-foreground">
                  “{EXAMPLE.after}”
                </p>
              </div>
            </div>
            <p className="mt-3.5 text-[0.8rem] leading-relaxed text-muted-foreground">
              {EXAMPLE.result}
            </p>
          </div>

          <p className="font-serif text-xl leading-snug font-semibold text-foreground lg:text-2xl">
            {THREAD.takeaway}
          </p>
        </div>
      </div>
    </section>
  )
}
