/**
 * Section 5 — Built for the way you host.
 *
 * Each audience is one entry below and one reusable card, so you can:
 *
 *   • edit the audience name   → `name`
 *   • edit the headline        → `title`
 *   • edit the supporting copy → `description`
 *   • edit the CTA             → `ctaLabel` and `ctaHref`
 *   • replace the image        → set `image` (and `imageAlt`)
 *   • reorder or add or remove → move, add or delete an entry
 *
 * The grid follows the number of entries, so three is not baked in.
 *
 * IMAGES: every card needs a real photograph before this section ships.
 * Until `image` is set, a card shows a warm branded placeholder rather than
 * a broken frame. Stock photography of people who are not StayStory hosts
 * would imply customers that don't exist, so nothing is filled in by default.
 */

type PanelKey = 'score' | 'story' | 'team'

export type Audience = {
  id: string
  /** Shown as the card heading. */
  name: string
  description: string
  ctaLabel: string
  ctaHref: string
  /** The small product panel shown beside the photograph. */
  panel: PanelKey
  image?: string
  imageAlt?: string
}

export const AUDIENCES: Audience[] = [
  {
    id: 'independent',
    name: 'Independent Hosts',
    description: 'Turn one property into a stay people choose, remember, and recommend.',
    ctaLabel: 'See how independent hosts use StayStory',
    ctaHref: '/signup',
    panel: 'score',
  },
  {
    id: 'boutique',
    name: 'Boutique Stays',
    description: 'Create a distinct experience guests recognise as yours.',
    ctaLabel: 'See how boutique stays use StayStory',
    ctaHref: '/signup',
    panel: 'story',
  },
  {
    id: 'teams',
    name: 'Hospitality Teams',
    description: 'Align teams across properties while keeping each stay personal.',
    ctaLabel: 'See how hospitality teams use StayStory',
    ctaHref: '/pricing',
    panel: 'team',
  },
]

/* ── The small product panel that sits beside each photograph ─────────── */

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-2.5 rounded-xl border border-border/70 bg-card p-3">
      <p className="text-[0.55rem] uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}

function ScorePanel() {
  return (
    <PanelShell title="Experience Audit">
      <div className="flex items-baseline gap-1.5">
        <span className="font-serif text-2xl font-semibold text-foreground">72</span>
        <span className="text-[0.6rem] text-muted-foreground">/ 100</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-[72%] rounded-full bg-primary" />
      </div>
      <p className="text-[0.62rem] leading-snug text-muted-foreground">
        Readiness score, this property
      </p>
    </PanelShell>
  )
}

function StoryPanel() {
  return (
    <PanelShell title="Story Builder">
      <p className="text-[0.7rem] font-medium leading-snug text-foreground">Laurel &amp; Lore</p>
      <ul className="flex flex-col gap-1">
        {['Signature moment', 'Tone of voice', 'Guest-facing story'].map((s) => (
          <li key={s} className="flex items-center gap-1.5 text-[0.62rem] text-muted-foreground">
            <span className="text-primary">✓</span>
            {s}
          </li>
        ))}
      </ul>
    </PanelShell>
  )
}

function TeamPanel() {
  return (
    <PanelShell title="Your properties">
      <ul className="flex flex-col gap-1.5">
        {['Laurel & Lore', 'The Wellness Deck', 'Pine Cabin'].map((p, i) => (
          <li key={p} className="flex items-center gap-2">
            <span
              className={`size-1.5 shrink-0 rounded-full ${i === 0 ? 'bg-primary' : 'bg-border'}`}
            />
            <span className="truncate text-[0.62rem] text-foreground">{p}</span>
          </li>
        ))}
      </ul>
      <p className="text-[0.6rem] leading-snug text-muted-foreground">
        Shared playbook · 3 co-hosts
      </p>
    </PanelShell>
  )
}

const PANELS: Record<PanelKey, () => React.ReactElement> = {
  score: ScorePanel,
  story: StoryPanel,
  team: TeamPanel,
}

/* ── Image slot ───────────────────────────────────────────────────────── */

function ImageSlot({ src, alt }: { src?: string; alt?: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ''} className="size-full object-cover" />
    )
  }
  return (
    // Empty state: sits left of the product overlay so it stays visible.
    <div className="flex size-full items-center bg-gradient-to-br from-accent via-secondary/50 to-muted pl-[18%]">
      <svg viewBox="0 0 24 24" fill="none" className="size-7 text-foreground/20" aria-hidden>
        <path
          d="M3 17.5l5.5-6 4 4.2 3.5-3.7L21 17.5M3.5 4.5h17v15h-17zM9 9.5a1.4 1.4 0 11-2.8 0 1.4 1.4 0 012.8 0z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function ArrowCta({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
    >
      <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden>
        <path
          d="M4 10h11m0 0l-4-4m4 4l-4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  )
}

export function Audiences() {
  return (
    <section id="audiences" className="px-6 py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Built for the way you host
          </p>
          <h2 className="font-serif text-[1.9rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.6rem]">
            StayStory works whether you host one special stay or a whole collection.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            One system. Every scale. The same unforgettable impact.
          </p>
        </div>

        <ul className="mt-14 grid gap-5 lg:mt-16 lg:grid-cols-3">
          {AUDIENCES.map((a) => {
            const Panel = PANELS[a.panel]
            return (
              <li
                key={a.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card"
              >
                {/* Photograph, with the product panel overlaid on it.
                    The panel sits in its own container so it can be moved or
                    replaced without touching the photograph. */}
                <div className="relative m-2 aspect-[16/11] overflow-hidden rounded-xl">
                  <ImageSlot src={a.image} alt={a.imageAlt} />
                  <div className="absolute inset-y-3 right-3 flex w-[48%] max-w-[200px] items-center">
                    <div className="w-full shadow-[0_12px_36px_-14px_rgba(60,40,25,0.5)]">
                      <Panel />
                    </div>
                  </div>
                </div>

                {/* Copy */}
                <div className="flex flex-1 flex-col gap-3 p-5 pt-3">
                  <h3 className="font-serif text-xl leading-snug font-semibold text-foreground">
                    {a.name}
                  </h3>
                  <p className="text-[0.85rem] leading-relaxed text-muted-foreground">
                    {a.description}
                  </p>
                  <div className="mt-auto pt-3">
                    <ArrowCta label={a.ctaLabel} href={a.ctaHref} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
