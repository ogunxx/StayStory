export type SubscriptionTier = 'free' | 'host' | 'signature' | 'legend' | 'legendary' | 'portfolio'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  tier: SubscriptionTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

export interface Property {
  id: string
  user_id: string
  name: string
  type: 'rv' | 'cabin' | 'house' | 'apartment' | 'tiny_house' | 'wellness' | 'other'
  description: string | null
  created_at: string
}

export type CompassStatus = 'preliminary' | 'developing' | 'confirmed' | 'evolving'

export type CompassField =
  | 'wonder'
  | 'purpose'
  | 'story'
  | 'transformation_arrive'
  | 'transformation_leave'
  | 'hospitality_promise'
  | 'signature_memory'
  | 'story_theyll_tell'

export interface CompassFieldProvenance {
  source_module: string
  contribution_id: string
  updated_at: string
}

export interface ExperienceCompass {
  id: string
  user_id: string
  property_id: string | null
  status: CompassStatus
  wonder: string | null
  purpose: string | null
  story: string | null
  transformation_arrive: string | null
  transformation_leave: string | null
  hospitality_promise: string | null
  signature_memory: string | null
  story_theyll_tell: string | null
  field_provenance: Partial<Record<CompassField, CompassFieldProvenance>>
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

export interface CompassContribution {
  id: string
  compass_id: string
  user_id: string
  property_id: string | null
  field: CompassField
  suggested_value: string
  source_module: string
  source_ref: Record<string, unknown> | null
  rationale: string | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  reviewed_at: string | null
}

export interface Guest {
  id: string
  user_id: string
  property_id: string | null
  name: string | null
  arrival_date: string | null
  why_visiting: string | null
  host_notes: string | null
  occasion: string | null
  emotional_state: string | null
  has_kids: boolean
  has_pets: boolean
  interests: string | null
  budget: 'zero' | 'under_10' | 'under_25' | 'premium'
  created_at: string
}

export interface Suggestion {
  id: string
  guest_id: string
  user_id: string
  level: 1 | 2 | 3 | 4
  content: SuggestionContent
  created_at: string
}

export interface SuggestionContent {
  principle: string
  why_it_matters: string
  gestures: {
    zero: string
    under_10: string
    under_25: string
    premium: string
  }
  touchpoint_focus: string
  setup_plan: string[]
  shopping_list: string[]
  messages: {
    pre_arrival: string
    welcome_note: string
    follow_up: string
  }
  expected_guest_impact: string
  story_it_reinforces: string
  dont_overdo_it: string
}

export interface Audit {
  id: string
  user_id: string
  property_id: string | null
  responses: AuditResponses
  score: number
  created_at: string
}

export interface AuditResponses {
  stayed_yourself: boolean | null
  arrival_rating: number | null
  lighting_rating: number | null
  temperature_rating: number | null
  sleep_rating: number | null
  bathroom_rating: number | null
  kitchen_rating: number | null
  layout_rating: number | null
  sound_smell_rating: number | null
  instructions_rating: number | null
  transformation_arrive: string | null
  transformation_leave: string | null
  pain_points: string | null
  one_thing: string | null
}

export interface GuestStory {
  id: string
  guest_id: string
  user_id: string
  narrative: string
  host_perspective: string
  social_caption: string
  pre_arrival_message: string
  listing_improvements: string
  created_at: string
}

export interface GeneratorFormData {
  guestName: string
  whyVisiting: string
  hostNotes: string
  occasion: string
  emotionalState: string
  hasKids: boolean
  hasPets: boolean
  interests: string
  budget: Guest['budget']
}
