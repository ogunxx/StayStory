import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { dates, notes } = await request.json()
  if (!dates?.trim()) return NextResponse.json({ error: 'Preferred dates are required' }, { status: 400 })

  const { error } = await supabase
    .from('profiles')
    .update({
      legend_stay_requested: true,
      legend_stay_dates: dates,
      legend_stay_notes: notes ?? null,
      legend_stay_requested_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
