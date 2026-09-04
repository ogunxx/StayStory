/**
 * The StayStory Method page — Section 8, Guests Feel It.
 *
 * Short by design: emotional confirmation before the final CTA, not a second
 * copy of the homepage proof section. Different guests are quoted here than
 * on the homepage so the two don't repeat.
 *
 * The mockup shows three quotes attributed to Sarah T. of Nashville, Mark R.
 * of Austin and Jenna L. of Portland. Those people don't exist, and the brief
 * says not to invent testimonials — so these are real Laurel & Lore guests
 * instead, quoted from their actual reviews.
 */

export const METHOD_PROOF = {
  label: 'Guests feel it',
  headline: 'You can hear the difference in what guests say.',
  supporting:
    'When a stay is designed on purpose, guests stop describing the property and start describing how it felt to be there.',
  attribution:
    'Real guest words from Laurel & Lore, the property where the StayStory system was developed and tested.',
}

export type MethodQuote = {
  id: string
  quote: string
  author: string
  source: string
  labelTitle: string
  labelValue: string
}

export const METHOD_QUOTES: MethodQuote[] = [
  {
    id: 'heather',
    quote: 'The details put into the place… were amazing.',
    author: 'Heather',
    source: 'Douglasville, GA · April 2025',
    labelTitle: 'What they noticed',
    labelValue: 'Anticipation',
  },
  {
    id: 'sonia',
    quote: 'Their place truly felt like home — everything we needed and then some.',
    author: 'Sonia',
    source: 'Miami, FL · March 2025',
    labelTitle: 'What they felt',
    labelValue: 'At home',
  },
  {
    id: 'victoria',
    quote: 'Such thoughtful touches throughout the space.',
    author: 'Victoria',
    source: '10 years on Airbnb · April 2025',
    labelTitle: 'What they remembered',
    labelValue: 'The thoughtful details',
  },
]

function Heart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4 text-primary/60" aria-hidden>
      <path
        d="M12 20s-7-4.4-7-9.2A3.9 3.9 0 0112 8.6a3.9 3.9 0 017 2.2c0 4.8-7 9.2-7 9.2z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MethodProof() {
  return (
    <section id="guests-feel-it" className="px-6 py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.85fr_2.15fr] lg:gap-14">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {METHOD_PROOF.label}
          </p>
          <h2 className="font-serif text-[1.6rem] leading-[1.18] font-semibold tracking-tight text-foreground sm:text-[1.9rem]">
            {METHOD_PROOF.headline}
          </h2>
          <p className="mt-4 max-w-sm text-[0.9rem] leading-relaxed text-muted-foreground">
            {METHOD_PROOF.supporting}
          </p>
          <p className="mt-5 max-w-sm text-[0.78rem] leading-relaxed text-muted-foreground/80">
            {METHOD_PROOF.attribution}
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {METHOD_QUOTES.map((q) => (
            <li
              key={q.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <blockquote className="font-serif text-[1.02rem] leading-snug text-foreground">
                “{q.quote}”
              </blockquote>

              <div className="mt-auto">
                <p className="text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                  {q.labelTitle}
                </p>
                <p className="mt-0.5 text-[0.8rem] leading-snug text-foreground">{q.labelValue}</p>
              </div>

              <div className="flex items-end justify-between gap-3 border-t border-border/60 pt-3">
                <p className="text-[0.72rem] leading-snug text-muted-foreground">
                  — {q.author}
                  <br />
                  <span className="text-muted-foreground/75">{q.source}</span>
                </p>
                <Heart />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
