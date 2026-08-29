/**
 * Interface previews for the six Platform deep dives.
 *
 * Each sits behind a key so a product can point at one by name. To replace any
 * with a real screenshot, set `image` on that product in platform-products.tsx
 * — the frame and section layout don't change.
 *
 * Where the mockup shows photographs inside a preview, these use a soft tinted
 * block instead. Dropping in stock photography of a property that isn't yours
 * would misrepresent the product.
 */

import type { PreviewKey } from './platform-products'

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_26px_70px_-38px_rgba(60,40,25,0.5)]">
      <div className="border-b border-border/60 px-4 py-3">
        <p className="font-serif text-[0.85rem] font-semibold text-foreground">{title}</p>
      </div>
      {children}
    </div>
  )
}

function Tabs({ items, active = 0 }: { items: string[]; active?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto border-b border-border/60 px-4">
      {items.map((t, i) => (
        <span
          key={t}
          className={`-mb-px border-b-2 py-2 text-[0.68rem] whitespace-nowrap ${
            i === active
              ? 'border-primary font-medium text-foreground'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground">{children}</p>
  )
}

/** Stand-in for a photograph inside a preview. */
function Photo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block rounded-lg bg-gradient-to-br from-accent via-secondary/50 to-muted ${className ?? ''}`}
    />
  )
}

/* ── 01 Experience Audit ──────────────────────────────────────────────── */

const AUDIT_NAV = [
  'About your property',
  'Guest journey today',
  'What’s working',
  'Friction points',
  'Opportunities',
  'Summary',
]

function AuditPreview() {
  return (
    <Frame title="Experience Audit">
      <div className="flex">
        <nav className="hidden w-36 shrink-0 flex-col gap-0.5 border-r border-border/60 bg-background/50 p-3 sm:flex">
          {AUDIT_NAV.map((n, i) => (
            <span
              key={n}
              className={`rounded-md px-2 py-1.5 text-[0.66rem] leading-snug ${
                i === 1 ? 'bg-primary/10 font-medium text-foreground' : 'text-muted-foreground'
              }`}
            >
              {n}
            </span>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <p className="px-4 pt-3 text-[0.75rem] font-medium text-foreground">Guest journey today</p>
          <Tabs items={['Dreaming', 'Booking', 'Arriving', 'Staying', 'Reflecting']} />
          <div className="flex gap-3 p-4">
            <div className="min-w-0 flex-1">
              <Eyebrow>What happens during this stage?</Eyebrow>
              <p className="mt-1.5 rounded-lg border border-border/70 bg-background p-2.5 text-[0.68rem] leading-relaxed text-foreground">
                Guests discover us through Airbnb and our website. They read reviews and view photos.
              </p>
            </div>
            <Photo className="hidden h-16 w-20 shrink-0 sm:block" />
          </div>
        </div>
      </div>
    </Frame>
  )
}

/* ── 02 Experience Compass ────────────────────────────────────────────── */

const COMPASS_PRINCIPLES = ['Effortless', 'Warm', 'Thoughtful', 'Local & Immersive']

function CompassPreview() {
  return (
    <Frame title="Experience Compass">
      <div className="grid gap-4 p-4 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <Eyebrow>Our experience should feel:</Eyebrow>
          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="flex flex-col gap-6">
              {COMPASS_PRINCIPLES.slice(0, 2).map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-primary/25 bg-primary/[0.07] px-3 py-1 text-[0.64rem] text-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-border">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 text-primary" aria-hidden>
                <path d="M12 2l2.3 6.2L20.5 10l-6.2 2.3L12 18.5l-2.3-6.2L3.5 10l6.2-1.8z" />
              </svg>
            </span>
            <div className="flex flex-col gap-6">
              {COMPASS_PRINCIPLES.slice(2).map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-primary/25 bg-primary/[0.07] px-3 py-1 text-[0.64rem] text-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-background p-3">
          <Eyebrow>Experience statement</Eyebrow>
          <p className="mt-1.5 text-[0.68rem] leading-relaxed text-foreground">
            A peaceful, welcoming escape that feels like a deep breath in a place that’s distinctly
            local and deeply cared for.
          </p>
        </div>
      </div>
    </Frame>
  )
}

/* ── 03 Experience Blueprint ──────────────────────────────────────────── */

const BLUEPRINT_MOMENTS = [
  { name: 'Settling In', body: 'Help guests feel at home quickly' },
  { name: 'Local Discovery', body: 'Inspire meaningful local experiences' },
  { name: 'Evening Unwind', body: 'Create space to relax and recharge' },
  { name: 'Thoughtful Touch', body: 'Surprise and delight' },
]

function BlueprintPreview() {
  return (
    <Frame title="Experience Blueprint">
      <Tabs items={['Dreaming', 'Booking', 'Arriving', 'Staying', 'Reflecting']} active={3} />
      <div className="p-4">
        <Eyebrow>Key moments</Eyebrow>
        <div className="mt-2.5 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {BLUEPRINT_MOMENTS.map((m) => (
            <div key={m.name} className="rounded-lg border border-border/70 bg-background p-2.5">
              <p className="text-[0.66rem] font-medium leading-snug text-foreground">{m.name}</p>
              <p className="mt-1 text-[0.6rem] leading-snug text-muted-foreground">{m.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

/* ── 04 Generator ─────────────────────────────────────────────────────── */

const GENERATOR_IDEAS = [
  { name: 'Warm welcome note', body: 'A handwritten note that makes guests feel seen from the start.' },
  { name: 'Easy arrival guide', body: 'Clear, beautiful instructions that remove friction and reduce stress.' },
  { name: 'Local treat on arrival', body: 'A small taste of the area that connects guests to the place.' },
]

function GeneratorPreview() {
  return (
    <Frame title="Generator">
      <div className="p-4">
        <Eyebrow>What ideas can we generate?</Eyebrow>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['Arrival experience', 'Welcome gift', 'In-stay surprise', 'Local recommendations'].map(
            (c, i) => (
              <span
                key={c}
                className={`rounded-full px-2.5 py-1 text-[0.62rem] ${
                  i === 0
                    ? 'bg-primary/12 font-medium text-primary'
                    : 'border border-border text-muted-foreground'
                }`}
              >
                {c}
              </span>
            )
          )}
        </div>

        <p className="mt-3.5 text-[0.68rem] font-medium text-foreground">
          Ideas for: <span className="text-primary">Arrival experience</span>
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {GENERATOR_IDEAS.map((idea) => (
            <div key={idea.name} className="rounded-lg border border-border/70 bg-background p-2">
              <Photo className="mb-2 h-12 w-full" />
              <p className="text-[0.62rem] font-medium leading-snug text-foreground">{idea.name}</p>
              <p className="mt-0.5 text-[0.56rem] leading-snug text-muted-foreground">{idea.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

/* ── 05 Story Builder ─────────────────────────────────────────────────── */

const STORY_PIECES = [
  'Welcome message',
  'Pre-arrival email',
  'House guide intro',
  'Check-out note',
  'Thank you message',
]

function StoryPreview() {
  return (
    <Frame title="Story Builder">
      <div className="flex">
        <nav className="hidden w-32 shrink-0 flex-col gap-0.5 border-r border-border/60 bg-background/50 p-3 sm:flex">
          {STORY_PIECES.map((n, i) => (
            <span
              key={n}
              className={`rounded-md px-2 py-1.5 text-[0.64rem] leading-snug ${
                i === 0 ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground'
              }`}
            >
              {n}
            </span>
          ))}
        </nav>

        <div className="min-w-0 flex-1 p-4">
          <p className="text-[0.72rem] font-medium text-foreground">Welcome message</p>
          <div className="mt-2 flex gap-2 border-b border-border/60 pb-2 text-[0.62rem] text-muted-foreground">
            <span className="font-bold">B</span>
            <span className="italic">I</span>
            <span className="underline">U</span>
            <span>•</span>
            <span>≡</span>
          </div>
          <p className="mt-2.5 text-[0.68rem] leading-relaxed text-foreground">
            We’re so excited to welcome you. Take a deep breath, slow down, and settle in. We’ve
            thought of everything so you can simply be here.
          </p>
          <p className="mt-2 text-right text-[0.58rem] text-muted-foreground">132 / 300</p>
        </div>
      </div>
    </Frame>
  )
}

/* ── 06 Guest Journey Playbook ────────────────────────────────────────── */

const PLAYBOOK_STAGES = ['Dreaming', 'Booking', 'Arriving', 'Staying', 'Reflecting']

function PlaybookPreview() {
  return (
    <Frame title="Guest Journey Playbook">
      <Tabs items={['Overview', 'Journey', 'Moments', 'Rituals', 'Touches', 'Details']} />
      <div className="grid gap-3 p-4 sm:grid-cols-[0.8fr_1.4fr]">
        <div className="rounded-lg border border-border/70 bg-background p-2">
          <Photo className="h-20 w-full" />
          <p className="mt-2 font-serif text-[0.72rem] font-semibold leading-snug text-foreground">
            Laurel &amp; Lore Cottage
          </p>
        </div>

        <div>
          <Eyebrow>Experience overview</Eyebrow>
          <p className="mt-1.5 text-[0.66rem] leading-relaxed text-foreground">
            Effortless, warm, thoughtful, and locally immersive. A peaceful escape where guests feel
            cared for in every detail.
          </p>
          <p className="mt-3 mb-2 text-[0.58rem] uppercase tracking-[0.12em] text-muted-foreground">
            Journey stages
          </p>
          <div className="flex items-center justify-between">
            {PLAYBOOK_STAGES.map((s) => (
              <span key={s} className="flex min-w-0 flex-col items-center gap-1">
                <span className="size-5 rounded-full bg-primary/12" />
                <span className="truncate text-[0.52rem] text-muted-foreground">{s}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  )
}

export const PLATFORM_PREVIEWS: Record<PreviewKey, () => React.ReactElement> = {
  audit: AuditPreview,
  compass: CompassPreview,
  blueprint: BlueprintPreview,
  generator: GeneratorPreview,
  story: StoryPreview,
  playbook: PlaybookPreview,
}
