/**
 * The StayStory platform components, as editable content.
 *
 * This is the single place to change what the Platform Overview section shows.
 * Everything here is rendered as real markup — nothing is baked into an image —
 * so you can safely:
 *
 *   • rename a component        → edit `name`
 *   • edit its description      → edit `description`
 *   • change its icon           → change `icon` to another key of ICONS below
 *   • reorder the components    → move an entry up or down in the array
 *   • add a component           → add an entry (the layout adapts to the count)
 *   • remove a component        → delete an entry
 *
 * To add a brand new icon, add a key to ICONS with an SVG path drawn on a
 * 24×24 grid, then reference that key from a component.
 */

export const ICONS = {
  audit: 'M4 5.5h11M4 12h11M4 18.5h7M18.5 15.5l2 2 3-3.5',
  compass: 'M12 21.5a9.5 9.5 0 100-19 9.5 9.5 0 000 19zm3.6-13.1l-2.2 5.4-5.4 2.2 2.2-5.4z',
  blueprint: 'M3.5 6.5l6-3 5 3 6-3v14l-6 3-5-3-6 3zM9.5 3.5v14M14.5 6.5v14',
  generator: 'M12 2.5l2.3 6.2 6.2 2.3-6.2 2.3L12 19.5l-2.3-6.2L3.5 11l6.2-2.3zM19 17.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  story: 'M4 4.5h7a3 3 0 013 3v13a2.5 2.5 0 00-2.5-2.5H4zM20 4.5h-3.5a3 3 0 00-3 3v13a2.5 2.5 0 012.5-2.5H20z',
} as const

export type IconKey = keyof typeof ICONS

export type PlatformComponent = {
  id: string
  name: string
  description: string
  icon: IconKey
  /** Alternating icon tint, matching the mockup's rhythm across the row. */
  accent: 'primary' | 'secondary'
}

export const PLATFORM_COMPONENTS: PlatformComponent[] = [
  {
    id: 'audit',
    name: 'Experience Audit',
    description: 'Find the friction and the hidden opportunities.',
    icon: 'audit',
    accent: 'primary',
  },
  {
    id: 'compass',
    name: 'Experience Compass',
    description: 'Define the feeling, story, and direction.',
    icon: 'compass',
    accent: 'secondary',
  },
  {
    id: 'blueprint',
    name: 'Experience Blueprint',
    description: 'Shape the key moments across the stay.',
    icon: 'blueprint',
    accent: 'primary',
  },
  {
    id: 'story',
    name: 'Story Builder',
    description: 'Turn the experience into a story guests carry.',
    icon: 'story',
    accent: 'secondary',
  },
  {
    id: 'generator',
    name: 'Generator',
    description: 'Create the gesture that fits this guest.',
    icon: 'generator',
    accent: 'primary',
  },
]

/** The outcome every component above rolls into. Editable in the same way. */
export const PLAYBOOK = {
  name: 'Guest Journey Playbook',
  description:
    'Your complete, shareable playbook for a consistent, unforgettable guest experience.',
}

export function ComponentIcon({ icon, className }: { icon: IconKey; className?: string }) {
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
