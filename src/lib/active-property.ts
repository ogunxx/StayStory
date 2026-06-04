import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { ACTIVE_PROPERTY_COOKIE } from '@/lib/config'

// The active property is stored in a non-httpOnly cookie set client-side by the
// PropertySwitcher (see ACTIVE_PROPERTY_COOKIE in config.ts), and read here on
// the server to scope reads/writes. Only Portfolio plans run more than one
// property, so for most users this resolves to their single property
// automatically.

/** Property ids the user can access — owned plus co-hosted. */
export async function getAccessiblePropertyIds(userId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data: owned } = await supabase
    .from('properties')
    .select('id')
    .eq('user_id', userId)

  const { data: shared } = await supabase
    .from('property_members')
    .select('property_id')
    .eq('user_id', userId)

  const ids = new Set<string>()
  ;(owned ?? []).forEach((p) => ids.add(p.id))
  ;(shared ?? []).forEach((m) => ids.add(m.property_id))
  return [...ids]
}

/**
 * Resolve which property new data should be attached to:
 *   1. the cookie selection, if the user still has access to it
 *   2. otherwise their first owned property
 *   3. otherwise null ("unassigned" — e.g. a user who never created a property)
 */
export async function resolveActivePropertyId(userId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data: owned } = await supabase
    .from('properties')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  const { data: shared } = await supabase
    .from('property_members')
    .select('property_id')
    .eq('user_id', userId)

  const ownedIds = (owned ?? []).map((p) => p.id)
  const accessible = new Set<string>([
    ...ownedIds,
    ...(shared ?? []).map((m) => m.property_id),
  ])

  const cookieStore = await cookies()
  const requested = cookieStore.get(ACTIVE_PROPERTY_COOKIE)?.value
  if (requested && accessible.has(requested)) return requested

  return ownedIds[0] ?? null
}
