import { existsSync, lstatSync, readdirSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { lockManagedSkillNames } from "../allowlist";
import { repoRoot } from "../repo";

// Permanent guard against dangling-symlink regressions (cf. commit 536fba8).
const MIRROR_DIRS = [".claude/skills", ".hermes/skills"] as const;

function entries(dir: string): string[] {
  return readdirSync(join(repoRoot, dir)).sort();
}

describe("symlink-integrity gate", () => {
  it("every mirror entry is a symlink resolving to .agents/skills/<same name>", () => {
    for (const dir of MIRROR_DIRS) {
      for (const name of entries(dir)) {
        const linkPath = join(repoRoot, dir, name);
        expect
          .soft(lstatSync(linkPath).isSymbolicLink(), `${dir}/${name} is not a symlink`)
          .toBe(true);
        expect.soft(existsSync(linkPath), `${dir}/${name} is dangling`).toBe(true);
        if (!existsSync(linkPath)) continue;
        const expected = realpathSync(join(repoRoot, ".agents/skills", name));
        expect
          .soft(realpathSync(linkPath), `${dir}/${name} points at the wrong target`)
          .toBe(expected);
      }
    }
  });

  it(".claude/skills and .hermes/skills mirror the same skill set", () => {
    expect(entries(".claude/skills")).toEqual(entries(".hermes/skills"));
  });

  it("every lock-managed skill is mirrored in both runtimes", () => {
    const mirrored = new Set(entries(".claude/skills"));
    for (const name of lockManagedSkillNames()) {
      expect.soft(mirrored.has(name), `lock-managed skill ${name} is not symlinked`).toBe(true);
    }
  });
});
