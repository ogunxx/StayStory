import { PLATFORM_PREVIEWS } from './platform-previews'
import { PRODUCTS, type Product } from './platform-products'

/**
 * Platform page — Sections 3 to 8, the six product deep dives.
 *
 * One component rendered six times rather than six near-identical sections,
 * which is what makes renaming, reordering, adding or removing a product a
 * one-line edit in platform-products.tsx. Numbering follows position.
 *
 * The mockup keeps copy left and preview right on every card rather than
 * alternating, so that's what this does — the tinted panel per product is what
 * separates them, not a flipped layout.
 */

function Check({ className }: { className: string }) {
  return (
    <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded ${className}`}>
      <svg viewBox="0 0 20 20" fill="none" className="size-2.5" aria-hidden>
        <path
          d="M4 10.5l4 4 8-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function DeepDive({ product, index }: { product: Product; index: number }) {
  const Preview = PLATFORM_PREVIEWS[product.id]

  return (
    <section
      id={product.id}
      className={`rounded-3xl px-6 py-10 sm:px-10 lg:px-12 lg:py-12 ${product.accent.panel}`}
    >
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.5fr] lg:items-center lg:gap-12">
        <div className="min-w-0">
          <p className="mb-3 text-[0.8rem] font-semibold tabular-nums text-primary">
            {String(index + 1).padStart(2, '0')}
          </p>
          <h2 className="font-serif text-[1.6rem] leading-tight font-semibold tracking-tight text-foreground sm:text-[1.9rem]">
            {product.name}
          </h2>
          <p className="mt-2 text-[0.95rem] font-medium leading-snug text-foreground">
            {product.headline}
          </p>
          <p className="mt-3 max-w-sm text-[0.87rem] leading-relaxed text-muted-foreground">
            {product.body}
          </p>

          <ul className="mt-5 flex flex-col gap-2">
            {product.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-[0.85rem] leading-snug text-foreground">
                <Check className={product.accent.check} />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* min-w-0 so a preview's no-wrap rows can't widen the column. */}
        <div className="min-w-0">
          {product.image ? (
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_26px_70px_-38px_rgba(60,40,25,0.5)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.imageAlt ?? `${product.name} in StayStory`}
                className="block w-full"
              />
            </div>
          ) : (
            <Preview />
          )}
        </div>
      </div>
    </section>
  )
}

export function PlatformDeepDives() {
  return (
    <div className="px-6 pb-4">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        {PRODUCTS.map((product, i) => (
          <DeepDive key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  )
}
