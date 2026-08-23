import { createClient } from '@/lib/supabase/server'
import { getAdminClient, isAdminEmail } from '@/lib/admin'
import { NextResponse } from 'next/server'

/**
 * Updates the publicly-stated site figures (Airbnb rating and review count).
 *
 * Every place the site states these numbers reads the same site_config rows,
 * so one write here updates the Proof section, the final CTA line, and the
 * founder story together.
 */

const EDITABLE_KEYS = ['airbnb_rating', 'airbnb_review_count'] as const
type EditableKey = (typeof EDITABLE_KEYS)[number]

function isValid(key: EditableKey, value: string): boolean {
  if (key === 'airbnb_rating') {
    const n = Number(value)
    return /^\d(\.\d{1,2})?$/.test(value) && n >= 0 && n <= 5
  }
  return /^\d{1,6}$/.test(value)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const updates: { key: EditableKey; value: string }[] = []

  for (const key of EDITABLE_KEYS) {
    const raw = body[key]
    if (raw === undefined) continue
    const value = String(raw).trim()
    if (!isValid(key, value)) {
      return NextResponse.json(
        {
          error:
            key === 'airbnb_rating'
              ? 'Rating must be a number between 0 and 5, e.g. 4.99'
              : 'Review count must be a whole number',
        },
        { status: 400 }
      )
    }
    updates.push({ key, value })
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const admin = getAdminClient()

  const { error } = await admin
    .from('site_config')
    .upsert(
      updates.map((u) => ({ key: u.key, value: u.value, updated_at: new Date().toISOString() })),
      { onConflict: 'key' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    config: Object.fromEntries(updates.map((u) => [u.key, u.value])),
  })
}
