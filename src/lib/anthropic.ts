import Anthropic from '@anthropic-ai/sdk'
import type { GeneratorFormData, SuggestionContent } from '@/types'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) return match[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) return text.slice(start, end + 1)
  return text.trim()
}

export async function generateHospitalityMoment(
  data: GeneratorFormData,
  propertyContext?: string
): Promise<SuggestionContent> {
  const prompt = `You are a world-class hospitality advisor trained in the philosophies of Will Guidara (Unreasonable Hospitality), Isaac French (Experiential Hospitality), and Jay Acunzo (storytelling).

A host needs your help creating a personalized, memorable moment for their guest.

GUEST PROFILE:
- Name: ${data.guestName || 'Guest'}
- Why visiting: ${data.whyVisiting}
- Host notes / guest messages: ${data.hostNotes || 'None provided'}
- Occasion: ${data.occasion || 'None specified'}
- Emotional state: ${data.emotionalState || 'Unknown'}
- Traveling with kids: ${data.hasKids ? 'Yes' : 'No'}
- Traveling with pets: ${data.hasPets ? 'Yes' : 'No'}
- Interests: ${data.interests || 'Not specified'}
${propertyContext ? `\nPROPERTY CONTEXT:\n${propertyContext}` : ''}

Your response must follow the Unreasonable Hospitality Field Guide framework. Return a JSON object with this exact structure:

{
  "gestures": {
    "zero": "A $0 gesture — purely thoughtful, no cost. Something the host can do with time and intention alone.",
    "under_10": "A gesture under $10. Specific, actionable, tied to this guest's context.",
    "under_25": "A gesture under $25. Slightly more elevated, still personal.",
    "premium": "An audacious gesture. Bold, memorable, the kind that creates a legend."
  },
  "touchpoint_focus": "Which touchpoint to target: 'Start Strong' (arrival), 'Transform a Pain Point', 'Stick the Landing' (post-checkout), or 'Elevate an Overlooked Moment'. Explain which and why.",
  "setup_plan": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "shopping_list": [
    "Item 1 — where to get it / estimated cost",
    "Item 2 — where to get it / estimated cost"
  ],
  "messages": {
    "pre_arrival": "A warm, personal pre-arrival message from the host. Should feel human, not templated.",
    "welcome_note": "A handwritten-style note to leave at the property. Short, warm, specific to this guest.",
    "follow_up": "A follow-up message to send 2-3 days after checkout. Extends the emotional arc. References something specific from their visit."
  },
  "why_it_works": "2-3 sentences teaching the host WHY this approach works — the psychology behind it. Reference the Guidara/French/Acunzo principles where relevant.",
  "dont_overdo_it": "A clear guardrail. What should the host NOT do? What would make this feel excessive or performative rather than genuine?"
}

Be specific to THIS guest. Generic suggestions are useless. The more personal, the more powerful.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: 'You are a hospitality intelligence assistant. Always respond with valid JSON only, no markdown, no explanation outside the JSON.',
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(extractJSON(text)) as SuggestionContent
}

export async function generateGuestStory(
  guestProfile: GeneratorFormData,
  suggestion: SuggestionContent
): Promise<{
  narrative: string
  host_perspective: string
  social_caption: string
  pre_arrival_message: string
  listing_improvements: string
}> {
  const prompt = `You are a storytelling advisor trained in Jay Acunzo's storytelling frameworks (One Simple Story, resonance over reach, brand voice).

A host has created a meaningful moment for their guest. Help them turn this into a story — for their brand, their listing, and their memory.

GUEST: ${guestProfile.guestName || 'Guest'} — ${guestProfile.whyVisiting}
OCCASION: ${guestProfile.occasion || 'None'}
THE GESTURE: ${guestProfile.budget === 'zero' ? suggestion.gestures.zero : guestProfile.budget === 'under_10' ? suggestion.gestures.under_10 : guestProfile.budget === 'under_25' ? suggestion.gestures.under_25 : suggestion.gestures.premium}
WHY IT WORKS: ${suggestion.why_it_works}

Return a JSON object:
{
  "narrative": "A 3-4 sentence guest story narrative. The guest is the hero. The host is the guide. Written from the guest's perspective — what they felt, what they'll remember, what they'll tell people.",
  "host_perspective": "2-3 sentences from the host's perspective — why they did it, what it meant to them. Authentic, not performative.",
  "social_caption": "An Instagram/TikTok caption the host could use. No hashtags. Warm, story-driven, 2-3 sentences.",
  "pre_arrival_message": "A pre-arrival message written in a warm, personal host voice. References something specific about this guest's purpose. Under 100 words.",
  "listing_improvements": "2-3 specific improvements to the listing copy that would attract guests who value this kind of thoughtful hospitality."
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: 'You are a storytelling assistant. Always respond with valid JSON only.',
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text)
}
