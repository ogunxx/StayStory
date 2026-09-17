/**
 * The Experience Audit, as data.
 *
 * Every step, question, option, conditional rule, StayStory Insight and
 * Compass mapping lives here. The UI renders whatever this file describes, so
 * rewording a question, adding an option, changing which answer reveals a
 * follow-up, or reordering a step is an edit here and nothing else.
 *
 * No server-only imports — the same reasoning as compass-fields.ts. The API
 * route needs this file to map answers onto the Compass, and the client needs
 * it to render.
 *
 * On answer values: every option has a stable `value` that is stored, and a
 * `label` that is shown. Rewording a label never invalidates saved answers.
 * Some options carry a `quality` from 0–3, which is how a descriptive answer
 * still produces a score internally without ever showing the host a 1–5 scale.
 */

import type { CompassField } from '@/types'

export type QuestionKind = 'single' | 'multi' | 'pills' | 'text' | 'textarea'

export type AuditOption = {
  value: string
  label: string
  /** 0 = needs work … 3 = intentionally designed. Omitted where not a quality judgement. */
  quality?: 0 | 1 | 2 | 3
}

export type AuditQuestion = {
  id: string
  kind: QuestionKind
  prompt: string
  /** Small line under the prompt. */
  helper?: string
  options?: AuditOption[]
  /** For pills/multi — the most a host may choose. */
  max?: number
  placeholder?: string
  /**
   * Only show this question when another answer matches. This is what keeps
   * the Audit conversational rather than exhaustive.
   */
  showIf?: { questionId: string; anyOf: string[] }
  /** Feeds this Compass field when answered. */
  compass?: CompassField
}

export type AuditStep = {
  id: string
  /** Short label for the progress rail. */
  navLabel: string
  title: string
  intro: string
  questions: AuditQuestion[]
  /** One teaching moment per step at most — placed where it becomes useful. */
  insight?: string
  /**
   * Optional photograph for this step. Deliberately unset: the brief rules out
   * decorative stock photography, and a picture of someone else's property
   * while a host audits their own would actively mislead. Set `image` to a
   * real photograph and the step renders it in the mockup's position.
   */
  image?: string
  imageAlt?: string
}

/* ── Shared option sets ───────────────────────────────────────────────────── */

const FEELINGS: AuditOption[] = [
  { value: 'rested', label: 'Rested' },
  { value: 'welcomed', label: 'Welcomed' },
  { value: 'inspired', label: 'Inspired' },
  { value: 'connected', label: 'Connected' },
  { value: 'curious', label: 'Curious' },
  { value: 'playful', label: 'Playful' },
  { value: 'cared_for', label: 'Cared for' },
  { value: 'peaceful', label: 'Peaceful' },
  { value: 'grounded', label: 'Grounded' },
  { value: 'energized', label: 'Energized' },
  { value: 'cozy', label: 'Cozy' },
  { value: 'luxurious', label: 'Luxurious' },
  { value: 'adventurous', label: 'Adventurous' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'something_else', label: 'Something else' },
]

const UNSURE: AuditOption = { value: 'unsure', label: 'I’m not sure' }

/* ── The eight steps ──────────────────────────────────────────────────────── */

