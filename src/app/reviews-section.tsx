'use client'

import { useState } from 'react'

interface Review {
  quote: string
  author: string
  detail: string
}

const INITIAL_COUNT = 8

export function ReviewsSection({ reviews, rating, reviewCount, airbnbUrl }: {
  reviews: Review[]
  rating: string
  reviewCount: string
  airbnbUrl: string
}) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? reviews : reviews.slice(0, INITIAL_COUNT)

  return (
    <section className="bg-card border-y border-border py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">What guests say</p>
            <h2 className="text-3xl font-serif font-semibold text-foreground">The word they use most is <em>love.</em></h2>
          </div>
          <a
            href={airbnbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline shrink-0 pb-1"
          >
            {rating}★ · {reviewCount} reviews on Airbnb ↗
          </a>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {displayed.map((r) => (
            <div key={r.author + r.detail} className="bg-background rounded-2xl p-6 flex flex-col gap-4 border border-border">
              <p className="text-sm text-foreground leading-relaxed italic flex-1">"{r.quote}"</p>
              <div>
                <p className="text-sm font-semibold text-foreground">{r.author}</p>
                <p className="text-xs text-muted-foreground">{r.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {!showAll && reviews.length > INITIAL_COUNT && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="text-sm font-medium text-primary hover:underline"
            >
              See more reviews ↓
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
