import { NextResponse } from 'next/server'
import { validateSubmission } from '@/lib/host-research'
import { insertResearch } from '@/lib/host-research-store'
import { looksAutomated, tooManyFrom, remember } from '@/lib/research-guard'

/**
 * The public Host Research endpoint.
 *
 * Unauthenticated by design — the whole point is to hear from hosts who have
 * never signed up. So nothing in the request is trusted:
 *
 *   • validateSubmission checks every field server-side and returns a value
 *     containing only the six answers plus the idempotency key.
 *   • insertResearch builds the row field by field from that value. The
 *     request body is never spread, so admin_status, id and the timestamps
 *     have nowhere to land however they are sent.
 *   • host_research has RLS on with no policies and no grants to anon, so
 *     the browser could not write to it directly even if it tried.
 *
 * The same idempotency key twice returns the same success rather than a
 * second row. A retry should look like it worked, because it did.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 400 })
  }

  // A hidden field no person can see or fill. Answered means a script.
  // Returns success rather than an error: telling a bot it was caught only
  // helps it try again differently, and a real person never reaches here.
  if (looksAutomated(body)) {
    return NextResponse.json({ ok: true })
  }

  const result = validateSubmission(body)
  if (!result.ok) {
    return NextResponse.json({ error: result.error, field: result.field }, { status: 400 })
  }

  // In-memory, per-instance, deliberately crude. Enough to stop one source
  // hammering the form; not a claim to distributed rate limiting.
  if (tooManyFrom(request)) {
    return NextResponse.json(
      { error: 'That is a lot of responses from one place. Please try again in a few minutes.' },
      { status: 429 }
    )
  }

  const saved = await insertResearch(result.value)
  if (!saved.ok) {
    return NextResponse.json({ error: saved.error }, { status: 500 })
  }

  remember(request)
  return NextResponse.json({ ok: true })
}
