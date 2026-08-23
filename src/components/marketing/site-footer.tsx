/** Shared marketing footer, so every public page ends the same way. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} StayStory · Built by Ogun &amp; Evie ·{' '}
      <a
        href="https://laurelandlore.com"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-foreground"
      >
        laurelandlore.com
      </a>
    </footer>
  )
}
