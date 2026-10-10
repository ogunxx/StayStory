'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isDisposableEmail } from '@/lib/disposable-domains'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FOCUSED_FREE_LAUNCH, LEGENDARY_PRICE } from '@/lib/config'

function SignupForm() {
  const searchParams = useSearchParams()
  const isLegendary = searchParams.get('plan') === 'legendary'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isDisposableEmail(email)) {
      setError('Please use a permanent email address. Disposable email addresses are not allowed.')
      setLoading(false)
      return
    }

    try {
      const check = await fetch('/api/auth/check-signup', { method: 'POST' })
      const checkData = await check.json()
      if (!checkData.allowed) {
        setError(checkData.error ?? 'An account already exists from this device.')
        setLoading(false)
        return
      }
    } catch {
      // If check fails, allow signup to proceed
    }

    const callbackUrl = isLegendary
      ? `${window.location.origin}/api/auth/callback?plan=legendary`
      : `${window.location.origin}/api/auth/callback`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: callbackUrl,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    fetch('/api/auth/record-signup', { method: 'POST' }).catch(() => {})

    // When the project doesn't require email confirmation, signUp hands back a
    // live session — the account already works, so telling someone to check
    // their inbox would leave them waiting for an email that never comes. Go
    // where the confirmation link would have taken them instead.
    if (data.session) {
      router.push(isLegendary ? '/pricing' : '/dashboard')
      router.refresh()
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background text-center">
        <Link href="/" className="text-xl font-serif font-semibold mb-10 text-foreground">
          StayStory
        </Link>
        <h1 className="text-2xl font-serif font-semibold mb-3 text-foreground">Check your email</h1>
        <p className="text-muted-foreground max-w-sm">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        {isLegendary && (
          <p className="text-sm text-primary mt-4 max-w-sm">
            After verifying, you'll be taken straight to checkout to complete your Legendary subscription.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <Link href="/" className="text-xl font-serif font-semibold mb-10 text-foreground">
        StayStory
      </Link>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-serif font-semibold mb-1 text-foreground">Create your account</h1>

        {isLegendary ? (
          <div className="mt-2 mb-6 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Starting with Legendary — {LEGENDARY_PRICE}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create your account, verify your email, then complete payment. The whole system, unlimited.
            </p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground mb-8">
            Start with your Experience Audit. From there, StayStory will help you shape your
            Experience Compass, uncover three personalized opportunities, and turn those insights
            into a Starter Playbook. Free to start, no card needed.
          </p>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              required
            />
          </div>
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? 'Creating account…'
              : isLegendary
                ? 'Create account & continue to payment →'
                : 'Create account & start my Audit →'}
          </Button>
        </form>

        {/* The only link in the app that led to the paid signup screen. While
            the focused journey is the free starting point, offering checkout
            to someone who has not yet run an Audit contradicts the page they
            arrived from. The route still exists and still works — see
            FOCUSED_FREE_LAUNCH. */}
        {!isLegendary && !FOCUSED_FREE_LAUNCH && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Want Legendary from the start?{' '}
            <Link href="/signup?plan=legendary" className="text-primary hover:underline">
              Sign up as Legendary →
            </Link>
          </p>
        )}

        <p className="text-sm text-muted-foreground text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
