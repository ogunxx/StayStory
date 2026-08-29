/**
 * The six StayStory components, as editable content.
 *
 * One place drives both the system overview (section 2) and all six deep
 * dives (sections 3–8). To change the platform:
 *
 *   • rename a component      → `name`
 *   • edit the one-liner       → `summary` (used in the system overview)
 *   • edit the deep dive       → `headline`, `body`, `benefits`
 *   • change its colour        → `accent`
 *   • swap the preview         → `image` (falls back to the in-code preview)
 *   • reorder / add / remove   → move or edit an entry; numbering follows
 *                                position and the overview respaces itself
 */

export const ICONS = {
  audit: 'M4 5.5h11M4 12h11M4 18.5h7M18.5 15.5l2 2 3-3.5',
  compass: 'M12 21.5a9.5 9.5 0 100-19 9.5 9.5 0 000 19zm3.6-13.1l-2.2 5.4-5.4 2.2 2.2-5.4z',
  blueprint: 'M3.5 6.5l6-3 5 3 6-3v14l-6 3-5-3-6 3zM9.5 3.5v14M14.5 6.5v14',
  generator:
    'M12 2.5l2.3 6.2 6.2 2.3-6.2 2.3L12 19.5l-2.3-6.2L3.5 11l6.2-2.3zM19 17.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  story: 'M4 20l1.5-5L16 4.5 19.5 8 9 18.5zM14.5 6l3.5 3.5',
  playbook: 'M4 4.8h5.5A2.5 2.5 0 0112 7.3v12a2 2 0 00-2-2H4zM20 4.8h-5.5A2.5 2.5 0 0012 7.3v12a2 2 0 012-2h6z',
} as const

export type IconKey = keyof typeof ICONS
export type PreviewKey =
  | 'audit'
  | 'compass'
  | 'blueprint'
  | 'generator'
  | 'story'
  | 'playbook'

/**
 * Accent per product. The mockups run six hues (green, purple, blue, amber,
 * pink, lavender); the warm StayStory palette has three, so these cycle
 * through them and the Playbook takes the strongest tint as the culmination.
 */
export type Accent = { panel: string; chip: string; check: string }

const SAGE: Accent = {
  panel: 'bg-secondary/20',
  chip: 'bg-secondary text-secondary-foreground',
  check: 'bg-secondary text-secondary-foreground',
}
const TERRACOTTA: Accent = {
  panel: 'bg-primary/[0.055]',
  chip: 'bg-primary/12 text-primary',
  check: 'bg-primary text-primary-foreground',
}
const GOLD: Accent = {
  panel: 'bg-accent/30',
  chip: 'bg-accent text-accent-foreground',
  check: 'bg-accent text-accent-foreground',
}
const TERRACOTTA_DEEP: Accent = {
  panel: 'bg-primary/[0.1]',
  chip: 'bg-primary text-primary-foreground',
  check: 'bg-primary text-primary-foreground',
}

export type Product = {
  id: PreviewKey
  name: string
  /** One line, used in the system overview. */
  summary: string
  /** Deep dive. */
  headline: string
  body: string
  benefits: string[]
  icon: IconKey
  accent: Accent
  /** Set to a screenshot to replace the in-code preview. */
  image?: string
  imageAlt?: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'audit',
    name: 'Experience Audit',
    summary: 'Understand what exists today',
    headline: 'See your current experience clearly.',
    body: 'Our guided audit helps you capture every touchpoint, what’s working, what’s not, and the opportunities hiding in plain sight.',
    benefits: [
      'Capture everything that matters',
      'Identify friction and gaps',
      'Understand what guests experience today',
    ],
    icon: 'audit',
    accent: SAGE,
  },
  {
    id: 'compass',
    name: 'Experience Compass',
    summary: 'Define what you want guests to feel',
    headline: 'Define the experience you want to create.',
    body: 'Set the emotional direction for your stay with a clear statement and guiding principles that shape every decision that follows.',
    benefits: [
      'Define your experience statement',
      'Choose the feelings you want to create',
      'Keep every decision aligned',
    ],
    icon: 'compass',
    accent: TERRACOTTA,
  },
  {
    id: 'blueprint',
    name: 'Experience Blueprint',
    summary: 'Map the journey and design the moments',
    headline: 'Map the journey. Design the moments.',
    body: 'Visually map the full guest journey and intentionally design the moments, rituals, and details that bring your experience to life.',
    benefits: [
      'Map every stage of the journey',
      'Design signature moments and rituals',
      'Align with your Compass',
    ],
    icon: 'blueprint',
    accent: GOLD,
  },
  {
    id: 'generator',
    name: 'Generator',
    summary: 'Create ideas, details, and guest touches',
    headline: 'Generate ideas that fit your experience.',
    body: 'Get personalised ideas for moments, touches, amenities, and details that align with your Compass and your guests.',
    benefits: [
      'Ideas tailored to your stay and guests',
      'Inspiration for every stage',
      'Save and refine your favourites',
    ],
    icon: 'generator',
    accent: SAGE,
  },
  {
    id: 'story',
    name: 'Story Builder',
    summary: 'Craft the words and moments that connect',
    headline: 'Craft the words that bring it to life.',
    body: 'Turn your experience into clear, compelling language your guests will read, feel, and remember.',
    benefits: [
      'Write guest-facing touchpoints',
      'Create messages, guides, and signs',
      'Make every word on-brand and on-feel',
    ],
    icon: 'story',
    accent: TERRACOTTA,
  },
  {
    id: 'playbook',
    name: 'Guest Journey Playbook',
    summary: 'Bring it all together and deliver consistently',
    headline: 'Your experience, in one living guide.',
    body: 'Everything comes together in one shareable playbook your team can use to deliver the experience consistently — every time.',
    benefits: [
      'Complete journey at a glance',
      'Share with your team or co-hosts',
      'Keep it updated as you evolve',
    ],
    icon: 'playbook',
    accent: TERRACOTTA_DEEP,
  },
]

export function ProductIcon({ icon, className }: { icon: IconKey; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d={ICONS[icon]}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
