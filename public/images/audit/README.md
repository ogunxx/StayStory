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
quality 82. The band they appear in is never larger than 782×208 CSS pixels, so
1600px still leaves headroom on a 2× screen. Nothing was cropped — `fit: inside`
only shrinks, so the approved framing is intact. The two PNGs became JPEGs
because neither needs transparency.

Together: 11.2 MB → 2.0 MB. The originals are in the image pack if a larger
version is ever wanted.

## Framing

The band is wide and short, so a photograph is cropped by `object-cover`. Where
the middle is not the part worth keeping, set `position` on that entry in
`src/lib/audit-images.ts` — `arrival.jpg` is the one that needs it, being the
only portrait shot in the set.

## alternates/

`light-senses-alternate.jpg` came with the pack as an option for step 4. It is
portrait, so it crops harder in this band than the landscape primary; the
primary is in use. To switch, point `light.src` at
`/images/audit/alternates/light-senses-alternate.jpg` and give it a `position`.

## A rule worth keeping

Every photograph of a real place keeps a caption naming the property. A picture
shown beside a host auditing their own property, with nothing saying whose it
is, reads as a claim about theirs.
