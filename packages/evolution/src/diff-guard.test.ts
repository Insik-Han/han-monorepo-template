import { describe, expect, it } from "vite-plus/test";
import { isAllowlisted, localSkillNames } from "./allowlist";
import { assertChangedFilesAllowlisted, partitionByAllowlist } from "./diff-guard";

describe("allowlist", () => {
  it("allows evolution targets", () => {
    expect(isAllowlisted("AGENTS.md")).toBe(true);
    expect(isAllowlisted("docs/agents/testing.md")).toBe(true);
    expect(isAllowlisted("docs/adr/0001-self-evolution-pipeline.md")).toBe(true);
    expect(isAllowlisted(".claude/settings.json")).toBe(true);
    expect(isAllowlisted(".claude/hooks/session-end-learnings.mjs")).toBe(true);
    expect(isAllowlisted("packages/evolution/src/allowlist.ts")).toBe(true);
    expect(isAllowlisted(".github/workflows/ci.yml")).toBe(true);
  });

  it("allows locally-owned skills but not lock-managed ones", () => {
    const local = localSkillNames();
    expect(local.length).toBeGreaterThan(0);
    expect(isAllowlisted(`.agents/skills/${local[0]}/SKILL.md`)).toBe(true);
    expect(isAllowlisted(".agents/skills/ast-grep/SKILL.md")).toBe(false);
    expect(isAllowlisted(".claude/skills/ast-grep")).toBe(false);
  });

  it("rejects everything else", () => {
    expect(isAllowlisted("packages/api/src/index.ts")).toBe(false);
    expect(isAllowlisted("pnpm-lock.yaml")).toBe(false);
    expect(isAllowlisted("skills-lock.json")).toBe(false);
    expect(isAllowlisted("vite.config.ts")).toBe(false);
    expect(isAllowlisted("AGENTS.md.bak")).toBe(false);
  });
});

describe("diff-guard", () => {
  it("partitions changed paths", () => {
    const { allowed, violations } = partitionByAllowlist([
      "docs/agents/testing.md",
      "packages/api/src/index.ts",
    ]);
    expect(allowed).toEqual(["docs/agents/testing.md"]);
    expect(violations).toEqual(["packages/api/src/index.ts"]);
  });

  it("throws with a violation list", () => {
    expect(() => assertChangedFilesAllowlisted(["pnpm-lock.yaml"])).toThrowError(/pnpm-lock\.yaml/);
  });

  it("passes for a clean evolution diff", () => {
    expect(() =>
      assertChangedFilesAllowlisted(["docs/agents/testing.md", "AGENTS.md"]),
    ).not.toThrow();
  });
});
