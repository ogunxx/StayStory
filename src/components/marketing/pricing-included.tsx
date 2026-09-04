import { ICONS, PRODUCTS, type Product } from './platform-products'

/**
 * Pricing — Section 3. What you get.
 *
 * The six components come from PRODUCTS, the same array that drives the
 * Platform page, so renaming or reordering a component there updates this
 * section too and the two pages can't disagree about what StayStory includes.
 */

function Component({ product }: { product: Product }) {
  return (
    <div className="min-w-0">
      <svg viewBox="0 0 24 24" fill="none" className="size-5 text-primary" aria-hidden>
        <path
          d={ICONS[product.icon]}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="mt-3.5 text-[0.95rem] font-semibold text-foreground">{product.name}</h3>
      <p className="mt-1.5 text-[0.83rem] leading-relaxed text-muted-foreground">
        {product.summary}
      </p>
    </div>
  )
}

export function PricingIncluded({
  eyebrow = 'What you get',
  headline = ['Everything you need to create', 'a more meaningful stay.'],
  supporting = 'StayStory brings together a complete set of tools to help you design, refine and deliver a guest experience that feels intentional and memorable.',
  products = PRODUCTS,
}: {
  eyebrow?: string
  headline?: string[]
  supporting?: string
  products?: Product[]
}) {
  return (
    <section className="px-6 py-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
        <div className="min-w-0">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h2 className="font-serif text-[1.7rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2.1rem]">
            {headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-5 max-w-sm text-[0.92rem] leading-relaxed text-muted-foreground">
            {supporting}
          </p>
        </div>

        <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 lg:border-l lg:border-border/70 lg:pl-12">
          {products.map((product) => (
            <Component key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
