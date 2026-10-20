# Things that cost a day, written down once

Portable notes from shipping StayStory. Nothing here is StayStory-specific
enough to leave behind — most of it applies to any small product on Vercel,
Supabase, Stripe and Resend, which describes every project in this stable.

**Copy this file into other projects.** It is meant to be duplicated, not
referenced.

Each entry is a thing that was genuinely surprising, cost real time, and will
happen again. Obvious advice has been left out on purpose.

---

## Email

### Sending and receiving are unrelated. Check both, separately.

A domain verified with a sending provider will send from **any** address at
that domain. `anything@yourdomain.com` leaves successfully with no mailbox
behind it.

Receiving needs something completely different: `MX` records on the root
domain, and a mailbox.

The failure mode is nasty because it is silent. Transactional email goes out
perfectly, the `Reply-To` looks right, and every reply a customer sends
vanishes. Nothing bounces on your side. Nothing appears in any dashboard.

**Test by emailing the address from an unrelated account and watching it
arrive.** A green tick in a sending dashboard says nothing about receiving.

### One contact address, in one constant, imported everywhere

Receipts said `hello@`, the legal pages said `info@`, neither existed. Put
the address in one module, import it into the emails *and* the legal pages,
and add a test that greps the source for any other address at your domain.

### Resend puts an MX record on a subdomain, and it is load-bearing

Resend asks for `MX` on `send` pointing at an SES feedback host. That is
bounce handling for **outbound** mail. It looks irrelevant to receiving and
it is — but deleting it can un-verify the domain and stop all outbound mail.

### Namecheap's mail-mode dropdown deletes records

Namecheap's Advanced DNS puts every `MX` record inside a MAIL SETTINGS block
governed by a single-choice dropdown: No Email Service / Private Email /
Gmail / Custom MX / Email Forwarding.

**Changing that dropdown deletes the custom MX rows.** Switching it to set up
forwarding silently removed Resend's `send` record.

Stay on **Custom MX** and add rows. It accepts any number, each with its own
`Host`, so a mailbox on `@` and a sending provider's record on `send` coexist
fine. Decline any "configure DNS automatically" offer from a mail provider —
that is the thing that flips the dropdown.

### Zoho's HTML-file verification does not work on Vercel

Zoho offers `TXT`, `CNAME`, or an HTML file at
`/zohoverify/verifyforzoho.html`. The file method is tempting because it is
a commit rather than a DNS edit.

It fails. Zoho's own instructions say to check the file over **`http://`**,
Vercel answers plain HTTP with an unconditional 308 to HTTPS, and Java's
`HttpURLConnection` refuses to follow a redirect that changes protocol. Not
configurable at either end.

Zoho's `CNAME` method uses a **subdomain** host (`zb<code>`), not the apex,
so it does not clash with the A record serving the site. It is a fine
fallback and a different validation path if `TXT` is being rejected.

### "Failed to save record" on Namecheap usually means duplicate

Namecheap reports a duplicate row as `Failed to save record. Please try
again.` If a record will not save, look for the same row already in the list,
pending or saved, before changing anything about the value.

When that is not it, and the record is valid, and it still will not save in
an incognito window with no extensions — the editor is broken. Move DNS
hosting. There is no third attempt worth making.

### Pick a DNS host with no modes

A host that treats every record the same — any type, any name, no
mail-settings dropdown, no auto-configure — removes an entire category of
problem. Worth doing before you need it, not during an outage.

---

## Vercel

- **`NEXT_PUBLIC_*` variables are inlined at build time.** Changing one in the
  dashboard does nothing until a redeploy. The old value stays in the bundle.
- **Branch-scoped environment variables can only target Preview.** Ticking
  Production *and* a git branch is rejected: *"Environment Variables with
  `gitBranch` can only be used with `target=preview`."*
- **A Vercel zone for a domain is not proof Vercel serves its DNS.** Check the
  nameservers. Reading records from a non-authoritative zone will produce a
  confident, wrong diagnosis.
- **Hobby allows two cron jobs, daily granularity.**

## Supabase

- **A free project pauses after about a week of no activity**, and a paused
  project takes the whole site down — not just the authenticated parts.
- **A keep-alive must prove the database was reached.** Loading the homepage
  on a timer proves nothing if the page wraps its query in a `try/catch` with
  a fallback: it returns a cheerful 200 whether Postgres answered or not.
  Hit a route that returns a non-2xx when the read fails.
- **A GET route handler can be cached**, which would make that keep-alive
  return 200 forever without touching the database. `export const dynamic =
  'force-dynamic'` and `revalidate = 0`.
- **RLS cannot restrict columns.** For "the user may edit these fields but not
  that one", use column-level `GRANT`/`REVOKE`.
- **RLS on with zero policies is the tightest setting**, not a misconfiguration,
  for tables only the service role touches. Advisors flag it as INFO; leave a
  comment in the migration saying why.
- **The service role bypasses RLS entirely.** It belongs nowhere near browser
  code. The `server-only` package turns a careless import into a build error.

## Stripe

- **For subscriptions you cannot set `statement_descriptor_suffix` on the
  PaymentIntent.** Precedence is Invoice → **Product** → account default, so
  set it per Product when several brands share one account.
- **Verify the price before charging.** An environment variable once pointed
  one tier at another tier's price. A guard that refuses on mismatch is a few
  lines and prevents charging the wrong amount.

## Testing

- **Commit the tests.** Tests written into a session scratchpad are lost with
  the container. That happened twice, for about 149 checks, before they were
  written as real files.
- **Keep the default suite offline.** No network, no database, no browser, so
  it runs in seconds and cannot fail for reasons unrelated to the change.
  Anything needing live services goes in a separate command.
- **`text-transform: uppercase` does not change the DOM, but it changes what
  you see.** Assertions written from a screenshot and compared case-sensitively
  will fail against markup that is lowercase. Compare case-insensitively.
- **Check a sweep actually swept.** A test that walks a directory and finds
  nothing passes vacuously. Assert the file count too.

## Working method

- **Say which kind of verified you mean**: verified in code, verified with
  fixtures, or verified against the live system. They are not the same claim
  and the third is the only one that counts for infrastructure.
- **Check before diagnosing.** Reading a non-authoritative DNS zone nearly
  produced a confident wrong answer; so did assuming which host a CNAME
  verification uses. Both were one lookup away from being right.
- **Two failed attempts is data, not bad luck.** The third attempt is almost
  never the one that works. Change the approach instead.
