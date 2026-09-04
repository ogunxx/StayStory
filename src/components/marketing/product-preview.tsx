/**
 * A composite, in-code preview of the StayStory product for the marketing hero.
 *
 * Deliberately built from the real modules and a real-shaped Compass rather than
 * invented metrics — the point is to make the platform feel tangible, not to
 * show a dashboard that doesn't exist. Isolated in its own file so it can be
 * swapped for an actual screenshot later without touching the hero layout.
 */

type ModuleState = 'done' | 'active' | 'upcoming'

const MODULES: { label: string; state: ModuleState }[] = [
  { label: 'Compass', state: 'done' },
  { label: 'Audit', state: 'done' },
  { label: 'Blueprint', state: 'done' },
  { label: 'Generator', state: 'active' },
  { label: 'Story', state: 'upcoming' },
  { label: 'Playbook', state: 'upcoming' },
]

const RAIL_ICONS = [
  'M4 4h5v5H4zM11 4h5v5h-5zM4 11h5v5H4zM11 11h5v5h-5z', // grid
  'M10 3a7 7 0 100 14 7 7 0 000-14zm2.5 4.5l-2 4-3 1.5 2-4z', // compass
  'M4 5h12M4 10h12M4 15h8', // lines
  'M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 16h12', // arrow
  'M10 10a3 3 0 100-6 3 3 0 000 6zm-6 7a6 6 0 0112 0z', // person
]

function RailIcon({ d, active }: { d: string; active?: boolean }) {
  return (
    <div
      className={`flex size-7 items-center justify-center rounded-lg ${
        active ? 'bg-primary/12 text-primary' : 'text-muted-foreground/45'
      }`}
    >
      <svg viewBox="0 0 20 20" fill="none" className="size-4">
        <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-3">
      <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ProductPreview() {
  const activeIndex = Math.max(0, MODULES.findIndex((m) => m.state === 'active'))

  return (
    <div className="relative">
      {/* Soft ambient wash so the panel lifts off the cream background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -inset-y-10 rounded-[3rem] bg-gradient-to-br from-secondary/40 via-accent/25 to-transparent blur-2xl"
      />

      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_24px_70px_-30px_rgba(60,40,25,0.45)]">
        <div className="flex">
          {/* ── Icon rail ─────────────────────────────────────────────── */}
          <div className="hidden w-14 shrink-0 flex-col items-center gap-2 border-r border-border/60 bg-background/50 py-5 sm:flex">
            <div className="mb-3 flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                <path d="M10 1.5l1.9 5.1 5.1 1.9-5.1 1.9L10 15.5l-1.9-5.1L3 8.5l5.1-1.9z" />
              </svg>
            </div>
            {RAIL_ICONS.map((d, i) => (
              <RailIcon key={d} d={d} active={i === 1} />
            ))}
          </div>

          {/* ── Panel body ────────────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-serif text-[0.95rem] font-semibold text-foreground">
                  Welcome back, Evie
                </p>
                <p className="truncate text-[0.7rem] text-muted-foreground">
                  Here&apos;s the experience you&apos;re designing.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden rounded-full border border-border bg-background px-2.5 py-1 text-[0.65rem] text-muted-foreground sm:inline">
                  Laurel &amp; Lore ▾
                </span>
                <span className="size-7 rounded-full bg-gradient-to-br from-accent to-secondary" />
              </div>
            </div>

            <div className="flex flex-col gap-4 p-5">
              {/* ── The journey ─────────────────────────────────────── */}
              <div>
                <p className="mb-3 text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Your journey
                </p>
                <div className="flex items-center">
                  {MODULES.map((m, i) => (
                    <div key={m.label} className="flex min-w-0 flex-1 items-center">
                      <div className="flex min-w-0 flex-col items-center gap-1.5">
                        <span
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-semibold ${
                            m.state === 'done'
                              ? 'bg-primary/12 text-primary'
                              : m.state === 'active'
                                ? 'bg-primary text-primary-foreground ring-4 ring-primary/15'
                                : 'border border-border bg-background text-muted-foreground/60'
                          }`}
                        >
                          {m.state === 'done' ? <Check /> : i + 1}
                        </span>
                        {/* Labels would collide on narrow screens — below sm the
                            row reads as numbered dots with a caption instead. */}
                        <span
                          className={`hidden truncate text-[0.6rem] sm:block ${
                            m.state === 'active' ? 'font-semibold text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {m.label}
                        </span>
                      </div>
                      {i < MODULES.length - 1 && (
                        <span
                          className={`-mt-4 h-px flex-1 ${
                            MODULES[i + 1].state === 'upcoming' ? 'bg-border' : 'bg-primary/25'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-2.5 text-center text-[0.65rem] text-muted-foreground sm:hidden">
                  Step {activeIndex + 1} of {MODULES.length} ·{' '}
                  <span className="font-semibold text-foreground">{MODULES[activeIndex].label}</span>
                </p>
              </div>

              {/* ── Experience Compass ──────────────────────────────── */}
              <div className="rounded-2xl border border-border/70 bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Experience Compass
                  </p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.6rem] font-medium text-secondary-foreground">
                    Confirmed
                  </span>
                </div>
                <dl className="flex flex-col gap-2.5">
                  <div>
                    <dt className="text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">Purpose</dt>
                    <dd className="text-[0.78rem] leading-snug text-foreground">
                      A place where busy couples remember how to slow down.
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">
                      Transformation
                    </dt>
                    <dd className="flex items-center gap-2 text-[0.78rem] leading-snug text-foreground">
                      <span>Overwhelmed</span>
                      <span className="text-primary">→</span>
                      <span>Restored</span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* ── A recommendation, in the StayStory format ───────── */}
              <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-4">
                <p className="mb-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-primary">
                  Informed by your Compass
                </p>
                <p className="text-[0.8rem] font-medium leading-snug text-foreground">
                  Guests decide how a stay feels long before they unpack.
                </p>
                <p className="mt-1 text-[0.75rem] leading-relaxed text-muted-foreground">
                  Instead of a welcome basket, leave kindling by the fire pit and a note inviting
                  them to do nothing at all tonight.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
