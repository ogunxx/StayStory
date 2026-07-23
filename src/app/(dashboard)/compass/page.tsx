import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import { getOrCreateCompass, getPendingContributions } from '@/lib/compass'
import CompassClient from './client'

export default async function CompassPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const propertyId = await resolveActivePropertyId(user.id)
  const compass = await getOrCreateCompass(user.id, propertyId)
  const pending = await getPendingContributions(compass.id)

  return <CompassClient initialCompass={compass} initialPending={pending} />
}
