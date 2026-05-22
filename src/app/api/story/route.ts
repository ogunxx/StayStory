import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { guestName, whyVisiting, occasion, gesture, whyItWorked } = await request.json()

  if (!whyVisiting || !gesture) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const prompt = `You are a storytelling advisor trained in Jay Acunzo's frameworks: the host is the guide, the guest is the hero, prioritize resonance over reach, every moment is a story.

A host created a memorable moment for their guest. Help them turn it into a story for their brand.

GUEST: ${guestName || 'Guest'} — ${whyVisiting}
OCCASION: ${occasion || 'None'}
WHAT THE HOST DID: ${gesture}
${whyItWorked ? `WHAT HAPPENED / FEEDBACK: ${whyItWorked}` : ''}

Return a JSON object only:
{
  "narrative": "3-4 sentence guest story. Guest is the hero. Written from their perspective — what they felt, what they'll remember, what they'll tell people.",
  "host_perspective": "2-3 sentences from the host's perspective — why they did it, what it meant. Authentic, not performative.",
  "social_caption": "Instagram/TikTok caption. No hashtags. Warm, story-driven, 2-3 sentences. Could start with a scene or a feeling.",
  "pre_arrival_message": "Pre-arrival message in a warm, personal host voice. References something specific about their purpose. Under 100 words.",
  "listing_improvements": "2-3 specific improvements to listing copy that would attract guests who value thoughtful hospitality. Make them feel something, not just describe features."
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: 'You are a storytelling assistant. Always respond with valid JSON only, no markdown.',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonStr = text.replace(/```(?:json)?\s*([\s\S]*?)```/, '$1').trim()
    const start = jsonStr.indexOf('{')
    const end = jsonStr.lastIndexOf('}')
    const story = JSON.parse(start !== -1 ? jsonStr.slice(start, end + 1) : jsonStr)

    await supabase.from('guest_stories').insert({
      user_id: user.id,
      guest_id: null,
      narrative: story.narrative,
      host_perspective: story.host_perspective,
      social_caption: story.social_caption,
      pre_arrival_message: story.pre_arrival_message,
      listing_improvements: story.listing_improvements,
    })

    return NextResponse.json({ story })
  } catch (err) {
    console.error('Story generation error:', err)
    return NextResponse.json({ error: 'Story generation failed. Please try again.' }, { status: 500 })
  }
}
