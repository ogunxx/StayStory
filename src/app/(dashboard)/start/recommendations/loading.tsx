/** Streamed while the server reads the Audit and Compass and generates. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      <p className="text-sm text-muted-foreground">Reading back through what you told us…</p>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-44 animate-pulse rounded-2xl border border-border bg-muted/40"
        />
      ))}
    </div>
  )
}