export const AUDIT_STEPS: AuditStep[] = [
  /* 1 ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'vision',
    navLabel: 'Your Vision',
    title: 'Your Vision',
    intro:
      'Let’s start with the big picture. These questions help us understand the experience you want to create for your guests.',
    questions: [
      {
        id: 'stayed_yourself',
        kind: 'single',
        prompt: 'Have you stayed in this property as a guest yourself?',
        options: [
          { value: 'full_stay', label: 'Yes, for a full stay', quality: 3 },
          { value: 'one_night', label: 'I’ve spent a night there', quality: 2 },
          { value: 'time_only', label: 'I’ve spent time there, but haven’t slept there', quality: 1 },
          { value: 'not_yet', label: 'Not yet', quality: 0 },
        ],
      },
      {
        id: 'desired_feelings',
        kind: 'pills',
        prompt: 'How do you want guests to feel here?',
        helper: 'Choose up to three.',
        max: 3,
        options: FEELINGS,
        compass: 'hospitality_promise',
      },
      {
        id: 'best_day',
        kind: 'textarea',
        prompt: 'Imagine this property on its best day. What are the guests doing?',
        placeholder:
          'Enjoying coffee on the deck, exploring the area, cooking together, gathering around a fire, reading, or simply feeling present and refreshed…',
        compass: 'story',
      },
      {
        id: 'desired_memory',
        kind: 'textarea',
        prompt: 'When they leave, what do you most want them to remember about this place?',
        placeholder: 'The moment, the feeling, the detail — not the amenities.',
        compass: 'signature_memory',
      },
      {
        id: 'strongest_asset',
        kind: 'single',
        prompt: 'What already feels most special about the property?',
        options: [
          { value: 'view', label: 'A view or natural setting' },
          { value: 'room', label: 'A particular room' },
          { value: 'architecture', label: 'An architectural feature' },
          { value: 'amenity', label: 'An amenity' },
          { value: 'atmosphere', label: 'The atmosphere' },
          { value: 'activity', label: 'Something guests do here' },
          { value: 'story_detail', label: 'A story or meaningful detail' },
          { value: 'not_sure', label: 'I’m not sure yet' },
          { value: 'something_else', label: 'Something else' },
        ],
      },
    ],
  },

  /* 2 ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'arrival',
    navLabel: 'Arrival',
    title: 'Arrival',
    intro:
      'The stay begins before the door opens. Let’s look at the first impressions and the details that help guests feel welcome from the moment they arrive.',
    insight:
      'Clear directions and visible identifying details reduce stress and help guests begin their stay feeling calm and confident.',
    questions: [
      {
        id: 'findable',
        kind: 'single',
        prompt: 'Could a first-time guest find the property easily without having to call or message you?',
        options: [
          { value: 'easily', label: 'Yes, easily', quality: 3 },
          { value: 'probably', label: 'Probably, but there may be some uncertainty', quality: 2 },
          { value: 'occasional', label: 'Guests occasionally have trouble', quality: 1 },
          { value: 'frequent', label: 'Guests frequently need help', quality: 0 },
          { value: 'untested', label: 'I haven’t tested this myself' },
        ],
      },
      {
        id: 'exterior_match',
        kind: 'single',
        prompt:
          'When guests first see the property, does the exterior match the expectation created by your listing?',
        options: [
          { value: 'not_really', label: 'Not really', quality: 0 },
          { value: 'mostly', label: 'Mostly', quality: 2 },
          { value: 'yes', label: 'Yes', quality: 3 },
          { value: 'exceeds', label: 'It exceeds the expectation', quality: 3 },
          UNSURE,
        ],
      },
      {
        id: 'identifiable',
        kind: 'single',
        prompt: 'Are the house number, driveway, entrance, or identifying features immediately clear?',
        options: [
          { value: 'very_clear', label: 'Very clear', quality: 3 },
          { value: 'mostly_clear', label: 'Mostly clear', quality: 2 },
          { value: 'somewhat_confusing', label: 'Somewhat confusing', quality: 1 },
          { value: 'difficult', label: 'Difficult to identify', quality: 0 },
        ],
      },
      {
        id: 'identifiable_after_dark',
        kind: 'single',
        prompt: 'Would they still be easy to identify after dark?',
        showIf: { questionId: 'identifiable', anyOf: ['mostly_clear', 'somewhat_confusing', 'difficult'] },
        options: [
          { value: 'yes', label: 'Yes, everything is lit and visible', quality: 3 },
          { value: 'partly', label: 'Partly — some things are hard to see', quality: 1 },
          { value: 'no', label: 'No, it gets difficult at night', quality: 0 },
          UNSURE,
        ],
      },
      {
        id: 'parking_obvious',
        kind: 'single',
        prompt: 'Is it immediately obvious where guests should park?',
        showIf: { questionId: 'identifiable', anyOf: ['mostly_clear', 'somewhat_confusing', 'difficult'] },
        options: [
          { value: 'obvious', label: 'Yes, there is no question', quality: 3 },
          { value: 'explained', label: 'Only because we explain it in advance', quality: 1 },
          { value: 'confusing', label: 'Guests often get this wrong', quality: 0 },
        ],
      },
      {
        id: 'path_to_door',
        kind: 'single',
        prompt: 'From the car to the door, does the path feel clear, safe, and intentional?',
        helper: 'Think about luggage, steps, surface, rain, landscaping and accessibility.',
        options: [
          { value: 'designed', label: 'It feels intentionally designed', quality: 3 },
          { value: 'easy', label: 'It’s easy and welcoming', quality: 2 },
          { value: 'clear_enough', label: 'It’s clear enough', quality: 1 },
          { value: 'struggle', label: 'Guests may struggle', quality: 0 },
        ],
      },
      {
        id: 'night_lighting',
        kind: 'single',
        prompt:
          'If a guest arrived for the first time at night, would the lighting naturally guide them from the car to the entrance?',
        options: [
          { value: 'guides', label: 'Yes — the lighting leads them the whole way', quality: 3 },
          { value: 'mostly', label: 'Mostly, with one or two dark stretches', quality: 2 },
          { value: 'phone', label: 'They’d likely use a phone torch', quality: 1 },
          { value: 'dark', label: 'It’s genuinely dark', quality: 0 },
          UNSURE,
        ],
      },
      {
        id: 'entry_confidence',
        kind: 'single',
        prompt: 'Can a guest identify the correct entrance and unlock the door without hesitation?',
        options: [
          { value: 'immediately', label: 'Immediately', quality: 3 },
          { value: 'figuring', label: 'With a little figuring out', quality: 2 },
          { value: 'instructions', label: 'Instructions are necessary', quality: 1 },
          { value: 'struggle', label: 'Guests sometimes struggle', quality: 0 },
        ],
      },
      {
        id: 'first_sight',
        kind: 'text',
        prompt:
          'Stand at the entrance as if you’ve never been here before. What is the first thing the guest sees?',
        placeholder: 'The first thing in their eyeline…',
      },
      {
        id: 'first_sight_intended',
        kind: 'single',
        prompt: 'Is that what you want them to notice first?',
        showIf: { questionId: 'first_sight', anyOf: ['__answered__'] },
        options: [
          { value: 'yes', label: 'Yes, that’s exactly it', quality: 3 },
          { value: 'partly', label: 'Partly — I’d rather they noticed something else', quality: 1 },
          { value: 'no', label: 'No, that isn’t what I want leading', quality: 0 },
        ],
      },
      {
        id: 'door_opens',
        kind: 'multi',
        prompt: 'When the door opens, what does the guest experience first?',
        options: [
          { value: 'natural_light', label: 'Natural light' },
          { value: 'view', label: 'A view' },
          { value: 'scent', label: 'Scent' },
          { value: 'temperature', label: 'Temperature' },
          { value: 'sound', label: 'Music or sound' },
          { value: 'art', label: 'Artwork or design' },
          { value: 'furniture', label: 'Furniture' },
          { value: 'signage', label: 'Instructions or signage' },
          { value: 'clutter', label: 'Clutter' },
          { value: 'amenity', label: 'A special amenity' },
          { value: 'something_else', label: 'Something else' },
        ],
      },
      {
        id: 'first_moment_supports',
        kind: 'single',
        prompt: 'Does that first moment support the way you want guests to feel?',
        options: [
          { value: 'yes', label: 'Yes, it sets exactly the right tone', quality: 3 },
          { value: 'partly', label: 'Partly', quality: 1 },
          { value: 'no', label: 'No, it works against it', quality: 0 },
          UNSURE,
        ],
      },
    ],
  },

  /* 3 ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'flow',
    navLabel: 'Living & Flow',
    title: 'Living & Flow',
    intro: 'Good flow quietly answers questions before guests have to ask them.',
    insight:
      'When a guest has to stop and work something out, the space has asked them to do the hosting. Every answer you place in advance is one less small effort.',
    questions: [
      {
        id: 'belongings_place',
        kind: 'single',
        prompt: 'Is there an obvious place for guests to put their belongings?',
        helper: 'Luggage, shoes, coats, bags, keys.',
        options: [
          { value: 'designed', label: 'Yes — it’s intentionally provided', quality: 3 },
          { value: 'workable', label: 'They find somewhere that works', quality: 2 },
          { value: 'improvise', label: 'They tend to improvise', quality: 1 },
          { value: 'nowhere', label: 'There isn’t really anywhere', quality: 0 },
        ],
      },
      {
        id: 'movement',
        kind: 'single',
        prompt: 'Can guests move naturally through the space without navigating around furniture or obstacles?',
        options: [
          { value: 'easily', label: 'Yes, it’s open and easy', quality: 3 },
          { value: 'mostly', label: 'Mostly', quality: 2 },
          { value: 'tight', label: 'There are one or two tight spots', quality: 1 },
          { value: 'awkward', label: 'It’s awkward in places', quality: 0 },
        ],
      },
      {
        id: 'furniture_supports',
        kind: 'single',
        prompt: 'Does the furniture arrangement support what guests are actually meant to do here?',
        helper: 'Talking, eating together, watching something, enjoying the view, games, reading, working, relaxing.',
        options: [
          { value: 'designed', label: 'It’s arranged for exactly that', quality: 3 },
          { value: 'works', label: 'It works well enough', quality: 2 },
          { value: 'inherited', label: 'It’s mostly how the room came', quality: 1 },
          { value: 'fights', label: 'It fights what people want to do', quality: 0 },
        ],
      },
      {
        id: 'items_located',
        kind: 'single',
        prompt: 'Are everyday items located where guests naturally need them?',
        helper:
          'Towels near the tub. Charging near the bed. Glasses near beverages. Blankets near outdoor seating.',
        options: [
          { value: 'thought_through', label: 'Yes — this has been thought through', quality: 3 },
          { value: 'mostly', label: 'Mostly', quality: 2 },
          { value: 'some_hunting', label: 'There’s some hunting involved', quality: 1 },
          { value: 'not_really', label: 'Not really', quality: 0 },
        ],
      },
      {
        id: 'friction_points',
        kind: 'single',
        prompt: 'Are there places where guests have to stop and figure out what to do?',
        options: [
          { value: 'none', label: 'No, everything is self-explanatory', quality: 3 },
          { value: 'one_or_two', label: 'One or two things', quality: 1 },
          { value: 'several', label: 'Several', quality: 0 },
          UNSURE,
        ],
      },
      {
        id: 'friction_where',
        kind: 'text',
        prompt: 'Where?',
        placeholder: 'The moment or object that trips people up…',
        showIf: { questionId: 'friction_points', anyOf: ['one_or_two', 'several'] },
      },
      {
        id: 'temperature_control',
        kind: 'single',
        prompt: 'Is temperature control easy for a first-time guest to understand?',
        options: [
          { value: 'obvious', label: 'Yes, it’s obvious', quality: 3 },
          { value: 'labelled', label: 'Yes, because we’ve labelled or explained it', quality: 2 },
          { value: 'asked', label: 'Guests sometimes ask', quality: 1 },
          { value: 'confusing', label: 'It’s genuinely confusing', quality: 0 },
        ],
      },
    ],
  },

  /* 4 ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'light',
    navLabel: 'Light & Senses',
    title: 'Light & Senses',
    intro:
      'Good lighting and sensory details help set the mood, support different moments, and make a space feel truly lived in.',
    insight:
      'Layers of light — from bright to soft — help a space shift from arrival, to conversation, to winding down.',
    questions: [
      {
        id: 'natural_light',
        kind: 'single',
        prompt: 'What does the natural light feel like during the day?',
        options: [
          { value: 'limited', label: 'Very limited', quality: 0 },
          { value: 'adequate', label: 'Adequate', quality: 1 },
          { value: 'pleasant', label: 'Pleasant', quality: 2 },
          { value: 'strength', label: 'One of the space’s strengths', quality: 3 },
          { value: 'changes', label: 'It changes significantly throughout the day', quality: 3 },
        ],
      },
      {
        id: 'best_time_of_day',
        kind: 'single',
        prompt: 'Is there a particular time of day when the space feels especially beautiful?',
        options: [
          { value: 'morning', label: 'Morning' },
          { value: 'midday', label: 'Midday' },
          { value: 'afternoon', label: 'Afternoon' },
          { value: 'golden_hour', label: 'Golden hour' },
          { value: 'evening', label: 'Evening' },
          { value: 'not_really', label: 'Not really' },
          UNSURE,
        ],
      },
      {
        id: 'overhead_only',
        kind: 'single',
        prompt: 'Does the main living space rely primarily on one overhead light?',
        options: [
          { value: 'yes', label: 'Yes', quality: 0 },
          { value: 'mostly', label: 'Mostly', quality: 1 },
          { value: 'no', label: 'No, guests have several lighting options', quality: 3 },
          UNSURE,
        ],
      },
      {
        id: 'light_for_activities',
        kind: 'multi',
        prompt: 'Can guests adjust the lighting for the activities that actually happen here?',
        helper: 'Choose everything the lighting genuinely supports today.',
        options: [
          { value: 'arrival', label: 'Arrival' },
          { value: 'cooking', label: 'Cooking' },
          { value: 'eating', label: 'Eating' },
          { value: 'reading', label: 'Reading' },
          { value: 'conversation', label: 'Conversation' },
          { value: 'working', label: 'Working' },
          { value: 'getting_ready', label: 'Getting ready' },
          { value: 'relaxing', label: 'Relaxing' },
          { value: 'bedtime', label: 'Bedtime' },
          { value: 'night_nav', label: 'Nighttime navigation' },
          { value: 'outdoor', label: 'Outdoor gathering' },
        ],
      },
      {
        id: 'switches_obvious',
        kind: 'single',
        prompt: 'Are light switches and controls obvious to someone using them for the first time?',
        options: [
          { value: 'obvious', label: 'Yes, immediately', quality: 3 },
          { value: 'mostly', label: 'Mostly', quality: 2 },
          { value: 'trial', label: 'There’s some trial and error', quality: 1 },
          { value: 'confusing', label: 'They’re genuinely confusing', quality: 0 },
        ],
      },
      {
        id: 'night_navigation',
        kind: 'single',
        prompt: 'Can guests move around at night without turning on harsh overhead lighting?',
        options: [
          { value: 'yes', label: 'Yes — there’s soft light for that', quality: 3 },
          { value: 'partly', label: 'In some rooms', quality: 1 },
          { value: 'no', label: 'No, it’s the big light or nothing', quality: 0 },
        ],
      },
      {
        id: 'sounds',
        kind: 'text',
        prompt: 'What sounds are guests most likely to notice?',
        placeholder: 'Birdsong, a road, the fridge, water, wind, neighbours…',
      },
      {
        id: 'smell',
        kind: 'text',
        prompt: 'What does the property naturally smell like when no fragrance is added?',
        placeholder: 'Be honest — this is the one nobody checks.',
      },
      {
        id: 'materials',
        kind: 'text',
        prompt: 'Which materials do guests physically interact with most?',
        placeholder: 'Linen, stone, timber, ceramic, metal…',
      },
      {
        id: 'natural_feature',
        kind: 'text',
        prompt: 'Is there a natural feature the experience could celebrate more intentionally?',
        placeholder: 'Trees, water, sky, sunset, stars, breeze, landscape, birdsong, natural light…',
      },
    ],
  },

  /* 5 ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'sleep',
    navLabel: 'Sleep & Bath',
    title: 'Sleep & Bath',
    intro:
      'Rest and refresh are essential to a great stay. Let’s look at the details that help guests feel comfortable, cared for, and at ease.',
    insight:
      'Rest is more than the mattress. Darkness, sound, temperature and bedside convenience all shape how well a guest settles in.',
    questions: [
      {
        id: 'bed_inviting',
        kind: 'single',
        prompt: 'When guests first see the bed, does it look genuinely inviting?',
        options: [
          { value: 'yes', label: 'Yes — it’s the best thing in the room', quality: 3 },
          { value: 'comfortable', label: 'It looks comfortable', quality: 2 },
          { value: 'fine', label: 'It’s fine', quality: 1 },
          { value: 'no', label: 'Honestly, no', quality: 0 },
        ],
      },
      {
        id: 'slept_in_bed',
        kind: 'single',
        prompt: 'Have you personally slept in this bed for a full night?',
        options: [
          { value: 'yes', label: 'Yes', quality: 3 },
          { value: 'briefly', label: 'Briefly, not a full night', quality: 1 },
          { value: 'no', label: 'Not yet', quality: 0 },
        ],
      },
      {
        id: 'darkness',
        kind: 'single',
        prompt: 'Can guests make the bedroom genuinely dark for sleeping?',
        options: [
          { value: 'easily', label: 'Yes, easily', quality: 3 },
          { value: 'mostly', label: 'Mostly', quality: 2 },
          { value: 'not_really', label: 'Not really', quality: 0 },
          UNSURE,
        ],
      },
      {
        id: 'night_sounds',
        kind: 'text',
        prompt: 'What sounds might guests notice while trying to sleep?',
        placeholder: 'Traffic, plumbing, wildlife, a neighbour, the heating…',
      },
      {
        id: 'bedside',
        kind: 'multi',
        prompt: 'Does each sleeper have convenient access to:',
        helper: 'Choose everything that’s true for both sides of the bed.',
        options: [
          { value: 'surface', label: 'A bedside surface' },
          { value: 'light', label: 'Their own light' },
          { value: 'charging', label: 'Charging' },
          { value: 'water', label: 'Water' },
          { value: 'temperature', label: 'Temperature control' },
        ],
      },
      {
        id: 'bathroom_ready',
        kind: 'single',
        prompt: 'When a guest enters the bathroom, does it immediately feel clean, calm, and ready?',
        options: [
          { value: 'yes', label: 'Yes, every time', quality: 3 },
          { value: 'mostly', label: 'Mostly', quality: 2 },
          { value: 'depends', label: 'It depends on the turnover', quality: 1 },
          { value: 'no', label: 'Not reliably', quality: 0 },
        ],
      },
      {
        id: 'bathroom_lighting',
        kind: 'single',
        prompt: 'Is the lighting good for getting ready?',
        options: [
          { value: 'flattering', label: 'Yes — flattering and bright enough', quality: 3 },
          { value: 'adequate', label: 'Adequate', quality: 2 },
          { value: 'harsh', label: 'Harsh or unflattering', quality: 1 },
          { value: 'dim', label: 'Too dim', quality: 0 },
        ],
      },
      {
        id: 'bathroom_storage',
        kind: 'single',
        prompt: 'Are towels, toiletries, hooks, and storage located where guests naturally need them?',
        options: [
          { value: 'yes', label: 'Yes, right where you’d reach', quality: 3 },
          { value: 'mostly', label: 'Mostly', quality: 2 },
          { value: 'some', label: 'Some things are awkward', quality: 1 },
          { value: 'no', label: 'No', quality: 0 },
        ],
      },
      {
        id: 'shower_controls',
        kind: 'single',
        prompt: 'Are shower or bathtub controls intuitive?',
        options: [
          { value: 'obvious', label: 'Yes, obvious', quality: 3 },
          { value: 'explained', label: 'Yes, because we explain them', quality: 2 },
          { value: 'tricky', label: 'They take a moment to work out', quality: 1 },
          { value: 'confusing', label: 'Guests ask about them', quality: 0 },
        ],
      },
      {
        id: 'bathroom_surfaces',
        kind: 'single',
        prompt: 'Is there somewhere convenient to place clothing, toiletries, or a phone?',
        options: [
          { value: 'yes', label: 'Yes', quality: 3 },
          { value: 'just', label: 'Just about', quality: 1 },
          { value: 'no', label: 'No', quality: 0 },
        ],
      },
      {
        id: 'bathroom_specific',
        kind: 'text',
        prompt:
          'Is there one small detail that makes this bathroom feel specific to this property rather than generic?',
        placeholder: 'One detail is enough — this doesn’t need to become a spa.',
      },
    ],
  },

  /* 6 ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'kitchen',
    navLabel: 'Kitchen & Amenities',
    title: 'Kitchen & Amenities',
    intro:
      'What guests actually do with a space matters more than what it contains. Let’s look at how this one is really used.',
    questions: [
      {
        id: 'kitchen_uses',
        kind: 'multi',
        prompt: 'What do guests realistically use this space for?',
        helper: 'If there is no kitchen, leave this blank and the rest of the section will step aside.',
        options: [
          { value: 'coffee', label: 'Coffee or tea' },
          { value: 'breakfast', label: 'Simple breakfast' },
          { value: 'reheating', label: 'Reheating food' },
          { value: 'basic_meals', label: 'Basic meals' },
          { value: 'full_cooking', label: 'Full cooking' },
          { value: 'eating_together', label: 'Eating together' },
          { value: 'gathering', label: 'Gathering and socialising' },
          { value: 'storage', label: 'Mostly food storage' },
        ],
      },
      {
        id: 'kitchen_easy',
        kind: 'single',
        prompt: 'Does the kitchen make those activities easy?',
        showIf: { questionId: 'kitchen_uses', anyOf: ['__answered__'] },
        options: [
          { value: 'easy', label: 'Yes, everything is to hand', quality: 3 },
          { value: 'mostly', label: 'Mostly', quality: 2 },
          { value: 'workable', label: 'Workable, with some hunting', quality: 1 },
          { value: 'frustrating', label: 'It’s frustrating', quality: 0 },
        ],
      },
      {
        id: 'stored_together',
        kind: 'single',
        prompt: 'Are items that are used together stored near one another?',
        showIf: { questionId: 'kitchen_uses', anyOf: ['__answered__'] },
        options: [
          { value: 'yes', label: 'Yes, deliberately', quality: 3 },
          { value: 'mostly', label: 'Mostly', quality: 2 },
          { value: 'scattered', label: 'They’re a bit scattered', quality: 1 },
          { value: 'no', label: 'No', quality: 0 },
        ],
      },
      {
        id: 'task_lighting',
        kind: 'single',
        prompt: 'Is task lighting sufficient where guests prepare food?',
        showIf: { questionId: 'kitchen_uses', anyOf: ['__answered__'] },
        options: [
          { value: 'yes', label: 'Yes', quality: 3 },
          { value: 'adequate', label: 'Adequate', quality: 2 },
          { value: 'dim', label: 'It’s dim', quality: 0 },
        ],
      },
      {
        id: 'appliance_instructions',
        kind: 'single',
        prompt: 'If appliances require instructions, are those instructions available where they are needed?',
        showIf: { questionId: 'kitchen_uses', anyOf: ['__answered__'] },
        options: [
          { value: 'at_point', label: 'Yes, right at the appliance', quality: 3 },
          { value: 'in_guide', label: 'In the guidebook', quality: 2 },
          { value: 'ask', label: 'Guests have to ask', quality: 0 },
          { value: 'na', label: 'Nothing here needs explaining', quality: 3 },
        ],
      },
      {
        id: 'food_moment',
        kind: 'text',
        prompt: 'Is there a food or drink moment that could become part of the memory of staying here?',
        placeholder: 'Morning coffee outside, local tea, breakfast together, wine at sunset, s’mores by the fire…',
      },
      {
        id: 'amenities_designed',
        kind: 'single',
        prompt:
          'Think about your major amenities. Are they simply available, or have you designed the experience around using them?',
        options: [
          { value: 'experiences', label: 'Most feel like experiences', quality: 3 },
          { value: 'a_few', label: 'A few do', quality: 2 },
          { value: 'mostly_amenities', label: 'Mostly just amenities right now', quality: 1 },
          { value: 'not_considered', label: 'I haven’t thought about this before', quality: 0 },
        ],
      },
    ],
  },

  /* 7 ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'story',
    navLabel: 'Story & Meaning',
    title: 'Story & Meaning',
    intro:
      'The details that make a place feel specific and personal are often the ones guests remember most.',
    insight:
      'Guests remember places that feel specific. Meaning usually comes from a few thoughtful details — not from adding more décor.',
    questions: [
      {
        id: 'focal_feature',
        kind: 'text',
        prompt:
          'If guests remembered only one physical feature of this property, what would you want it to be?',
        placeholder: 'One feature.',
      },
      {
        id: 'focal_draws_attention',
        kind: 'single',
        prompt: 'Does the space naturally draw attention toward it?',
        showIf: { questionId: 'focal_feature', anyOf: ['__answered__'] },
        options: [
          { value: 'yes', label: 'Yes — everything points at it', quality: 3 },
          { value: 'somewhat', label: 'Somewhat', quality: 1 },
          { value: 'no', label: 'No, you’d have to find it', quality: 0 },
        ],
      },
      {
        id: 'focal_experienced',
        kind: 'single',
        prompt: 'Can guests experience that feature rather than simply look at it?',
        helper:
          'A view becomes a moment when there’s somewhere comfortable to sit. A fire pit becomes an experience when seating, blankets or s’mores invite people to stay.',
        showIf: { questionId: 'focal_feature', anyOf: ['__answered__'] },
        options: [
          { value: 'designed', label: 'Yes — we’ve designed for that', quality: 3 },
          { value: 'possible', label: 'They could, if they thought of it', quality: 1 },
          { value: 'look_only', label: 'It’s mostly something to look at', quality: 0 },
        ],
      },
      {
        id: 'tells_about_place',
        kind: 'multi',
        prompt: 'Is there anything here that tells guests something about this specific place?',
        options: [
          { value: 'hosts', label: 'The hosts' },
          { value: 'history', label: 'The history of the property' },
          { value: 'building', label: 'The building' },
          { value: 'neighborhood', label: 'The neighbourhood' },
          { value: 'culture', label: 'Local culture' },
          { value: 'makers', label: 'Local artists or makers' },
          { value: 'landscape', label: 'The landscape' },
          { value: 'nature', label: 'Nature' },
          { value: 'why_exists', label: 'Why this property exists' },
          { value: 'not_yet', label: 'Not really yet' },
        ],
        compass: 'story',
      },
      {
        id: 'uncopyable',
        kind: 'single',
        prompt: 'Is there at least one detail here that could not simply be copied from another vacation rental?',
        options: [
          { value: 'several', label: 'Several', quality: 3 },
          { value: 'one', label: 'One', quality: 2 },
          { value: 'not_yet', label: 'Not yet, but I’d like there to be', quality: 1 },
          { value: 'no', label: 'Not really', quality: 0 },
        ],
      },
      {
        id: 'filler_objects',
        kind: 'single',
        prompt:
          'Are there decorative objects or furnishings that may simply be filling space rather than adding meaning?',
        options: [
          { value: 'several', label: 'Yes, several', quality: 0 },
          { value: 'a_few', label: 'A few', quality: 1 },
          { value: 'no', label: 'No — everything is here for a reason', quality: 3 },
          UNSURE,
        ],
      },
      {
        id: 'listing_matches',
        kind: 'single',
        prompt: 'Does the actual property look and feel like the story told by the listing?',
        options: [
          { value: 'yes', label: 'Yes', quality: 3 },
          { value: 'mostly', label: 'Mostly', quality: 2 },
          { value: 'gap', label: 'There’s a gap', quality: 0 },
        ],
      },
      {
        id: 'negative_surprise',
        kind: 'multi',
        prompt: 'Is anything about the real stay likely to surprise guests negatively?',
        helper: 'Choose anything that applies. Nothing here is a failure — it’s what the Audit is for.',
        options: [
          { value: 'smaller', label: 'Smaller than expected' },
          { value: 'darker', label: 'Darker' },
          { value: 'louder', label: 'Louder' },
          { value: 'farther', label: 'Farther away' },
          { value: 'less_private', label: 'Less private' },
          { value: 'older', label: 'Older' },
          { value: 'different', label: 'Different than expected' },
          { value: 'none', label: 'Nothing comes to mind' },
        ],
      },
      {
        id: 'undersold',
        kind: 'single',
        prompt: 'Is there something wonderful about the property that the listing currently undersells?',
        options: [
          { value: 'yes', label: 'Yes', quality: 0 },
          { value: 'no', label: 'No, the listing does it justice', quality: 3 },
          UNSURE,
        ],
      },
      {
        id: 'undersold_what',
        kind: 'text',
        prompt: 'What is it?',
        showIf: { questionId: 'undersold', anyOf: ['yes'] },
        placeholder: 'The thing guests only discover once they arrive…',
      },
    ],
  },

  /* 8 ─────────────────────────────────────────────────────────────────────── */
  {
    id: 'transformation',
    navLabel: 'Guest Transformation',
    title: 'The Guest Transformation',
    intro:
      'Finally, let’s look at the big picture — the change you hope guests experience from arrival to departure.',
    questions: [
      {
        id: 'arrive_feeling',
        kind: 'pills',
        prompt: 'How do guests usually feel when they arrive?',
        helper: 'Choose up to three.',
        max: 3,
        options: [
          { value: 'tired', label: 'Tired' },
          { value: 'stressed', label: 'Stressed' },
          { value: 'excited', label: 'Excited' },
          { value: 'curious', label: 'Curious' },
          { value: 'rushed', label: 'Rushed' },
          { value: 'disconnected', label: 'Disconnected' },
          { value: 'celebratory', label: 'Celebratory' },
          { value: 'overstimulated', label: 'Overstimulated' },
          { value: 'ready_explore', label: 'Ready to explore' },
          { value: 'ready_rest', label: 'Ready to rest' },
          { value: 'something_else', label: 'Something else' },
        ],
        compass: 'transformation_arrive',
      },
      {
        id: 'leave_feeling',
        kind: 'pills',
        prompt: 'How do you want guests to feel when they leave?',
        helper: 'Choose up to three.',
        max: 3,
        options: [
          { value: 'rested', label: 'Rested' },
          { value: 'connected', label: 'Connected' },
          { value: 'cared_for', label: 'Cared for' },
          { value: 'inspired', label: 'Inspired' },
          { value: 'grounded', label: 'Grounded' },
          { value: 'energized', label: 'Energized' },
          { value: 'peaceful', label: 'Peaceful' },
          { value: 'delighted', label: 'Delighted' },
          { value: 'curious', label: 'Curious' },
          { value: 'reconnected', label: 'Reconnected' },
          { value: 'something_else', label: 'Something else' },
        ],
        compass: 'transformation_leave',
      },
      {
        id: 'what_creates_change',
        kind: 'textarea',
        prompt: 'What happens during the stay that creates that change?',
        placeholder: 'Tell us what you think makes the biggest difference…',
        compass: 'purpose',
      },
      {
        id: 'biggest_friction',
        kind: 'text',
        prompt: 'What is currently the biggest friction point in the guest experience?',
        placeholder: 'The one you already know about.',
      },
      {
        id: 'does_better',
        kind: 'text',
        prompt: 'What does your property do better than most other places a guest could stay?',
        placeholder: 'The thing that’s genuinely yours.',
        compass: 'signature_memory',
      },
      {
        id: 'where_to_begin',
        kind: 'single',
        prompt: 'If you could improve just one part of the guest experience right now, where would you begin?',
        options: [
          { value: 'arrival', label: 'Arrival' },
          { value: 'comfort', label: 'Comfort' },
          { value: 'sleep', label: 'Sleep' },
          { value: 'lighting', label: 'Lighting' },
          { value: 'layout', label: 'Layout & flow' },
          { value: 'bathroom', label: 'Bathroom' },
          { value: 'kitchen', label: 'Kitchen / food & drink' },
          { value: 'outdoor', label: 'Outdoor experience' },
          { value: 'amenities', label: 'Amenities' },
          { value: 'story', label: 'Story & personality' },
          { value: 'communication', label: 'Instructions / communication' },
          { value: 'something_else', label: 'Something else' },
          { value: 'help_decide', label: 'I’m not sure — help me decide' },
        ],
      },
    ],
  },
]

