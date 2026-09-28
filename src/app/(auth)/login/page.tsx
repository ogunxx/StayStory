'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * What a confirmation link that didn't work should say. The callback route
 * sends only the key, so the wording lives here rather than in a URL.
 */
const NOTICES: Record<string, { title: string; body: string }> = {
  link_expired: {
    title: 'That confirmation link has expired',
    body: 'Links are only good for a short while. If your account is already active you can sign in below — otherwise create it again and we’ll send a fresh link.',
  },
  link_invalid: {
    title: 'We couldn’t confirm that link',
    body: 'Confirmation links only work in the same browser you signed up in. Try opening it there, or sign up again for a new one.',
  },
}

function LoginForm() {
  const searchParams = useSearchParams()
  const notice = NOTICES[searchParams.get('notice') ?? '']

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <Link href="/" className="text-xl font-serif font-semibold mb-10 text-foreground">
        StayStory
      </Link>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-serif font-semibold mb-1 text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-8">Sign in to your account</p>

        {notice && (
          <div className="mb-8 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{notice.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notice.body}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
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
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          No account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
