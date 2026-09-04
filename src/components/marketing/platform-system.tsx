import { PRODUCTS, ProductIcon } from './platform-products'

/**
 * Platform page — Section 2, The System.
 *
 * The overview only: six components in sequence with arrows between, each
 * carrying its one-line summary. The deep dives below do the explaining.
 *
 * Everything comes from PRODUCTS, so the row follows however many components
 * exist and stays in step with the sections beneath it.
 */

export const SYSTEM = {
  label: 'The System',
  headline: 'One connected system. Every step with purpose.',
  supporting:
    'Each part builds on the one before it, and all of it collects into your Guest Journey Playbook.',
}

function Arrow() {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center py-1 text-primary/40 lg:px-1 lg:py-0"
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

export function PlatformSystem() {
  return (
    <section id="the-system" className="px-6 py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {SYSTEM.label}
          </p>
          <h2 className="font-serif text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2.2rem]">
            {SYSTEM.headline}
          </h2>
          <p className="mt-4 text-[0.9rem] leading-relaxed text-muted-foreground">
            {SYSTEM.supporting}
          </p>
        </div>

        <ol className="mt-14 flex flex-col lg:mt-16 lg:flex-row lg:items-start">
          {PRODUCTS.map((p, i) => (
            <li key={p.id} className="contents">
              <div className="flex min-w-0 flex-1 items-center gap-4 lg:flex-col lg:gap-0 lg:text-center">
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-full lg:size-14 ${p.accent.chip}`}
                >
                  <ProductIcon icon={p.icon} className="size-5 lg:size-6" />
                </span>
                <span className="min-w-0 lg:mt-4">
                  <span className="block text-[0.85rem] font-semibold leading-snug text-foreground lg:text-[0.8rem]">
                    {p.name}
                  </span>
                  <span className="mt-1 block text-[0.78rem] leading-snug text-muted-foreground lg:text-[0.72rem]">
                    {p.summary}
                  </span>
                </span>
              </div>

              {i < PRODUCTS.length - 1 && <Arrow />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
