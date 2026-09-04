/**
 * The StayStory Method page — Section 4, Why Experiences Matter.
 *
 * The visual makes one point: the moments in a stay don't carry equal
 * emotional weight, and the tall ones are the ones worth designing.
 *
 * Everything is data. STAGES drives the curve — change a `weight` and the
 * shape follows; add or remove a stage and the spacing recalculates. PRINCIPLES
 * are free to rename, reorder, add to or cut.
 */

export const WHY = {
  label: 'Why experiences matter',
  headline:
    'Guests don’t remember everything. They remember what stood out — and how it made them feel.',
  supporting:
    'A stay is made of dozens of moments, but only a few become part of the story guests carry home. The work is finding those and shaping them on purpose.',
  callout: 'People may forget the details. They remember the feeling.',
}

export const PRINCIPLES: string[] = [
  'Anticipation',
  'Meaningful details',
  'Rituals',
  'Surprise',
  'Emotional peaks',
  'Ease',
  'Story',
  'Feeling cared for',
]

export type Stage = {
  id: string
  label: string
  /** 0–100. How much emotional weight this moment tends to carry. */
  weight: number
  /** Set to name the moment worth designing here. */
  highlight?: string
}

export const STAGES: Stage[] = [
  { id: 'dreaming', label: 'Dreaming', weight: 68, highlight: 'Anticipation' },
  { id: 'booking', label: 'Booking', weight: 22 },
  { id: 'arriving', label: 'Arriving', weight: 92, highlight: 'The first ten seconds' },
  { id: 'staying', label: 'Staying', weight: 52 },
  { id: 'reflecting', label: 'Reflecting', weight: 84, highlight: 'The goodbye' },
]

/* The curve is drawn in this coordinate space and scales with the container. */
const VB = { w: 600, h: 150, padX: 45, top: 22, bottom: 128 }

function points(stages: Stage[]) {
  const span = VB.w - VB.padX * 2
  return stages.map((s, i) => ({
    stage: s,
    x: stages.length === 1 ? VB.w / 2 : VB.padX + (span / (stages.length - 1)) * i,
    y: VB.bottom - (s.weight / 100) * (VB.bottom - VB.top),
  }))
}

/** Smooth curve with horizontal tangents, so it reads as a swell not a zigzag. */
function curve(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const mid = (a.x + b.x) / 2
    d += ` C${mid},${a.y} ${mid},${b.y} ${b.x},${b.y}`
  }
  return d
}

function MomentCurve() {
  const pts = points(STAGES)
  const line = curve(pts)
  const area = `${line} L${pts[pts.length - 1].x},${VB.bottom} L${pts[0].x},${VB.bottom} Z`

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full" role="img" aria-label="Emotional weight across the guest journey, peaking at a few designed moments">
        <defs>
          <linearGradient id="ss-moment-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={VB.padX - 12}
          y1={VB.bottom}
          x2={VB.w - VB.padX + 12}
          y2={VB.bottom}
          stroke="var(--border)"
          strokeWidth="1"
        />
        <path d={area} fill="url(#ss-moment-fill)" />
        <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />

        {pts.map(({ stage, x, y }) =>
          stage.highlight ? (
            <g key={stage.id}>
              <circle cx={x} cy={y} r="8" fill="var(--primary)" opacity="0.16" />
              <circle cx={x} cy={y} r="4" fill="var(--primary)" />
            </g>
          ) : (
            <circle
              key={stage.id}
              cx={x}
              cy={y}
              r="3.5"
              fill="var(--background)"
              stroke="var(--border)"
              strokeWidth="1.5"
            />
          )
        )}
      </svg>

      {/* Peak callouts. Positioned as a percentage of the same coordinate
          space, so they track the curve at any width. Hidden on phones,
          where they'd overlap — the list beneath carries them instead. */}
      {pts
        .filter((p) => p.stage.highlight)
        .map(({ stage, x, y }) => (
          <span
            key={stage.id}
            className="absolute hidden -translate-x-1/2 -translate-y-[190%] whitespace-nowrap text-[0.68rem] font-medium text-primary sm:block"
            style={{ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%` }}
          >
            {stage.highlight}
          </span>
        ))}

      {/* Stage labels, aligned to the same x positions. */}
      <div className="relative mt-1">
        {pts.map(({ stage, x }) => (
          <span
            key={stage.id}
            className="absolute -translate-x-1/2 whitespace-nowrap text-[0.7rem] text-muted-foreground"
            style={{ left: `${(x / VB.w) * 100}%` }}
          >
            {stage.label}
          </span>
        ))}
        <span className="block h-5" aria-hidden />
      </div>

      {/* Phones: the highlighted moments as a plain list. */}
      <p className="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground sm:hidden">
        Worth designing:{' '}
        <span className="text-primary">
          {STAGES.filter((s) => s.highlight)
            .map((s) => s.highlight)
            .join(' · ')}
        </span>
      </p>
    </div>
  )
}

export function MethodWhy() {
  return (
    <section id="why-experiences-matter" className="px-6 py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.9fr] lg:gap-14">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {WHY.label}
          </p>
          <h2 className="font-serif text-[1.6rem] leading-[1.18] font-semibold tracking-tight text-foreground sm:text-[1.9rem]">
            {WHY.headline}
          </h2>
          <p className="mt-4 max-w-sm text-[0.9rem] leading-relaxed text-muted-foreground">
            {WHY.supporting}
          </p>
          <p className="mt-6 max-w-sm border-l-2 border-primary/40 pl-4 font-serif text-[0.98rem] leading-snug text-foreground">
            {WHY.callout}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <MomentCurve />

          <ul className="flex flex-wrap gap-2">
            {PRINCIPLES.map((p) => (
              <li
                key={p}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[0.78rem] text-muted-foreground"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
