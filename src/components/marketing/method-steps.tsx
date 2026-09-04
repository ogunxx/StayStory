import { Fragment } from 'react'

/**
 * The StayStory Method page — Section 5, The Method.
 *
 * Share → Define → Design → Deliver as one sequence, not four tools sitting
 * near each other: arrows carry between the cards on wide screens and down
 * the stack on phones.
 *
 * Steps are data — rename one, rewrite its description, swap which preview it
 * shows, reorder them, or add a fifth. Numbering follows position, so nothing
 * needs renumbering by hand.
 */

export const STEPS_HEADER = {
  label: 'The Method',
  headline: 'A repeatable way to design the guest journey.',
  supporting:
    'Each stage builds on the one before it, and all of it collects into a single Guest Journey Playbook you can actually work from.',
}

type PreviewKey = 'audit' | 'compass' | 'tools' | 'playbook'

export type Step = {
  id: string
  name: string
  description: string
  preview: PreviewKey
}

export const STEPS: Step[] = [
  {
    id: 'share',
    name: 'Share',
    description: 'Share your property details and complete the Experience Audit.',
    preview: 'audit',
  },
  {
    id: 'define',
    name: 'Define',
    description: 'Build your Experience Compass.',
    preview: 'compass',
  },
  {
    id: 'design',
    name: 'Design',
    description: 'Shape the journey with the Blueprint, Generator, and Story Builder.',
    preview: 'tools',
  },
  {
    id: 'deliver',
    name: 'Deliver',
    description: 'Bring everything together in the Guest Journey Playbook.',
    preview: 'playbook',
  },
]

/* ── Step previews ────────────────────────────────────────────────────── */

function PreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-auto rounded-xl border border-border/70 bg-background p-3.5">{children}</div>
  )
}

function Bars({ widths }: { widths: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {widths.map((w, i) => (
        <span key={i} className="block h-1.5 rounded-full bg-muted">
          <span className="block h-full rounded-full bg-primary/35" style={{ width: w }} />
        </span>
      ))}
    </div>
  )
}

/** The Audit's real output: a readiness score out of 100. */
function AuditPreview() {
  const score = 78
  const r = 16
  const c = 2 * Math.PI * r
  return (
    <PreviewShell>
      <div className="flex items-center gap-3">
        <span className="relative flex size-11 shrink-0 items-center justify-center">
          <svg viewBox="0 0 40 40" className="size-11 -rotate-90" aria-hidden>
            <circle cx="20" cy="20" r={r} fill="none" stroke="var(--muted)" strokeWidth="3.5" />
            <circle
              cx="20"
              cy="20"
              r={r}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * c} ${c}`}
            />
          </svg>
          <span className="absolute font-serif text-[0.72rem] font-semibold text-foreground">
            {score}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 text-[0.62rem] leading-tight uppercase tracking-[0.12em] text-muted-foreground">
            Experience Audit
          </p>
          <Bars widths={['82%', '58%', '70%']} />
        </div>
      </div>
    </PreviewShell>
  )
}

function CompassPreview() {
  return (
    <PreviewShell>
      <p className="mb-2.5 text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
        Experience Compass
      </p>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M15.2 8.8l-2 4.4-4.4 2 2-4.4z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.72rem] leading-snug font-medium text-foreground">Overwhelmed → Restored</p>
          <p className="text-[0.65rem] leading-snug text-muted-foreground">Purpose · Promise · Memory</p>
        </div>
      </div>
    </PreviewShell>
  )
}

const DESIGN_TOOLS = [
  { name: 'Blueprint', icon: 'M3.5 6.5l6-3 5 3 6-3v14l-6 3-5-3-6 3zM9.5 3.5v14M14.5 6.5v14' },
  { name: 'Generator', icon: 'M12 3l2 5.5L19.5 10 14 12l-2 5.5L10 12 4.5 10 10 8.5z' },
  { name: 'Story Builder', icon: 'M4 20l1-4 10-10 3 3-10 10zM14.5 6.5l3 3' },
]

function ToolsPreview() {
  return (
    <PreviewShell>
      <div className="grid grid-cols-3 gap-2">
        {DESIGN_TOOLS.map((t) => (
          <div key={t.name} className="flex min-w-0 flex-col items-center gap-1.5 text-center">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
                <path
                  d={t.icon}
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-[0.55rem] leading-[1.25] text-balance text-muted-foreground">
              {t.name}
            </span>
          </div>
        ))}
      </div>
    </PreviewShell>
  )
}

function PlaybookPreview() {
  return (
    <PreviewShell>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
            <path
              d="M4 4.8h5.5A2.5 2.5 0 0112 7.3v12a2 2 0 00-2-2H4zM20 4.8h-5.5A2.5 2.5 0 0012 7.3v12a2 2 0 012-2h6z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 text-[0.66rem] leading-snug font-medium text-foreground">
            Guest Journey Playbook
          </p>
          <Bars widths={['90%', '65%']} />
        </div>
      </div>
    </PreviewShell>
  )
}

const PREVIEWS: Record<PreviewKey, () => React.ReactElement> = {
  audit: AuditPreview,
  compass: CompassPreview,
  tools: ToolsPreview,
  playbook: PlaybookPreview,
}

function StepArrow() {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center py-1 text-primary/45 lg:px-2.5 lg:py-0"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4 rotate-90 lg:rotate-0">
        <path
          d="M4 12h15m0 0l-5-5m5 5l-5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function MethodSteps() {
  return (
    <section id="the-method" className="px-6 py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1fr_3.2fr] lg:gap-12">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {STEPS_HEADER.label}
          </p>
          <h2 className="font-serif text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2rem]">
            {STEPS_HEADER.headline}
          </h2>
          <p className="mt-4 max-w-sm text-[0.9rem] leading-relaxed text-muted-foreground">
            {STEPS_HEADER.supporting}
          </p>
        </div>

        <ol className="flex flex-col lg:flex-row lg:items-stretch">
          {STEPS.map((step, i) => {
            const Preview = PREVIEWS[step.preview]
            return (
              <Fragment key={step.id}>
                {/* min-w-0 so flex-1 actually divides evenly — without it the
                    longest description widens its own card. */}
                <li className="flex min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[0.68rem] font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-foreground">{step.name}</h3>
                  </div>
                  <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <Preview />
                </li>

                {i < STEPS.length - 1 && <StepArrow />}
              </Fragment>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
