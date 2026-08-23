'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Editor for the figures the marketing site states publicly.
 *
 * The homepage reads these from site_config in one place, so saving here
 * updates the Proof section, the final CTA line, and the founder story at the
 * same time. Nothing on the site hardcodes these numbers.
 */
export function SiteFigures({
  initialRating,
  initialReviews,
}: {
  initialRating: string
  initialReviews: string
}) {
  const [rating, setRating] = useState(initialRating)
  const [reviews, setReviews] = useState(initialReviews)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; message: string } | null>(null)

  const dirty = rating !== initialRating || reviews !== initialReviews

  async function save() {
    setSaving(true)
    setStatus(null)
    try {
      const res = await fetch('/api/admin/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ airbnb_rating: rating, airbnb_review_count: reviews }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save')
      setStatus({ kind: 'ok', message: 'Saved. The homepage will show the new figures.' })
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif text-lg font-semibold text-foreground">Guest review figures</h2>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
        The rating and review count the homepage states publicly. Both appear in the proof
        section, the closing call to action, and the founder story — updating them here
        changes all three at once. Keep them matching the live Airbnb listing.
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="airbnb_rating">Rating</Label>
          <Input
            id="airbnb_rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            inputMode="decimal"
            placeholder="4.99"
            className="w-28"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="airbnb_review_count">Review count</Label>
          <Input
            id="airbnb_review_count"
            value={reviews}
            onChange={(e) => setReviews(e.target.value)}
            inputMode="numeric"
            placeholder="153"
            className="w-32"
          />
        </div>
        <Button onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save figures'}
        </Button>
      </div>

      {status && (
        <p
          className={`mt-3 text-sm ${status.kind === 'ok' ? 'text-primary' : 'text-destructive'}`}
        >
          {status.message}
        </p>
      )}
    </div>
  )
}
