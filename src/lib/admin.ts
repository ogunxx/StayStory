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
