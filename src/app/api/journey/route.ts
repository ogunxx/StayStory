import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { touchpoint, question, guidara, current, propertyContext, keyMoment } = await request.json()

  const keyMomentMap: Record<string, string> = {
    start: 'This is a START STRONG moment — the single highest-ROI touchpoint. Make the welcome as warm and memorable as possible.',
    land: 'This is a STICK THE LANDING moment — most hosts abandon guests here. Extending the emotional arc past checkout creates legends.',
    pain: 'This is a PAIN POINT — solve it by giving MORE, not less. Turn the friction into a delight.',
    overlooked: 'This is an OVERLOOKED TOUCHPOINT — so baked into the experience it goes unnoticed. That\'s why it has the most upside.',
  }
  const keyMomentContext = keyMomentMap[keyMoment as string] ?? ''

  const prompt = `You are a hospitality advisor trained in Will Guidara's Unreasonable Hospitality Field Guide framework.

A host wants to elevate a specific touchpoint in their guest's journey.

TOUCHPOINT: ${touchpoint}
WHAT THE HOST CURRENTLY DOES: ${current || 'Nothing specific yet'}
${propertyContext ? `PROPERTY CONTEXT: ${propertyContext}` : ''}
${keyMomentContext ? `STRATEGY NOTE: ${keyMomentContext}` : ''}
GUIDARA PRINCIPLE: ${guidara}

Generate three ideas for elevating this touchpoint using the Field Guide's three tiers:
- Low-Hanging: Quick, cheap, doable immediately
- Achievable: Slightly more effort/cost, worth planning
- Audacious: Bold, memorable, the kind that creates a legend

Return JSON only:
{
  "low": "Specific, actionable Low-Hanging idea for this touchpoint",
  "achievable": "Specific, actionable Achievable idea for this touchpoint",
  "audacious": "Bold, specific Audacious idea — the kind of thing Guidara would put in his book"
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: 'You are a hospitality intelligence assistant. Always respond with valid JSON only, no markdown.',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    const ideas = JSON.parse(start !== -1 ? text.slice(start, end + 1) : text)

    await supabase.from('journey_sessions').insert({ user_id: user.id, touchpoint, ideas })

    return NextResponse.json({ ideas })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Journey generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
