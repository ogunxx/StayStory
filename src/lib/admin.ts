import { createClient } from '@supabase/supabase-js'

// Comma-separated allowlist of admin emails, e.g. "you@example.com,partner@example.com".
// Kept as an env var (not hardcoded) so it can change without a code deploy.
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const allowlist = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return allowlist.includes(email.toLowerCase())
}

/**
 * Service-role client that bypasses RLS — only ever call this after
 * isAdminEmail() has already gated the caller. Never exposed to the browser.
 */
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function logAdminAction(input: {
  adminUserId: string
  targetUserId: string
  action: 'tier_change' | 'suspend' | 'reactivate'
  previousValue?: string | null
  newValue?: string | null
}): Promise<void> {
  try {
    const admin = getAdminClient()
    await admin.from('admin_actions').insert({
      admin_user_id: input.adminUserId,
      target_user_id: input.targetUserId,
      action: input.action,
      previous_value: input.previousValue ?? null,
      new_value: input.newValue ?? null,
    })
  } catch (err) {
    // The audit log is best-effort — it must never block the actual admin action.
    console.error('[admin] logAdminAction failed:', err)
  }
}
