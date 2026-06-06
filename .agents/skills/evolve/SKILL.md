---
name: evolve
description: Digest accumulated session learnings into a gated self-evolution PR that improves agent docs, skills, or the evolution engine itself. Use when the user runs /evolve, asks to digest learnings, or wants agent instructions updated from session feedback.
disable-model-invocation: true
---

# Evolve

Turn undigested entries in `docs/agents/learnings.md` into one reviewed PR. Read `docs/agents/self-evolution.md` first — it defines the allowlist, gates, and learnings format. The human gate is PR review; do not ask for chat confirmation of individual edits.

## Flow

1. **Load** — parse `docs/agents/learnings.md`; collect entries with `status:undigested`. If none, say so and stop.
2. **Group** — cluster entries by `target`. For each target, decide the minimal edit that addresses the rationale(s). Skip entries whose rationale is wrong or already addressed — flip them to `digested` with a note in the PR body instead of editing.
3. **Allowlist check** — every file you plan to touch must satisfy `isAllowlisted` (`packages/evolution/src/allowlist.ts`). Non-allowlisted suggestions go into the PR body as "Out of scope" notes, never into the diff.
4. **Branch** — `git checkout -b evolve/<YYYY-MM-DD>-<slug>` (never edit on main; a PreToolUse hook blocks main commits anyway).
5. **Edit** — apply the grouped edits. Keep docs ≤15KB (docs-size gate). New/edited skills need `name` = dirname frontmatter and the two runtime symlinks (see "New skills" below).
6. **Flip** — set consumed entries to `status:digested` in `docs/agents/learnings.md` (same commit). If the buffer exceeds 32KB, move digested entries to `docs/agents/learnings-archive.md`.
7. **Self-check** — run from the repo root:
   - `vp check`
   - `cd packages/evolution && vp test run` (structural gates)
   - `cd packages/evolution && EVOLUTION_DIFF_BASE=origin/main vp test run src/evolution-guard.test.ts` (after committing)
   - Optional semantic eval: `cd packages/evolution && SEMANTIC_EVAL=1 vp test run src/semantic-eval.test.ts` — record scores in the PR body.
8. **PR** — push and `gh pr create` using `reference/pr-template.md` as the body. Add the `self-evolving` label: `gh pr create --label self-evolving ...`.
9. **Engine self-modification** — if the diff touches `.claude/settings.json`, `.claude/hooks/**`, `packages/evolution/**`, or `.github/workflows/ci.yml`, you MUST add an ADR under `docs/adr/` in the same diff (next number, use `docs/adr/0000-template.md`) and tick the self-modifying checkbox in the PR body. CI fails otherwise.

## New skills (MUSE Creation)

When ≥3 undigested learnings cluster on the same procedural theme (a repeatable how-to rather than a doc fix), propose a new skill instead of bloating docs:

1. Follow the `write-a-skill` skill to draft `.agents/skills/<name>/SKILL.md` (kebab-case name = dirname, ≤15KB).
2. Create both symlinks (relative, exactly like existing ones):
   ```bash
   ln -s ../../.agents/skills/<name> .claude/skills/<name>
   ln -s ../../.agents/skills/<name> .hermes/skills/<name>
   ```
3. Do NOT touch `skills-lock.json` — local skills are defined by absence from it.
4. The skill ships in the same evolution PR, flagged in the PR body under "New skills".

## Rules

- One `/evolve` run = one branch = one PR. Never push to main.
- Never modify lock-managed skills (anything listed in `skills-lock.json`) or files outside the allowlist.
- Don't invent learnings: every change must trace to a learnings entry hash quoted in the PR body.
- If a learning conflicts with an existing instruction, prefer the learning only when its evidence is stronger; otherwise flip to `digested` with a "rejected" note.
