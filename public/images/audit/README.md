# Audit step imagery

Files the Experience Audit serves itself, instead of loading from the Laurel &
Lore CDNs. Which step uses which file is configured in `src/lib/audit-images.ts`.

| File                  | Audit step            |
| --------------------- | --------------------- |
| `vision.jpg`          | 1 · Your Vision       |
| `light.jpg`           | 4 · Light & Senses    |
| `sleep.jpg`           | 5 · Sleep & Bath      |
| `story.jpg`           | 7 · Story & Meaning   |
| `transformation.jpg`  | 8 · Guest Transformation |

To fill this folder, from the project root:

```
node scripts/fetch-audit-images.mjs
```

Until the files are here the Audit falls back to the remote URLs, so nothing
breaks while the folder is empty — it is just less reliable, which is the
reason for moving them local.

## Steps still without a photograph

No approved image exists for these yet, so they render without one:

- 2 · Arrival — an entry, path or front door
- 3 · Living & Flow — a living space
- 6 · Kitchen & Amenities — a kitchen or gathering table

Drop a file here and add an entry to `src/lib/audit-images.ts` to fill one.

Every photograph of a real place must keep a caption naming the property. A
picture shown beside a host auditing their own property, with nothing saying
whose it is, reads as a claim about theirs.
