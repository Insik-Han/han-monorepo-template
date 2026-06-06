# Context Map

This file maps the bounded contexts of this repo to their `CONTEXT.md` glossaries. See `docs/agents/domain.md` for how agents consume these documents.

## Contexts

| Context | Code                                              | Glossary          | Status                                                         |
| ------- | ------------------------------------------------- | ----------------- | -------------------------------------------------------------- |
| Auth    | `packages/auth`, `packages/db/src/schema/auth.ts` | _not yet written_ | better-auth-backed identity; sessions shared by web and native |
| API     | `packages/api`, `apps/server`                     | _not yet written_ | oRPC procedures served over Hono on Cloudflare Workers         |

> The product domain has not been designed yet — this template ships only the
> infrastructure contexts above. Add a row per bounded context as the domain
> takes shape.

## How to add a context

1. Create `<context-root>/CONTEXT.md` with the glossary for that context (term, definition, terms to avoid).
2. Create `<context-root>/docs/adr/` for context-scoped decisions.
3. Add a row to the table above.

Context glossaries and ADRs are produced lazily — typically through `/grill-with-docs` sessions — when terms or decisions actually get resolved. Don't scaffold empty glossaries upfront.

## Decision records

- System-wide ADRs live in `docs/adr/` (see `docs/adr/0000-template.md`).
- Context-scoped ADRs live in `<context-root>/docs/adr/`.
