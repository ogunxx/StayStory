import { createClient } from '@/lib/supabase/server'
import { generateHospitalityMoment } from '@/lib/anthropic'
import { getUserTier, hasAccess } from '@/lib/get-tier'
import { resolveActivePropertyId } from '@/lib/active-property'
import { buildCompassContext, getOrCreateCompass } from '@/lib/compass'
import { NextResponse } from 'next/server'
import type { GeneratorFormData } from '@/types'

const FREE_MONTHLY_LIMIT = 1

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tier = await getUserTier()

  if (!hasAccess(tier, 'legendary')) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    if ((count ?? 0) >= FREE_MONTHLY_LIMIT) {
      return NextResponse.json(
        { error: 'limit_reached', usedCount: count, limit: FREE_MONTHLY_LIMIT },
        { status: 429 }
      )
    }
  }

  const body: GeneratorFormData = await request.json()

  if (!body.whyVisiting) {
    return NextResponse.json({ error: 'Why visiting is required' }, { status: 400 })
  }

  try {
    const property_id = await resolveActivePropertyId(user.id)
    const compass = await getOrCreateCompass(user.id, property_id)
    const compassContext = buildCompassContext(compass)

    const suggestion = await generateHospitalityMoment(body, compassContext?.text)

    const { data, error } = await supabase
      .from('suggestions')
      .insert({
        user_id: user.id,
        property_id,
        guest_id: null,
        level: 3,
        content: suggestion,
      })
      .select()
      .single()

    if (error) {
      console.error('DB error saving suggestion:', error)
    }

    return NextResponse.json({ suggestion, id: data?.id, compassElementsUsed: compassContext?.usedFields ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
