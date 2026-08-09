import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { getUserTier, hasAccess } from '@/lib/get-tier'
import { resolveActivePropertyId } from '@/lib/active-property'
import { FREE_BLUEPRINT_GENERATIONS } from '@/lib/config'
import { saveTouchpointState } from '@/lib/blueprint'
import { buildCompassContext, getOrCreateCompass, proposeCompassContribution } from '@/lib/compass'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Building & editing the Blueprint is free for everyone; generating ideas is
  // metered for free accounts and unlimited on paid plans.
  const tier = await getUserTier()
  if (!hasAccess(tier, 'legendary')) {
    const { count } = await supabase
      .from('journey_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((count ?? 0) >= FREE_BLUEPRINT_GENERATIONS) {
      return NextResponse.json(
        {
          error: `You've used all ${FREE_BLUEPRINT_GENERATIONS} free idea generations. Upgrade to Legendary for unlimited.`,
          limitReached: true,
        },
        { status: 402 }
      )
    }
  }

  const { touchpoint, touchpointId, question, guidara, current, propertyContext, keyMoment } = await request.json()

  const keyMomentMap: Record<string, string> = {
    start: 'This is a START STRONG moment — the single highest-ROI touchpoint. Make the welcome as warm and memorable as possible.',
    land: 'This is a STICK THE LANDING moment — most hosts abandon guests here. Extending the emotional arc past checkout creates legends.',
    pain: 'This is a PAIN POINT — solve it by giving MORE, not less. Turn the friction into a delight.',
    overlooked: 'This is an OVERLOOKED TOUCHPOINT — so baked into the experience it goes unnoticed. That\'s why it has the most upside.',
  }
  const keyMomentContext = keyMomentMap[keyMoment as string] ?? ''

  const property_id = await resolveActivePropertyId(user.id)
  const compass = await getOrCreateCompass(user.id, property_id)
  const compassContext = buildCompassContext(compass)

  const prompt = `You are a hospitality advisor trained in Will Guidara's Unreasonable Hospitality Field Guide framework.

A host wants to elevate a specific touchpoint in their guest's journey.
${compassContext ? `\n${compassContext.text}\n` : ''}
TOUCHPOINT: ${touchpoint}
WHAT THE HOST CURRENTLY DOES: ${current || 'Nothing specific yet'}
${propertyContext ? `PROPERTY CONTEXT: ${propertyContext}` : ''}
${keyMomentContext ? `STRATEGY NOTE: ${keyMomentContext}` : ''}
GUIDARA PRINCIPLE: ${guidara}

Generate three ideas for elevating this touchpoint using the Field Guide's three tiers${compassContext ? ", each one clearly in service of this host's Compass above — not generic hospitality advice" : ''}:
- Low-Hanging: Quick, cheap, doable immediately
- Achievable: Slightly more effort/cost, worth planning
- Audacious: Bold, memorable, the kind that creates a legend

Follow the StayStory recommendation format — teach the principle before the ideas, and connect the ideas back to guest impact and story. Return JSON only:
{
  "principle": "1-2 sentences teaching the hospitality principle behind elevating this specific touchpoint, before describing what to do.",
  "why_it_matters": "1 sentence connecting that principle to this specific touchpoint and what the host currently does.",
  "low": "Specific, actionable Low-Hanging idea for this touchpoint",
  "achievable": "Specific, actionable Achievable idea for this touchpoint",
  "audacious": "Bold, specific Audacious idea — the kind of thing Guidara would put in his book",
  "expected_guest_impact": "1 sentence: what the guest will likely feel or notice differently because of this.",
  "story_it_reinforces": "1 sentence: what this reinforces in the story guests tell about staying here."
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: 'You are a hospitality intelligence assistant. Always respond with valid JSON only, no markdown.',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    const ideas = JSON.parse(start !== -1 ? text.slice(start, end + 1) : text)

    await supabase.from('journey_sessions').insert({ user_id: user.id, property_id, touchpoint, ideas })

    if (touchpointId) {
      await saveTouchpointState(user.id, property_id, touchpointId, { current, ideas })
    }

    // The "signature moment" touchpoint is the Blueprint's one designated Compass
    // contributor — a host describing their unique offering there is the same
    // kind of signal as the Audit's "one thing you do best."
    if (touchpointId === 'your_one_thing' && current?.trim()) {
      await proposeCompassContribution({
        userId: user.id,
        propertyId: property_id,
        field: 'signature_memory',
        suggestedValue: current.trim(),
        sourceModule: 'blueprint',
        rationale: 'From your Experience Blueprint — your property\'s signature moment',
      })
    }

    return NextResponse.json({ ideas, compassUsed: compassContext?.usedFields ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Journey generation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
