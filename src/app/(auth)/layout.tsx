import { CLARITY_MASK } from '@/lib/analytics'

/**
 * Hides everything on the sign-in, sign-up, forgot-password and
 * reset-password pages from session recordings.
 *
 * These four pages are nothing but credentials: two password fields on the
 * reset page alone, an email on every one of them, and a name at signup. None
 * of it should ever reach a recording, so the guarantee is made here in code
 * rather than left to Clarity's dashboard default.
 *
 * A layout rather than an attribute on each page, for two reasons. Each of
 * these pages has several return branches — a sent-link confirmation, an
 * expired-link notice, a success state — and some of them display the address
 * that was just typed in; covering them one by one would mean six or seven
 * edits and would miss the next branch somebody adds. And the pages
 * themselves are auth implementation, which this task is not permitted to
 * touch: this adds a wrapper around them without altering a line.
 *
 * The flex classes reproduce exactly what each page had as a direct child of
 * <body> (which is `min-h-full flex flex-col`), so nothing moves.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-clarity-mask={CLARITY_MASK} className="flex flex-1 flex-col">
      {children}
    </div>
  )
}
