/**
 * Who StayStory is, and how someone reaches it.
 *
 * One place, because the same entity name, contact address and refund window
 * appear across Terms, Privacy and Refunds — and in the emails Stripe
 * triggers. Several copies of a fact like that is several chances for them to
 * disagree. If the company name changes, or the refund window moves, change
 * it here.
 *
 * ┌─ NOT LEGAL ADVICE ─────────────────────────────────────────────────────┐
 * │ These pages were drafted to describe accurately what StayStory         │
 * │ actually does — the data it stores, the companies it sends that data   │
 * │ to, what a subscriber is buying. That makes them a far better starting │
 * │ point than a template, and still not a substitute for a lawyer         │
 * │ reading them. Privacy especially, now that the homepage collects names │
 * │ and email addresses from the public.                                   │
 * └────────────────────────────────────────────────────────────────────────┘
 */

/**
 * StayStory is a brand, not a company. A contract needs a party that legally
 * exists, so every legal page says who that is and then uses "StayStory"
 * throughout.
 *
 * Verify the exact registered name against the Georgia Secretary of State
 * rather than Stripe's business-name field — Stripe's is often a trading
 * name, and these documents identify who the customer is contracting with.
 */
export const ENTITY = {
  legalName: 'Laurel & Lore, LLC',
  shortForm: 'Laurel & Lore',
  jurisdiction: 'Georgia',
  descriptor: 'a Georgia limited liability company',
  tradingAs: 'StayStory',
} as const

/**
 * The one address a host is ever told to write to.
 *
 * Used by the legal pages and by the transactional emails alike, which is the
 * point: a receipt that says "reply to us here" and a refund policy that
 * names somewhere else is how people conclude nobody is home.
 *
 * ┌─ TWO REQUIREMENTS, EASILY CONFUSED ────────────────────────────────────┐
 * │ A `From` address needs its DOMAIN verified in Resend. Any local-part   │
 * │ works — `anything@staystory.co` sends perfectly whether or not a       │
 * │ mailbox exists behind it.                                              │
 * │                                                                        │
 * │ A `Reply-To` address needs a MAILBOX that actually RECEIVES. That is   │
 * │ MX records on the root domain, which is an entirely separate piece of  │
 * │ DNS from the sending setup.                                            │
 * │                                                                        │
 * │ Mail kept leaving successfully for months while every reply vanished,  │
 * │ because the first requirement was met and the second was never         │
 * │ noticed. If this address changes, check both.                          │
 * │ See docs/MAILBOX_SETUP.md.                                             │
 * └────────────────────────────────────────────────────────────────────────┘
 */
export const CONTACT_EMAIL = 'info@staystory.co'

export const SITE = {
  name: 'StayStory',
  domain: 'staystory.co',
  url: 'https://staystory.co',
} as const

/**
 * The `From` header on every email StayStory sends itself.
 *
 * Deliberately the same address as `CONTACT_EMAIL` rather than a no-reply:
 * someone answering a receipt is usually someone with a question, and the
 * reply ought to land somewhere a person reads.
 */
export const EMAIL_FROM = `${SITE.name} <${CONTACT_EMAIL}>`

/**
 * Shown as "Last updated" on each page. Move it whenever the substance
 * changes — not for a typo, and not automatically, because a date that
 * shifts on every deploy tells a reader nothing.
 */
export const LAST_UPDATED = '20 October 2026'

/**
 * Full refund if asked within this many days of a first payment; after that,
 * cancel any time and keep access to the end of the period already paid for.
 *
 * Chosen deliberately over the stricter industry norm: a new brand asking for
 * a subscription has to earn the benefit of the doubt, and a refund window is
 * a cheaper way to buy trust than most marketing.
 */
export const REFUND_WINDOW_DAYS = 7

/**
 * Who else sees a host's data, and why.
 *
 * Read off the actual integrations rather than a generic list. If a
 * processor is added or dropped, this is the list to change — a privacy
 * policy naming a company you no longer use is worse than naming none.
 */
export const PROCESSORS = [
  {
    name: 'Supabase',
    purpose: 'Database and account sign-in',
    detail:
      'Stores your account, your properties and everything you write in StayStory. Passwords are hashed by Supabase and are never visible to us.',
  },
  {
    name: 'Anthropic',
    purpose: 'The AI that drafts recommendations and content',
    detail:
      'When you ask StayStory to generate something, the relevant parts of your Audit, Compass and notes are sent to Anthropic to produce it. Anthropic processes this to return a result for you.',
  },
  {
    name: 'Stripe',
    purpose: 'Payments',
    detail:
      'Handles every payment. Card details go to Stripe directly and never reach StayStory — we store only the customer reference Stripe gives us.',
  },
  {
    name: 'Resend',
    purpose: 'Email',
    detail:
      'Sends account emails: confirming your address, resetting a password, receipts.',
  },
  {
    name: 'Vercel',
    purpose: 'Hosting',
    detail:
      'Runs the website and the application, and keeps short-lived technical logs of requests.',
  },
] as const
