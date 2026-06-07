# Vite+

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task.

Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`.

Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`.

## Commands

- Run `vp help` to print a list of commands.
- Run `vp <command> --help` for information about a specific command.
- Run `vp install` after pulling remote changes and before getting started.
- Run `vp check` and `vp test` to format, lint, type check, and test changes.
- Check whether `vite.config.ts` tasks or `package.json` scripts are necessary for validation, and run them via `vp run <script>`.
- If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

## Package management

Use `vp` for all package management — do not call `pnpm`, `npm`, or `npx` directly. `vp` detects the workspace's package manager (pnpm here, via `packageManager` in `package.json`) and downloads the matching version automatically. This rule is enforced: a PreToolUse hook (`.agents/hooks/guard-package-manager.mjs`) blocks direct `pnpm`/`npm`/`npx` calls (ADR-0002).

- `vp install` installs dependencies; `vp install --lockfile-only` updates `pnpm-lock.yaml` without a full install.
- `vp add <pkg>` / `vp add -D <pkg>` / `vp remove <pkg>` edit dependencies.
- `vp dlx <pkg>` replaces `pnpm dlx` / `npx` for one-off binaries.
- `vp pm <command>` forwards a raw pnpm-specific command when no normalized `vp` equivalent exists (e.g. `vp pm why --json`).

## Commit hooks

Git hooks are managed by Vite+ itself — do not add lefthook, husky, or lint-staged.

- Hooks live in `.vite-hooks/` (`core.hooksPath` points there). Run `vp config` once after cloning if hooks are not active.
- The pre-commit hook runs `vp staged`, which applies the `staged` config in `vite.config.ts` (currently `vp check --fix` on staged JS/TS files).
- To change what runs on commit, edit the `staged` block in `vite.config.ts`, not the hook files.

## Docs

Docs are local at `node_modules/vite-plus/docs` or online at `https://viteplus.dev/guide/`.
