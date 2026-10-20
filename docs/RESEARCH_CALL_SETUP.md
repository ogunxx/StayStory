# The 15-minute research conversation

> What to set up outside the repo so the optional booking invitation appears
> after someone submits the Help Shape StayStory form on the homepage.
>
> Decided 18 October 2026: reuse the existing Acuity account rather than add
> a second scheduling platform. Nothing is installed in the codebase — the
> app holds one URL and links to it.

---

## The short version

1. In Acuity, make an appointment type called **StayStory Host Research
   Conversation** — 15 minutes, no payment, minimal intake.
2. Copy its public scheduling link.
3. Set `NEXT_PUBLIC_RESEARCH_CALL_URL` to that link in Vercel, for
   **Preview** now and **Production** before launch.
4. **Redeploy.** The variable is read at build time, not at request time.

Until step 3, the research form works completely and the booking invitation
simply does not appear. That is a working state, not a broken one.

---

## 1. The Acuity appointment type

| Setting | Value | Why |
|---|---|---|
| Name | StayStory Host Research Conversation | It appears on the booking page and in the calendar invite. A host should recognise what they agreed to. |
| Duration | 15 minutes | What the invitation on the site promises. If you change it, change `CONVERSATION` in `help-shape.tsx` to match. |
| Price | None | This is research. A payment step would contradict everything the page says. |
| Type | One-on-one | |
| Intake form | Nothing, or at most one optional question | We already have their name, email, property type, biggest challenge and what they wish existed. Asking again wastes the goodwill that got them this far. |
| Confirmation | Say plainly it is a conversation, not a sales call | It is the last thing they read before the day arrives. |

Keep availability honest — only hours you will genuinely keep.

## 2. The link

Acuity shows a **direct scheduling link** for each appointment type. Copy
whatever it gives you rather than assembling one by hand. It is usually one
of these shapes:

```
https://app.acuityscheduling.com/schedule.php?owner=XXXXXXX&appointmentType=YYYYYYY
https://<your-name>.as.me/<slug>
```

It must be **https**. The app refuses anything else — a booking page on plain
http would send a stranger's name and email across the network in clear text,
and `isUsableCallUrl` in `src/lib/host-research.ts` rejects it rather than
rendering a link that leaks.

Use the link for the *appointment type*, not the account's general booking
page. A general page makes someone choose a meeting kind, which is a decision
we already made for them.

## 3. Vercel

**Project:** staystory · **Variable:** `NEXT_PUBLIC_RESEARCH_CALL_URL`

| Environment | When | Why |
|---|---|---|
| Preview | Now | So the invitation can be tested on the preview before launch |
| Production | Before launch | Otherwise the live site hides the invitation and nobody can book |
| Development | Optional | Only if you want it locally |

It is a public value by design — `NEXT_PUBLIC_` means it ends up in the
browser bundle, which is correct for a link that is meant to be clicked. Do
not put anything private behind this prefix.

## 4. Redeploy

`NEXT_PUBLIC_*` variables are **inlined when the app is built**, not read per
request. Setting the variable does nothing to deployments that already exist.
Redeploy the preview after setting it, or the invitation will still be
missing and it will look as though the code is wrong.

---

## Checking it worked

On the homepage: expand **Help Shape StayStory**, answer the questions,
choose **Yes** or **Maybe** for testing, and submit. After the confirmation
you should see **Open to a quick conversation?** with a
**Book a 15-Minute Conversation** button.

Choosing **Not right now** should show the confirmation with no invitation —
they answered the question, and asking again is pressure.

If the invitation does not appear, in order of likelihood:

1. The deployment predates the variable → redeploy.
2. The value is not `https://…` → the app hides it on purpose.
3. The chosen interest was "Not right now" → working as intended.

## If the link ever changes

Change it in Vercel and redeploy. One constant,
`RESEARCH_CALL_URL` in `src/lib/config.ts`, is the only place the app reads
it, and one function, `shouldOfferConversation`, is the only place that
decides whether to show the button. Nothing else needs touching.

## What is deliberately not built

No Acuity API integration, no embedded booking widget, no webhook writing
bookings back into `host_research`, no reminder emails. A link is enough for
early access, and each of those would be a system to maintain for a handful
of conversations. Revisit when the volume justifies it, not before.
