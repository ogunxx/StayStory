# Live-database checks

**These are not part of the release suite and never run automatically.**

`npm test` runs pure business-rule tests only: no database, no credentials, no
network. Everything in this folder talks to a real Postgres and is here for
the cases where a fixture genuinely cannot prove the thing — schema facts, and
query behaviour against real rows.

Run them deliberately:

```bash
DATABASE_URL='postgres://…' npm run test:live
```

Without `DATABASE_URL` they skip, so running them by accident does nothing.

## Rules these follow

- **Every write is inside `BEGIN … ROLLBACK`.** Nothing persists, including on
  failure.
- **No `DROP`, no `TRUNCATE`, no `DELETE` outside a rolled-back transaction.**
- Fixture rows use a reserved id prefix (`00000000-0000-4000-8000-…`) and
  `@example.invalid` emails, so anything that somehow escaped a rollback is
  obvious and traceable.
- They assert behaviour that the pure tests already cover, against the real
  schema. If a live test and a pure test disagree, the pure test's fixture is
  wrong — fix the fixture, do not relax the live test.

## What is here

| File | What it proves |
|---|---|
| `schema.live.test.ts` | The columns the code assumes actually exist — in particular `playbooks.property_id`, whose absence was asserted by a comment and caused the `/legend` scoping bug |
