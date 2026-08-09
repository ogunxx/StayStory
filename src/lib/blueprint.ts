import { createClient } from '@/lib/supabase/server'

export interface BlueprintTouchpointIdeas {
  principle: string
  why_it_matters: string
  low: string
  achievable: string
  audacious: string
  expected_guest_impact: string
  story_it_reinforces: string
}

export interface BlueprintTouchpointState {
  current: string
  ideas: BlueprintTouchpointIdeas | null
}

export interface ExperienceBlueprint {
  id: string
  user_id: string
  property_id: string | null
  property_context: string | null
  touchpoints: Record<string, BlueprintTouchpointState>
  created_at: string
  updated_at: string
}

export async function getOrCreateBlueprint(
  userId: string,
  propertyId: string | null
): Promise<ExperienceBlueprint> {
  const supabase = await createClient()

  let query = supabase.from('experience_blueprint').select('*').eq('user_id', userId)
  query = propertyId ? query.eq('property_id', propertyId) : query.is('property_id', null)

  const { data: existing } = await query.maybeSingle()
  if (existing) return existing as ExperienceBlueprint

  const { data: created, error } = await supabase
    .from('experience_blueprint')
    .insert({ user_id: userId, property_id: propertyId })
    .select('*')
    .single()

  if (created) return created as ExperienceBlueprint

  if (error?.code === '23505') {
    let retryQuery = supabase.from('experience_blueprint').select('*').eq('user_id', userId)
    retryQuery = propertyId ? retryQuery.eq('property_id', propertyId) : retryQuery.is('property_id', null)
    const { data: retried } = await retryQuery.single()
    if (retried) return retried as ExperienceBlueprint
  }

  throw new Error(error?.message ?? 'Could not load your Experience Blueprint.')
}

export async function savePropertyContext(
  userId: string,
  propertyId: string | null,
  propertyContext: string
): Promise<ExperienceBlueprint> {
  const blueprint = await getOrCreateBlueprint(userId, propertyId)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('experience_blueprint')
    .update({ property_context: propertyContext, updated_at: new Date().toISOString() })
    .eq('id', blueprint.id)
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Could not save.')
  return data as ExperienceBlueprint
}

export async function saveTouchpointState(
  userId: string,
  propertyId: string | null,
  touchpointId: string,
  patch: Partial<BlueprintTouchpointState>
): Promise<ExperienceBlueprint> {
  const blueprint = await getOrCreateBlueprint(userId, propertyId)
  const supabase = await createClient()

  const existingState = blueprint.touchpoints[touchpointId] ?? { current: '', ideas: null }
  const nextTouchpoints = {
    ...blueprint.touchpoints,
    [touchpointId]: { ...existingState, ...patch },
  }

  const { data, error } = await supabase
    .from('experience_blueprint')
    .update({ touchpoints: nextTouchpoints, updated_at: new Date().toISOString() })
    .eq('id', blueprint.id)
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Could not save.')
  return data as ExperienceBlueprint
}
