import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import { listProperties } from '@/lib/properties'
import HistoryClient from './client'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const properties = await listProperties()
  const activePropertyId = await resolveActivePropertyId(user.id)
  const activeProperty = properties.find((p) => p.id === activePropertyId) ?? null

  // Scope to the active property, but always include legacy rows with no
  // property_id (created before per-property scoping) so nothing disappears.
  const fetchScoped = (table: string, columns: string) => {
    let q = supabase.from(table).select(columns).eq('user_id', user.id)
    if (activePropertyId) {
      q = q.or(`property_id.eq.${activePropertyId},property_id.is.null`)
    }
    return q.order('created_at', { ascending: false }).limit(50)
  }

  const [audits, moments, stories, blueprints, playbooks] = await Promise.all([
    fetchScoped('audits', 'id, created_at, property_id, score, responses'),
    fetchScoped('suggestions', 'id, created_at, property_id, content'),
    fetchScoped(
      'guest_stories',
      'id, created_at, property_id, narrative, host_perspective, social_caption, pre_arrival_message, listing_improvements'
    ),
    fetchScoped('journey_sessions', 'id, created_at, property_id, touchpoint, ideas'),
    fetchScoped('playbooks', 'id, created_at, property_id, property_name, executive_summary'),
  ])

  return (
    <HistoryClient
      hasMultipleProperties={properties.length > 1}
      activePropertyName={activeProperty?.name ?? null}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audits={(audits.data as any[]) ?? []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      moments={(moments.data as any[]) ?? []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stories={(stories.data as any[]) ?? []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blueprints={(blueprints.data as any[]) ?? []}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      playbooks={(playbooks.data as any[]) ?? []}
    />
  )
}
