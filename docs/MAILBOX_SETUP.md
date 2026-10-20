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

## The open question

Namecheap's MAIL SETTINGS dropdown is exclusive, and every `MX` record lives
inside it. **It is not established whether a mailbox mode (Private Email,
Gmail, Forwarding) allows an additional host-specific `MX` row for `send`
alongside its own records on `@`.**

If it does, this is straightforward. If it does not, then at Namecheap a
mailbox and Resend's `send` record cannot coexist, and the fix is to move DNS
hosting (see the last section) rather than to keep fighting the dropdown.

Find out before changing anything. Do not assume either answer.

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
