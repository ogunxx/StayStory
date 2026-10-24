'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { failureFromParams } from '@/lib/auth-redirects'
import { checkPwnedPassword } from '@/lib/pwned-password'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Set a new password, having arrived from a reset link.
 *
 * The link goes to /api/auth/callback, which exchanges the code for a session
 * and sends the visitor here. So by the time this page loads there is already
 * a session — that session is the proof they can read the inbox, and it is
 * what lets updateUser change the password.
 *
 * Which also means the first thing to do is check there is one. Reaching this
 * page without a session means the link expired, was already used, or was
 * opened in a different browser from the one that asked for it. That gets its
 * own answer rather than a form that cannot work.
 *
 * The breached-password check runs here too. This is the second of the two
 * places a password is ever set, and a reset is exactly when someone reaches
 * for a password they already use elsewhere.
 */

type Status = 'checking' | 'ready' | 'no_session' | 'done'

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<Status>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    let cancelled = false

    async function resolveStatus(): Promise<Status> {
      // Supabase reports a dead link in the URL fragment on some paths, and
      // a fragment never reaches the server — so the callback could not have
      // seen it, and this is the only place it can be read.
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const fromHash = failureFromParams({
        error: hash.get('error'),
        errorCode: hash.get('error_code'),
      })
      if (fromHash) return 'no_session'

      const { data } = await createClient().auth.getUser()
      return data.user ? 'ready' : 'no_session'
    }

    // One write, from a callback, after everything is known — rather than
    // setting state part-way through and rendering a state nobody is in.
    resolveStatus().then((next) => {
      if (!cancelled) setStatus(next)
    })

    return () => {
      cancelled = true
    }
  }, [])

  // Move focus to the heading whenever the page changes what it is saying, so
  // a screen reader announces the new state instead of leaving someone on a
  // button that has gone.
  useEffect(() => {
    if (status === 'no_session' || status === 'done') headingRef.current?.focus()
  }, [status])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Those two passwords do not match.')
      return
    }

    setSaving(true)

    // Same guard as signup. Fails open — see pwned-password.ts.
    const breached = await checkPwnedPassword(password)
    if (breached.pwned) {
      setError(
        'This password has appeared in a known data breach, which means it is already on the lists attackers try first. Please choose a different one.'
      )
      setSaving(false)
      return
    }

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      // Supabase's own wording goes to the console, not onto the page. Some
      // of it names internals, and none of it tells the person what to do.
      console.error('Password update failed:', updateError.message)
      // A session that has gone between loading this page and submitting it
      // is the one case worth a different answer, because the form cannot
      // succeed however many times it is tried.
      if (/session|jwt|token/i.test(updateError.message)) {
        setStatus('no_session')
        return
      }
      setError('We could not save that password. Please try again in a moment.')
      setSaving(false)
      return
    }

    setStatus('done')
    router.refresh()
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <p className="text-sm text-muted-foreground">Checking your link…</p>
      </div>
    )
  }

  if (status === 'no_session') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background text-center">
        <Link href="/" className="text-xl font-serif font-semibold mb-10 text-foreground">
          StayStory
        </Link>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-serif font-semibold mb-3 text-foreground outline-none"
        >
          That link has run out
        </h1>
        <p className="text-muted-foreground max-w-sm leading-relaxed">
          Reset links are good for a short while, and only in the browser that asked for
          them. Ask for a fresh one and it will work.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 text-sm font-medium text-primary underline underline-offset-4"
        >
          Send me a new link →
        </Link>
      </div>
    )
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background text-center">
        <Link href="/" className="text-xl font-serif font-semibold mb-10 text-foreground">
          StayStory
        </Link>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-serif font-semibold mb-3 text-foreground outline-none"
        >
          Your new password is saved
        </h1>
        <p className="text-muted-foreground max-w-sm">
          You&apos;re signed in and ready to pick up where you left off.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 text-sm font-medium text-primary underline underline-offset-4"
        >
          Continue →
        </Link>
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
          Choose a new password
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground mb-8">
          Once it&apos;s saved you&apos;ll be signed in, and we&apos;ll take you straight
          back to your work.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it once more"
              minLength={8}
              required
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Saving…' : 'Save new password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
