# About page imagery

The three photographs in the "Laurel & Lore is where everything started" row.
Which file belongs to which slot is configured in
`src/components/marketing/laurel-images.ts`, and the row itself is
`LAUREL_PHOTOS` in `src/components/marketing/about-laurel.tsx`. Those are the
only two places to change one.

| File | Shows | Source | Ratio |
| --- | --- | --- | --- |
| `rv.jpg` | The guest RV in its clearing — fire pit, picnic table, oaks | 969×633 | 1.53 landscape |
| `outdoor-shower.jpg` | The outdoor shower on the deck, cabin left, pergola right | 1067×1600 | 0.67 **portrait** |
| `wellness.jpg` | The soaking tub laid for a bath — candle, flowers, salts, tea | 1448×1086 | 1.33 landscape |

## How these were prepared

Resized so the longest side is at most 1600px and saved as progressive JPEG
at quality 82 — the same recipe as the Audit set. Nothing was cropped;
`fit: inside` only shrinks, so the original framing is intact. The bath
photograph arrived as a PNG and became a JPEG, having no transparency to
lose.

## Framing

All three share one frame — `LAUREL_PHOTO_FRAME` — and each says for itself
how to meet it, with an optional `fit` (`cover` by default) and `position`.

The frame is `aspect-square sm:aspect-[5/4]`, deliberately a ratio and not a
fixed height. The row is three grid columns, so its width moves with the
viewport; a fixed height meant the frame's *shape* moved too, and these
photographs were framed comfortably on a phone while losing nearly half their
width on a desktop.

Two of these are landscape and one is portrait, so no single crop suits all
three. 5/4 is where they meet: the bath is 1.33 and barely crops, the RV is
1.53 and keeps about 82% of its width, and the shower is portrait and gives
up height it has to spare — everything that matters in it sits in a band
across the middle.

On a phone the columns are only about 90px wide, which is why the frame goes
square there: a landscape frame that narrow leaves 70px-tall slivers, and the
old fixed height cropped more than half the width off both landscape shots.

## The one that will catch you out

`arrival.jpg` on the homepage arrived with an **EXIF orientation tag**, and
because it was square the dimensions gave nothing away — every crop landed
in the wrong part of a sideways photograph, and it only showed up on screen.
If a photograph here is ever replaced, pass it through `sharp(...).rotate()`
with no argument first. See `docs/LESSONS.md`.
