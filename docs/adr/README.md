# Architecture Decision Records

System-wide decisions for this repo. Context-scoped decisions live in `<context-root>/docs/adr/` instead — see `CONTEXT-MAP.md` at the repo root.

## Index

| ADR                                           | Title                                                     | Status   |
| --------------------------------------------- | --------------------------------------------------------- | -------- |
| `0001-self-evolution-pipeline.md`             | Self-evolution runs through allowlisted, gated PRs only   | accepted |
| `0002-enforce-vp-package-manager-via-hook.md` | Enforce vp-only package management with a PreToolUse hook | accepted |

## Conventions

- Copy `0000-template.md` to `NNNN-short-slug.md` (next number, kebab-case slug).
- One decision per record; supersede rather than edit accepted ADRs.
- Add a row to the index above when a record lands.
