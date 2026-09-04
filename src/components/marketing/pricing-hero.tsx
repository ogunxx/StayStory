/**
 * Pricing — Section 1. Hero.
 *
 * Copy left, an arched line-art panel right. Headline, supporting copy, the
 * three reassurance points and the note inside the arch are all props.
 *
 * The illustration is drawn in code rather than placed as an image, so it
 * takes the warm palette from the theme and stays crisp at any size. Nothing
 * about it is baked into the layout — drop an `image` in its place later if a
 * commissioned illustration replaces it.
 */

const ICONS = {
  compass: 'M12 21.5a9.5 9.5 0 100-19 9.5 9.5 0 000 19zm3.6-13.1l-2.2 5.4-5.4 2.2 2.2-5.4z',
  layers: 'M12 3.5l8.5 4-8.5 4-8.5-4zM3.5 12l8.5 4 8.5-4M3.5 16.5l8.5 4 8.5-4',
  heart: 'M12 20s-7-4.6-7-9.4A3.9 3.9 0 0112 8.6a3.9 3.9 0 017 2c0 4.8-7 9.4-7 9.4z',
} as const

type IconKey = keyof typeof ICONS

export type HeroPoint = { id: string; label: string[]; icon: IconKey }

export const HERO_POINTS: HeroPoint[] = [
  { id: 'guided', label: ['Guided', 'process'], icon: 'compass' },
  { id: 'practical', label: ['Practical', 'tools'], icon: 'layers' },
  { id: 'real-hosts', label: ['Designed for', 'real hosts'], icon: 'heart' },
]

/** The arched line drawing that anchors the hero, as in the mockup. */
function ArchIllustration({ note }: { note: string[] }) {
  return (
    <div className="rounded-t-[16rem] bg-secondary/20 px-10 pb-8 pt-20 sm:px-14">
      <p className="mb-6 ml-auto max-w-[11rem] font-serif text-[0.9rem] italic leading-snug text-primary">
        {note.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>

      <svg
        viewBox="0 0 320 180"
        fill="none"
        aria-hidden
        className="w-full text-primary/55"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Horizon */}
        <path d="M8 150h304" stroke="currentColor" strokeWidth="1.2" />
        {/* Cottage */}
        <path d="M100 150V100l50-34 50 34v50z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M88 106l62-42 62 42" stroke="currentColor" strokeWidth="1.4" />
        {/* Chimney */}
        <path d="M182 78V64h10v20" stroke="currentColor" strokeWidth="1.2" />
        {/* Door and windows */}
        <path d="M140 150v-30h20v30" stroke="currentColor" strokeWidth="1.2" />
        <path d="M112 114h20v16h-20zM168 114h20v16h-20z" stroke="currentColor" strokeWidth="1.2" />
        {/* Path to the door, running toward the viewer */}
        <path d="M138 150c-8 12-18 20-32 28" stroke="currentColor" strokeWidth="1.2" />
        <path d="M162 150c6 12 14 20 26 28" stroke="currentColor" strokeWidth="1.2" />
        {/* Cypress */}
        <path d="M250 150V92" stroke="currentColor" strokeWidth="1.2" />
        <path d="M250 78c-9 10-13 26-13 38s5 22 13 24c8-2 13-12 13-24s-4-28-13-38z" stroke="currentColor" strokeWidth="1.2" />
        {/* Shrubs */}
        <path d="M56 150c0-11 8-18 17-18s17 7 17 18" stroke="currentColor" strokeWidth="1.2" />
        <path d="M210 150c0-8 6-14 13-14s13 6 13 14" stroke="currentColor" strokeWidth="1.2" />
        <path d="M278 150c0-7 5-12 11-12s11 5 11 12" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    </div>
  )
}

export function PricingHero({
  eyebrow = 'Pricing',
  headline = ['A better guest', 'experience is within', 'reach.'],
  supporting = 'StayStory gives you the tools, structure and guidance to design a more intentional guest journey — without the guesswork.',
  points = HERO_POINTS,
  note = ['More than', 'amenities.', 'A guest journey', 'with meaning.'],
}: {
  eyebrow?: string
  headline?: string[]
  supporting?: string
  points?: HeroPoint[]
  note?: string[]
}) {
  return (
    <section className="px-6 py-14 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="min-w-0">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h1 className="font-serif text-[2.1rem] leading-[1.1] font-semibold tracking-tight text-foreground sm:text-[2.8rem] lg:text-[3.1rem]">
            {headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            {supporting}
          </p>

          <ul className="mt-9 flex flex-wrap gap-x-10 gap-y-5">
            {points.map((point) => (
              <li key={point.id} className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border">
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
                <span className="text-[0.83rem] leading-snug text-foreground">
                  {point.label.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <ArchIllustration note={note} />
        </div>
      </div>
    </section>
  )
}
