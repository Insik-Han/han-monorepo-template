# Agent Instructions

Read `docs/agents/index.md` first. It is the index map for repo-specific agent instructions.

## Agent skills

This section is an index map. Read the linked `docs/agents/*.md` files for the full instructions.

### Toolchain

This project uses Vite+ through the `vp` CLI. See `docs/agents/vite-plus.md`.

### Architecture boundaries

Package and layer import boundaries are enforced by a custom Oxlint plugin via `vp check`. See `docs/agents/architecture.md`.

### Structural code search

Use ast-grep for AST-aware code search when text search is not precise enough. See `docs/agents/ast-grep.md`.

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `Insik-Han/han-monorepo-template`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default five-label triage vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Use a multi-context domain-doc layout with a root `CONTEXT-MAP.md` pointing to per-context docs. See `docs/agents/domain.md`.

### Internationalization

`apps/web` and `apps/native` use Lingui (en/ja/ko). New UI strings must use macros and go through the extract → translate workflow. See `docs/agents/i18n.md`.

### Testing

Testing-trophy strategy: `vp test` (Vitest) everywhere except `apps/native` (jest-expo), plus thin Playwright/Maestro E2E. See `docs/agents/testing.md`.

### Self-evolution

Session learnings accumulate in `docs/agents/learnings.md`; the `/evolve` skill digests them into gated PRs. Changes to `AGENTS.md`, `docs/agents/**`, and local skills go through `/evolve` PRs — never commit them straight to `main`. See `docs/agents/self-evolution.md`.
