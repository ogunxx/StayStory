import { createClient } from '@/lib/supabase/server'
import { validateSubmission, type FeedbackRecord } from '@/lib/feedback'

/**
 * Reading and writing the host's own feedback.
 *
 * Writes go through the user-scoped client, not the admin one, so RLS and the
 * column grants both apply. A host therefore cannot reach another host's row,
 * and cannot set review_status, even if they bypass the form entirely.
 */

/** This host's feedback for the active property, if they have left any. */
export async function getMyFeedback(
  userId: string,
  propertyId: string | null
): Promise<FeedbackRecord | null> {
  const supabase = await createClient()
  const query = supabase
    .from('focused_feedback')
    .select('*')
    .eq('user_id', userId)
    .limit(1)

  const { data } = await (propertyId
    ? query.eq('property_id', propertyId)
    : query.is('property_id', null))

  return (data?.[0] as FeedbackRecord | undefined) ?? null
}

/** Whether feedback exists, without pulling it back. For /start and the Playbook. */
export async function hasFeedback(userId: string, propertyId: string | null): Promise<boolean> {
  const supabase = await createClient()
  const query = supabase
    .from('focused_feedback')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count } = await (propertyId
    ? query.eq('property_id', propertyId)
    : query.is('property_id', null))

  return (count ?? 0) > 0
}

/**
 * Save this host's feedback, updating what is already there.
 *
 * One row per host per property, so a returning host edits rather than
 * accumulating submissions. The update path is matched on user and property
 * rather than on an id sent by the browser — an id from the client would be a
 * row reference we did not choose, and RLS should not be the only thing
 * standing between that and someone else's feedback.
 *
 * Not an upsert: the unique indexes are partial (`where property_id is not
 * null` / `is null`), and ON CONFLICT cannot target a partial index without
 * restating its predicate. Read-then-write is clearer, and the race it leaves
 * is a host double-submitting their own feedback, which the unique index
 * rejects anyway.
 */
export async function saveMyFeedback(
  userId: string,
  propertyId: string | null,
  input: unknown
): Promise<{ ok: true; record: FeedbackRecord } | { ok: false; error: string; status: number }> {
  const parsed = validateSubmission(input)
  if (!parsed.ok) return { ok: false, error: parsed.error, status: 400 }

  const supabase = await createClient()
  const existing = await getMyFeedback(userId, propertyId)

  if (existing) {
    const { data, error } = await supabase
      .from('focused_feedback')
      .update({ ...parsed.value, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error) {
      console.error('[feedback] update failed:', error)
      return { ok: false, error: 'We could not save that just now. Please try again.', status: 500 }
    }
    return { ok: true, record: data as FeedbackRecord }
  }

  const { data, error } = await supabase
    .from('focused_feedback')
    .insert({ user_id: userId, property_id: propertyId, ...parsed.value })
    .select('*')
    .single()

  if (error) {
    // 23505 is the unique index doing its job — two submissions raced. The
    // row that won is the host's own, so show them that rather than an error.
    if (error.code === '23505') {
      const saved = await getMyFeedback(userId, propertyId)
      if (saved) return { ok: true, record: saved }
    }
    console.error('[feedback] insert failed:', error)
    return { ok: false, error: 'We could not save that just now. Please try again.', status: 500 }
  }

  return { ok: true, record: data as FeedbackRecord }
}
