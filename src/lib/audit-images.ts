/**
 * The photographs that break up the Experience Audit.
 *
 * This is the one place Audit imagery is configured. Changing a picture,
 * reframing one, rewording a caption or removing one is an edit here — the
 * Audit component reads this and renders whatever it finds, so none of it
 * requires touching the questions or the UI.
 *
 * Every file is served from this app's own /public directory. There is no
 * remote fallback any more: the approved set lives in the repository, so the
 * Audit no longer depends on anyone else's CDN being up, which is what was
 * making these fail intermittently. Files are in public/images/audit — see the
 * README there for which belongs to which step.
 *
 * ── On what these pictures are ──────────────────────────────────────────────
 *
 * Every one is Laurel & Lore, the property the StayStory system was built and
 * tested on, and the only real place we can honestly show. Each carries a
 * visible caption saying so, because an uncaptioned photograph beside a host
 * auditing their own property reads as a claim about theirs. No stock
 * photography — that's the website brief, and it holds inside the product too.
 */

export type AuditImage = {
  /** Served from /public. Edit this to swap a picture. */
  src: string
  /** Empty for decorative images — the caption carries the meaning. */
  alt: string
  /** Never omit this on a photograph of a real place. */
  caption: string
  /**
   * CSS object-position, for when the middle of a photograph isn't the part
   * worth keeping. The band is wide and short, so a portrait shot is cropped
   * hard; this decides which slice survives. Omit for centre.
   */
  position?: string
}

const CAPTION = 'Laurel & Lore — the property StayStory was built on'

/** Keyed by Audit step id. A step with no entry simply renders no image. */
export const AUDIT_IMAGES: Record<string, AuditImage> = {
  /** 1 — Your Vision. Wide exterior: the whole place, at a distance. */
  vision: { src: '/images/audit/vision.jpg', alt: '', caption: CAPTION },

  /**
   * 2 — Arrival. Entry door and approach. The only portrait shot in the set,
   * so it is pulled upward: centred, the band would crop to the deck boards
   * and lose the door the step is about.
   */
  arrival: { src: '/images/audit/arrival.jpg', alt: '', caption: CAPTION, position: '50% 38%' },

  /** 3 — Living & Flow. Wide interior showing circulation and layout. */
  flow: { src: '/images/audit/flow.jpg', alt: '', caption: CAPTION },

  /** 4 — Light & Senses. Warm natural light across the interior. */
  light: { src: '/images/audit/light.jpg', alt: '', caption: CAPTION },

  /** 5 — Sleep & Bath. Murphy bed deployed. */
  sleep: { src: '/images/audit/sleep.jpg', alt: '', caption: CAPTION },

  /** 6 — Kitchen & Amenities. Kitchenette and cooking setup. */
  kitchen: { src: '/images/audit/kitchen.jpg', alt: '', caption: CAPTION },

  /** 7 — Story & Meaning. Bench under the oak; the sense of place. */
  story: { src: '/images/audit/story.jpg', alt: '', caption: CAPTION },

  /** 8 — Guest Transformation. The calm outdoor scene the stay builds toward. */
  transformation: { src: '/images/audit/transformation.jpg', alt: '', caption: CAPTION },
}

export function auditImage(stepId: string): AuditImage | undefined {
  return AUDIT_IMAGES[stepId]
}
