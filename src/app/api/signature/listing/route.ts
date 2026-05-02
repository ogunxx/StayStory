import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyName, propertyType, uniqueFeatures, targetGuest, currentListing } = await request.json()

  const prompt = `You are a hospitality copywriter trained in Jay Acunzo's storytelling principles and Isaac French's experiential hospitality philosophy. You write Airbnb/VRBO listing copy that sells transformation, not features.

PROPERTY:
- Name: ${propertyName}
- Type: ${propertyType}
- Unique features: ${uniqueFeatures}
- Target guest: ${targetGuest || 'Not specified'}
${currentListing ? `- Current listing copy: ${currentListing}` : ''}

Rewrite their listing copy. Every line should sell how the guest will FEEL, not just what they'll find. Return JSON only:
{
  "headline": "A listing title under 50 characters that creates intrigue or emotion — not just 'Cozy Cabin Near Lake'",
  "opening_paragraph": "2-3 sentences that open with a scene or feeling. The guest should picture themselves there immediately.",
  "experience_section": "3-4 sentences describing the experience of staying here — specific sensory details, the flow of a day, what makes it unlike anywhere else.",
  "closing_hook": "1-2 sentences that end with something memorable — a question, a promise, or an invitation that makes them want to book."
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: 'You are a hospitality copywriter. Always respond with valid JSON only, no markdown.',
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
