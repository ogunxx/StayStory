import Link from 'next/link'

/**
 * Pricing — Section 5. Why it's worth it.
 *
 * Copy and a CTA left, four value pillars right. Each pillar is one entry in
 * VALUES — edit `title`, `body` or `icon`, reorder them, or add a fifth.
 */

const ICONS = {
  star: 'M12 3.8l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.6-5 2.6.9-5.6-4-4 5.6-.8z',
  clock: 'M4 20h16M7 20v-6m4.5 6V8m4.5 12v-9M7.5 9.5l4-4 3 3 4.5-4.5',
  heart: 'M12 20s-7-4.6-7-9.4A3.9 3.9 0 0112 8.6a3.9 3.9 0 017 2c0 4.8-7 9.4-7 9.4z',
  person: 'M12 12a3.6 3.6 0 100-7.2A3.6 3.6 0 0012 12zM5 20c0-3.4 3.1-5.4 7-5.4s7 2 7 5.4',
} as const

type IconKey = keyof typeof ICONS

export type Value = {
  id: string
  title: string
  body: string
  icon: IconKey
}

export const VALUES: Value[] = [
  {
    id: 'stronger',
    title: 'Create a stronger guest experience',
    body: 'Design stays that feel intentional, not accidental.',
    icon: 'star',
  },
  {
    id: 'guesswork',
    title: 'Save time and reduce guesswork',
    body: 'Follow a clear, simple process from start to finish.',
    icon: 'clock',
  },
  {
    id: 'stand-out',
    title: 'Stand out in a crowded market',
    body: 'Offer something distinctive and memorable.',
    icon: 'heart',
  },
  {
    id: 'grows',
    title: 'Build a guest experience that grows with you',
    body: 'Flexible, scalable and easy to keep using.',
    icon: 'person',
  },
]

export function PricingValue({
  eyebrow = 'Why it’s worth it',
  headline = ['More than a tool.', 'A better way to host.'],
  paragraphs = [
    'StayStory isn’t just about features — it’s about helping you create a guest experience that feels uniquely yours.',
    'It gives you the clarity, structure and inspiration to focus on what really matters.',
  ],
  ctaLabel = 'Explore the Platform',
  ctaHref = '/platform',
  values = VALUES,
}: {
  eyebrow?: string
  headline?: string[]
  paragraphs?: string[]
  ctaLabel?: string
  ctaHref?: string
  values?: Value[]
}) {
  return (
    <section className="px-6 py-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
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

          <Link
            href={ctaHref}
            className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {ctaLabel}
          </Link>
        </div>

        <ul className="flex flex-col lg:border-l lg:border-border/70 lg:pl-12">
          {values.map((value, i) => (
            <li
              key={value.id}
              className={`flex min-w-0 items-start gap-4 py-5 ${
                i === 0 ? 'pt-0' : 'border-t border-border/60'
              } ${i === values.length - 1 ? 'pb-0' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden>
                <path
                  d={ICONS[value.icon]}
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="min-w-0">
                <h3 className="text-[0.92rem] font-semibold text-foreground">{value.title}</h3>
                <p className="mt-1 text-[0.83rem] leading-relaxed text-muted-foreground">
                  {value.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
