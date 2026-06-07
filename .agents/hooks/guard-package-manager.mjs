#!/usr/bin/env node
// PreToolUse guard: forbid direct `pnpm` / `npm` / `npx` invocations — all
// package management goes through `vp` (docs/agents/vite-plus.md).
// Exit 2 = deny; stderr is shown to the agent.
//
// Only command segments whose first token is a forbidden binary are
// inspected — prose inside heredocs/strings (e.g. a commit message mentioning
// "pnpm install") must not trigger the guard. `vp pm <command>` remains the
// escape hatch for raw pnpm-specific commands.

import { readFileSync } from "node:fs";

const FORBIDDEN = {
  pnpm: "vp (e.g. `vp install`, `vp add <pkg>`, `vp pm <raw pnpm command>`)",
  npm: "vp (e.g. `vp install`, `vp add <pkg>`, `vp run <script>`)",
  npx: "vp dlx <pkg>",
};

function deny(message) {
  console.error(message);
  process.exit(2);
}

/** @returns {string[]} forbidden binaries invoked by the command */
function forbiddenInvocations(command) {
  const found = [];
  for (const segment of String(command).split(/\|\||&&|;|\||\n/)) {
    const tokens = segment.trim().split(/\s+/).filter(Boolean);
    // skip leading VAR=value assignments
    let i = 0;
    while (i < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[i])) i += 1;
    const bin = tokens[i];
    if (bin && Object.hasOwn(FORBIDDEN, bin)) found.push(bin);
  }
  return found;
}

try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const invoked = forbiddenInvocations(input.tool_input?.command ?? "");
  if (invoked.length === 0) process.exit(0);

  const hints = [...new Set(invoked)]
    .map((bin) => `\`${bin}\` -> use ${FORBIDDEN[bin]}`)
    .join("; ");
  deny(
    `Blocked: direct package-manager calls are forbidden in this repo — use vp instead. ${hints}. ` +
      "See docs/agents/vite-plus.md.",
  );
} catch {
  process.exit(0); // never break tool use on guard errors
}
