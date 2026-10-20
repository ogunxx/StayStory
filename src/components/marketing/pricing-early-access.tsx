import Link from 'next/link'
import { ctaHeroPrimary, ctaHeroSecondary, REASSURANCE } from './cta-styles'

/**
 * What /pricing says while the focused launch is free.
 *
 * The full pricing page is preserved and unchanged — this composition sits
 * in front of it, and the original returns the moment FOCUSED_LAUNCH_MODE is
 * off. Nothing about the plans is deleted.
 *
 * It exists because people still arrive here: an old bookmark, a search
 * result, a typed URL. Showing them a $29 tier comparison would contradict
 * every other page, which currently promises a free guided journey. The
 * honest answer is that there is nothing to buy yet, so that is what it says.
 *
 * It does not pretend the plans do not exist. Hiding them entirely would
 * raise the obvious question — "so what will this cost?" — and leave it
 * unanswered.
 */
export function PricingEarlyAccess() {
  return (
    <section className="px-6 py-20 lg:py-28">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-primary">Early access</p>
        <h1 className="mt-4 font-serif text-[2.1rem] leading-[1.1] font-semibold tracking-tight text-foreground min-[360px]:text-[2.6rem] sm:text-[3.2rem]">
          StayStory is open for early access.
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          There is nothing to buy today. You can walk the whole guided StayStory journey without
          a subscription, a plan or a card — see the stay the way your guests do, shape what you
          want them to feel, find three opportunities worth your attention, and leave with a
          Starter Playbook you can actually work from.
        </p>

        <ol className="mt-10 flex flex-col gap-3">
          {[
            ['Experience Audit', 'Walk your property the way a guest does.'],
            ['Experience Compass', 'Name what you want guests to feel and remember.'],
            ['Three opportunities', 'Drawn from your own property, not a checklist.'],
            ['Starter Playbook', 'What each one could mean, and one first step for each.'],
          ].map(([name, line], i) => (
            <li
              key={name}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5"
            >
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[0.7rem] font-semibold tabular-nums text-primary"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0">
                <span className="block font-serif text-lg font-semibold text-foreground">
                  {name}
                </span>
                <span className="mt-0.5 block text-[0.9rem] leading-relaxed text-muted-foreground">
                  {line}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/signup" className={`${ctaHeroPrimary} w-full sm:w-auto`}>
            Start Your Experience Audit →
          </Link>
          <Link href="/platform" className={`${ctaHeroSecondary} w-full sm:w-auto`}>
            See the Platform
          </Link>
        </div>

        {/* The same line as every other focused surface, from the same
            constant, so this page cannot drift from the hero again. */}
        <p className="mt-6 text-[0.85rem] leading-relaxed text-muted-foreground">
          {REASSURANCE.join(' · ')}
        </p>

        {/* Says what happens later without turning this into a price list. */}
        <p className="mt-10 border-t border-border pt-6 text-[0.9rem] leading-relaxed text-muted-foreground">
          StayStory will have paid plans as it grows, and hosts who join during early access will
          hear about them from us first. None of that is required for the experience above.
        </p>
      </div>
    </section>
  )
}
