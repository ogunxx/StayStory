'use client'

import { useRouter } from 'next/navigation'
import { ACTIVE_PROPERTY_COOKIE } from '@/lib/config'
import type { Property } from '@/lib/properties'

// Shown in the header only when the user can access more than one property
// (Portfolio plans + co-hosts). Switching sets the active-property cookie and
// refreshes so server components and tool writes pick up the new selection.
export function PropertySwitcher({
  properties,
  activeId,
}: {
  properties: Property[]
  activeId: string | null
}) {
  const router = useRouter()

  function onChange(id: string) {
    document.cookie = `${ACTIVE_PROPERTY_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`
    router.refresh()
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Active property</span>
      <select
        value={activeId ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-sm text-foreground max-w-[14rem] focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {properties.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
            {p.is_owner ? '' : ' (co-host)'}
          </option>
        ))}
      </select>
    </label>
  )
}
