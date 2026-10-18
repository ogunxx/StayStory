# Tests

```bash
npm test
```

That is the release suite. It needs nothing but a clean `npm install` — no
database, no credentials, no network, no dev server. It runs in about a
second.

## Why these exist

Through most of this project the tests lived in a session scratchpad rather
than the repository. They worked, and then a fresh container arrived and
roughly 149 checks were simply gone — unrunnable at exactly the moment a
release candidate needed them most. These are the same business rules,
committed, so they live and die with the code instead of with a session.

## What runs

`node --test` with `tsx` for TypeScript and the `@/*` path alias. Both are
already in the stack; nothing heavier was added.

| File | What it protects |
|---|---|
| `focused-path.test.ts` | The five stages, the first-run rule, the returning-Audit state (completed beats a leftover draft), and Feedback staying optional |
| `journey-sequence.test.ts` | What the Dashboard tells a host to do next — including "Continue your Audit", and not sending a front-door host into the six-tool product |
| `property-scope.test.ts` | The user+property scoping convention, and the `/legend` Playbook leak as a regression |
| `focused-kinds.test.ts` | Focused rows never consume a Generator credit or render as blank History cards |
| `staleness.test.ts` | When generated work goes stale, and when re-confirming an unchanged Compass must *not* make it stale |
| `feedback.test.ts` | Submission validation, limits, and `review_status` staying ours rather than the host's |
| `admin-data.test.ts` | Property-scoped journey facts, draft precedence, and a funnel that counts people rather than rows |
| `stripe-price-guard.test.ts` | Checkout refuses a mismatched price — the crossed Legendary/Portfolio bug |
| `launch-mode.test.ts` | Who gets the focused shell, the launch copy, and the full-mode wording staying recoverable |

## What is deliberately not here

**Rendering and layout.** Responsive checks and click-throughs are done with
a browser against a dev server. They are worth running before a release but
they are slow, need a server, and are not business rules.

**Live-database checks.** `tests/live/` holds read-only schema assertions and
skips unless credentials are present. See `tests/live/README.md`. They are
never part of `npm test`.

## Writing more

Two rules, both learned the hard way here:

**Test the exported rule, not a copy of it.** If a test has to reimplement the
algorithm to check the algorithm, it will drift and then disagree with the
product — which happened, and the test was the thing that was wrong. Export
the rule and have both call it. `activeStage` and `scopeToProperty` are both
exported for exactly this reason.

**Prefer a seam to a source grep.** A couple of assertions here do read source
text, where the guarantee is "this call site uses the shared registry" and no
runtime seam can observe that. They are marked where they appear. Everywhere
else, test the function.
