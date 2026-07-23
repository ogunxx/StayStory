'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Property, PropertyMember } from '@/lib/properties'

const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: 'rv', label: 'RV' },
  { value: 'cabin', label: 'Cabin' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'tiny_house', label: 'Tiny house' },
  { value: 'wellness', label: 'Wellness space' },
  { value: 'other', label: 'Other' },
]

export default function PropertiesClient({
  properties: initialProperties,
  membersByProperty: initialMembers,
  limit,
  teamEnabled,
}: {
  properties: Property[]
  membersByProperty: Record<string, PropertyMember[]>
  limit: number
  teamEnabled: boolean
}) {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [members, setMembers] = useState<Record<string, PropertyMember[]>>(initialMembers)

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ownedCount = properties.filter((p) => p.is_owner).length
  const atLimit = ownedCount >= limit

  async function addProperty(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name, type, description }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      setProperties((prev) => [...prev, data.property])
      setMembers((prev) => ({ ...prev, [data.property.id]: [] }))
      setName('')
      setType('')
      setDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Your properties</p>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">Properties</h1>
        <p className="text-muted-foreground leading-relaxed">
          Every place you host gets its own blueprint and playbook.{' '}
          {limit === 1 ? (
            <>
              Your plan includes one property.{' '}
              <Link href="/pricing" className="text-primary underline underline-offset-2">
                Upgrade to Portfolio
              </Link>{' '}
              to run up to five and invite your co-hosts.
            </>
          ) : (
            <>You can run up to {limit} properties and invite co-hosts to each.</>
          )}
        </p>
      </div>

      {/* Existing properties */}
      <div className="flex flex-col gap-4">
        {properties.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No properties yet. Add your first one below.
          </p>
        )}
        {properties.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            members={members[p.id] ?? []}
            teamEnabled={teamEnabled}
            onUpdated={(next) => setProperties((prev) => prev.map((pr) => (pr.id === next.id ? next : pr)))}
            onMembersChange={(next) => setMembers((prev) => ({ ...prev, [p.id]: next }))}
          />
        ))}
      </div>

      {/* Add property */}
      <div className="border-t border-border pt-8">
        <h2 className="text-lg font-serif font-semibold text-foreground mb-4">Add a property</h2>
        {atLimit ? (
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-5 py-4">
            <p className="text-sm font-semibold text-foreground">
              You&apos;ve reached your plan&apos;s property limit
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {limit === 1 ? (
                <>
                  Upgrade to Portfolio to run up to five places, each with its own blueprint and team.
                </>
              ) : (
                <>Your plan includes up to {limit} properties.</>
              )}
            </p>
            {limit === 1 && (
              <Link
                href="/pricing"
                className="inline-block mt-3 text-xs font-medium text-primary underline underline-offset-2"
              >
                Scale with Portfolio →
              </Link>
            )}
          </div>
        ) : (
          <form onSubmit={addProperty} className="flex flex-col gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Property name (e.g. The Deck House)"
              required
            />
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(type === t.value ? '' : t.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${type === t.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description — optional"
              rows={2}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={creating} size="sm" className="w-fit">
              {creating ? 'Adding…' : 'Add property'}
            </Button>
            <p className="text-xs text-muted-foreground">
              {ownedCount} of {limit} {limit === 1 ? 'property' : 'properties'} used.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

function PropertyCard({
  property,
  members,
  teamEnabled,
  onUpdated,
  onMembersChange,
}: {
  property: Property
  members: PropertyMember[]
  teamEnabled: boolean
  onUpdated: (next: Property) => void
  onMembersChange: (next: PropertyMember[]) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(property.name)
  const [type, setType] = useState(property.type ?? '')
  const [description, setDescription] = useState(property.description ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', propertyId: property.id, name, type, description }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      onUpdated({ ...data.property, is_owner: true })
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setName(property.name)
    setType(property.type ?? '')
    setDescription(property.description ?? '')
    setError(null)
    setEditing(false)
  }

  return (
    <div className="border border-border rounded-xl p-5 flex flex-col gap-3">
      {editing ? (
        <div className="flex flex-col gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Property name" />
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(type === t.value ? '' : t.value)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${type === t.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/50'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description — optional"
            rows={2}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancel} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-serif font-semibold text-foreground">{property.name}</p>
            {property.type && <p className="text-xs text-muted-foreground mt-0.5">{property.type}</p>}
            {property.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{property.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {property.is_owner && (
              <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline">
                Edit
              </button>
            )}
            {!property.is_owner && (
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border rounded-full px-2 py-0.5">
                Co-host
              </span>
            )}
          </div>
        </div>
      )}

      {teamEnabled && property.is_owner && (
        <CohostManager property={property} members={members} onChange={onMembersChange} />
      )}
    </div>
  )
}

function CohostManager({
  property,
  members,
  onChange,
}: {
  property: Property
  members: PropertyMember[]
  onChange: (next: PropertyMember[]) => void
}) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invite', propertyId: property.id, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      onChange([...members, data.member])
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  async function remove(memberId: string) {
    setError(null)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', memberId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      onChange(members.filter((m) => m.id !== memberId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="border-t border-border/60 pt-3 mt-1">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
        Co-hosts
      </p>
      {members.length > 0 && (
        <ul className="flex flex-col gap-1.5 mb-3">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground">
                {m.email}
                <span className="text-xs text-muted-foreground ml-2">
                  {m.status === 'active' ? 'Active' : 'Invited'}
                </span>
              </span>
              <button
                onClick={() => remove(m.id)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={invite} className="flex items-center gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="co-host email"
          className="h-9"
        />
        <Button type="submit" disabled={busy} variant="outline" size="sm" className="shrink-0">
          {busy ? 'Inviting…' : 'Invite'}
        </Button>
      </form>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  )
}
