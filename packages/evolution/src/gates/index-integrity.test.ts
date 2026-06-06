import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { repoRoot } from "../repo";

// Files that intentionally live outside the index table.
const UNINDEXED = new Set(["index.md", "learnings.md", "learnings-archive.md"]);

function indexedSources(): string[] {
  const index = readFileSync(join(repoRoot, "docs/agents/index.md"), "utf8");
  return [...index.matchAll(/`docs\/agents\/([\w-]+\.md)`/g)].map((m) => m[1]!);
}

describe("index-integrity gate", () => {
  it("every index.md table row points at an existing doc", () => {
    const sources = indexedSources();
    expect(sources.length).toBeGreaterThan(0);
    for (const source of sources) {
      expect
        .soft(existsSync(join(repoRoot, "docs/agents", source)), `${source} missing`)
        .toBe(true);
    }
  });

  it("every docs/agents/*.md is referenced from index.md", () => {
    const sources = new Set(indexedSources());
    const files = readdirSync(join(repoRoot, "docs/agents")).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      if (UNINDEXED.has(file)) continue;
      expect.soft(sources.has(file), `${file} not listed in docs/agents/index.md`).toBe(true);
    }
  });

  it("every docs/agents reference in AGENTS.md resolves", () => {
    const agents = readFileSync(join(repoRoot, "AGENTS.md"), "utf8");
    const refs = [...agents.matchAll(/docs\/agents\/([\w-]+\.md)/g)].map((m) => m[1]!);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) {
      expect
        .soft(existsSync(join(repoRoot, "docs/agents", ref)), `AGENTS.md → ${ref} missing`)
        .toBe(true);
    }
  });
});
