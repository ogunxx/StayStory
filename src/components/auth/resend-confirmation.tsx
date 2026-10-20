'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Send the confirmation email again.
 *
 * Until now the only way out of "I never got the email" was to sign up a
 * second time, which fails once the account exists and leaves the host
 * stranded. This is the way out.
 *
 * It appears in two places — under the "check your email" screen after
 * signing up, and on /login when Supabase says the account was never
 * confirmed. In both, the account is known to exist and to be unconfirmed,
 * so offering this reveals nothing that the person in front of it does not
 * already know.
 *
 * The cooldown is not security. Supabase rate-limits these server-side
 * regardless; the countdown exists so the limit is visible as a number
 * ticking down rather than as a button that silently stops working.
 */

const COOLDOWN_SECONDS = 45

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string }

/**
 * Supabase expresses its own rate limit as prose, with the wait baked into
 * the sentence. Rather than show that, we recognise it and keep our wording.
 */
function isRateLimited(error: { status?: number; code?: string; message: string }): boolean {
  return (
    error.status === 429 ||
    error.code === 'over_email_send_rate_limit' ||
    /only request this after|rate limit|too many/i.test(error.message)
  )
}

export function ResendConfirmation({ email }: { email: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [cooldown, setCooldown] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function resend() {
    setState({ kind: 'sending' })

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      // Same destination as the original link, so a resent email behaves
      // exactly like the first one.
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    })

    if (error) {
      setState({
        kind: 'error',
        message: isRateLimited(error)
          ? 'We have sent one recently. Give it a minute before asking for another.'
          : 'That did not send. Try again in a moment.',
      })
      // A rate limit means one is already in flight, so hold the button too.
      if (isRateLimited(error)) setCooldown(COOLDOWN_SECONDS)
      return
    }

    setState({ kind: 'sent' })
    setCooldown(COOLDOWN_SECONDS)
  }

  const waiting = cooldown > 0
  const busy = state.kind === 'sending'

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={resend}
        disabled={busy || waiting}
        className="text-sm font-medium text-primary underline underline-offset-4 disabled:no-underline disabled:text-muted-foreground disabled:cursor-not-allowed"
      >
        {busy
          ? 'Sending…'
          : waiting
            ? `You can send another in ${cooldown}s`
            : 'Send the email again'}
      </button>

      {/* Spoken to assistive tech as it changes, so the outcome isn't
          something you have to be looking at the button to notice. */}
      <p aria-live="polite" className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {state.kind === 'sent' && 'Sent. It should arrive shortly.'}
        {state.kind === 'error' && state.message}
      </p>
    </div>
  )
}
