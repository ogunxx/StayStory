import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ProductPreview } from './product-preview'

const REASSURANCE = ['No credit card', 'Setup in minutes', 'Cancel anytime']

function TickIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-3.5 shrink-0 text-primary" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.5 10.3l2.4 2.3 4.6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 pt-14 pb-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:pt-20 lg:pb-28">
        {/* ── Message ───────────────────────────────────────────────────── */}
        <div className="flex flex-col">
          <h1 className="font-serif text-[2.75rem] leading-[1.05] font-semibold tracking-tight text-foreground sm:text-6xl lg:text-[4.15rem]">
            Design guest
            <br />
            experiences they&apos;ll
            <br />
            <span className="relative inline-block whitespace-nowrap">
              remember.
              <svg
                viewBox="0 0 240 12"
                preserveAspectRatio="none"
                aria-hidden
                className="absolute -bottom-1.5 left-0 h-2.5 w-full text-primary/45"
              >
                <path
                  d="M2 8.5C46 4 118 2.5 238 5.5"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            StayStory helps hosts design the whole guest journey — not just add another amenity.
            Uncover what makes your place meaningful, shape every moment around it, and deliver
            it consistently, stay after stay.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: 'lg' }), 'h-12 rounded-xl px-7 text-base')}
            >
              Start Free
              <span aria-hidden className="ml-1">→</span>
            </Link>
            <a
              href="/platform"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-12 rounded-xl border-border px-7 text-base'
              )}
            >
              See the Platform
            </a>
          </div>

          <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
            {REASSURANCE.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-[0.8rem] text-muted-foreground">
                <TickIcon />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Product preview ───────────────────────────────────────────── */}
        <div className="lg:pl-4">
          <ProductPreview />
        </div>
      </div>
    </section>
  )
}
