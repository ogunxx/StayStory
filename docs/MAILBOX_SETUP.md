# Making `info@staystory.co` work — both directions

Outbound mail (confirmations, receipts) has always worked. Inbound has never
worked at all. Those are two separate pieces of DNS, and the second was
never set up. This file records what is true, what is still unknown, and the
order the remaining steps have to happen in.

> **Nothing here has been verified live.** The container this was written in
> cannot reach DNS — the proxy refuses `cloudflare-dns.com` and `dns.google`
> alike — so every claim below is either read off a screenshot, read out of
> this repository, or explicitly marked as unknown. Do not treat it as a
> report of the current state of the domain.

---

## Why sending works and receiving does not

| | Needs | Where it lives |
|---|---|---|
| **Sending** as `info@staystory.co` | the *domain* verified in Resend | DKIM `TXT`, SPF `TXT`, and an `MX` on the `send` subdomain |
| **Receiving** at `info@staystory.co` | a *mailbox*, and `MX` on the **root** domain | a mail host's own records on `@` |

The confusing part: a verified sending domain lets you send from *any*
local-part. `anything@staystory.co` leaves successfully whether or not a
mailbox exists behind it. So outbound looked completely healthy while every
reply customers sent went nowhere — a failure with no symptom on our side.

This is why `src/lib/legal.ts` carries a long comment next to
`CONTACT_EMAIL`. The two requirements look like one thing and are not.

---

## What the DNS actually is

- **Registrar and DNS host: Namecheap.** The nameservers are
  `dns1.registrar-servers.com` / `dns2.registrar-servers.com`, which is
  Namecheap BasicDNS. Records are edited at **Domain List → staystory.co →
  Manage → Advanced DNS**.
- **Vercel also holds a zone for staystory.co, and it is not authoritative.**
  Reading records there tells you nothing about live DNS. This nearly caused
  a wrong diagnosis on 20 October. Vercel will offer to move the nameservers
  to itself; don't — the mail configuration goes with them.

### The trap, in detail

Namecheap's Advanced DNS page has two separate areas. **HOST RECORDS** holds
A, CNAME and TXT. **MAIL SETTINGS** holds every `MX` record *and* a
single-choice dropdown: No Email Service / Private Email / Gmail / Custom MX
/ Email Forwarding.

Changing that dropdown away from **Custom MX** deletes the custom `MX` rows.
This happened on 20 October: the `send` MX record vanished while trying to
set up forwarding.

**If `send` is missing, re-add it:**

| Type | Host | Value | Priority |
|---|---|---|---|
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |

That record is Resend's bounce-and-complaint handling. Losing it can
un-verify the domain in Resend, which stops **signup confirmation emails and
Stripe receipts** — strictly worse than the inbound problem it was lost
trying to fix. It is the single most important record on the domain.

---

## The way through: stay in Custom MX and add rows

Namecheap's MAIL SETTINGS dropdown is exclusive, and every `MX` record lives
inside it. The mailbox modes — Private Email, Gmail, Email Forwarding — each
write their own records on `@` and take the table over, which is what
destroyed the `send` row on 20 October.

**So don't use them.** `Custom MX` is a table that accepts any number of rows
with a different `Host` on each, which is how `send` existed in the first
place. A mailbox and Resend coexist perfectly there:

| Type | Host | Value | Priority |
|---|---|---|---|
| MX | `@` | the mailbox provider's first mail server | 10 |
| MX | `@` | the mailbox provider's second mail server | 10 |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |

The rule that follows from this: **once a mailbox exists, never touch that
dropdown again.** Every future change is adding or editing a row inside
Custom MX. Buying Private Email will offer to configure DNS automatically —
decline it, or it switches the mode and the `send` row goes with it.

A mail provider's dashboard may then complain that DNS is "not configured",
because it looks for its own mode rather than the records. Cosmetic, as long
as the values match what it asked for. Trust a delivered test message over
that warning.

### Zoho's HTML verification does not work here

Zoho offers three ways to prove domain ownership: a `TXT` record, a `CNAME`,
or an HTML file served from the domain. The file method is the appealing one,
because `public/zohoverify/verifyforzoho.html` is a commit rather than a trip
through someone's DNS editor.

**It fails on a Vercel-hosted domain.** It was tried on 20 October: the file
served correctly over HTTPS — confirmed in a browser — and its contents were
byte-identical to Zoho's, and Zoho still refused. Of the three causes Zoho
lists, the path and the content were both eliminated, leaving the first:
*"invalid or expired certificate … or allow your website to load in http
mode."*

Zoho's own step 4 gives it away — it tells you to check
`http://staystory.co/zohoverify/verifyforzoho.html`, over plain HTTP. Vercel
answers HTTP with an unconditional 308 to HTTPS, and Java's
`HttpURLConnection` will not follow a redirect that changes protocol. Not
configurable at either end.

So verification has to be a DNS record. **Both remaining methods are
viable** — an earlier note here claimed the `CNAME` method needed a record
on the apex, where it would clash with the A record serving the website.
That was an assumption and it was wrong: Zoho's CNAME method uses a
subdomain host shaped like `zb<code>`, which conflicts with nothing. If one
record type will not save, try the other.

The verification file is harmless and has been left deployed; delete
`public/zohoverify/` whenever the domain is verified another way.

