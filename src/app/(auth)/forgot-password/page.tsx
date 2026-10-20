'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Ask for a password reset link.
 *
 * Until now there was no way back into an account whose password had been
 * forgotten — the only route was to create a second one.
 *
 * The confirmation is deliberately the same whether or not an account exists
 * for that address. Saying "no account with that email" would turn this form
 * into a way to find out who has signed up, one guess at a time. The person
 * who owns the address learns everything they need from their inbox.
 */

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    // The callback exchanges the code for a session and then sends them on to
    // the page where the new password is set. `next` is a short key, never a
    // path, so nothing in the URL can redirect anyone somewhere unexpected.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=reset`,
    })

    // Whatever came back, say the same thing. An error here is usually "no
    // such user", and reporting it would answer a question we don't want this
    // form answering.
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background text-center">
        <Link href="/" className="text-xl font-serif font-semibold mb-10 text-foreground">
          StayStory
        </Link>
        <h1 className="text-2xl font-serif font-semibold mb-3 text-foreground">Check your email</h1>
        <p className="text-muted-foreground max-w-sm">
          If there is a StayStory account for <strong>{email}</strong>, a link to set a new
          password is on its way.
        </p>

        <div className="mt-8 w-full max-w-sm rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-left">
          <p className="text-sm font-semibold text-foreground">Not in your inbox?</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Give it a minute, then check your spam or junk folder &mdash; these emails
            sometimes end up there. The link is only good for a short while, so open it
            when you find it.
          </p>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          <Link href="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <Link href="/" className="text-xl font-serif font-semibold mb-10 text-foreground">
        StayStory
      </Link>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-serif font-semibold mb-1 text-foreground">
          Reset your password
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground mb-8">
          Tell us the email you signed up with and we&apos;ll send you a link to set a new
          password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending…' : 'Send me a reset link'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Remembered it?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
