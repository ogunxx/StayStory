import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import { getStarterPlaybook } from '@/lib/focused-playbook'
import PlaybookClient from './playbook-client'

export const metadata: Metadata = { title: 'Your Starter Playbook — StayStory' }

/**
 * Stage 4 of the focused path.
 *
 * Read only. Unlike Stage 3, which generates on first visit, this page never
 * calls the model — a Starter Playbook appears because the host pressed a
 * button, and reloading the page shows the saved one. That is what makes
 * "leave and come back" reliable, and it means a refresh can never race into
 * a second generation.
 *
 * This is not /legend. The full Guest Journey Playbook is untouched and
 * remains where it is.
 */
export default async function StarterPlaybookPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const propertyId = await resolveActivePropertyId(user.id)
  const { playbook, state } = await getStarterPlaybook(user.id, propertyId)

  return <PlaybookClient playbook={playbook} state={state} />
}
