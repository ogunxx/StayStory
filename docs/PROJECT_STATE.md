# Where StayStory is right now

> A handover note, not a spec. `CLAUDE.md` already loads the Operating System
> and the Website Brief, so a new session arrives knowing the philosophy and
> the design rules. What it does not know is everything decided while
> building — which is what this file is for.
>
> Last updated: 20 October 2026, after the mail audit.

---

## The one thing to know first

**This is live.** `claude/staystory-hero-s1` was merged to `main` and deployed
to staystory.co on **20 October 2026** (`0ed264a`), ending six weeks on the
4 September build. The merge came out byte-identical to the branch — main's
one unmerged commit was already superseded — and was verified that way rather
than assumed.

Real people can now reach all of it. Treat changes accordingly: there is no
longer a gap between "pushed" and "shipped".

**Rollback**, if ever needed: Vercel → Deployments → the previous production
deployment → Promote to Production. It does not undo accounts, Audits or
research submitted in the meantime; those rows stay and are read again on
roll-forward.

The branch still exists at the same tree. Preview (stable, survives
redeploys):

```
https://staystory-git-claude-stayst-20f9fd-oguncananoglu-6236s-projects.vercel.app
```

Database changes were always live, because schema is not branch scoped —
this deploy needed no migration, production simply started reading tables it
had been ignoring.

---

## Open items, most pressing first

Written down because sessions start cold and the owner is often away from a
computer when these come up. Nothing here is on fire.

1. **Rotate `SUPABASE_SERVICE_ROLE_KEY`.** Railway disclosed a breach of the
   systems that store customer environment variables on 21 October 2026, and
   the Railway integration on this Vercel team held
   `read-write:project-env-vars` across **all** projects, this one included.
   No integration ever *wrote* a variable here — every one was created by the
   owner's own account — and StayStory was never linked to a Railway service,
   so the likely path for the values to reach Railway did not exist. But
   reads leave no trace, and this key bypasses RLS on every table. Cheap
   insurance.
   **Order matters:** create the new key, set it in Vercel, redeploy, *then*
   revoke the old one. Reverse that and production breaks.
   `STRIPE_SECRET_KEY` is the same argument one notch down. The rest
   (`STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`) are
   judgement calls.
2. **Remove the Railway integration** from the Vercel team. Vercel disabled
   it platform-wide, but the configuration is still installed. Nothing on
   this project uses it.
3. **`info@staystory.co` has never been tested end to end.** The alias, MX,
   SPF and DKIM are all in place and the domain is verified, but nobody has
   sent a message to it, watched it arrive, and replied. Until that round
   trip happens it is configured, not working.
4. **Domain auto-renew is off.** `staystory.co` expires 1 May 2027. Two
   toggles on Namecheap's Domain tab — the domain and the privacy
   protection. Losing it takes the site and the email with it.
5. **Nobody has walked signup on production.** Account → confirmation email
   → Audit, as a real person, on staystory.co.
6. **Stripe statement descriptors** are unset at the Product level, so card
   statements will not say what the charge was for. Subscriptions take the
   descriptor from the Product, not the payment.
7. **Next 16 reports the `middleware` file convention as deprecated** in
   favour of `proxy`. Pre-existing and harmless, but it is the auth gate, so
   it wants a quiet day.
8. **Two bits of litter.** An environment variable whose *name* is a Stripe
   price ID (`price_1Tzx…`), and a DNS `TXT` record on `semd` — a typo of
   `send` — that came across to Cloudflare. Both inert.
9. **The "Welcome" sign on the Boutique Stays card** is behind the product
   panel on mobile and half behind it on desktop. Not fixable by framing;
   it needs either a different photograph or a change to the overlay. The
   reasoning is in `public/images/home/README.md`.

---

## The product, as it now stands

The public promise is a four-step journey. Feedback is a fifth stage in the
code but deliberately *not* part of the promise.

