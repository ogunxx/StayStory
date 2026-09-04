/**
 * Product previews for the "Why hosts choose StayStory" benefit stories.
 *
 * Composition follows the section 3 mockup — one wide panel for the Audit,
 * then side-by-side pairs for Compass + Blueprint and Generator + Story
 * Builder. The *content* is what the product actually does today rather than
 * the mockup's illustrative UI, so the marketing page doesn't promise screens
 * the app doesn't have.
 *
 * Each preview sits behind a key so a benefit can point at one by name. To
 * replace any of them with a real screenshot, set `image` on the benefit in
 * benefits.tsx — the frame and sizing stay identical and the surrounding
 * layout doesn't change.
 */

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_20px_60px_-34px_rgba(60,40,25,0.45)] ${className ?? ''}`}
    >
      {children}
    </div>
  )
}

function PanelHead({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
      <p className="flex min-w-0 items-center gap-2">
        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
        <span className="truncate font-serif text-[0.8rem] font-semibold text-foreground">
          {title}
        </span>
      </p>
      {badge && (
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[0.6rem] font-medium text-secondary-foreground">
          {badge}
        </span>
      )}
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.56rem] uppercase tracking-[0.14em] text-muted-foreground">{children}</p>
  )
}

/* ── 01 · Experience Audit ────────────────────────────────────────────── */

const AUDIT_ROWS = [
  { label: 'Arrival experience', score: 3 },
  { label: 'Lighting & mood', score: 4 },
  { label: 'Sound & smell', score: 2 },
  { label: 'Instructions & clarity', score: 4 },
]

function AuditPreview() {
  return (
    <Panel>
      <PanelHead title="Experience Audit" badge="Complete" />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-semibold text-foreground">72</span>
            <span className="text-[0.65rem] leading-tight text-muted-foreground">
              Readiness
              <br />
              score
            </span>
          </div>
          <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
            {AUDIT_ROWS.map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-3">
                <span className="truncate text-[0.72rem] text-foreground">{r.label}</span>
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
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-background p-3">
            <Eyebrow>Priority fixes</Eyebrow>
            <ul className="mt-1.5 flex flex-col gap-1">
              {['Sound & smell', 'Arrival experience'].map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-[0.7rem] text-foreground">
                  <span className="text-destructive">→</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border/70 bg-background p-3">
            <Eyebrow>Your strengths</Eyebrow>
            <ul className="mt-1.5 flex flex-col gap-1">
              {['Lighting & mood', 'Instructions'].map((s) => (
                <li key={s} className="flex items-center gap-1.5 text-[0.7rem] text-foreground">
                  <span className="text-primary">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Panel>
  )
}

/* ── 02 · Experience Compass + Blueprint ──────────────────────────────── */

const COMPASS_FIELDS = [
  { label: 'Purpose', value: 'Help busy couples slow down.' },
  { label: 'Transformation', value: 'Overwhelmed → Restored' },
  { label: 'Hospitality promise', value: 'Feel expected, not processed.' },
  { label: 'Signature memory', value: 'The fire, after dark.' },
]

const BLUEPRINT_PHASES = [
  { phase: 'Before', moment: 'The week-before note' },
  { phase: 'Arrival', moment: 'The first ten seconds' },
  { phase: 'The stay', moment: 'Evening by the fire' },
  { phase: 'After', moment: 'What they find later' },
]

function JourneyPreview() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel>
        {/* No badge here — the title needs the full width of a half-column panel. */}
        <PanelHead title="Experience Compass" />
        <div className="grid grid-cols-2 gap-3 p-4">
          {COMPASS_FIELDS.map((f) => (
            <div key={f.label}>
              <Eyebrow>{f.label}</Eyebrow>
              <p className="mt-1 text-[0.7rem] leading-snug text-foreground">{f.value}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHead title="Experience Blueprint" />
        <div className="flex flex-col gap-2.5 p-4">
          {BLUEPRINT_PHASES.map((p, i) => (
            <div key={p.phase} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex flex-col items-center">
                <span
                  className={`size-1.5 shrink-0 rounded-full ${i === 1 ? 'bg-primary' : 'bg-border'}`}
                />
                {i < BLUEPRINT_PHASES.length - 1 && <span className="mt-1 h-5 w-px bg-border" />}
              </span>
              <span className="min-w-0 flex-1">
                <Eyebrow>{p.phase}</Eyebrow>
                <p className="text-[0.72rem] leading-snug text-foreground">{p.moment}</p>
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

/* ── 03 · Generator + Story Builder ───────────────────────────────────── */

function CreatePreview() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel>
        <PanelHead title="Generator" badge="For Sarah" />
        <div className="flex flex-col gap-3 p-4">
          <div className="rounded-xl border border-border/70 bg-background p-3">
            <Eyebrow>Why they&apos;re visiting</Eyebrow>
            <p className="mt-1 text-[0.7rem] leading-snug text-muted-foreground">
              First trip alone since the baby. Arriving late Friday.
            </p>
          </div>
          <Eyebrow>Ideas</Eyebrow>
          <ul className="flex flex-col gap-1.5">
            {[
              'Kindling stacked by the fire pit',
              'Coffee from the roaster in town',
              'A note that nothing is scheduled',
            ].map((idea) => (
              <li key={idea} className="flex items-start gap-2 text-[0.7rem] leading-snug text-foreground">
                <span className="mt-0.5 text-primary">✓</span>
                {idea}
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel>
        <PanelHead title="Story Builder" />
        <div className="flex flex-col gap-2.5 p-4">
          <p className="font-serif text-[0.9rem] leading-snug font-semibold text-foreground">
            Our home, your stay story.
          </p>
          <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
            We made this place to slow people down. There&apos;s kindling by the fire and
            nothing on your schedule — that part was on purpose.
          </p>
          <div className="mt-1 rounded-xl bg-secondary p-3">
            <Eyebrow>Welcome note</Eyebrow>
            <p className="mt-1 text-[0.7rem] leading-snug text-foreground italic">
              &ldquo;You made it. Don&apos;t unpack yet — go sit outside.&rdquo;
            </p>
          </div>
        </div>
      </Panel>
    </div>
  )
}

/* ── Resolver ─────────────────────────────────────────────────────────── */

export const PREVIEWS = {
  audit: AuditPreview,
  journey: JourneyPreview,
  create: CreatePreview,
} as const

export type PreviewKey = keyof typeof PREVIEWS
