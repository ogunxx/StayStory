import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { getResearch } from '@/lib/host-research-store'
import { propertyTypeLabel, testingInterestLabel } from '@/lib/host-research'
import { AdminNav } from '../../admin-nav'
import { ResearchStatusControl } from './status-control'

export const metadata: Metadata = { title: 'Host Research — StayStory Admin' }

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[0.78rem] text-muted-foreground">{label}</p>
      <div className="text-[0.95rem] leading-relaxed text-foreground">{children}</div>
    </div>
  )
}

/** One response in full. Everything they wrote, nothing inferred. */
export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const row = await getResearch((await params).id)
  if (!row) notFound()

  return (
    <div className="flex flex-col gap-6">
      <AdminNav active="/admin/research" />

      <div>
        <Link href="/admin/research" className="text-sm text-primary underline underline-offset-4">
          ← Host Research
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-foreground">
          {row.name || row.email}
        </h1>
      </div>

      <Block title="Participant">
        <Row label="Name">{row.name || <span className="text-muted-foreground">Not given</span>}</Row>
        <Row label="Email">
          <a href={`mailto:${row.email}`} className="text-primary underline underline-offset-4">
            {row.email}
          </a>
        </Row>
        <Row label="Property type">
          {propertyTypeLabel(row.property_type)}
          {row.property_type_other ? ` — ${row.property_type_other}` : ''}
        </Row>
      </Block>

      <Block title="Their perspective">
        <Row label="Biggest challenge creating a memorable guest experience">
          <p className="whitespace-pre-wrap">{row.biggest_challenge}</p>
        </Row>
        <Row label="What would make designing better guest experiences easier">
          {row.desired_support ? (
            <p className="whitespace-pre-wrap">{row.desired_support}</p>
          ) : (
            <span className="text-muted-foreground">Not answered</span>
          )}
        </Row>
        <Row label="Interested in testing StayStory">
          {testingInterestLabel(row.testing_interest)}
        </Row>
      </Block>

      <Block title="Contact">
        <Row label="Permission to contact about this research">
          {row.contact_permission ? 'Yes — given at submission' : 'No'}
        </Row>
        <Row label="Submitted">{formatDate(row.created_at)}</Row>
        <Row label="Last updated">{formatDate(row.updated_at)}</Row>
      </Block>

      <Block title="Internal">
        <ResearchStatusControl id={row.id} status={row.admin_status} />
      </Block>
    </div>
  )
}
