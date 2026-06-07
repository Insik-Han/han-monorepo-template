# Self-evolution

The agent improves its own instructions and skills through a gated PR pipeline. The only human gate is PR review. Decision record: `docs/adr/0001-self-evolution-pipeline.md`.

## Pipeline

```
SessionEnd hook (.agents/hooks/session-end-learnings.mjs, async)
  → headless `claude -p` (haiku) summarizes the transcript
  → appends deduplicated entries to docs/agents/learnings.md

/evolve skill (manual)
  → groups undigested learnings by target → drafts diffs
  → runs gates locally → opens a PR on branch evolve/<date>-<slug>
  → flips consumed learnings to status:digested in the same PR

CI (.github/workflows/ci.yml)
  → ci job: vp check + vp run test (includes packages/evolution gates)
  → evolution-guard job (label: self-evolving): diff allowlist + ADR-on-engine-change
  → human review & merge — rollback is `git revert` of the squashed commit
```

## Allowlist

`packages/evolution/src/allowlist.ts` is the **single source of truth**. Evolution PRs may change:

- `AGENTS.md`, `docs/agents/**`, `docs/adr/**`
- `.claude/settings.json`, `.codex/hooks.json`, `.agents/hooks/**`
- `packages/evolution/**`, `.github/workflows/ci.yml` (engine — requires an ADR in the same diff)
- locally-owned skills: directories in `.agents/skills/` that are **not** in `skills-lock.json`, plus their `.claude/skills/<name>` / `.hermes/skills/<name>` symlinks

Everything else (app code, lockfiles, `skills-lock.json`, external skills) needs a regular human-driven PR.

## Learnings buffer format

`docs/agents/learnings.md` is an append-only buffer. Entry shape:

```
## <ISO timestamp> · category:<slug> · status:<undigested|digested>
- target: <repo-relative path the learning should improve>
- rationale: <what was learned and why it matters>
- evidence: <session id, correction count>
- hash: <8-hex dedup hash of category+target+rationale>
```

- `status:` is the digestion marker; `/evolve` flips it to `digested` when a PR consumes the entry.
- When the buffer exceeds 32KB, move digested entries to `docs/agents/learnings-archive.md`.
- Canonical parser: `packages/evolution/src/learnings-format.ts`. The hook keeps an intentional `.mjs` duplicate in `.agents/hooks/lib/learnings.mjs` (hooks cannot import workspace TS) — change both together; `learnings-format.test.ts` pins the format.

## Gates (packages/evolution)

Vitest tests that read repo files via `node:fs` (the `.agents/.claude/.hermes` trees are lint-ignored, so lint rules cannot guard them). They run in every `vp run test`:

| Gate              | Invariant                                                                 |
| ----------------- | ------------------------------------------------------------------------- |
| docs-size         | `AGENTS.md` + `docs/agents/*.md` ≤ 15KB; learnings buffer ≤ 32KB          |
| index-integrity   | `docs/agents/index.md` table ⇔ files on disk; `AGENTS.md` links resolve   |
| skill-frontmatter | every SKILL.md has `name` = dirname + description; local skills ≤ 15KB    |
| symlink-integrity | `.claude/skills` ≡ `.hermes/skills`, all symlinks resolve into `.agents`  |
| settings-schema   | `.claude/settings.json` validates; hook scripts referenced actually exist |
| lock-consistency  | lock-managed skills exist on disk; local/lock-managed sets are disjoint   |

Diff-level guard (`src/evolution-guard.test.ts`) activates with `EVOLUTION_DIFF_BASE=origin/main` and enforces the allowlist plus the ADR-on-engine-change rule.

## Recursion guard

The SessionEnd hook spawns headless `claude -p`, which itself fires SessionEnd on exit. The hook sets `EVOLVE_HOOK_GUARD=1` for the child and exits immediately when that variable is present. Never remove this guard.

## Rules

- Changes to evolution targets go through `/evolve` PRs — never commit them straight to `main`.
- One evolution = one PR = one revertable commit. PR bodies follow `.agents/skills/evolve/reference/pr-template.md`.
- Engine self-modification (hooks, settings, `packages/evolution`, `ci.yml`) additionally requires the `self-evolving` label and an ADR in the same diff.
