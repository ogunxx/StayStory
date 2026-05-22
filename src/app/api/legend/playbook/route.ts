import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await request.json()

  const prompt = `You are a world-class hospitality consultant trained in the philosophies of Will Guidara (Unreasonable Hospitality), Isaac French (Experiential Hospitality), and Jay Acunzo (storytelling). You are creating a custom guest journey playbook for a Legend-tier host.

PROPERTY DETAILS:
- Name: ${form.propertyName}
- Type: ${form.propertyType}
- Location/Setting: ${form.location || 'Not specified'}
- Unique features: ${form.uniqueFeatures}
- Typical guest: ${form.typicalGuest || 'Not specified'}
- Current rating: ${form.currentRating || 'Not specified'}
- Host philosophy: ${form.hostPhilosophy || 'Not specified'}
- Biggest challenge: ${form.biggestChallenge || 'Not specified'}
- Monthly hospitality budget: ${form.budget || 'Flexible'}

Create a comprehensive custom guest journey playbook. Return JSON only:

{
  "executive_summary": "3-4 sentences summarizing this property's unique hospitality opportunity and what makes it positioned to create legendary stays. Specific to their property.",
  "property_positioning": "How this property should be positioned in the market. What category does it own? What feeling does it sell — not features, but transformation. Reference Isaac French's experiential hospitality philosophy.",
  "signature_experience": "The one signature moment this property should become known for. Specific, ownable, unrepeatable anywhere else. The Soniat House version of this property.",
  "guest_archetypes": [
    {
      "type": "Archetype name (e.g. 'The Reconnecting Couple')",
      "what_they_need": "What they're really looking for emotionally",
      "wow_gesture": "The specific unreasonable hospitality gesture for this archetype"
    },
    {
      "type": "Second archetype",
      "what_they_need": "...",
      "wow_gesture": "..."
    },
    {
      "type": "Third archetype",
      "what_they_need": "...",
      "wow_gesture": "..."
    }
  ],
  "touchpoint_priorities": [
    {
      "touchpoint": "Highest-priority touchpoint to elevate",
      "current_gap": "What's likely missing right now",
      "recommendation": "Specific recommendation — Low-Hanging / Achievable / Audacious options"
    },
    {
      "touchpoint": "Second priority touchpoint",
      "current_gap": "...",
      "recommendation": "..."
    },
    {
      "touchpoint": "Third priority touchpoint",
      "current_gap": "...",
      "recommendation": "..."
    }
  ],
  "monthly_rhythm": "A practical monthly hosting rhythm — what to do the week before each guest, day of arrival, mid-stay, checkout, and 3 days after. Specific to this property and budget.",
  "your_one_thing": "One sentence — the single most powerful thing this host can do to become unforgettable. The Soniat House principle applied to their specific property."
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: 'You are a hospitality intelligence assistant. Always respond with valid JSON only, no markdown.',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    const playbook = JSON.parse(start !== -1 ? text.slice(start, end + 1) : text)

    await supabase.from('playbooks').insert({
      user_id: user.id,
      property_name: form.propertyName || null,
      executive_summary: playbook.executive_summary || null,
    })

    return NextResponse.json({ playbook })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Playbook generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
