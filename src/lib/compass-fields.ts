import type { CompassField } from '@/types'

// Client-safe field definitions — no server-only imports here, so both API
// routes and 'use client' pages (Compass, Generator) can import this directly.

export const COMPASS_FIELDS: { field: CompassField; label: string; prompt: string }[] = [
  { field: 'wonder', label: 'Wonder', prompt: 'What first inspired you to create this place?' },
  { field: 'purpose', label: 'Purpose', prompt: 'Why does this place exist?' },
  { field: 'story', label: 'Story', prompt: 'What story are guests stepping into?' },
  { field: 'transformation_arrive', label: 'Guests arrive feeling', prompt: 'Guests arrive feeling ___.' },
  { field: 'transformation_leave', label: 'Guests leave feeling', prompt: 'Guests leave feeling ___.' },
  { field: 'hospitality_promise', label: 'Hospitality Promise', prompt: 'Every guest should feel ___.' },
  { field: 'signature_memory', label: 'Signature Memory', prompt: 'Six months later, what do you hope guests still remember?' },
  {
    field: 'story_theyll_tell',
    label: "The Story They'll Tell",
    prompt: `When someone asks "So, how was your trip?" — what's the first thing you hope they say?`,
  },
]

export const COMPASS_FIELD_LABELS: Record<CompassField, string> = Object.fromEntries(
  COMPASS_FIELDS.map((f) => [f.field, f.label])
) as Record<CompassField, string>
