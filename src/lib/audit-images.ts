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

/**
 * How a photograph meets the frame.
 *
 * `cover` fills the frame and crops whatever does not fit. Right when the
 * subject sits comfortably in the middle band and losing the edges costs
 * nothing.
 *
 * `contain` shrinks the whole picture until all of it fits, leaving neutral
 * ground on either side when the proportions disagree. Right when the
 * composition *is* the point and cropping it would remove the thing the step
 * is about.
 *
 * Neither ever distorts: both preserve the original aspect ratio.
 */
export type AuditImageFit = 'cover' | 'contain'

export type AuditImage = {
  /** Served from /public. Edit this to swap a picture. */
  src: string
  /** Empty for decorative images — the caption carries the meaning. */
  alt: string
  /** Never omit this on a photograph of a real place. */
  caption: string
  /**
   * Defaults to `cover`. Set `contain` for a picture whose whole composition
   * has to survive — see the type above for how to choose.
   */
  fit?: AuditImageFit
  /**
   * CSS object-position, for when the middle of a photograph isn't the part
   * worth keeping. Omit for centre.
   *
   * Under `cover` this chooses which slice survives the crop. Under `contain`
   * nothing is cropped, so it only slides the whole picture around inside the
   * frame — along whichever axis has spare room, and not at all on the other.
   * Usually leave it unset on a contained image.
   */
  position?: string
}

/**
 * The frame every Audit photograph appears in. One ratio for all eight steps,
 * so the Audit keeps a single rhythm no matter what shape each picture is.
 *
 * ┌─ WHY A RATIO RATHER THAN A FIXED HEIGHT ───────────────────────────────┐
 * │ This used to be `h-40 … sm:h-52` — 160px tall on a phone, 208px on a   │
 * │ desktop. Because the height was fixed while the width was not, the     │
 * │ frame's shape changed enormously between breakpoints: about 2.1:1 on   │
 * │ a phone but 3.8:1 on a desktop. The same photograph was cropped        │
 * │ mildly on mobile and brutally on desktop, which is why the images      │
 * │ read as "too zoomed in" on a large screen and looked fine on a small   │
 * │ one.                                                                   │
 * │                                                                        │
 * │ An aspect ratio holds the shape steady instead, so a picture is        │
 * │ framed the same way everywhere and only its size changes.              │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * The two values are chosen against the actual photographs. Most of the set
 * is 3:2, so a phone (3/2) crops them not at all, and a desktop (12/5 ≈ 2.4:1)
 * keeps about 62% of their height rather than the 40% the old band kept.
 *
 * Changing this is a one-line edit and every step follows. Keep it a ratio,
 * and keep it the same for all steps.
 */
export const AUDIT_IMAGE_FRAME = 'aspect-[3/2] sm:aspect-[12/5]'

/** The Tailwind class for an image's fit. `cover` unless it says otherwise. */
export function auditImageFitClass(image: Pick<AuditImage, 'fit'>): string {
  return image.fit === 'contain' ? 'object-contain' : 'object-cover'
}

const CAPTION = 'Laurel & Lore — the property StayStory was built on'

/** Keyed by Audit step id. A step with no entry simply renders no image. */
export const AUDIT_IMAGES: Record<string, AuditImage> = {
  /** 1 — Your Vision. Wide exterior: the whole place, at a distance. */
  vision: { src: '/images/audit/vision.jpg', alt: '', caption: CAPTION },

  /**
   * 2 — Arrival. Entry door and approach, and the only portrait shot in the
   * set (3:4 against a landscape frame).
   *
   * Contained rather than cropped, because this picture *is* the arrival:
   * the path, the steps, the deck, the door, the roofline above it. Any crop
   * wide enough to fill the frame keeps a horizontal slice of the door and
   * throws away the approach — which is the one thing the step asks about.
   * It sits narrow on neutral ground instead, whole.
   *
   * The old `position: '50% 38%'` is gone with the crop it was correcting.
   */
  arrival: { src: '/images/audit/arrival.jpg', alt: '', caption: CAPTION, fit: 'contain' },

  /** 3 — Living & Flow. Wide interior showing circulation and layout. */
  flow: { src: '/images/audit/flow.jpg', alt: '', caption: CAPTION },

  /** 4 — Light & Senses. Warm natural light across the interior. */
  light: { src: '/images/audit/light.jpg', alt: '', caption: CAPTION },

  /** 5 — Sleep & Bath. Murphy bed deployed. */
  sleep: { src: '/images/audit/sleep.jpg', alt: '', caption: CAPTION },

  /**
   * 6 — Kitchen & Amenities. Kitchenette and cooking setup. The squarest
   * picture in the set at 4:3, so it crops a little harder than the rest;
   * nudged down because the subject — the board, the food, the counter —
   * sits in the lower half, and a centred crop clips it.
   */
  kitchen: { src: '/images/audit/kitchen.jpg', alt: '', caption: CAPTION, position: '50% 62%' },

  /** 7 — Story & Meaning. Bench under the oak; the sense of place. */
  story: { src: '/images/audit/story.jpg', alt: '', caption: CAPTION },

  /** 8 — Guest Transformation. The calm outdoor scene the stay builds toward. */
  transformation: { src: '/images/audit/transformation.jpg', alt: '', caption: CAPTION },
}

export function auditImage(stepId: string): AuditImage | undefined {
  return AUDIT_IMAGES[stepId]
}
