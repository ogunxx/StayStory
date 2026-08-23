/**
 * Product previews for the "Why hosts choose StayStory" benefit stories.
 *
 * Each preview lives behind a key so a benefit can point at one by name. To
 * replace any of them with a real screenshot, set `image` on the benefit in
 * benefits.tsx — the frame, sizing and shadow stay identical, and nothing in
 * the surrounding layout has to change.
 *
 * These composites are built from the real shape of each tool (a real audit
 * score and categories, a real Compass field, real gesture tiers) rather than
 * invented metrics.
 */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_24px_70px_-34px_rgba(60,40,25,0.5)]">
      {children}
    </div>
  )
}

function Head({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
      <p className="truncate font-serif text-[0.85rem] font-semibold text-foreground">{title}</p>
      {badge && (
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-[0.62rem] font-medium text-secondary-foreground">
          {badge}
        </span>
      )}
    </div>
  )
}

/* ── Experience Audit ─────────────────────────────────────────────────── */

const AUDIT_ROWS = [
  { label: 'Arrival experience', score: 3 },
  { label: 'Lighting & mood', score: 4 },
  { label: 'Sound & smell', score: 2 },
  { label: 'Instructions & clarity', score: 4 },
]

function AuditPreview() {
  return (
    <Frame>
      <Head title="Experience Audit" badge="Complete" />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-4xl font-semibold text-foreground">72</span>
          <span className="text-[0.72rem] leading-tight text-muted-foreground">
            Hospitality Readiness
            <br />
            Score out of 100
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {AUDIT_ROWS.map((r) => (
            <li key={r.label} className="flex items-center justify-between gap-3">
              <span className="truncate text-[0.75rem] text-foreground">{r.label}</span>
              <span className="flex shrink-0 gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`size-1.5 rounded-full ${n <= r.score ? 'bg-primary' : 'bg-border'}`}
                  />
                ))}
              </span>
            </li>
          ))}
        </ul>

        <div className="rounded-xl border border-border/70 bg-background p-3">
          <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
            Worth noticing
          </p>
          <p className="mt-1 text-[0.72rem] leading-relaxed text-foreground">
            Arrival asks guests to do five things before they can sit down.
          </p>
        </div>
      </div>
    </Frame>
  )
}

/* ── Experience Compass + Blueprint ───────────────────────────────────── */

const BLUEPRINT_PHASES = [
  { phase: 'Before arrival', count: '3 moments', done: true },
  { phase: 'Arrival', count: '3 moments', done: true },
  { phase: 'The stay', count: '2 moments', done: true },
  { phase: 'Departure', count: 'Not mapped', done: false },
]

function JourneyPreview() {
  return (
    <Frame>
      <Head title="Experience Compass" badge="Confirmed" />
      <div className="flex flex-col gap-4 p-5">
        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">Purpose</p>
          <p className="mt-1 text-[0.8rem] leading-snug text-foreground">
            A place where busy couples remember how to slow down.
          </p>
        </div>
        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
            Transformation
          </p>
          <p className="mt-1 flex items-center gap-2 text-[0.8rem] leading-snug text-foreground">
            Overwhelmed <span className="text-primary">→</span> Restored
          </p>
        </div>

        <div className="border-t border-border/60 pt-4">
          <p className="mb-2.5 text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
            Experience Blueprint
          </p>
          <ul className="flex flex-col gap-2">
            {BLUEPRINT_PHASES.map((p) => (
              <li key={p.phase} className="flex items-center gap-2.5">
                <span
                  className={`size-1.5 shrink-0 rounded-full ${p.done ? 'bg-primary' : 'bg-border'}`}
                />
                <span className="flex-1 truncate text-[0.75rem] text-foreground">{p.phase}</span>
                <span className="shrink-0 text-[0.68rem] text-muted-foreground">{p.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Frame>
  )
}

/* ── Generator + Story Builder ────────────────────────────────────────── */

function CreatePreview() {
  return (
    <Frame>
      <Head title="Generator" badge="For Sarah & Marcus" />
      <div className="flex flex-col gap-4 p-5">
        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
            Principle
          </p>
          <p className="mt-1 text-[0.8rem] leading-snug text-foreground">
            Guests decide how a stay feels long before they unpack.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-secondary p-3">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-secondary-foreground">
              $0
            </p>
            <p className="mt-1 text-[0.7rem] leading-snug text-foreground">
              Kindling stacked by the fire pit.
            </p>
          </div>
          <div className="rounded-xl bg-primary/10 p-3">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-primary">
              Under $10
            </p>
            <p className="mt-1 text-[0.7rem] leading-snug text-foreground">
              Coffee from the roaster in town.
            </p>
          </div>
        </div>

        <div className="border-t border-border/60 pt-3.5">
          <p className="mb-1.5 text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
            Story Builder · welcome note
          </p>
          <p className="text-[0.72rem] leading-relaxed text-foreground italic">
            &ldquo;There&apos;s kindling by the fire and nothing on your schedule. That was
            on purpose.&rdquo;
          </p>
        </div>
      </div>
    </Frame>
  )
}

/* ── Resolver ─────────────────────────────────────────────────────────── */

export const PREVIEWS = {
  audit: AuditPreview,
  journey: JourneyPreview,
  create: CreatePreview,
} as const

export type PreviewKey = keyof typeof PREVIEWS