| Stage | Route | State |
|---|---|---|
| 1 Experience Audit | `/audit` | Eight guided steps, draft-saving |
| 2 Experience Compass | `/compass` | Confirmed before it steers anything |
| 3 Three Opportunities | `/start/recommendations` | Generated from Audit + Compass |
| 4 Starter Playbook | `/start/playbook` | Develops the three, never replaces them |
| — Feedback | `/start/feedback` | Optional, after the Playbook. Not a product stage |

`/start` is the guided journey. The full six-tool product (`/journey`,
`/generator`, `/story`, `/legend`) is untouched and still reachable.

### Four switches in `src/lib/config.ts`

All currently `true`, all independent, each documented at length in place.

- `FOCUSED_FIRST_RUN` — new hosts land in the guided journey, not the Dashboard
- `FOCUSED_HOMEPAGE` — the public site shows the focused composition
- `FOCUSED_FREE_LAUNCH` — signup does not offer the paid plan up front
- `FOCUSED_LAUNCH_MODE` — paid tiers and six-tool messaging stay out of an
  early host's way. `src/lib/launch-mode.ts` decides who sees what: anyone
  paying, or with deeper work already saved, gets the full product regardless

---

## Decisions that will look strange without the reason

**Focused work lives in `suggestions` under a `kind`.** Two kinds so far, both
listed in `src/lib/focused-kinds.ts`. Exactly two queries must know about
them — Generator credit counting and the History page — and both read that
list. **Adding a third kind means adding it there and nowhere else.** Get this
wrong and hosts get charged a Generator credit for a Playbook, and the rows
render as blank cards in History. That nearly happened once.

**Feedback got its own table instead.** `focused_feedback`, because admin
needs to filter and sort by review status and that is awkward through jsonb.

**RLS cannot restrict columns.** `focused_feedback.review_status` is ours, not
the host's, so `authenticated` holds UPDATE on the answer columns only. Verified:
a host's own token reports `false` for UPDATE on that column.

**Staleness is a fingerprint, not a timestamp.** `confirmCompass` rewrites
`updated_at` every call, so timestamps would mark unchanged work as stale. The
Compass + Audit context is hashed instead. The Playbook separately tracks
`source_set_id` — the recommendation row it was built from.

**Admin reads everything in one batch.** `src/lib/admin-data.ts`. A query per
user per stage would be unusable by a hundred users. Every journey fact is
keyed `user:property`.

**Checkout verifies the price before charging.** An environment variable once
pointed Legendary at the Portfolio price. `findPriceMismatch` now refuses
rather than charging the wrong amount.

---

## Two bugs that were fixed, and are worth not reintroducing

Both were listed here as known and deliberately unfixed; both were then
fixed, and the fixes are the reason two test files exist.

1. **`/legend` playbook count was user-scoped.** `journey-state.ts` counted
   `playbooks` by `user_id` alone, though the table has `property_id`, so one
   property's Playbook counted for all of them. Property scoping now goes
   through `scopeToProperty` in `src/lib/property-scope.ts` — a one-line
   helper that exists mainly so `tests/property-scope.test.ts` can hold the
   behaviour still. Proved against the live database in a rolled-back
   transaction: viewing property B, the old query returned 1 and the new
   returned 0.
2. **A saved Audit draft looked unstarted on `/start`.** The host-facing path
   ignored the draft row that Admin read correctly. `/start` now says
   "Continue your Audit" with the step number. See `tests/focused-path.test.ts`.

---

## Outside the repo, and easy to lose

- **Supabase Auth → URL Configuration** must list `staystory.co/**`, the Vercel
  preview wildcard and `localhost:3000/**`. Supabase silently replaces
  `emailRedirectTo` with the Site URL otherwise — that is what once sent
  confirmation emails to `localhost`.
- **Custom SMTP** is set up through Resend. Full detail in
  `docs/AUTH_EMAIL_SETUP.md`.