### One trap worth knowing before you start

If the provider asks for an **SPF `TXT` record on `@`** and a root SPF record
already exists, **do not add a second one.** Two SPF records on the same host
is invalid and breaks mail for both. They have to be merged into a single
record with both `include:` terms.

Resend's SPF sits on `send`, not `@`, so it does not collide — but check `@`
before adding anything there.

---

## The zone as it stood before any migration

Read off the Namecheap Advanced DNS screen on 20 October 2026. Recorded
because a DNS migration is only safe if you know what you are copying, and
because Namecheap's editor had by then stopped saving records at all.

**HOST RECORDS**

| Type | Host | Value | TTL |
|---|---|---|---|
| A | `@` | `76.76.21.21` | Automatic |
| CNAME | `www` | `cname.vercel-dns.com.` | Automatic |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBg…` **(truncated on screen)** | Automatic |
| TXT | `semd` | `v=spf1 include:amazonses.com ~all` | Automatic |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | Automatic |

**MAIL SETTINGS** (Custom MX)

| Type | Host | Value | Priority |
|---|---|---|---|
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |

Three things to know about that table:

- **The DKIM value is truncated** and is the one record that cannot be
  retyped from here. It does not need to be: the Resend dashboard shows
  every record it requires, in full, at any time. That is the backup copy.
- **`semd` is a typo of `send`** and is inert — nothing queries it. Do not
  bother carrying it across.
- The A record and the `www` CNAME are what serve the website. If either is
  wrong after a migration, staystory.co goes down.

### Why Namecheap had to be abandoned

In one afternoon its DNS editor deleted the `send` MX record when the mail
mode changed, then refused to save a valid `TXT` record four times —
including once in an incognito window with no extensions running — with no
message but *"Failed to save record. Please try again."* A duplicate row
accounted for two of those attempts; removing it changed nothing.

The records above are all valid and all still resolve. The editor simply
stopped accepting writes. There is no way to run a mail setup through a DNS
host that cannot be written to, and the MX records for a mailbox were still
ahead.

---

## Order of work

### 1. Read the Resend dashboard first — 2 minutes

**Resend → Domains → staystory.co.** It lists every record it expects with a
status beside each one, and says whether the domain as a whole is Verified.

This single screen answers:

- Is outbound mail currently broken? (Is the domain still Verified?)
- Which records must survive whatever comes next?
- Is the `send` MX record present, or did it stay deleted?

Nothing else should be touched until this has been looked at. If the domain
shows as not verified, restoring the `send` record is the only urgent task on
this page — a mailbox can wait, working signup emails cannot.

### 2. Restore anything Resend reports missing

Namecheap → Advanced DNS → MAIL SETTINGS. If the dropdown is not on **Custom
MX**, set it there first, then add the rows Resend asks for — using the
values **Resend shows**, which are account-specific and must not be copied
from this file or anywhere else. The `send` MX value above is recorded for
recognition, not for pasting.

Give it an hour, then recheck Resend.

### 3. Then, and only then, add a mailbox

A **real mailbox** rather than forwarding, because forwarding solves half the
problem: mail arrives, but replying as `info@staystory.co` then needs Gmail's
"Send mail as" wired through Resend's SMTP on top. A mailbox is one login
that does both.

**Namecheap Private Email** is the recommendation, for one reason only: the
domain is already at Namecheap, so Namecheap writes its own MX records rather
than asking anyone to hand-edit DNS. It costs a couple of dollars a month for
one mailbox. Webmail at `privateemail.com`, and IMAP for a phone.

Zoho Mail has a genuinely free single-user tier and Google Workspace is the
familiar option, but both require typing their MX records into Namecheap by
hand — which is precisely the step that went wrong once already.

Whichever is chosen, afterwards **go back to the Resend dashboard and
confirm the domain still says Verified.** Adding root MX records should not
disturb the `send` subdomain, but "should not" is doing real work in that
sentence, given the open question above.

### 4. Check it actually receives

Send a message from an unrelated address — a phone, a personal account — to
`info@staystory.co` and watch it arrive. Then reply, and confirm the reply
shows `info@staystory.co` as the sender, not a provider's address.

Until that round trip has been seen, inbound is unverified regardless of what
any dashboard claims.

---

## What the code already does

`src/lib/legal.ts` is the single source: `CONTACT_EMAIL` and `EMAIL_FROM`.
The legal pages, the Stripe welcome email and the Stripe cancellation email
all read from it, and `tests/legal.test.ts` sweeps every file under `src/`
to fail the build if another address ever reappears.

So there is nothing to change in the repository when the mailbox starts
working. The code is already pointing at the right address; it is the
address that needs to become real.

The one thing that could still need a code change: if `info@` turns out to be
impractical and some other address is used instead, change `CONTACT_EMAIL`
and nothing else.

---

## If this keeps being painful

The root cause is Namecheap's exclusive mail-mode dropdown. Moving DNS
hosting to **Cloudflare** (free) removes that entire class of problem — any
combination of records on any host, no modes, and Cloudflare Email Routing
forwards `info@` to a Gmail address for nothing, adding its own MX records
with one toggle.

It is also a nameserver change on a live site, which means copying every
existing record across first and accepting a propagation window. Worth doing
eventually; not worth doing in the week of launch, and not worth doing at all
until step 1 has established what the records currently are.
