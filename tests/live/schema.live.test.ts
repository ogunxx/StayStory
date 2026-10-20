/**
 * Read-only schema checks against a real Supabase project.
 *
 * Not part of `npm test`. Skips entirely unless the environment supplies
 * credentials, so it can never fail a clean checkout or a CI run that does
 * not have them.
 *
 * Nothing here writes. Every query asks for zero rows and only names the
 * columns the application assumes exist — if a column is missing, PostgREST
 * returns an error and the test fails. That is the whole point: the /legend
 * property-scoping bug existed because a comment in the code asserted that
 * `playbooks.property_id` did not exist. It does. A comment cannot be
 * verified; this can.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const configured = Boolean(url && key && !url.includes('placeholder'))

/** Columns the application reads. A missing one is a latent wrong answer. */
const REQUIRED: Record<string, string[]> = {
  playbooks: ['id', 'user_id', 'property_id'],
  audits: ['id', 'user_id', 'property_id'],
  audit_drafts: ['id', 'user_id', 'property_id', 'step_index', 'answers'],
  suggestions: ['id', 'user_id', 'property_id', 'content'],
  guest_stories: ['id', 'user_id', 'property_id'],
  experience_blueprint: ['id', 'user_id', 'property_id', 'touchpoints'],
}

describe('live schema', { skip: configured ? false : 'no Supabase credentials in env' }, () => {
  const supabase = configured ? createClient(url!, key!) : null

  for (const [table, columns] of Object.entries(REQUIRED)) {
    test(`${table} has ${columns.join(', ')}`, async () => {
      // limit(0) returns no rows but still validates the column list.
      const { error } = await supabase!.from(table).select(columns.join(',')).limit(0)
      assert.equal(error, null, error ? `${table}: ${error.message}` : '')
    })
  }

  test('playbooks.property_id is the column the /legend fix depends on', async () => {
    // Called out on its own because this is the exact fact a code comment
    // got wrong, and the wrong answer was silent.
    const { error } = await supabase!.from('playbooks').select('property_id').limit(0)
    assert.equal(error, null, error?.message)
  })
})
