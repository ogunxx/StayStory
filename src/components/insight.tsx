export function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-primary/40 pl-4 py-0.5">
      <p className="text-sm text-muted-foreground leading-relaxed italic">{children}</p>
    </div>
  )
}
