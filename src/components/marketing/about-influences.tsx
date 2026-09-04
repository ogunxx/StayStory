/**
 * About — Section 6. The people and ideas that shaped our thinking.
 *
 * Each person is one entry in INFLUENCES — name, what they're known for, and
 * an optional `image`. With no image the card shows a monogram.
 *
 * Two rules from the brief hold this section together:
 *
 *   1. These are influences on our thinking. They are not partners, advisors,
 *      investors, customers or endorsers of StayStory, and the note under the
 *      row says so plainly.
 *   2. No invented quotations, and no photographs of them — we don't have
 *      permission to use either. Set `image` if that ever changes.
 */

export type Influence = {
  id: string
  name: string
  /** Two or three lines describing what they're known for. */
  known: string
  /** Optional portrait. Only add one you have permission to publish. */
  image?: string
  imageAlt?: string
}

export const INFLUENCES: Influence[] = [
  {
    id: 'guidara',
    name: 'Will Guidara',
    known: 'Restaurateur and author of Unreasonable Hospitality, on the difference between service and genuine care.',
  },
  {
    id: 'acunzo',
    name: 'Jay Acunzo',
    known: 'Writer and speaker on original thinking, and on why a clear point of view beats more content.',
  },
  {
    id: 'french',
    name: 'Isaac French',
    known: 'Creator of Live Oak Lake, on designing places where every detail is deliberate.',
  },
]

function Monogram({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')

  return (
    <span
      aria-hidden
      className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/50 font-serif text-lg font-semibold text-foreground"
    >
      {initials}
    </span>
  )
}

export function AboutInfluences({
  eyebrow = 'The people and ideas that shaped our thinking',
  intro = 'We’re inspired by hospitality leaders and storytellers who remind us that details matter, and that meaningful experiences are built from empathy, creativity and intention.',
  people = INFLUENCES,
  note = 'These are influences on our thinking — not partners, advisors or endorsers of StayStory.',
}: {
  eyebrow?: string
  intro?: string
  people?: Influence[]
  note?: string
}) {
  return (
    <section className="px-6 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <p className="max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">{intro}</p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-0">
          {people.map((person, i) => (
            <div
              key={person.id}
              className={`flex min-w-0 items-start gap-4 lg:px-8 ${
                i === 0 ? 'lg:pl-0' : 'lg:border-l lg:border-border/70'
              } ${i === people.length - 1 ? 'lg:pr-0' : ''}`}
            >
              {person.image ? (
                <span className="size-14 shrink-0 overflow-hidden rounded-2xl bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={person.image}
                    alt={person.imageAlt ?? person.name}
                    className="size-full object-cover"
                  />
                </span>
              ) : (
                <Monogram name={person.name} />
              )}

              <div className="min-w-0">
                <h3 className="text-[1.05rem] font-semibold text-foreground">{person.name}</h3>
                <p className="mt-1.5 text-[0.83rem] leading-relaxed text-muted-foreground">
                  {person.known}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[0.78rem] leading-relaxed text-muted-foreground/80">{note}</p>
      </div>
    </section>
  )
}
