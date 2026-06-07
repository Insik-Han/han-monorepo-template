#!/usr/bin/env node
// PreToolUse guard: forbid `git commit` while on main and any `git push` that
// targets main. Evolution (and all other) changes must land via PR branches.
// Exit 2 = deny; stderr is shown to the agent. Spec: docs/agents/self-evolution.md.
//
// Only command segments whose first token is `git` are inspected — prose
// inside heredocs/strings (e.g. a PR body mentioning "git push") must not
// trigger the guard.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

function deny(message) {
  console.error(message);
  process.exit(2);
}

/** @returns {{sub: string, args: string[]}[]} git invocations found in the command */
function gitInvocations(command) {
  const invocations = [];
  for (const segment of String(command).split(/\|\||&&|;|\||\n/)) {
    const tokens = segment.trim().split(/\s+/).filter(Boolean);
    // skip leading VAR=value assignments
    let i = 0;
    while (i < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[i])) i += 1;
    if (tokens[i] !== "git") continue;
    i += 1;
    // skip global flags like -C <path> / -c key=val
    while (i < tokens.length && tokens[i].startsWith("-")) {
      i += ["-C", "-c"].includes(tokens[i]) ? 2 : 1;
    }
    if (i < tokens.length) invocations.push({ sub: tokens[i], args: tokens.slice(i + 1) });
  }
  return invocations;
}

try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const invocations = gitInvocations(input.tool_input?.command ?? "");
  if (invocations.length === 0) process.exit(0);

  const wantsCommit = invocations.some((inv) => inv.sub === "commit");
  const pushes = invocations.filter((inv) => inv.sub === "push");
  if (!wantsCommit && pushes.length === 0) process.exit(0);

  let branch = "";
  try {
    branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: input.cwd ?? process.cwd(),
      encoding: "utf8",
    }).trim();
  } catch {
    process.exit(0); // not a git repo — nothing to guard
  }

  if (wantsCommit && branch === "main") {
    deny(
      "Blocked: direct commits to main are forbidden. Create a branch first " +
        "(evolution changes: evolve/<date>-<slug>, see docs/agents/self-evolution.md).",
    );
  }

  for (const push of pushes) {
    const positional = push.args.filter((arg) => !arg.startsWith("-"));
    const refspec = positional[1]; // git push <remote> <refspec>
    const targetsMain = refspec
      ? refspec === "main" || refspec.endsWith(":main")
      : branch === "main";
    if (targetsMain) {
      deny("Blocked: pushing to main is forbidden. Open a PR instead (gh pr create).");
    }
  }
} catch {
  process.exit(0); // never break tool use on guard errors
}
