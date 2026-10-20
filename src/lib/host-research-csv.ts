import type { HostResearchRecord } from '@/lib/host-research'

/**
 * Turning research responses into a CSV.
 *
 * Pure string work, kept out of host-research-store.ts so it carries no
 * `server-only` guard and can be tested directly. The store does the reading;
 * this does the formatting.
 */
/**
 * The research as a CSV, for reading somewhere other than a browser tab.
 *
 * Built here rather than with a library: nine known columns of our own data
 * is not a parsing problem, and a dependency for it would be more code to
 * trust than the twelve lines below.
 *
 * Deliberately NOT exported: id, idempotency_key, contact_permission,
 * submission_source, updated_at. Internal plumbing and service metadata,
 * useless in a spreadsheet, and the fewer places a row's primary key travels
 * the better. No IP address is stored anywhere, so none can leak here.
 */
export const CSV_COLUMNS = [
  'Submitted',
  'Name',
  'Email',
  'Property type',
  'Property type (other)',
  'Biggest challenge',
  'What would help',
  'Testing interest',
  'Status',
] as const

/**
 * One CSV field.
 *
 * A leading =, +, - or @ makes a spreadsheet treat the cell as a formula, so
 * a response beginning "=" could execute when the file is opened. Prefixing
 * a tab neutralises that without changing what a reader sees. Quotes are
 * doubled, and every field is quoted so commas and newlines inside an answer
 * cannot break the row.
 */
export function csvCell(value: string | null | undefined): string {
  const raw = value ?? ''
  const safe = /^[=+\-@\t\r]/.test(raw) ? `\t${raw}` : raw
  return `"${safe.replace(/"/g, '""')}"`
}

export function toCsv(rows: HostResearchRecord[]): string {
  const lines = [CSV_COLUMNS.map((c) => csvCell(c)).join(',')]
  for (const r of rows) {
    lines.push(
      [
        r.created_at,
        r.name,
        r.email,
        r.property_type,
        r.property_type_other,
        r.biggest_challenge,
        r.desired_support,
        r.testing_interest,
        r.admin_status,
      ]
        .map((v) => csvCell(v as string | null))
        .join(',')
    )
  }
  // CRLF: what spreadsheet software expects, and unambiguous across platforms.
  return lines.join('\r\n')
}
