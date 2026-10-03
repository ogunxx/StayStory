import { LAUREL_IMAGES } from '@/components/marketing/laurel-images'

/**
 * The photographs that break up the Experience Audit.
 *
 * This is the one place Audit imagery is configured. Changing a picture,
 * removing one, rewording a caption or adding one to a step that has none is
 * an edit here — the Audit component reads this and renders whatever it finds,
 * so none of it requires touching the UI.
 *
 * ── Local first, remote as a safety net ─────────────────────────────────────
 *
 * `src` points at a file served from this app's own /public directory. `remote`
 * is the original URL on the Laurel & Lore CDNs, used only if the local file
 * isn't there. The host reported images failing intermittently, which is what
 * depending on someone else's CDN buys you.
 *
 * The two together mean the switch needs no coordination: while /public is
 * empty the local request 404s, the remote loads, and the Audit looks the same
 * as it does today. Drop the files in and every load is local from then on,
 * with no code change. If both fail the figure removes itself rather than
 * leaving a broken-image icon in the middle of the step.
 *
 * To fetch the files, run:  node scripts/fetch-audit-images.mjs
 * See public/images/audit/README.md for what belongs there.
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
  /** Original CDN URL, used only when the local file is missing. */
  remote?: string
  /** Empty for decorative images — the caption carries the meaning. */
  alt: string
  /** Never omit this on a photograph of a real place. */
  caption: string
}

const CAPTION = 'Laurel & Lore — the property StayStory was built on'

/**
 * Ask each CDN for a sensibly sized file.
 *
 * The originals are requested at 2500w and 1200w for a band that is never
 * taller than 208px. Multi-megabyte downloads for a decorative strip are the
 * most likely reason they were timing out, so the fallback asks for something
 * proportionate. The marketing site's own usage is untouched: these are
 * derived here rather than changed in LAUREL_IMAGES.
 */
function sized(url: string): string {
  return url
    .replace(/format=\d+w/, 'format=1000w')
    .replace(/im_w=\d+/, 'im_w=720')
}

/** Keyed by Audit step id. A step with no entry simply renders no image. */
export const AUDIT_IMAGES: Record<string, AuditImage> = {
  vision: {
    src: '/images/audit/vision.jpg',
    remote: sized(LAUREL_IMAGES.exterior),
    alt: '',
    caption: CAPTION,
  },
  light: {
    src: '/images/audit/light.jpg',
    remote: sized(LAUREL_IMAGES.interior),
    alt: '',
    caption: CAPTION,
  },
  sleep: {
    src: '/images/audit/sleep.jpg',
    remote: sized(LAUREL_IMAGES.outdoorShower),
    alt: '',
    caption: CAPTION,
  },
  story: {
    src: '/images/audit/story.jpg',
    remote: sized(LAUREL_IMAGES.wellness),
    alt: '',
    caption: CAPTION,
  },
  transformation: {
    src: '/images/audit/transformation.jpg',
    remote: sized(LAUREL_IMAGES.deck),
    alt: '',
    caption: CAPTION,
  },

  // Steps 2 (Arrival), 3 (Living & Flow) and 6 (Kitchen & Amenities) have no
  // entry on purpose: there is no approved photograph of an entry, a living
  // space or a kitchen. Add one here when there is — nothing else changes.
}

export function auditImage(stepId: string): AuditImage | undefined {
  return AUDIT_IMAGES[stepId]
}
