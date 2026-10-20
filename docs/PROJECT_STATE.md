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
- **DNS lives at Namecheap, not Vercel.** The nameservers are
  `dns1/dns2.registrar-servers.com`. Vercel holds a zone for staystory.co
  but it is *not authoritative* — reading records there tells you nothing,
  which nearly caused a wrong diagnosis on 20 October. Vercel will suggest
  moving nameservers to it; do not, or the mail configuration goes with
  them.
- **Nothing receives mail at staystory.co.** There is no MX record on the
  root domain, so `info@staystory.co` bounces or vanishes — while sending
  from that same address works perfectly, because a verified sending domain
  needs no mailbox. Everything in the app now names `info@` and nothing
  else; the address itself is what still has to be made real.

  ⚠️ Changing Namecheap's MAIL SETTINGS away from "Custom MX" **deletes the
  `send` MX record**, which un-verifies the domain in Resend and can stop
  signup emails and Stripe receipts entirely. This happened on 20 October.

  **Read `docs/MAILBOX_SETUP.md` before touching any DNS.** It has the order
  of work, the record to restore, and the one question that has to be
  answered first.
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
