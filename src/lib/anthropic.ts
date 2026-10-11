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

Lead with the opportunity, not the instruction. You can see this host's property only through what they told you — you do not know their budget, their layout constraints, their cleaning turnaround or what they have already tried. So name the experience opportunity with conviction, then offer a way to bring it to life, or two or three if they are genuinely different. Write "One way to bring this to life…", "You might…", "Consider…", "When it suits the stay…" rather than issuing an operational order. Be confident about the reasoning and flexible about the execution.

This is not permission to be vague. The idea must still be concrete enough for the host to picture happening in their own property this week.

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
      "title": "A short, concrete name for the opportunity — 3 to 7 words. Name the opportunity, not an order: 'The arrival could carry the calm' rather than 'Move the bed before they arrive'.",
      "recommendation": "2-4 sentences. Name the opportunity, then one concrete way to bring it to life at this property — or a couple, if they're genuinely different. Specific enough to picture here. Not 'create a welcoming arrival' but what that means in this place. Invite rather than instruct.",
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

/* ── Focused path: the Starter Playbook ───────────────────────────────────── */

export type StarterPlaybookSection = {
  /** The source opportunity's title, preserved or lightly condensed. */
  opportunity: string
  /** The experience being designed, stated as an intention not an object. */
  what_were_designing: string
  /** Why this opportunity fits this particular stay. */
  why_it_belongs_here: string
  /** The guest-side effect, concrete and experiential. */
  what_this_could_change: string
  /** Around three ways to begin. Options, never commands. */
  bring_it_to_life: string[]
  /** Assets already present in the context that support this. */
  use_what_you_already_have: string
  /** One small, concrete action. */
  first_step: string
  /** At most one short prompt, omitted when it would be clutter. */
  reflection?: string
}

export type StarterPlaybook = {
  /** 2–4 sentences on the shared direction, grounded in the Compass. */
  direction: string
  sections: StarterPlaybookSection[]
}

/**
 * Turn three existing opportunities into a practical starting plan.
 *
 * This deliberately does not generate ideas. The host already has three, they
 * have read them, and replacing them here would make Stage 3 feel like a
 * draft. The three are passed in and the model develops them in place — which
 * is why they are numbered in the prompt and why the output is matched back to
 * them by position upstream.
 */
export async function generateStarterPlaybook(
  contextText: string,
  recommendations: FocusedRecommendation[]
): Promise<StarterPlaybook | null> {
  const opportunities = recommendations
    .map(
      (r, i) => `OPPORTUNITY ${i + 1}
Title: ${r.title}
The opportunity: ${r.recommendation}
Why StayStory raised it: ${r.why_it_fits}
Intended effect on the guest: ${r.what_this_could_change}`
    )
    .join('\n\n')

  const prompt = `You are a hospitality experience designer working in the tradition of Will Guidara (Unreasonable Hospitality), Isaac French (experiential hospitality) and Jay Acunzo (storytelling).

A host has completed an Experience Audit, confirmed their Experience Compass, and received three opportunities. They have read those three. They are now asking one question:

"Okay. What do I actually do with these?"

Your job is to turn insight into action. You are NOT generating new ideas.

WHAT YOU KNOW ABOUT THIS PROPERTY

${contextText}

THE THREE OPPORTUNITIES — these are the subject of the playbook

${opportunities}

Develop exactly these three, in this order. Do not add a fourth. Do not swap one for a different idea. Do not quietly turn opportunity 2 into something else because you prefer it. If an opportunity feels thin, go deeper into it rather than around it.

WHAT MAKES THIS WORTH READING

The host has already read the opportunity. If a section just restates it in more words, you have failed. Every section must add something they did not already have: a way to see it, a way to begin, a way to use what is already there.

Hard rules:
- Never state a fact about the property the host did not tell you. No invented amenities, rooms, views, furniture or features.
- Never invent guest demographics, budgets, staffing, policies, suppliers, timings or operational constraints. You do not know them.
- Do not diagnose their business. No claims about reviews, bookings, revenue, occupancy or ratings.
- Favour noticing, sequencing, presentation, communication, sensory detail and small changes to what exists over buying anything.
- Offer options, not orders. "Consider…", "One simple version could be…", "Another way to approach it…", "If it fits your space…".
- Be specific without pretending to be omniscient. Name the opportunity with conviction; hold the execution loosely.
- Avoid "delight your guests", "elevate the experience", "create unforgettable memories" and every phrase like them.
- Write to the host as a thoughtful peer. Warm, calm, concrete. Never a consultant issuing instructions.

Return JSON only:

{
  "direction": "2-4 sentences naming the single emotional direction all three of these serve, drawn from the host's confirmed Compass. Not a list of Compass fields — the thread connecting them. Do not invent values the Compass does not contain.",
  "sections": [
    {
      "opportunity": "The source opportunity's title, kept as-is or lightly condensed. Must still be recognisably the same opportunity.",
      "what_were_designing": "ONE sentence naming the guest experience being designed — a feeling or a moment, never an object to buy. E.g. 'Guests should be able to move through the property after dark without breaking the sense of calm the daytime created.'",
      "why_it_belongs_here": "2-3 sentences on why this fits THIS stay, grounded in something specific the host actually told you in their Audit, Compass or property description. The host should think 'yes, that is my place'. If you have little to go on, say less rather than inventing.",
      "what_this_could_change": "1-2 sentences on the guest-side effect, concrete and experiential — easier arrival, less uncertainty, more calm, a smoother transition, a stronger memory, feeling cared for. Possibility, never promise. No business outcomes.",
      "bring_it_to_life": ["About three genuinely different ways to begin, one per string, 1-3 sentences each. Options the host chooses between, not steps to complete in order. Lead with what they can do with what they already have."],
      "use_what_you_already_have": "2-3 sentences naming assets, routines or qualities ALREADY mentioned in the context that support this. Name only real things from the context. If the context does not name enough, write something like 'Look first at what already supports this moment before adding anything new' — never invent an amenity to fill this in.",
      "first_step": "ONE small concrete action, doable this week without a project. Usually noticing something rather than building something — walking the arrival as a stranger, sitting in the room at the hour guests arrive, watching where attention goes first. One sentence.",
      "reflection": "OPTIONAL. One short question to sit with, only if it genuinely adds something. Omit this field entirely rather than padding."
    }
  ]
}

Exactly three sections, matching the three opportunities in order. No preamble, no markdown.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system:
      'You are a hospitality mentor. Warm, specific, never generic, never salesy. You develop the ideas you are given rather than replacing them. Always respond with valid JSON only, no markdown.',
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = JSON.parse(extractJSON(text)) as Partial<StarterPlaybook>

  const sections = Array.isArray(parsed.sections) ? parsed.sections : []
  if (sections.length === 0 || typeof parsed.direction !== 'string') return null

  return {
    direction: parsed.direction,
    // Three is the product decision. Trim a long answer rather than showing a
    // fourth; a short one is surfaced as-is and handled upstream.
    sections: sections.slice(0, 3).map((s) => ({
      ...s,
      bring_it_to_life: Array.isArray(s.bring_it_to_life) ? s.bring_it_to_life : [],
    })),
  }
}
