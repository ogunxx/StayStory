import { createClient } from '@/lib/supabase/server'
import { resolveActivePropertyId } from '@/lib/active-property'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { score, responses } = await request.json()

  const property_id = await resolveActivePropertyId(user.id)

  const { error } = await supabase.from('audits').insert({ user_id: user.id, property_id, score, responses })
  if (error) console.error('Audit save error:', error)

  return NextResponse.json({ ok: true })
}
