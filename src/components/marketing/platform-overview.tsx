import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ComponentIcon, PLATFORM_COMPONENTS, PLAYBOOK } from './platform-components'
import { PlaybookPreview } from './playbook-preview'

/**
 * Section 2 — Platform Overview.
 *
 * The idea this section has to land visually is that the components are not
 * five unrelated tools: they converge into one outcome. That convergence is
 * built as real layout (dotted connector rails into a single node) rather than
 * a static diagram, so it stays correct if components are added or removed in
 * platform-components.tsx.
 */

const count = PLATFORM_COMPONENTS.length

/**
 * Tailwind needs the full class name present in the source, so the column
 * count is looked up rather than interpolated. Add a row here if the platform
 * ever grows past six components.
 */
const GRID_COLS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
}
const colsClass = GRID_COLS[count] ?? 'lg:grid-cols-3'

const ACCENT = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
} as const

const BADGE = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
} as const

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden>
      <path
        d="M4 4.8h5.5A2.5 2.5 0 0112 7.3v12a2 2 0 00-2-2H4zM20 4.8h-5.5A2.5 2.5 0 0012 7.3v12a2 2 0 012-2h6z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PlatformOverview() {
  return (
    <section id="platform" className="px-6 py-20 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            The StayStory Platform
          </p>
          <h2 className="max-w-5xl font-serif text-[2rem] leading-[1.12] font-semibold tracking-tight text-foreground sm:text-4xl lg:text-[2.6rem] lg:whitespace-nowrap">
            One system. One guest journey playbook.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Everything you build inside StayStory rolls into a living playbook you can
            use, share, and refine.
          </p>
          <a
            href="#how-it-works"
            className={cn(buttonVariants(), 'mt-8 h-12 rounded-full px-7 text-base')}
          >
            Explore the platform
            <span aria-hidden className="ml-1.5">→</span>
          </a>
        </div>

        {/* ── Components ──────────────────────────────────────────────── */}
        {/* Column count follows the data, so adding or removing a component
            in platform-components.tsx just works. */}
        <ul className={cn('mt-16 grid gap-3 lg:mt-20', colsClass)}>
          {PLATFORM_COMPONENTS.map((c, i) => (
            <li key={c.id} className="relative flex flex-col">
              <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card px-5 py-6 text-center">
                <span
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                    ACCENT[c.accent]
                  )}
                >
                  <ComponentIcon icon={c.icon} className="size-5" />
                </span>
                <h3 className="mt-1 font-serif text-[0.95rem] font-semibold leading-snug text-foreground">
                  {c.name}
                </h3>
                <p className="text-[0.8rem] leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
                <span
                  className={cn(
                    'mt-auto flex size-6 items-center justify-center rounded-full text-[0.65rem] font-semibold tabular-nums',
                    BADGE[c.accent]
                  )}
                >
                  {i + 1}
                </span>
              </div>

              {/* Connector into the next card — wide screens sit it in the gap. */}
              {i < count - 1 && (
                <>
                  <span
                    aria-hidden
                    className="absolute top-1/2 -right-3 hidden w-3 -translate-y-1/2 items-center gap-[3px] lg:flex"
                  >
                    <span className="size-1 rounded-full bg-border" />
                    <span className="h-px flex-1 bg-border" />
                    <span className="size-1 rounded-full bg-border" />
                  </span>
                  <span
                    aria-hidden
                    className="mx-auto h-4 border-l border-dashed border-border lg:hidden"
                  />
                </>
              )}
            </li>
          ))}
        </ul>

        {/* ── Convergence into the outcome ────────────────────────────── */}
        <div aria-hidden className="flex flex-col items-center">
          {/* Wide screens: a dotted stub under each card, joined into one rail. */}
          <div className="hidden w-full lg:block">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
              {PLATFORM_COMPONENTS.map((c) => (
                <span key={c.id} className="mx-auto h-8 border-l border-dashed border-border" />
              ))}
            </div>
            <div
              className="mx-auto border-t border-dashed border-border"
              style={{ width: `${(1 - 1 / count) * 100}%` }}
            />
          </div>
          <span className="h-5 border-l border-dashed border-border lg:h-6" />
          <span className="size-2.5 rounded-full border border-border bg-background" />
          <span className="h-5 border-l border-dashed border-border lg:h-6" />
        </div>

        {/* ── Guest Journey Playbook ──────────────────────────────────── */}
        <div className="mt-4 overflow-hidden rounded-3xl border border-primary/20 bg-primary/[0.05] p-6 sm:p-8 lg:py-10 lg:pl-10 lg:pr-0">
          <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
            <div className="flex gap-4 sm:gap-5">
              <span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground sm:flex">
                <BookIcon />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-serif text-2xl leading-tight font-semibold text-foreground sm:text-[1.75rem]">
                    {PLAYBOOK.name}
                  </h3>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[0.65rem] font-medium text-secondary-foreground">
                    Living
                  </span>
                </div>
                <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-muted-foreground">
                  {PLAYBOOK.description}
                </p>
              </div>
            </div>

            {/* Bleeds off the right edge on wide screens, as in the mockup.
                Swap for a screenshot by passing src — see playbook-preview.tsx */}
            <div className="lg:-mr-10 xl:-mr-16">
              <PlaybookPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
