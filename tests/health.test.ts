/**
 * The daily keep-alive.
 *
 * A free Supabase project pauses after about a week without activity, and a
 * paused project takes the whole site down. A cron reads one row a day so
 * that week never arrives.
 *
 * Most of this is source checking, deliberately. The failure mode here is
 * silent — a cached route returning a happy 200 while nothing reaches
 * Postgres — and there is no runtime seam that can observe "this response
 * came from a cache". The thing worth protecting is the configuration.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')
const ROUTE = 'src/app/api/health/route.ts'
const vercelJson = JSON.parse(read('vercel.json')) as {
  crons?: { path: string; schedule: string }[]
}

describe('the route can never be cached', () => {
  test('it is force-dynamic', () => {
    // Without this a GET handler can be served from cache: the cron gets a
    // perfect 200 every day, nothing reaches the database, and the project
    // pauses anyway while everything looks fine.
    assert.match(read(ROUTE), /export const dynamic = 'force-dynamic'/)
  })

  test('revalidate is off', () => {
    assert.match(read(ROUTE), /export const revalidate = 0/)
  })

  test('responses say no-store', () => {
    const src = read(ROUTE)
    const responses = src.match(/NextResponse\.json\(/g) ?? []
    const noStore = src.match(/'Cache-Control': 'no-store'/g) ?? []
    assert.ok(responses.length >= 3, 'expected success, db-error and throw paths')
    // Every path that reports on the database must be uncacheable. The 401
    // is the one exception — it never touched the database.
    assert.ok(noStore.length >= 3, `only ${noStore.length} responses set no-store`)
  })
})

describe('it actually reads the database', () => {
  test('it queries a real table', () => {
    assert.match(read(ROUTE), /\.from\('site_config'\)/)
  })

  test('it uses the ordinary server client, not the service role', () => {
    const src = read(ROUTE)
    assert.match(src, /from '@\/lib\/supabase\/server'/)
    assert.doesNotMatch(src, /getAdminClient|SERVICE_ROLE/)
  })

  test('a failed read is reported, not swallowed', () => {
    // The homepage reads the same table inside a try/catch and falls back to
    // hardcoded figures. That is right for the homepage and fatal here.
    const src = read(ROUTE)
    assert.match(src, /status: 503/)
    assert.match(src, /database: 'unreachable'/)
  })

  test('a thrown error is caught and still reported as unhealthy', () => {
    const src = read(ROUTE)
    assert.match(src, /catch \(err\)/)
    const failures = src.match(/status: 503/g) ?? []
    assert.equal(failures.length, 2, 'both the error path and the throw path must 503')
  })

  test('it does not leak connection details', () => {
    const src = read(ROUTE)
    assert.doesNotMatch(src, /SUPABASE_URL|ANON_KEY|process\.env\.NEXT_PUBLIC/)
  })
})

describe('the cron is configured', () => {
  test('vercel.json declares exactly one cron', () => {
    assert.ok(Array.isArray(vercelJson.crons))
    assert.equal(vercelJson.crons!.length, 1)
  })

  test('it points at the health route, which exists', () => {
    assert.equal(vercelJson.crons![0].path, '/api/health')
    assert.ok(read(ROUTE).length > 0)
  })

  test('it runs daily — well inside the one-week pause window', () => {
    const [minute, hour, dom, month, dow] = vercelJson.crons![0].schedule.split(' ')
    assert.match(minute, /^\d+$/, 'a fixed minute, not a range')
    assert.match(hour, /^\d+$/, 'a fixed hour: daily, not hourly')
    assert.equal(dom, '*')
    assert.equal(month, '*')
    assert.equal(dow, '*', 'every day, including weekends')
  })

  test('it stays within the Hobby plan limit of two cron jobs', () => {
    assert.ok(vercelJson.crons!.length <= 2, 'Hobby allows at most two')
  })

  test('the schedule has five fields', () => {
    assert.equal(vercelJson.crons![0].schedule.split(' ').length, 5)
  })
})

describe('the secret is optional', () => {
  test('CRON_SECRET is honoured when set and skipped when not', () => {
    // Requiring it unconditionally would break the cron the moment it
    // deployed, before anyone had set the variable.
    const src = read(ROUTE)
    assert.match(src, /process\.env\.CRON_SECRET/)
    assert.match(src, /if \(secret\)/, 'the check must be conditional on the secret existing')
  })
})
