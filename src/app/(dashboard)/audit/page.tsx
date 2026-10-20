import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import type { AuditAnswers } from '@/lib/audit-questions'
import AuditClient from './audit-client'

/**
 * Experience Audit.
 *
 * Loads the unfinished draft for the active property, if there is one, so a
 * host picks up where they left off.
 */
export default async function AuditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const propertyId = await resolveActivePropertyId(user.id)

  const query = supabase
    .from('audit_drafts')
    .select('answers, step_index')
    .eq('user_id', user.id)
  const { data: draft } = await (propertyId
    ? query.eq('property_id', propertyId)
    : query.is('property_id', null)
  ).maybeSingle()

  return (
    <AuditClient
      initialAnswers={(draft?.answers as AuditAnswers) ?? {}}
      initialStep={draft?.step_index ?? 0}
    />
  )
}
