/**
 * Platform page — Section 9, Everything Stays Connected.
 *
 * Lighter than the Playbook section above it: a visual reset before the close.
 * Four qualities rather than a systems diagram, since the sequence has already
 * been shown twice on this page and a third version would just be noise.
 */

export const CONNECTED = {
  label: 'Everything stays connected',
  headline: 'Always aligned.',
  headlineAccent: 'Always up to date.',
  supporting:
    'Your Compass guides every decision. Your Playbook keeps it consistent. And everything stays connected, so you can evolve the experience without losing what makes it yours.',
}

const ICONS = {
  compass: 'M12 21.5a9.5 9.5 0 100-19 9.5 9.5 0 000 19zm3.6-13.1l-2.2 5.4-5.4 2.2 2.2-5.4z',
  sync: 'M4.5 12a7.5 7.5 0 0112.8-5.3M19.5 12a7.5 7.5 0 01-12.8 5.3M17.5 3.5v3.5H14M6.5 20.5V17H10',
  team: 'M9 11a3.2 3.2 0 100-6.4A3.2 3.2 0 009 11zM2.5 19.5a6.5 6.5 0 0113 0M16.5 11.5a2.6 2.6 0 100-5.2M17 14.5a5.5 5.5 0 014.5 5',
  evolve: 'M4 19.5c0-6 4-9 9-10M13 9.5h5v-5M8.5 19.5a2 2 0 11-4 0 2 2 0 014 0z',
} as const

type IconKey = keyof typeof ICONS

export type Quality = { id: string; title: string; body: string; icon: IconKey }

export const QUALITIES: Quality[] = [
  {
    id: 'compass',
    title: 'Compass-guided',
    body: 'Every idea and decision stays aligned.',
    icon: 'compass',
  },
  {
    id: 'updates',
    title: 'Everything carries forward',
    body: 'What you build in one place shows up in the next.',
    icon: 'sync',
  },
  {
    id: 'team',
    title: 'Team alignment',
    body: 'Everyone delivers the same experience.',
    icon: 'team',
  },
  {
    id: 'evolve',
    title: 'Evolve with ease',
    body: 'Refine and improve without starting over.',
    icon: 'evolve',
  },
]

export function PlatformConnected() {
  return (
    <section id="everything-connected" className="px-6 py-16 lg:py-24">
      <div className="mx-auto w-full max-w-5xl text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          {CONNECTED.label}
        </p>
        <h2 className="font-serif text-[1.8rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2.3rem]">
          {CONNECTED.headline}{' '}
          <span className="text-primary">{CONNECTED.headlineAccent}</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-[0.92rem] leading-relaxed text-muted-foreground">
          {CONNECTED.supporting}
        </p>

        <ul className="mt-12 grid gap-8 text-left sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-6">
          {QUALITIES.map((q) => (
            <li key={q.id} className="flex gap-3.5 lg:flex-col lg:gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                  <path
                    d={ICONS[q.icon]}
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <p className="text-[0.88rem] font-semibold text-foreground">{q.title}</p>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-muted-foreground">{q.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
