/**
 * The StayStory Method page — Section 3, The Shift.
 *
 * Movement rather than contrast: the Problem section sets two things against
 * each other, this one carries each term across into something larger.
 *
 * Each transformation is one entry in SHIFTS — rename either side, swap the
 * icons, reorder, add a fourth or drop to two. The layout follows the count.
 */

const ICONS = {
  amenity: 'M5 9.5h14M6.5 9.5V19h11V9.5M9 9.5V6a3 3 0 016 0v3.5',
  moment: 'M12 20s-7-4.4-7-9.2A3.9 3.9 0 0112 8.6a3.9 3.9 0 017 2.2c0 4.8-7 9.2-7 9.2z',
  property: 'M4 10.5L12 4l8 6.5V20H4zM9.5 20v-6h5v6',
  journey: 'M6 20c0-4 3-4 6-6s3-6 3-6M6.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 9.5a2 2 0 100-4 2 2 0 000 4z',
  service: 'M4.5 17.5h15M6.5 17.5a5.5 5.5 0 0111 0M12 5v2M9.5 12h5',
  feeling: 'M12 21a9 9 0 100-18 9 9 0 000 18zM8.5 14s1.3 1.5 3.5 1.5 3.5-1.5 3.5-1.5M9 9.5h.01M15 9.5h.01',
} as const

type IconKey = keyof typeof ICONS

export type Shift = {
  id: string
  from: string
  to: string
  fromIcon: IconKey
  toIcon: IconKey
}

export const SHIFT = {
  label: 'The Shift',
  headline: 'From providing more to designing what matters.',
  supporting:
    'A memorable stay isn’t built by adding isolated touches one at a time. It comes from seeing the whole journey and shaping the moments that carry the most weight.',
  aside: 'Every detail becomes more powerful when it has a purpose.',
}

export const SHIFTS: Shift[] = [
  { id: 'moments', from: 'Amenities', to: 'Moments', fromIcon: 'amenity', toIcon: 'moment' },
  { id: 'journey', from: 'Property', to: 'Journey', fromIcon: 'property', toIcon: 'journey' },
  { id: 'feeling', from: 'Service', to: 'Feeling', fromIcon: 'service', toIcon: 'feeling' },
]

function Glyph({ icon, emphasis }: { icon: IconKey; emphasis?: boolean }) {
  return (
    <span
      className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
        emphasis ? 'bg-primary/12 text-primary' : 'bg-muted text-muted-foreground'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
        <path
          d={ICONS[icon]}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0 text-primary/50" aria-hidden>
      <path
        d="M4 12h15m0 0l-5-5m5 5l-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MethodShift() {
  return (
    <section id="the-shift" className="px-6 py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.85fr_2fr] lg:items-center lg:gap-14">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {SHIFT.label}
          </p>
          <h2 className="font-serif text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2rem]">
            {SHIFT.headline}
          </h2>
          <p className="mt-4 max-w-sm text-[0.9rem] leading-relaxed text-muted-foreground">
            {SHIFT.supporting}
          </p>
        </div>

        <div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {SHIFTS.map((s) => (
              <li
                key={s.id}
                className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-5 py-7 text-center"
              >
                <div className="flex items-center gap-3">
                  <Glyph icon={s.fromIcon} />
                  <Arrow />
                  <Glyph icon={s.toIcon} emphasis />
                </div>
                <p className="flex flex-wrap items-center justify-center gap-1.5 text-[0.9rem]">
                  <span className="text-muted-foreground">{s.from}</span>
                  <span aria-hidden className="text-primary/60">
                    →
                  </span>
                  <span className="font-semibold text-foreground">{s.to}</span>
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[0.85rem] italic leading-relaxed text-muted-foreground">
            {SHIFT.aside}
          </p>
        </div>
      </div>
    </section>
  )
}
