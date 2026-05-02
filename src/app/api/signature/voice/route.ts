import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyName, hostPersonality, guestFeeling, whatYouHate, exampleMessage } = await request.json()

  const prompt = `You are a brand voice strategist trained in Jay Acunzo's philosophy: the host's unique voice should be present everywhere, not generic. You help short-term rental hosts find and document their authentic hosting voice.

HOST PROFILE:
- Property: ${propertyName}
- Personality: ${hostPersonality}
- What they want guests to feel: ${guestFeeling}
- What they hate about typical host communication: ${whatYouHate || 'Not specified'}
- Example of a message they felt good about: ${exampleMessage || 'None provided'}

Build their brand voice document. Return JSON only:
{
  "voice_statement": "One sentence that captures this host's unique voice and what makes it distinct. Not generic — specific to who they are.",
  "three_words": ["Word1", "Word2", "Word3"],
  "what_you_say": ["5 specific phrases or approaches that fit this voice"],
  "what_you_never_say": ["5 things that would feel off-brand or inauthentic for this host"],
  "sample_welcome_message": "A sample welcome message written entirely in their voice. Warm, specific, human. Under 80 words.",
  "sample_listing_opener": "A 2-sentence listing opener written in their voice that sells a feeling, not features."
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: 'You are a brand voice strategist. Always respond with valid JSON only, no markdown.',
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
