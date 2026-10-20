import type { CompassField } from '@/types'

// Client-safe field definitions — no server-only imports here, so both API
// routes and 'use client' pages (Compass, Generator) can import this directly.

/**
 * `tier` separates what the Audit can establish from what only deeper work
 * can. The six 'core' fields are exactly the ones the Experience Audit maps
 * onto, so a host who has completed the Audit already has a Compass strong
 * enough to guide recommendations. 'evolving' fields — Wonder and the story
 * guests will tell — come from reflection and Story Builder, and asking a new
 * host to write them before they can continue would be a wall, not a compass.
 *
 * Nothing about this changes what reaches the recommendations:
 * buildCompassContext still uses every field that has a value. It only changes
 * what the host is told is expected of them.
 */
export type CompassTier = 'core' | 'evolving'

export const COMPASS_FIELDS: {
  field: CompassField
  label: string
  prompt: string
  tier: CompassTier
}[] = [
  { field: 'wonder', label: 'Wonder', prompt: 'What first inspired you to create this place?', tier: 'evolving' },
  { field: 'purpose', label: 'Purpose', prompt: 'Why does this place exist?', tier: 'core' },
  { field: 'story', label: 'Story', prompt: 'What story are guests stepping into?', tier: 'core' },
  { field: 'transformation_arrive', label: 'Guests arrive feeling', prompt: 'Guests arrive feeling ___.', tier: 'core' },
  { field: 'transformation_leave', label: 'Guests leave feeling', prompt: 'Guests leave feeling ___.', tier: 'core' },
  { field: 'hospitality_promise', label: 'Hospitality Promise', prompt: 'Every guest should feel ___.', tier: 'core' },
  { field: 'signature_memory', label: 'Signature Memory', prompt: 'Six months later, what do you hope guests still remember?', tier: 'core' },
  {
    field: 'story_theyll_tell',
    label: "The Story They'll Tell",
    prompt: `When someone asks "So, how was your trip?" — what's the first thing you hope they say?`,
    tier: 'evolving',
  },
]

export const COMPASS_FIELD_LABELS: Record<CompassField, string> = Object.fromEntries(
  COMPASS_FIELDS.map((f) => [f.field, f.label])
) as Record<CompassField, string>
