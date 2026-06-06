import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { localSkillNames } from "../allowlist";
import { parseFrontmatter } from "../markdown";
import { repoRoot } from "../repo";

function skillDirs(): string[] {
  return readdirSync(join(repoRoot, ".agents/skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

describe("skill-frontmatter gate", () => {
  it("every skill has a SKILL.md with valid frontmatter", () => {
    for (const dir of skillDirs()) {
      const path = join(repoRoot, ".agents/skills", dir, "SKILL.md");
      expect.soft(existsSync(path), `${dir}/SKILL.md missing`).toBe(true);
      if (!existsSync(path)) continue;

      const fields = parseFrontmatter(readFileSync(path, "utf8"));
      expect.soft(fields, `${dir}: no frontmatter`).toBeDefined();
      expect.soft(fields?.["name"], `${dir}: frontmatter name must match directory`).toBe(dir);
      expect
        .soft((fields?.["description"]?.length ?? 0) > 0, `${dir}: empty description`)
        .toBe(true);
      expect
        .soft((fields?.["description"]?.length ?? 0) <= 1024, `${dir}: description too long`)
        .toBe(true);
    }
  });

  // Size constraint applies only to evolvable (local) skills — external
  // lock-managed skills are upstream-owned and may exceed it.
  it("every local SKILL.md stays within the Hermes size constraint (15KB)", () => {
    for (const dir of localSkillNames()) {
      const path = join(repoRoot, ".agents/skills", dir, "SKILL.md");
      if (!existsSync(path)) continue;
      const size = readFileSync(path, "utf8").length;
      expect.soft(size, `${dir}/SKILL.md exceeds 15KB`).toBeLessThanOrEqual(15 * 1024);
    }
  });
});
