import { createClient } from '@/lib/supabase/server'
import { anthropic } from '@/lib/anthropic'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message } = await request.json()
  if (!message?.trim()) return NextResponse.json({ error: 'No message provided' }, { status: 400 })

  const prompt = `Analyze this vacation rental guest message and extract structured information to help the host create a personalized hospitality experience.

GUEST MESSAGE:
${message}

Extract only what is clearly mentioned. Return null for anything not stated. Return JSON only:
{
  "guestName": "First name if mentioned, else null",
  "whyVisiting": "Their purpose or reason for the trip in 1-2 clear sentences",
  "occasion": "Special occasion if mentioned (anniversary, birthday, honeymoon, etc.) else null",
  "emotionalState": "How they seem — excited, stressed, reconnecting, celebrating, grieving, etc. Use intuition from tone.",
  "hasKids": true or false,
  "hasPets": true or false,
  "interests": "Hobbies, preferences, food loves, activities mentioned — comma separated — else null",
  "hostNotes": "Any other personal detail useful for creating a hospitality moment"
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: 'You extract structured guest information from vacation rental messages. Respond with valid JSON only, no markdown.',
      messages: [{ role: 'user', content: prompt }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const start = text.indexOf('{'), end = text.lastIndexOf('}')
    const result = JSON.parse(start !== -1 ? text.slice(start, end + 1) : text)
    return NextResponse.json({ result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
