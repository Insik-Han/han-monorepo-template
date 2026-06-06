import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { repoRoot } from "../repo";

// Hermes-style size constraint: instruction docs must stay scannable.
const DOC_LIMIT_BYTES = 15 * 1024;
const LEARNINGS_LIMIT_BYTES = 32 * 1024;
const ARCHIVE_LIMIT_BYTES = 256 * 1024;

const LEARNINGS_FILES = new Set(["learnings.md", "learnings-archive.md"]);

describe("docs-size gate", () => {
  it("keeps AGENTS.md within the size limit", () => {
    expect(statSync(join(repoRoot, "AGENTS.md")).size).toBeLessThanOrEqual(DOC_LIMIT_BYTES);
  });

  it("keeps every docs/agents/*.md within the size limit", () => {
    const dir = join(repoRoot, "docs/agents");
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      if (LEARNINGS_FILES.has(file)) continue;
      expect
        .soft(statSync(join(dir, file)).size, `${file} exceeds ${DOC_LIMIT_BYTES}B`)
        .toBeLessThanOrEqual(DOC_LIMIT_BYTES);
    }
  });

  it("keeps the learnings buffer within its limit (archive when exceeded)", () => {
    const dir = join(repoRoot, "docs/agents");
    const limits: Record<string, number> = {
      "learnings.md": LEARNINGS_LIMIT_BYTES,
      "learnings-archive.md": ARCHIVE_LIMIT_BYTES,
    };
    for (const [file, limit] of Object.entries(limits)) {
      const path = join(dir, file);
      let size = 0;
      try {
        size = statSync(path).size;
      } catch {
        continue; // buffer not created yet — fine
      }
      expect.soft(size, `${file} exceeds ${limit}B`).toBeLessThanOrEqual(limit);
    }
  });
});
