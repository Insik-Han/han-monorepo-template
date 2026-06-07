# ADR-0001: Self-evolution runs through allowlisted, gated PRs only

- **Status**: accepted
- **Date**: 2026-06-06
- **Context scope**: system-wide

## Context

Agent instructions (`AGENTS.md`, `docs/agents/**`) and locally-owned skills drift out of date as the repo evolves, and corrections given in chat sessions are lost when the session ends. We want the agent to improve its own instructions continuously (cf. NousResearch hermes-agent-self-evolution, MUSE-Autoskill), but unsupervised self-modification compounds errors and misalignment (cf. Anthropic, _Recursive Self-Improvement_). Human review in chat is explicitly out of scope — the only acceptable human gate is PR review.

## Decision

We will let the agent evolve its own instructions through a constrained pipeline:

1. **Capture**: a `SessionEnd` hook extracts learnings from each session transcript (headless `claude -p`, haiku) into the append-only buffer `docs/agents/learnings.md`.
2. **Digest**: the `/evolve` skill turns undigested learnings into a branch + PR (`gh pr create`). Direct commits to `main` are forbidden for evolution targets.
3. **Gate**: CI runs structural gates (`packages/evolution`) on every PR; PRs labeled `self-evolving` additionally run a diff-level guard.

Constraints, enforced in code (`packages/evolution/src/allowlist.ts` is the single source of truth):

- **Allowlist**: evolution PRs may only change `AGENTS.md`, `docs/agents/**`, `docs/adr/**`, `.claude/settings.json`, `.codex/hooks.json`, `.agents/hooks/**`, `packages/evolution/**`, `.github/workflows/ci.yml`, and locally-owned skills (skills present in `.agents/skills/` but absent from `skills-lock.json`, plus their runtime symlinks). Lock-managed external skills, app/package source code, lockfiles, and `skills-lock.json` itself are never evolution targets.
- **Engine self-modification** (settings, hooks, `packages/evolution`, CI workflow) is allowed but must ship an ADR in the same diff, enforced by the `evolution-guard` CI job.
- **Rollback model**: every evolution lands as one PR = one revertable commit on `main`; `git revert` is the recovery path and PR bodies must state it.

Branch protection on `main` (require the `ci` check, forbid direct pushes) is configured manually in GitHub settings — it cannot be expressed in-repo.

## Consequences

- Instructions and skills improve from real session evidence without chat-level ceremony; the human cost is concentrated in PR review.
- The structural gates (doc size, index integrity, skill frontmatter, symlink integrity, settings schema, lock consistency) double as general repo-invariant tests and run for every PR, not just evolution ones.
- The learnings hook parser (`.agents/hooks/lib/learnings.mjs`) intentionally duplicates `packages/evolution/src/learnings-format.ts` because hooks cannot import workspace TypeScript; the format test pins both.
- Dependency changes (`pnpm-lock.yaml`) are outside the allowlist, so an evolution that needs a new package must be split into a human-driven PR first. This is accepted friction (supply-chain safety).
- Revisit triggers: the learnings buffer overflowing faster than `/evolve` digests it; gate false-positives blocking legitimate doc updates; a need for scheduled (cron) evolution instead of manual `/evolve`.

## Alternatives considered

- **GitHub Actions-driven evolution (scheduled headless agent)** — rejected for v1: secrets management and runaway-cost risk; local hooks keep the human in the loop at zero infra cost.
- **Oxlint rules as gates** — rejected: `.agents/`, `.claude/`, `.hermes/` are lint-ignored; Vitest tests reading files via `node:fs` slot into the existing `vp run test` pipeline instead.
- **Free-form evolution without an allowlist** — rejected: violates the compounding-misalignment guardrails; the allowlist plus ADR-on-self-modification keeps every step auditable and revertable.
