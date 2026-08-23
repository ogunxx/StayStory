/**
 * The Guest Journey Playbook product preview.
 *
 * Deliberately isolated from the section around it so the visual can be
 * swapped without touching the layout. To replace it with a real screenshot,
 * pass a src — the surrounding frame, sizing, and shadow stay identical:
 *
 *   <PlaybookPreview src="/images/playbook.png" alt="The Guest Journey Playbook" />
 *
 * With no src it falls back to the in-code composite below, which is built
 * from the real shape of a playbook rather than invented metrics.
 */

/** The phases down the left rail — the real Blueprint stages. */
const PHASES = ['Before arrival', 'Arrival', 'The stay', 'Departure', 'After']

/** The moments shown in the open phase. */
const MOMENTS = [
  { name: 'Finding the place', done: true },
  { name: 'The first ten seconds', done: true },
  { name: 'Where the bag goes', done: false },
]

function Composite() {
  return (
    <div className="flex">
      {/* Phase rail */}
      <div className="hidden w-[38%] shrink-0 flex-col gap-1 border-r border-border/60 bg-background/50 p-4 sm:flex">
        <p className="mb-1.5 text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
          Phases
        </p>
        {PHASES.map((p, i) => (
          <div
            key={p}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[0.72rem] ${
              i === 1 ? 'bg-primary/10 font-medium text-foreground' : 'text-muted-foreground'
            }`}
          >
            <span
              className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[0.55rem] font-semibold ${
                i === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </span>
            <span className="truncate">{p}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-serif text-[0.85rem] font-semibold text-foreground">
              Your Guest Journey Playbook
            </p>
            <p className="truncate text-[0.65rem] text-muted-foreground">
              Laurel &amp; Lore · updated this week
            </p>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[0.62rem] text-muted-foreground sm:flex">
            <svg viewBox="0 0 20 20" fill="none" className="size-3" aria-hidden>
              <path
                d="M7.5 10.5l5-3M7.5 9.5l5 3M6 12.5a2 2 0 100-4 2 2 0 000 4zM14 7a2 2 0 100-4 2 2 0 000 4zM14 17a2 2 0 100-4 2 2 0 000 4z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
            Share
          </span>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
            Moments in this phase
          </p>
          <ul className="flex flex-col gap-2">
            {MOMENTS.map((m) => (
              <li key={m.name} className="flex items-center gap-2.5">
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
                    m.done ? 'bg-primary/15 text-primary' : 'border border-border'
                  }`}
                >
                  {m.done && (
                    <svg viewBox="0 0 20 20" fill="none" className="size-2.5" aria-hidden>
                      <path
                        d="M4 10.5l4 4 8-9"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-[0.75rem] leading-snug text-foreground">{m.name}</span>
              </li>
            ))}
          </ul>

          <div className="mt-1 rounded-xl border border-border/70 bg-background p-3">
            <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
              Why this moment matters
            </p>
            <p className="mt-1 text-[0.72rem] leading-relaxed text-foreground">
              The first ten seconds set the tone for everything that follows.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PlaybookPreview({ src, alt }: { src?: string; alt?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_24px_70px_-34px_rgba(60,40,25,0.5)]">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? 'The Guest Journey Playbook'} className="block w-full" />
      ) : (
        <Composite />
      )}
    </div>
  )
}
