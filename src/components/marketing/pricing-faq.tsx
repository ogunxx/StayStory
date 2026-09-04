/**
 * Pricing — Section 6. Common questions.
 *
 * Each question is one entry in FAQS. The accordion is a native <details>
 * element, so it opens without JavaScript, is keyboard-operable by default,
 * and this stays a server component.
 *
 * Answers state only what the product actually does today. Plan limits here
 * must match PROPERTY_LIMITS and PLAN_PRICING in src/lib/config.
 */

export type Faq = { id: string; question: string; answer: string }

export const FAQS: Faq[] = [
  {
    id: 'experience',
    question: 'Do I need hospitality experience to use StayStory?',
    answer:
      'No. StayStory asks you questions about your place and your guests, then walks you through the thinking step by step. If you have hosted even once, you already know more than you think — the tools help you put it into words and act on it.',
  },
  {
    id: 'pace',
    question: 'Can I complete the steps at my own pace?',
    answer:
      'Yes. Nothing is timed and nothing expires. You can run the Audit today, come back to the Compass next week, and build the Blueprint whenever you are ready. Your work is saved as you go.',
  },
  {
    id: 'change',
    question: 'Can I change my property details later?',
    answer:
      'Yes. Everything you write can be edited at any time. Most hosts revisit their Blueprint after a few stays, once guests have shown them what actually lands.',
  },
  {
    id: 'multiple',
    question: 'What if I manage more than one property?',
    answer:
      'The Free and Legendary plans cover one property. Portfolio covers up to five, each with its own blueprint, plus co-host and team access.',
  },
  {
    id: 'free',
    question: 'Is the free plan really free?',
    answer:
      'Yes, and it does not need a card. You can build and edit your Experience Blueprint, run an Experience Audit, and try the Generator. Paid plans remove the limits and unlock the full Guest Journey Playbook.',
  },
  {
    id: 'cancel',
    question: 'Can I cancel at any time?',
    answer:
      'Yes. Cancel whenever you like and you keep access through the period you have already paid for. You can also turn off auto-renewal at checkout, so the plan simply ends rather than renewing.',
  },
  {
    id: 'billing',
    question: 'What is the difference between monthly and annual billing?',
    answer:
      'Monthly is charged each month. Annual is charged once for the year and works out to two months free compared with paying monthly. The plan itself is identical either way.',
  },
  {
    id: 'install',
    question: 'Do I need to install anything or connect my listing?',
    answer:
      'No. StayStory runs in your browser and does not need access to your Airbnb, Vrbo or booking accounts. You bring what you know about your place; StayStory helps you shape it.',
  },
  {
    id: 'output',
    question: 'What do I actually end up with?',
    answer:
      'A Guest Journey Playbook: your experience defined, the journey mapped stage by stage, and the moments, messages and details written out so they can be delivered the same way every stay.',
  },
  {
    id: 'fit',
    question: 'Will this work for my kind of stay?',
    answer:
      'It is built for independent and boutique stays — cabins, cottages, design-led homes, small collections. The thinking applies wherever a guest arrives, stays and leaves with an impression. If you are unsure, the free plan is the cheapest way to find out.',
  },
]

function Chevron() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
    >
      <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function PricingFaq({
  eyebrow = 'Frequently asked questions',
  headline = 'Common questions',
  supporting = 'Here are some of the questions hosts ask us most.',
  faqs = FAQS,
}: {
  eyebrow?: string
  headline?: string
  supporting?: string
  faqs?: Faq[]
}) {
  return (
    <section id="faq" className="px-6 py-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div className="min-w-0">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h2 className="font-serif text-[1.8rem] leading-tight font-semibold tracking-tight text-foreground sm:text-[2.2rem]">
            {headline}
          </h2>
          <p className="mt-4 max-w-xs text-[0.92rem] leading-relaxed text-muted-foreground">
            {supporting}
          </p>
        </div>

        <div className="min-w-0 lg:border-l lg:border-border/70 lg:pl-12">
          {faqs.map((faq) => (
            <details key={faq.id} className="group border-b border-border/60">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[0.92rem] font-medium text-foreground marker:content-none hover:text-primary">
                {faq.question}
                <Chevron />
              </summary>
              <p className="pb-5 pr-10 text-[0.87rem] leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
