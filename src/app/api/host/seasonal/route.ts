import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyName, season, guestType, propertyFeatures, budget } = await request.json()

  const prompt = `You are a hospitality advisor trained in Isaac French's experiential hospitality philosophy and Will Guidara's Unreasonable Hospitality principles.

A host wants to plan a curated seasonal experience for their property.

PROPERTY: ${propertyName}
SEASON: ${season}
GUEST TYPE: ${guestType}
FEATURES: ${propertyFeatures}
BUDGET: ${budget || 'Flexible'}

Design a seasonal experience plan that feels intentional and curated — not generic. Return JSON only:
{
  "theme": "A one-line seasonal theme for this property (e.g. 'Golden Hour Wellness' or 'Winter Slowdown')",
  "arrival_ritual": "A specific arrival ritual for this season that uses the property's features and the time of year",
  "sensory_touches": [
    "Specific sensory detail 1 — scent, sound, lighting, temperature",
    "Specific sensory detail 2",
    "Specific sensory detail 3"
  ],
  "experience_ideas": [
    "Curated experience idea 1 specific to this season and property",
    "Curated experience idea 2",
    "Curated experience idea 3",
    "Curated experience idea 4"
  ],
  "shopping_list": [
    "Item 1 — estimated cost",
    "Item 2 — estimated cost",
    "Item 3 — estimated cost",
    "Item 4 — estimated cost"
  ],
  "message_hook": "One sentence to use in pre-arrival messages that captures the seasonal feeling of this property right now"
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: 'You are a hospitality experience designer. Always respond with valid JSON only, no markdown.',
      messages: [{ role: 'user', content: prompt }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const start = text.indexOf('{'), end = text.lastIndexOf('}')
    const result = JSON.parse(start !== -1 ? text.slice(start, end + 1) : text)
    return NextResponse.json({ result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
