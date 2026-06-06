import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { localSkillNames, lockManagedSkillNames } from "../allowlist";
import { repoRoot } from "../repo";

describe("lock-consistency gate", () => {
  it("every lock-managed skill exists on disk with a SKILL.md", () => {
    for (const name of lockManagedSkillNames()) {
      const path = join(repoRoot, ".agents/skills", name, "SKILL.md");
      expect.soft(existsSync(path), `lock-managed skill missing on disk: ${name}`).toBe(true);
    }
  });

  it("local (evolvable) skills are disjoint from lock-managed skills", () => {
    const lockManaged = lockManagedSkillNames();
    for (const name of localSkillNames()) {
      expect.soft(lockManaged.has(name), `${name} is both local and lock-managed`).toBe(false);
    }
  });

  it("every local skill has a SKILL.md", () => {
    for (const name of localSkillNames()) {
      const path = join(repoRoot, ".agents/skills", name, "SKILL.md");
      expect.soft(existsSync(path), `local skill missing SKILL.md: ${name}`).toBe(true);
    }
  });
});
