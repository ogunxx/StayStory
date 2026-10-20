# Auth and email — how this is wired, and what lives outside the repo

Account creation, confirmation and password reset depend on settings held in
the Supabase dashboard and in DNS. None of that is in version control, so this
file is the record of what has to be true for the auth flows to work.

Supabase project: `lfeubukacgvuakpfhlxf` ("Stay Story Project").

---

## What the app does

| Route | Purpose |
|---|---|
| `/signup` | Create an account. Checks for disposable addresses and breached passwords, then calls `supabase.auth.signUp`. |
| `/login` | Sign in. Explains an unconfirmed account rather than showing Supabase's bare "Email not confirmed", and offers to resend. |
| `/forgot-password` | Ask for a reset link. |
| `/reset-password` | Set a new password, having arrived from that link. |
| `/api/auth/callback` | Where every email link lands. Exchanges the code for a session, then routes onward. |

Two details worth knowing before changing any of it:

**The callback decides where someone goes next from a key, not a path.**
A confirmation link and a reset link both arrive with nothing but a code —
Supabase does not say which kind it was. So the sender puts `?next=<key>` in
its own redirect URL, and the callback matches that key against the
`DESTINATIONS` allow-list. It must stay an allow-list. Turning a query string
into a redirect target would be an open redirect on a `staystory.co` link.

**The breached-password check is ours, not Supabase's.**
See `src/lib/pwned-password.ts`. Supabase can do this at the Auth layer, but
only on the Pro plan. Ours runs in the browser at the two places a password is
set, and fails open on every path so an outage can never block signup. If the
project moves to Pro, turn Supabase's own version on as well — that one is
enforced server-side.

---

## Supabase settings that must be right

### Authentication → URL Configuration

| Field | Value |
|---|---|
| Site URL | `https://staystory.co` |
| Redirect URLs | `https://staystory.co/**`, `https://*-oguncananoglu-6236s-projects.vercel.app/**`, `http://localhost:3000/**` |

Supabase **discards** the `emailRedirectTo` an app sends and substitutes the
Site URL whenever the target is not in the Redirect URLs allow-list. That is
the entire reason confirmation emails once pointed at `localhost`: the code was
already correct, the allow-list was not.

The `**` wildcards cover `/api/auth/callback` and its `?next=` and `?plan=`
variants, so new link types need no change here.

---

## Email deliverability

### The problem

By default Supabase sends from its own shared address. It has no reputation
tied to `staystory.co` and no SPF/DKIM alignment with the domain, so filters
treat it with suspicion and confirmation emails land in spam. It is also
rate-limited to roughly **2 emails per hour** on the free plan, which is what
exhausts email sending during testing.

The app says "check your spam folder" on the relevant screens, and offers a
resend. That is damage limitation. Custom SMTP is the actual fix.

### The fix: custom SMTP

Easiest route is Resend's one-click Supabase integration, which creates the API
key and fills in the SMTP fields. Done by hand, the settings are:

| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` (implicit TLS; 587 / 2587 use STARTTLS if 465 is blocked) |
| Username | `resend` |
| Password | the Resend API key |
| Sender email | `info@staystory.co` — see `CONTACT_EMAIL` in `src/lib/legal.ts` |
| Sender name | `StayStory` |

Any local-part at the verified domain *sends* fine, whether or not a mailbox
exists behind it. Keeping this in step with `CONTACT_EMAIL` is so that a
reply lands somewhere a person reads — which needs root MX records, a
separate piece of DNS entirely. See `docs/MAILBOX_SETUP.md`.

Entered in the dashboard under **Authentication → Emails → SMTP Settings**
(older builds: Project Settings → Auth → SMTP Settings), with *Enable Custom
SMTP* turned on.

The domain must be verified in Resend **first**. Resend generates the exact
DNS records to add at the registrar — a DKIM `TXT`, an SPF `TXT` and an `MX`
for the sending subdomain. Use the values Resend shows; they are
account-specific and must not be copied from anywhere else.

Add a DMARC record too, once SPF and DKIM pass. Start in report-only so
nothing is silently rejected while the setup settles:

```
_dmarc.staystory.co   TXT   "v=DMARC1; p=none; rua=mailto:<an address you read>"
```

Tighten `p=none` to `p=quarantine` later, after the reports show legitimate
mail passing.

### Checking it worked

1. Sign up with a fresh address and confirm the email arrives in the inbox, not
   spam.
2. View the message source — `SPF`, `DKIM` and `DMARC` should all say `pass`,
   and the `From` should be `@staystory.co`.
3. Request a password reset and confirm that link lands on `/reset-password`.

---

## Still open

- **Leaked-password protection** is off, and is Pro-only. Our browser-side
  check covers the same ground; Supabase's is server-enforced and also covers
  password changes.
- **Password strength rules** (minimum length, required character classes) are
  *not* Pro-gated and are server-enforced. Currently 8 characters and nothing
  else. Same dashboard page as the SMTP settings.
- **`rls_enabled_no_policy`** shows as INFO for `signup_ips` and
  `admin_actions`. That is intended: both are written only by the service role,
  which bypasses RLS, so RLS with no policies is the tightest correct setting.
  See the comments in `supabase-migration.sql`.
