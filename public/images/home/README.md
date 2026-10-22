# Homepage imagery

The photographs on "Built for the way you host". Which file belongs to which
card is configured in the `AUDIENCES` array in
`src/components/marketing/audiences.tsx` — that is the only place to change
one, and swapping a photograph is a one-line edit to `image` on that entry.

| File | Card | Shows | Ratio |
| --- | --- | --- | --- |
| `arrival.jpg` | Independent Hosts | The cabin, its deck and screens, under the oak, lawn in front | 1.455 |
| `welcome-vignette.jpg` | Boutique Stays | A welcome tray — owl card, cut flowers, a chalked "Welcome" | 1.138 |

## How these were prepared

Progressive JPEG at quality 82. The card frame is never larger than about
588×404 CSS pixels, so roughly 1200px covers a 2× screen.

`welcome-vignette.jpg` arrived as a 2.2MB PNG with no transparency and became
a 227KB JPEG at its original 1338×1176.

`arrival.jpg` was **cropped before import**, which is unusual here and worth
the explanation. The original is square, with a lot of empty sky above the
oak and a lot of empty grass below the deck, and the buildings in a thin band
between. Dropped into the card's 16/11 frame it read as canopy and lawn with
a property somewhere in it. So the file was cropped to the band that holds
the oak, the buildings and enough grass to be a place — which is why it needs
no focal position: at 1.455 it is already the frame's own shape.

## The one that will catch you out

The original `arrival.jpg` carried an **EXIF orientation tag** (orientation 6,
rotate 90°). Because the source was square, the dimensions looked right and
nothing flagged it — but every crop landed in the wrong part of a sideways
photograph, and it was only visible once rendered.

**Pass any replacement through `sharp(...).rotate()` with no argument first.**
That applies the tag and strips it. See `docs/LESSONS.md`.

## A note on the frame

A product panel is overlaid on the right of every card image, up to 200px
wide — covering about 36% of the frame on a desktop and 52% on a phone.
Whatever sits behind it is hidden however well the photograph is framed, so a
picture for these cards wants its subject left of centre. `imagePosition`
moves the picture; it cannot move the panel.

This is why the "Welcome" chalkboard in the vignette is only partly visible
on a desktop and hidden on a phone: it sits at 52–88% of that photograph's
width. The photograph is also taller than the frame, so `cover` fills the
width with no horizontal slack and the horizontal half of `object-position`
does nothing at all. No fit or focal value can rescue it — only a different
photograph, or a change to the overlay.
