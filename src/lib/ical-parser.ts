export interface CalendarEvent {
  uid: string
  summary: string
  start: Date
  end: Date
  nights: number
  guestName?: string
  adults?: number
  children?: number
  pets?: number
  bookingCode?: string
}

function unfoldLines(raw: string): string[] {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '')
    .split('\n')
}

function parseDate(value: string): Date {
  const clean = value.replace(/TZID=[^:]+:/, '').replace('Z', '').split('T')[0]
  const year = parseInt(clean.slice(0, 4))
  const month = parseInt(clean.slice(4, 6)) - 1
  const day = parseInt(clean.slice(6, 8))
  return new Date(Date.UTC(year, month, day))
}

export function parseIcal(icsContent: string): CalendarEvent[] {
  const lines = unfoldLines(icsContent)
  const events: CalendarEvent[] = []
  let inEvent = false
  let raw: Record<string, string> = {}

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      raw = {}
    } else if (line === 'END:VEVENT') {
      if (raw.DTSTART && raw.DTEND) {
        const start = parseDate(raw.DTSTART)
        const end = parseDate(raw.DTEND)
        const nights = Math.round((end.getTime() - start.getTime()) / 86400000)
        const desc = (raw.DESCRIPTION ?? '').replace(/\\n/g, '\n').replace(/\\,/g, ',')

        events.push({
          uid: raw.UID ?? '',
          summary: raw.SUMMARY ?? 'Booking',
          start,
          end,
          nights,
          guestName: desc.match(/(?:GUEST|NAME):\s*(.+)/i)?.[1].trim(),
          adults: desc.match(/ADULTS?:\s*(\d+)/i) ? parseInt(desc.match(/ADULTS?:\s*(\d+)/i)![1]) : undefined,
          children: desc.match(/CHILDREN?:\s*(\d+)/i) ? parseInt(desc.match(/CHILDREN?:\s*(\d+)/i)![1]) : undefined,
          pets: desc.match(/PETS?:\s*(\d+)/i) ? parseInt(desc.match(/PETS?:\s*(\d+)/i)![1]) : undefined,
          bookingCode: desc.match(/(?:BOOKING|CONFIRMATION)\s*CODE:\s*(\S+)/i)?.[1].trim(),
        })
      }
      inEvent = false
    } else if (inEvent) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).split(';')[0]
      raw[key] = line.slice(idx + 1)
    }
  }

  const now = new Date()
  return events
    .filter(e => e.end >= now)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}
