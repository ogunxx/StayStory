#!/usr/bin/env node
/**
 * Download the Audit's photographs into public/images/audit so the app serves
 * them itself instead of depending on the Laurel & Lore CDNs.
 *
 * Run once, from the project root:
 *
 *   node scripts/fetch-audit-images.mjs
 *
 * Then commit what it writes. Until you do, the Audit falls back to the remote
 * URLs and looks exactly as it does now — nothing breaks either way.
 *
 * The URLs come from src/lib/audit-images.ts, so adding an image there and
 * re-running this is all it takes to bring a new one local.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const OUT = join(process.cwd(), 'public', 'images', 'audit')

// Kept in step with AUDIT_IMAGES in src/lib/audit-images.ts.
const IMAGES = {
  'vision.jpg':
    'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/c82788f2-21c5-482e-91ae-4c1a4267ff59/20241026_083649%7E2.jpg?format=1000w',
  'light.jpg':
    'https://a0.muscache.com/im/pictures/hosting/Hosting-775430494188891274/original/e927b3f7-5a56-4502-860b-48c62c139429.png?im_w=720',
  'sleep.jpg':
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1602145313140364507/original/ab43fe51-ba2a-44e8-b214-f86e288e85c2.png?im_w=720',
  'story.jpg':
    'https://a0.muscache.com/im/pictures/hosting/Hosting-1602145313140364507/original/e5e36dce-a806-4a55-af47-4176f609851f.png?im_w=720',
  'transformation.jpg':
    'https://images.squarespace-cdn.com/content/v1/6831b00b1fc03a3e45b32250/d6a3add4-6041-4731-ad96-76aaf6e87b61/WhatsApp+Image+2025-11-23+at+3.32.46+PM.jpeg?format=1000w',
}

await mkdir(OUT, { recursive: true })

let failed = 0
for (const [name, url] of Object.entries(IMAGES)) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.byteLength < 1024) throw new Error(`suspiciously small (${buf.byteLength} bytes)`)
    await writeFile(join(OUT, name), buf)
    console.log(`  ok    ${name}  ${(buf.byteLength / 1024).toFixed(0)} KB`)
  } catch (err) {
    failed++
    console.error(`  FAIL  ${name}  ${err instanceof Error ? err.message : err}`)
  }
}

console.log(
  failed
    ? `\n${failed} image(s) failed. The Audit still falls back to the remote URLs for those.`
    : `\nAll images saved to public/images/audit. Commit them and the Audit serves its own.`
)
process.exit(failed ? 1 : 0)
