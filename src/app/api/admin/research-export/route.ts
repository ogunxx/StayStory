import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import { listResearch } from '@/lib/host-research-store'
import { toCsv } from '@/lib/host-research-csv'

/**
 * Download the host research as a CSV.
 *
 * Same admin gate as every other admin route, reused rather than
 * reimplemented. Nothing is written, and the export leaves out ids,
 * the idempotency key and service metadata — see CSV_COLUMNS.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const csv = toCsv(await listResearch())
  const date = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="staystory-host-research-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
