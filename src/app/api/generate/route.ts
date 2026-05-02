import { createClient } from '@/lib/supabase/server'
import { generateHospitalityMoment } from '@/lib/anthropic'
import { getUserTier, hasAccess } from '@/lib/get-tier'
import { NextResponse } from 'next/server'
import type { GeneratorFormData } from '@/types'

const FREE_MONTHLY_LIMIT = 3

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tier = await getUserTier()

  if (!hasAccess(tier, 'host')) {
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
    const suggestion = await generateHospitalityMoment(body)

    const { data, error } = await supabase
      .from('suggestions')
      .insert({
        user_id: user.id,
        guest_id: null,
        level: 3,
        content: suggestion,
      })
      .select()
      .single()

    if (error) {
      console.error('DB error saving suggestion:', error)
    }

    return NextResponse.json({ suggestion, id: data?.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
