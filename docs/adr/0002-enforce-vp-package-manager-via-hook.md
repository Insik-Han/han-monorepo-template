# ADR-0002: Enforce vp-only package management with a PreToolUse hook

- **Status**: accepted
- **Date**: 2026-06-07
- **Context scope**: system-wide

## Context

`docs/agents/vite-plus.md` already states that all package management must go through `vp` and that `pnpm`, `npm`, and `npx` must never be called directly — `vp` resolves the workspace's pinned package manager (`package.json#packageManager`) automatically, so direct calls risk version drift, broken lockfiles, and skipping Vite+ integrations. In practice the doc rule alone is not followed reliably: in a real session the agent attempted `pnpm install` despite the instruction (it failed only because `pnpm` happened to be absent from `PATH`). The user has mandated that npm/pnpm use be blocked outright.

## Decision

We will enforce the rule in the harness, not just in docs: a new PreToolUse hook (`.agents/hooks/guard-package-manager.mjs`, registered in `.claude/settings.json` alongside `guard-main-branch.mjs`) denies any Bash command segment whose first token is `pnpm`, `npm`, or `npx`, with an error message naming the `vp` equivalent (`vp install` / `vp add` / `vp dlx` / `vp pm <raw command>`).

Like the main-branch guard, it inspects only command-position tokens (split on `&&`, `||`, `;`, `|`, newlines, skipping leading `VAR=value` assignments), so prose inside commit messages, heredocs, or PR bodies mentioning "pnpm" does not trigger it, and it exits 0 on any internal error so a guard bug can never block unrelated tool use.

## Consequences

- The vp-only rule is now machine-enforced for agent sessions; `vp pm <command>` remains the escape hatch for raw pnpm-specific commands.
- Humans in their own terminals are not constrained — this guards agent tool use only.
- Indirect invocations (e.g. a shell script that internally calls pnpm, or `command pnpm`) are not caught; accepted as out of scope since the guard targets the common agent failure mode, not adversarial bypass.
- Revisit triggers: vp gaining a command that legitimately requires a raw `npx`-style call, or false positives blocking legitimate commands.

## Alternatives considered

- **Docs-only rule (status quo)** — rejected: demonstrably insufficient; the agent ignored it under pressure to make progress.
- **`permissions.deny` rules in `.claude/settings.json`** — rejected: prefix-based permission rules are easy to bypass with compound commands and cannot emit a corrective message pointing at the `vp` equivalent.
- **Removing pnpm/npm from PATH** — rejected: environment-dependent, not in-repo, and breaks human workflows outside agent sessions.