- **DNS lives at Cloudflare**, as of 20 October 2026. Nameservers
  `mitch.ns.cloudflare.com` / `perla.ns.cloudflare.com`, set at Namecheap,
  which is still the registrar. Vercel also holds a zone for staystory.co
  and it is *not authoritative* — reading records there tells you nothing,
  which nearly caused a wrong diagnosis. Vercel will offer to take the
  nameservers; don't.

  **`www.staystory.co` redirects to the apex, 308.** It is a *project domain
  in Vercel* with a redirect — not just a DNS record. Both halves are
  needed and they fail in different ways. DNS resolved `www` to Vercel from
  the start, but `www` was never added to the Vercel project, so Vercel had
  no certificate for that hostname and the TLS handshake failed: every
  visitor got a browser security warning, with no error anywhere on our
  side. It went unnoticed until the Instagram bio used the `www` form on
  launch day, 22 October 2026. Added, verified, redirecting that day.

  The lesson generalises: **a hostname that resolves but is not registered
  to the project is worse than one that does not resolve**, because it
  fails with a security warning rather than a plain "can't find this site".

  **The A record and `www` CNAME must stay `DNS only`, not Proxied.**
  Vercel terminates its own TLS; Cloudflare's proxy in front of it causes
  certificate errors and redirect loops. Cloudflare nags about this. Ignore
  the nag.

  It moved because Namecheap's editor stopped accepting writes — it
  refused a valid TXT record four times, having earlier deleted the `send`
  MX record on its own. **`docs/MAILBOX_SETUP.md`** has the full account,
  the zone as it was, and what each record is for.
- **`info@staystory.co` is set up to receive through Zoho**, as an alias on
  the same account and user as Valor Oak. The domain is verified and the
  MX, SPF and DKIM records are in Cloudflare. **The round trip was never
  tested** — send to it, reply, and confirm the reply leaves as
  `info@staystory.co` before trusting it.

  Sending from the address and receiving at it are **separate pieces of
  DNS**, and the second was missing for months without a symptom: a
  verified sending domain sends from any local-part, mailbox or not. So
  Stripe receipts went out perfectly while every customer reply vanished.
  If this address ever changes, check both halves, and test by actually
  emailing it.
- **Four Stripe price IDs** in Vercel, all verified October 2026. The checkout
  guard will refuse if one is ever wrong again.
- **`NEXT_PUBLIC_RESEARCH_CALL_URL`** — the Acuity link for the optional
  15-minute research conversation. **Set for Preview and Production,
  19 October 2026**, pointing at the Laurel & Lore Acuity account's
  15-minute "StayStory Host Research Conversation". Unset is a working
  state: the form still submits and the invitation just does not render.
  Full detail in `docs/RESEARCH_CALL_SETUP.md`.
- **`ADMIN_EMAILS`** is the only thing granting admin access. The app cannot
  write to it, which is why Admin shows admin status but offers no control
  over it.

---

## Standing rules this project is built under

Carried from the Operating System and from how the work has been run:

- Never invent statistics, testimonials, ratings or screenshots of features
  that do not exist. Unverified claims use editable placeholders.
- Never show "MVP", "beta" or "limited version" to a customer.
- Distinguish *verified in code*, *verified with fixtures* and *verified
  against the live system* — and say which.
- Data work is additive and reversible. No dropping tables.
- Do not merge to `main` without being asked.
- The warm palette governs — cream, terracotta, sage — whatever colour a
  mockup arrives in.

---

## If you are picking this up fresh

Read `CLAUDE.md` first (it loads the rest), then this file. Then:

```
git log --oneline origin/main..HEAD     # what is not yet in production
```

```
npm test            # 254 tests, no network, no database
npm run build       # the real check — the suite does not catch type errors
```

**The tests are committed, in `tests/`.** They were twice written in the
session scratchpad and twice lost with the container, which is the whole
reason they are now real files. `tests/README.md` says what each one guards.
They are deliberately logic-only: no network, no database, no browser, so
they run in seconds and cannot fail for a reason unrelated to the change.

Anything needing the live database lives in `tests/live/` and runs separately
under `npm run test:live` — never as part of `npm test`.

Lint has a standing baseline of **23 problems** (20 errors, 3 warnings), all
`react/no-unescaped-entities` and unused variables that predate this work.
Unchanged is the pass condition; it is not zero.