/* ── Helpers shared by the client and the API route ───────────────────────── */

export type AuditAnswers = Record<string, string | string[] | undefined>

/** A text answer counts as answered when it isn't blank. */
function isAnswered(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Should this question be shown, given what's been answered so far?
 * `__answered__` means "whenever the other question has any answer".
 */
export function isVisible(question: AuditQuestion, answers: AuditAnswers): boolean {
  if (!question.showIf) return true
  const value = answers[question.showIf.questionId]
  if (question.showIf.anyOf.includes('__answered__')) return isAnswered(value)
  if (Array.isArray(value)) return value.some((v) => question.showIf!.anyOf.includes(v))
  return typeof value === 'string' && question.showIf.anyOf.includes(value)
}

/** The questions actually on screen for a step, after conditional rules. */
export function visibleQuestions(step: AuditStep, answers: AuditAnswers): AuditQuestion[] {
  return step.questions.filter((q) => isVisible(q, answers))
}

/** How many visible questions in this step have an answer. */
export function stepProgress(step: AuditStep, answers: AuditAnswers): { answered: number; total: number } {
  const visible = visibleQuestions(step, answers)
  return {
    answered: visible.filter((q) => isAnswered(answers[q.id])).length,
    total: visible.length,
  }
}

/**
 * A 0–100 score, kept for the existing `audits.score` column and anything
 * downstream that reads it. Built only from answers that carry a `quality`,
 * so a host never sees a 1–5 scale but the number still means something.
 */
export function scoreFromAnswers(answers: AuditAnswers): number {
  let earned = 0
  let possible = 0
  for (const step of AUDIT_STEPS) {
    for (const question of step.questions) {
      if (!isVisible(question, answers)) continue
      const value = answers[question.id]
      if (typeof value !== 'string') continue
      const option = question.options?.find((o) => o.value === value)
      if (option?.quality === undefined) continue
      earned += option.quality
      possible += 3
    }
  }
  return possible === 0 ? 0 : Math.round((earned / possible) * 100)
}

/** Look up the human label for a stored value, for summaries and the Compass. */
export function labelFor(questionId: string, value: string): string {
  for (const step of AUDIT_STEPS) {
    const q = step.questions.find((question) => question.id === questionId)
    if (q) return q.options?.find((o) => o.value === value)?.label ?? value
  }
  return value
}

/** Every question, flattened — used by the API route when mapping answers. */
export function allQuestions(): AuditQuestion[] {
  return AUDIT_STEPS.flatMap((s) => s.questions)
}
