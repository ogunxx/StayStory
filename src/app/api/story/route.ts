import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { resolveActivePropertyId } from '@/lib/active-property'
import { proposeCompassContribution } from '@/lib/compass'
import { NextResponse } from 'next/server'
import type { CompassField } from '@/types'

const COMPASS_CONTRIBUTION_FIELDS: CompassField[] = ['wonder', 'purpose', 'story', 'story_theyll_tell']

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

A host created a memorable moment for their guest. Help them put it into words — so the experience can be understood, anticipated, felt, and remembered. This is about making meaning, not writing marketing copy.

GUEST: ${guestName || 'Guest'} — ${whyVisiting}
OCCASION: ${occasion || 'None'}
WHAT THE HOST DID: ${gesture}
${whyItWorked ? `WHAT HAPPENED / FEEDBACK: ${whyItWorked}` : ''}

Return a JSON object only:
{
  "narrative": "3-4 sentence guest story. Guest is the hero. Written from their perspective — what they felt, what they'll remember, what they'll tell people.",
  "host_perspective": "2-3 sentences from the host's perspective — why they did it, what it meant. Authentic, not performative.",
  "social_caption": "The moment in words the host could share — a short, true expression of what happened and how it felt, 2-3 sentences. Capture the feeling, not a marketing caption. No hashtags, no salesy language. Start with a scene or a feeling.",
  "pre_arrival_message": "Pre-arrival message in a warm, personal host voice. References something specific about their purpose. Under 100 words.",
  "listing_improvements": "Describe what a FUTURE guest should be able to FEEL before they book — the emotional truth of this experience, written so someone reading it can anticipate the moment and imagine themselves in it. 2-3 sentences. Not feature edits, not marketing copy — the meaning a future guest should sense is waiting for them.",
  "compass_contributions": {
    "wonder": "A short (1 sentence) draft of what seems to spark wonder for this host, based only on what's above — or null if nothing here actually reveals it.",
    "purpose": "A short draft of why this place seems to exist for this host — or null.",
    "story": "A short draft of what story guests seem to be stepping into — or null.",
    "story_theyll_tell": "A short draft, in the guest's likely words, of what they'd say when asked how their trip was — or null."
  }
}

The compass_contributions fields are drafts for the host to review later, never a final decision — only fill one in when this specific input genuinely reveals it, use null otherwise. Don't stretch to fill all four.`

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

    const property_id = await resolveActivePropertyId(user.id)

    const { data: storyRow } = await supabase
      .from('guest_stories')
      .insert({
        user_id: user.id,
        property_id,
        guest_id: null,
        narrative: story.narrative,
        host_perspective: story.host_perspective,
        social_caption: story.social_caption,
        pre_arrival_message: story.pre_arrival_message,
        listing_improvements: story.listing_improvements,
      })
      .select('id')
      .single()

    const compassContributions = story.compass_contributions ?? {}
    for (const field of COMPASS_CONTRIBUTION_FIELDS) {
      const suggestedValue = compassContributions[field]
      if (typeof suggestedValue === 'string' && suggestedValue.trim()) {
        await proposeCompassContribution({
          userId: user.id,
          propertyId: property_id,
          field,
          suggestedValue: suggestedValue.trim(),
          sourceModule: 'story_builder',
          rationale: `From your Story Builder entry for ${guestName || 'a guest'}`,
          sourceRef: storyRow?.id ? { table: 'guest_stories', id: storyRow.id } : undefined,
        })
      }
    }

    const storyForClient = {
      narrative: story.narrative,
      host_perspective: story.host_perspective,
      social_caption: story.social_caption,
      pre_arrival_message: story.pre_arrival_message,
      listing_improvements: story.listing_improvements,
    }

    return NextResponse.json({ story: storyForClient })
  } catch (err) {
    console.error('Story generation error:', err)
    return NextResponse.json({ error: 'Story generation failed. Please try again.' }, { status: 500 })
  }
}
