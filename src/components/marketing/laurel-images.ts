/**
 * Real photographs of Laurel & Lore — the property where the StayStory system
 * was built and tested.
 *
 * Kept in one place so any page can use them and there's a single spot to swap
 * a URL when a photo changes. These are the only photographs on the marketing
 * site that show a real property, because it's the only one we can honestly
 * show: it's ours.
 */

/**
 * ┌─ LOCAL FILES BEAT HOT-LINKS ───────────────────────────────────────────┐
 * │ The three photographs the About page shows are served from /public.    │
 * │ The rest are still hot-linked from Squarespace and from Airbnb's image │
 * │ CDN, which is a standing risk: either can start refusing requests at   │
 * │ any time, and the picture disappears from a live page with no deploy   │
 * │ on our side and nothing in our logs. That already happened once to the │
 * │ Audit images, which is why those were moved into the repository.       │
 * │                                                                        │
 * │ Move the rest the same way when there is reason to touch them. Files   │
 * │ belong in public/images/about, resized so the longest side is at most  │
 * │ 1600px and saved as progressive JPEG at quality 82 — the same recipe   │
 * │ as the Audit set.                                                      │
 * └────────────────────────────────────────────────────────────────────────┘
 */
export const LAUREL_IMAGES = {
  /**
   * Wide exterior — the whole place in one frame: the cabin and its deck, the
   * oak, the guest RV, the lawn. Cropped before import from a square original
   * to 7:5, the shape of the frame it sits in, so nothing is cropped again at
   * render time. See public/images/about/README.md.
   */
  exterior: '/images/about/origin-property.jpg',
  /** Deck and outdoor seating. Still hot-linked; nothing uses it today. */
  deck: 'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/d6a3add4-6041-4731-ad96-76aaf6e87b61/WhatsApp+Image+2025-11-23+at+3.32.46+PM.jpeg?format=1500w',
  /** Interior — evening. Still hot-linked. */
  interior:
    'https://a0.muscache.com/im/pictures/hosting/Hosting-775430494188891274/original/e927b3f7-5a56-4502-860b-48c62c139429.png?im_w=1200',
  /** The guest RV in its clearing — fire pit, picnic table, oaks. 969x633. */
  rv: '/images/about/rv.jpg',
  /** Outdoor shower on the deck, beside the cabin. Portrait, 1067x1600. */
  outdoorShower: '/images/about/outdoor-shower.jpg',
  /** The soaking tub, laid for a bath. 1448x1086. */
  wellness: '/images/about/wellness.jpg',
  /** Movie night on the deck. Still hot-linked. */
  movieNight:
    'https://a0.muscache.com/im/pictures/hosting/Hosting-775430494188891274/original/e927b3f7-5a56-4502-860b-48c62c139429.png?im_w=1200',
} as const

/**
 * Ogun and Evie. Kept here after the homepage origin section was removed, so
 * the portraits are ready if the founder story is ever told on the About page.
 */
export const FOUNDER_IMAGES = {
  ogun: '/images/ogun.jpg',
  evie: 'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/07ed0151-1334-403c-abfe-5b40be6d44b5/20240704_110537.jpg?format=2500w',
  together:
    'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/87953ab6-87f5-479b-b95c-735a41c92e8b/Blue+Bird.png?format=2500w',
} as const

/** The live listing, used wherever the guest rating is stated. */
export const AIRBNB_URL = 'https://www.airbnb.com.mt/rooms/775430494188891274'

/** The Laurel & Lore site. */
export const LAUREL_URL = 'https://laurelandlore.com'
