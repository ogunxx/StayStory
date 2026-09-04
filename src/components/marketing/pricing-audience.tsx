/**
 * Pricing — Section 4. Who it's for.
 *
 * Copy left, a checked list right. Each line is one string in AUDIENCES, so
 * adding, removing or rewording who StayStory is for is a one-line edit.
 */

export const AUDIENCES: string[] = [
  'Independent hosts and owners',
  'Boutique and design-focused stays',
  'Vacation rental and short-term rental hosts',
  'Small hospitality teams',
  'Multi-property operators, on the Portfolio plan',
]

function CheckCircle() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-[1.15rem] shrink-0 text-primary" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M6.5 10.3l2.4 2.3 4.6-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PricingAudience({
  eyebrow = 'Who it’s for',
  headline = ['Built for the people', 'who make stays special.'],
  supporting = 'Whether you host a single property or manage a growing collection, StayStory is designed for independent hosts, small teams and boutique hospitality operators who want to create more intentional, memorable guest experiences.',
  audiences = AUDIENCES,
}: {
  eyebrow?: string
  headline?: string[]
  supporting?: string
  audiences?: string[]
}) {
  return (
    <section className="px-6 py-4">
      <div className="mx-auto w-full max-w-7xl rounded-3xl bg-accent/25 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
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
            <p className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-muted-foreground">
              {supporting}
            </p>
          </div>

          <ul className="flex flex-col gap-4 lg:border-l lg:border-border/60 lg:pl-12">
            {audiences.map((audience) => (
              <li key={audience} className="flex items-center gap-3 text-[0.9rem] text-foreground">
                <CheckCircle />
                {audience}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
