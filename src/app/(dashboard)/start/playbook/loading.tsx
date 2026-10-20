/**
 * Streams while the saved Starter Playbook is read.
 *
 * Reading is fast — the page never generates — so this is a brief shape
 * rather than an explanation. The slow path (actually building one) has its
 * own in-place state on the button, which is where the host is looking.
 */
export default function Loading() {
  return (
    <div className="flex max-w-3xl animate-pulse flex-col gap-8" aria-busy="true">
      <div className="flex flex-col gap-3">
        <div className="h-3 w-40 rounded bg-secondary" />
        <div className="h-9 w-80 max-w-full rounded bg-secondary" />
        <div className="h-4 w-full max-w-xl rounded bg-secondary/70" />
      </div>
      <div className="h-28 rounded-2xl bg-secondary/50" />
      <div className="flex flex-col gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-secondary/40" />
        ))}
      </div>
    </div>
  )
}
