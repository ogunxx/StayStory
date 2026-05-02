import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { propertyName, moment, guestContext } = await request.json()

  const prompt = `You are a social media storyteller trained in Jay Acunzo's principles: lead with the story not the feature, prioritize resonance over reach, open with a scene or feeling never a generic statement.

PROPERTY: ${propertyName}
MOMENT TO SHARE: ${moment}
${guestContext ? `GUEST CONTEXT: ${guestContext}` : ''}

Write captions for this hosting moment. No hashtags. No emojis unless essential. Return JSON only:
{
  "story_hook": "One sentence — the emotional core of this moment. What does it really mean?",
  "captions": [
    {
      "platform": "Instagram / TikTok",
      "caption": "2-3 sentences. Open with a scene or feeling. End with something that invites a response or makes them feel something. No hashtags."
    },
    {
      "platform": "Airbnb / VRBO review response or listing update",
      "caption": "Professional but warm. 2 sentences that reference the moment and what it says about the hosting philosophy."
    },
    {
      "platform": "Personal / behind the scenes",
      "caption": "Informal, authentic. The host's real voice reflecting on why they do this. 2-3 sentences."
    }
  ]
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 900,
      system: 'You are a social media storyteller. Always respond with valid JSON only, no markdown.',
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
