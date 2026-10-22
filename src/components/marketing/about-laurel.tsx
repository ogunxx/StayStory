import { AIRBNB_URL, LAUREL_IMAGES, LAUREL_URL } from './laurel-images'

/**
 * About — Section 3. Laurel & Lore, where the thinking was tested.
 *
 * Tinted band: copy left, a row of photographs and the Laurel & Lore seal
 * right. Photographs live in `images`, so the row length is editable.
 *
 * The mockup's copy claims "thousands of guest stays". We can't substantiate
 * that, so this states the figure we can — the live rating and review count,
 * passed in from the page and read from Supabase — and links to the listing so
 * anyone can check it.
 */

export type LaurelPhoto = {
  src: string
  alt: string
  /** Defaults to `cover`. Neither fit ever distorts. */
  fit?: 'cover' | 'contain'
  /** CSS object-position. Omit for centre. */
  position?: string
}

/**
 * Three photographs of the real property. Swapping one is an edit to its
 * `src` — the files live under /public and nothing is baked into the layout.
 *
 * The frame below is the same shape for all three, but the pictures are not:
 * two are landscape and the shower is portrait. So each says for itself which
 * part of it matters, rather than all three being cropped identically and two
 * of them losing their subject.
 */
export const LAUREL_PHOTOS: LaurelPhoto[] = [
  {
    src: LAUREL_IMAGES.rv,
    alt: 'The guest RV at Laurel & Lore, with a fire pit and picnic table under the oaks',
    // 1.53 against a 1.25 frame: cropped left and right, not top to bottom.
    // Centred keeps the whole trailer and the clearing around it.
  },
  {
    src: LAUREL_IMAGES.outdoorShower,
    alt: 'The outdoor shower on the deck at Laurel & Lore, beside the cabin and the pergola',
    // The only portrait shot, 0.67 against 1.25, so it loses roughly half its
    // height. Everything that matters — the cabin, the shower, the deck, the
    // pergola — sits in a band across the middle, and the crop is held there:
    // above it is only sky and canopy, below it only decking.
    position: '50% 46%',
  },
  {
    src: LAUREL_IMAGES.wellness,
    alt: 'A bath drawn at Laurel & Lore, with a candle, flowers, bath salts and tea on the tub tray',
    // 1.33 against 1.25 is nearly the frame's own shape, so this one barely
    // crops at all. Nudged right: the tray — candle, flowers, salts, cup — is
    // the subject and sits right of centre.
    position: '58% 50%',
  },
]

/**
 * The frame all three share.
 *
 * A ratio rather than a fixed height, and for the reason the Audit images
 * were changed: this row is three columns of a grid, so its width moves with
 * the viewport. A fixed height meant the frame's *shape* changed as well —
 * it was about 1.4 wide on a phone and 0.85 on a desktop, so the landscape
 * photographs were comfortable on a phone and lost nearly half their width
 * on a desktop, which is the opposite of what anyone would guess.
 *
 * 5/4 is the compromise the three actually want: the bath is 1.33 and barely
 * crops, the RV is 1.53 and keeps most of its width, and the portrait shower
 * gives up height it can spare. Change it here and all three follow.
 *
 * Square on a phone, because the row stays three columns there and each one
 * is only about 90px wide. A landscape frame that narrow leaves photographs
 * around 70px tall — a strip of thumbnails rather than pictures — while the
 * old fixed height went the other way and cropped more than half the width
 * off the two landscape shots. Square is the balance: more presence than the
 * first, far less cropping than the second.
 */
export const LAUREL_PHOTO_FRAME = 'aspect-square sm:aspect-[5/4]'

function Seal() {
  return (
    <div className="hidden size-28 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full border border-accent bg-background/70 text-center xl:flex">
      <span className="font-serif text-[0.62rem] uppercase tracking-[0.22em] text-foreground">
        Laurel
      </span>
      <span className="font-serif text-[0.62rem] text-muted-foreground">&amp;</span>
      <span className="font-serif text-[0.62rem] uppercase tracking-[0.22em] text-foreground">
        Lore
      </span>
    </div>
  )
}

export function AboutLaurel({
  eyebrow = 'Where the thinking was tested',
  headline = ['Laurel & Lore is where', 'everything started.'],
  body = 'Laurel & Lore is our hospitality brand and our real-world laboratory. Every idea, framework and tool inside StayStory was shaped by real guest stays, real feedback and the conversations that followed.',
  linkLabel = 'Explore Laurel & Lore',
  linkHref = LAUREL_URL,
  images = LAUREL_PHOTOS,
  rating = '4.99',
  reviews = '136',
}: {
  eyebrow?: string
  headline?: string[]
  body?: string
  linkLabel?: string
  linkHref?: string
  images?: LaurelPhoto[]
  rating?: string
  reviews?: string
}) {
  return (
    <section className="px-6 py-4">
      <div className="mx-auto w-full max-w-7xl rounded-3xl bg-secondary/25 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:items-center lg:gap-14">
          <div className="min-w-0">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h2 className="font-serif text-[1.7rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2.1rem]">
              {headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-5 max-w-sm text-[0.92rem] leading-relaxed text-muted-foreground">
              {body}
            </p>
            <p className="mt-4 max-w-sm text-[0.92rem] leading-relaxed text-foreground">
              Today it sits at{' '}
              <a
                href={AIRBNB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
              >
                {rating}★ across {reviews} guest reviews
              </a>
              .
            </p>

            <a
              href={linkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4"
            >
              {linkLabel}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="grid min-w-0 flex-1 grid-cols-3 gap-3 sm:gap-4">
              {images.map((img) => (
                <div
                  key={img.src}
                  className={`overflow-hidden rounded-2xl bg-muted ${LAUREL_PHOTO_FRAME}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    style={img.position ? { objectPosition: img.position } : undefined}
                    className={`block size-full ${
                      img.fit === 'contain' ? 'object-contain' : 'object-cover'
                    }`}
                  />
                </div>
              ))}
            </div>
            <Seal />
          </div>
        </div>
      </div>
    </section>
  )
}
