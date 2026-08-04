'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import type { SubscriptionTier } from '@/types'

const ASSIGNABLE_TIERS: SubscriptionTier[] = ['free', 'legendary', 'portfolio']

type Member = {
  id: string
  email: string
  full_name: string | null
  tier: SubscriptionTier
  created_at: string
  suspended_at: string | null
  counts: {
    audits: number
    moments: number
    stories: number
    blueprints: number
    playbooks: number
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminMembersTable({
  initialMembers,
  currentAdminEmail,
}: {
  initialMembers: Member[]
  currentAdminEmail: string
}) {
  const [members, setMembers] = useState(initialMembers)

  function replaceMember(updated: Member) {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold">Members</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {members.length} accounts. Tier changes and suspensions are manual overrides — they don&apos;t touch
          Stripe billing directly, and every action here is logged.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Tier</th>
              <th className="pb-2 pr-4">Signed up</th>
              <th className="pb-2 pr-4">Audits</th>
              <th className="pb-2 pr-4">Moments</th>
              <th className="pb-2 pr-4">Stories</th>
              <th className="pb-2 pr-4">Blueprints</th>
              <th className="pb-2 pr-4">Playbooks</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <MemberRow key={m.id} member={m} isSelf={m.email === currentAdminEmail} onUpdated={replaceMember} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MemberRow({
  member,
  isSelf,
  onUpdated,
}: {
  member: Member
  isSelf: boolean
  onUpdated: (m: Member) => void
}) {
  const [editingTier, setEditingTier] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function changeTier(newTier: SubscriptionTier) {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/update-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: member.id, newTier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      onUpdated(data.member)
      setEditingTier(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  async function toggleSuspend() {
    const suspending = !member.suspended_at
    if (suspending && !window.confirm(`Suspend ${member.email}? They won't be able to sign in until reactivated.`)) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: member.id, action: suspending ? 'suspend' : 'reactivate' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      onUpdated(data.member)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <tr className="border-b border-border/50 align-top">
      <td className="py-2 pr-4 text-foreground">{member.email}</td>
      <td className="py-2 pr-4 text-muted-foreground">{member.full_name ?? '—'}</td>
      <td className="py-2 pr-4 text-muted-foreground">
        {editingTier ? (
          <div className="flex flex-wrap gap-1">
            {ASSIGNABLE_TIERS.map((t) => (
              <button
                key={t}
                onClick={() => changeTier(t)}
                disabled={busy}
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${t === member.tier ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}
              >
                {t}
              </button>
            ))}
            <button onClick={() => setEditingTier(false)} className="text-xs text-muted-foreground hover:underline ml-1">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setEditingTier(true)} className="hover:text-primary hover:underline">
            {member.tier}
          </button>
        )}
      </td>
      <td className="py-2 pr-4 text-muted-foreground">{formatDate(member.created_at)}</td>
      <td className="py-2 pr-4 text-muted-foreground">{member.counts.audits}</td>
      <td className="py-2 pr-4 text-muted-foreground">{member.counts.moments}</td>
      <td className="py-2 pr-4 text-muted-foreground">{member.counts.stories}</td>
      <td className="py-2 pr-4 text-muted-foreground">{member.counts.blueprints}</td>
      <td className="py-2 pr-4 text-muted-foreground">{member.counts.playbooks}</td>
      <td className="py-2 pr-4">
        {member.suspended_at ? (
          <Badge variant="destructive">Suspended</Badge>
        ) : (
          <Badge variant="outline">Active</Badge>
        )}
      </td>
      <td className="py-2 pr-4">
        {isSelf ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          <button
            onClick={toggleSuspend}
            disabled={busy}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            {member.suspended_at ? 'Reactivate' : 'Suspend'}
          </button>
        )}
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </td>
    </tr>
  )
}
