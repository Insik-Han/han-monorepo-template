import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vite-plus/test";
import { assertChangedFilesAllowlisted } from "./diff-guard";
import { repoRoot } from "./repo";

/**
 * Diff-level guard for self-evolution PRs. Activated by setting
 * EVOLUTION_DIFF_BASE (e.g. "origin/main") — run by the CI evolution-guard
 * job and by /evolve before opening a PR. Skipped in normal test runs.
 */
const base = process.env["EVOLUTION_DIFF_BASE"];

// Engine files: changing these rewires the evolution pipeline itself, so the
// same diff must carry an ADR explaining the change.
const ENGINE_PATTERNS = [
  ".claude/settings.json",
  ".claude/hooks/",
  "packages/evolution/",
  ".github/workflows/ci.yml",
] as const;

function changedFiles(diffBase: string): string[] {
  const output = execFileSync("git", ["diff", "--name-only", `${diffBase}...HEAD`], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return output.split("\n").filter(Boolean);
}

describe.skipIf(!base)("evolution-guard", () => {
  const changed = base ? changedFiles(base) : [];

  it("only touches allowlisted files", () => {
    expect(() => assertChangedFilesAllowlisted(changed)).not.toThrow();
  });

  it("engine self-modifications ship with an ADR in the same diff", () => {
    const touchesEngine = changed.some((path) =>
      ENGINE_PATTERNS.some((pattern) =>
        pattern.endsWith("/") ? path.startsWith(pattern) : path === pattern,
      ),
    );
    if (!touchesEngine) return;
    const hasAdr = changed.some((path) => path.startsWith("docs/adr/"));
    expect(hasAdr, "engine change without docs/adr/* in the same diff").toBe(true);
  });
});
