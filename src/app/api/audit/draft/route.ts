import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'

/**
 * Autosave for an in-progress Experience Audit.
 *
 * One draft per property (or per user when they have no property yet), held
 * in audit_drafts and removed once the Audit is submitted. Saving a draft
 * never touches `audits` and never proposes anything to the Compass — an
 * unfinished Audit shouldn't influence the host's Compass.
 */

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { answers, step_index } = await request.json()

  if (typeof answers !== 'object' || answers === null || Array.isArray(answers)) {
    return NextResponse.json({ error: 'answers must be an object' }, { status: 400 })
  }

  const property_id = await resolveActivePropertyId(user.id)

  // Find the existing draft rather than relying on upsert — the unique index
  // is partial (property_id null vs not null), which onConflict can't target.
  const existing = supabase
    .from('audit_drafts')
    .select('id')
    .eq('user_id', user.id)
  const { data: found } = await (property_id
    ? existing.eq('property_id', property_id)
    : existing.is('property_id', null)
  ).maybeSingle()

  const payload = {
    answers,
    step_index: Number.isInteger(step_index) ? step_index : 0,
    updated_at: new Date().toISOString(),
  }

  const { error } = found
    ? await supabase.from('audit_drafts').update(payload).eq('id', found.id)
    : await supabase.from('audit_drafts').insert({ user_id: user.id, property_id, ...payload })

  if (error) {
    console.error('Audit draft save error:', error)
    return NextResponse.json({ error: 'Could not save your progress' }, { status: 500 })
  }

  return NextResponse.json({ saved_at: payload.updated_at })
}
