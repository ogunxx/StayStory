# Audit step imagery

The approved photographs for the Experience Audit, served by this app rather
than fetched from a CDN. Which file belongs to which step is configured in
`src/lib/audit-images.ts` — that is the only place to change one.

| File                 | Audit step                | Source pack file           |
| -------------------- | ------------------------- | -------------------------- |
| `vision.jpg`         | 1 · Your Vision           | `01-vision.jpg`            |
| `arrival.jpg`        | 2 · Arrival               | `02-arrival.jpg`           |
| `flow.jpg`           | 3 · Living & Flow         | `03-living-flow.jpg`       |
| `light.jpg`          | 4 · Light & Senses        | `04-light-senses.jpg`      |
| `sleep.jpg`          | 5 · Sleep & Bath          | `05-sleep-bath.jpg`        |
| `kitchen.jpg`        | 6 · Kitchen & Amenities   | `06-kitchen-amenities.png` |
| `story.jpg`          | 7 · Story & Meaning       | `07-story-meaning.jpg`     |
| `transformation.jpg` | 8 · Guest Transformation  | `08-guest-transformation.png` |

All eight steps now have one. `SOURCE-PACK.txt` is the description that came
with the approved set.

## How these were prepared

Resized so the longest side is at most 1600px and saved as progressive JPEG at
quality 82. The frame they appear in is never larger than 782×326 CSS pixels,
so 1600px still just covers a 2× screen. Nothing was cropped — `fit: inside`
only shrinks, so the approved framing is intact. The two PNGs became JPEGs
because neither needs transparency.

Together: 11.2 MB → 2.0 MB. The originals are in the image pack if a larger
version is ever wanted.

## Framing

Two settings per picture, both in `src/lib/audit-images.ts`, both optional.

**`fit`** — `cover` (the default) fills the frame and crops what will not fit.
`contain` shrinks the whole picture until all of it shows, leaving neutral
ground either side. Neither ever distorts. Choose `contain` when the
composition *is* the point and a crop would remove the thing the step asks
about; `arrival.jpg` is the one that needs it, being the only portrait shot
against a landscape frame.

**`position`** — which slice survives a `cover` crop, when the middle is not
the part worth keeping. `kitchen.jpg` uses it: its subject sits low in the
frame and a centred crop clips the board. It does almost nothing under
`contain`, since nothing is being cropped.

The frame itself is one ratio for all eight steps — `AUDIT_IMAGE_FRAME`, in
the same file. It is a ratio rather than a fixed height on purpose: a fixed
height with a fluid width meant the frame was about 2.1:1 on a phone and
3.8:1 on a desktop, so the same photograph was cropped mildly on one and
brutally on the other. Most of this set is 3:2, so the phone frame now crops
them not at all.

## alternates/

`light-senses-alternate.jpg` came with the pack as an option for step 4. It is
portrait, so against this frame it either crops hard or shows small; the
landscape primary is in use. To switch, point `light.src` at
`/images/audit/alternates/light-senses-alternate.jpg` and give it either a
`position` or `fit: 'contain'`, the same choice `arrival.jpg` faced.

## A rule worth keeping

Every photograph of a real place keeps a caption naming the property. A picture
shown beside a host auditing their own property, with nothing saying whose it
is, reads as a claim about theirs.
