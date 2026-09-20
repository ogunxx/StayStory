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

Your response must follow the Unreasonable Hospitality Field Guide framework, and the StayStory recommendation format: teach the principle before the how, and connect it back to what this recommendation actually does for the guest and the story. Return a JSON object with this exact structure:

{
  "principle": "1-2 sentences teaching the hospitality principle behind this recommendation, BEFORE describing what to do. Reference Guidara/French/Acunzo where relevant. Never generic — this should only make sense for this specific guest.",
  "why_it_matters": "1-2 sentences connecting the principle to this specific guest and moment — why this matters here, not in general.",
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
  "expected_guest_impact": "1-2 sentences: specifically what this guest will likely feel or do differently because of this — not a vague 'they'll love it.'",
  "story_it_reinforces": "1 sentence: what this guest will tell people about their stay because of this moment, or which part of the host's story it reinforces.",
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
WHY IT WORKS: ${suggestion.why_it_matters}

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

/* ── Focused path: three contextual recommendations ───────────────────────── */

export type FocusedRecommendation = {
  /** A short, specific name for the idea. */
  title: string
  /** What the host could actually do, concretely, at this property. */
  recommendation: string
  /** Which of their own answers led here, in hospitality language. */
  why_it_fits: string
  /** The intended effect on the guest, stated as a possibility. */
  what_this_could_change: string
}

/**
 * Three recommendations for a property, drawn from the host's confirmed
 * Compass and their completed Audit.
 *
 * This sits alongside generateHospitalityMoment rather than replacing or
 * wrapping it: that function designs one moment for one named guest, with
 * gestures at price tiers, and its inputs are a guest profile. Feeding it a
 * fabricated guest to get property-level advice would produce exactly the
 * generic output this is meant to avoid. Same module, same client, same
 * model, same JSON handling, same philosophy — different question.
 */
export async function generateFocusedRecommendations(
  contextText: string
): Promise<FocusedRecommendation[]> {
  const prompt = `You are a hospitality experience designer working in the tradition of Will Guidara (Unreasonable Hospitality), Isaac French (experiential hospitality) and Jay Acunzo (storytelling).

A host has completed an Experience Audit of their property and confirmed their Experience Compass. Everything below is in their own words.

${contextText}

Give this host exactly THREE recommendations.

The strongest recommendations come from the tension between where the experience IS today (the Audit) and where the host wants it to GO (the Compass). Look for that tension first.

Aim for three meaningfully different ideas. Where the context supports it, a useful spread is: one that removes friction or effort, one that strengthens a meaningful or emotional moment, and one that makes the place more distinctly itself. Do not force that split if this property's context points somewhere better — context wins over formula.

Hard rules:
- Be specific to THIS property. If a recommendation could be given unchanged to almost any vacation rental, it is not good enough — start again.
- Do not suggest a handwritten note, a welcome basket, a list of local recommendations, champagne, string lights or robes unless this host's specific context genuinely calls for it.
- Assume no renovation, no staff, no large budget, no food service and no amenity that was not mentioned. The goal is not to do more; it is to make what they already do matter more.
- Never state a fact about the property that the host did not tell you. If you don't know, design around what you do know.
- Never promise results. Write "this could", "this gives you the chance to", "this may".

Return JSON only:

{
  "recommendations": [
    {
      "title": "A short, concrete name for the idea — 3 to 7 words",
      "recommendation": "2-4 sentences. What they could actually do, specific enough to picture at this property. Not 'create a welcoming arrival' but what that means here.",
      "why_it_fits": "1-2 sentences naming what in their Audit and their Compass led you here. Refer to what they told you in human language — never mention fields, data or a model. Something like: 'Your Audit suggests arriving after dark may take extra effort, while your Compass keeps returning to ease and feeling cared for.'",
      "what_this_could_change": "1-2 sentences on the intended effect for the guest. Possibility, never promise."
    }
  ]
}

Exactly three. No preamble, no markdown.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system:
      'You are a hospitality mentor. Warm, specific, never generic, never salesy. Always respond with valid JSON only, no markdown.',
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = JSON.parse(extractJSON(text)) as { recommendations?: FocusedRecommendation[] }

  const recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : []
  // Exactly three is the product decision, so trim a long answer rather than
  // surfacing four. A short answer is surfaced as-is and handled upstream.
  return recommendations.slice(0, 3)
}
