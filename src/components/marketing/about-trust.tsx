/**
 * About — Section 8. Built on experience. Backed by guests.
 *
 * A quiet row of four credibility points and a seal. Each point is one entry
 * in TRUST_POINTS.
 *
 * The brief rules out invented customer counts, host counts and revenue
 * claims, and rules out implying that Laurel & Lore guests were StayStory
 * software customers. So these describe how the thinking was formed, and the
 * only number stated is the live guest rating, passed in from the page.
 */

const ICONS = {
  hosting: 'M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 12a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0zM12 6.5v2M12 15.5v2',
  feedback: 'M12 4v11m0 0l-3.5-3.5M12 15l3.5-3.5M4.5 18.5h15',
  tools: 'M4 19l6.5-6.5M14 4.5a3.5 3.5 0 004.8 4.8l-9 9-3.3-3.3 9-9z',
  memories: 'M6 4.5h12v15l-6-3.5-6 3.5z',
} as const

type IconKey = keyof typeof ICONS

export type TrustPoint = {
  id: string
  body: string
  icon: IconKey
}

export const TRUST_POINTS: TrustPoint[] = [
  {
    id: 'experience',
    body: 'Built by hosts with a career in hospitality, running a real property.',
    icon: 'hosting',
  },
  {
    id: 'feedback',
    body: 'Shaped continuously by guest feedback and on-the-ground learning.',
    icon: 'feedback',
  },
  {
    id: 'tested',
    body: 'Tools tested by what actually works in the real world — not theory.',
    icon: 'tools',
  },
  {
    id: 'memories',
    body: 'Made to help hosts create impact, loyalty and lasting memories.',
    icon: 'memories',
  },
]

function Seal() {
  return (
    <div
      aria-hidden
      className="hidden size-24 shrink-0 flex-col items-center justify-center gap-1 rounded-full border border-accent text-center xl:flex"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5 text-primary">
        <path
          d="M12 20s-7-4.6-7-9.4A3.9 3.9 0 0112 8.6a3.9 3.9 0 017 2c0 4.8-7 9.4-7 9.4z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[0.52rem] uppercase tracking-[0.14em] text-muted-foreground">
        Designed
        <br />
        with care
      </span>
    </div>
  )
}

export function AboutTrust({
  label = 'Built on experience. Backed by guests.',
  points = TRUST_POINTS,
  rating = '4.99',
  reviews = '136',
}: {
  label?: string
  points?: TrustPoint[]
  rating?: string
  reviews?: string
}) {
  return (
    <section className="px-6 py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <p className="mb-8 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>

        <div className="flex items-center gap-8">
          <div className="grid min-w-0 flex-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {points.map((point, i) => (
              <div
                key={point.id}
                className={`flex min-w-0 items-start gap-3 lg:px-6 ${
                  i === 0 ? 'lg:pl-0' : 'lg:border-l lg:border-border/70'
                } ${i === points.length - 1 ? 'lg:pr-0' : ''}`}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                  <svg viewBox="0 0 24 24" fill="none" className="size-4 text-primary" aria-hidden>
                    <path
                      d={ICONS[point.icon]}
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="text-[0.82rem] leading-relaxed text-muted-foreground">{point.body}</p>
              </div>
            ))}
          </div>

          <Seal />
        </div>

        <p className="mt-8 text-[0.8rem] leading-relaxed text-muted-foreground/80">
          The one number we can show you is our own: {rating}★ across {reviews}{' '}
          guest reviews at Laurel &amp; Lore, the property where this system was built.
        </p>
      </div>
    </section>
  )
}
