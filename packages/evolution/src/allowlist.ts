import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { repoRoot } from "./repo";

/**
 * Single source of truth for what self-evolution PRs may change.
 *
 * A trailing "/" means "directory prefix"; anything else is an exact path.
 * Everything outside this list (plus locally-owned skills, computed below)
 * must go through a regular human-driven PR.
 */
export const STATIC_ALLOWLIST: readonly string[] = [
  "AGENTS.md",
  "docs/agents/",
  "docs/adr/",
  ".claude/settings.json",
  ".codex/hooks.json",
  ".agents/hooks/",
  "packages/evolution/",
  ".github/workflows/ci.yml",
];

/** Skill names managed by skills-lock.json (externally sourced — never evolved). */
export function lockManagedSkillNames(root: string = repoRoot): Set<string> {
  const lock = JSON.parse(readFileSync(join(root, "skills-lock.json"), "utf8")) as {
    skills: Record<string, unknown>;
  };
  return new Set(Object.keys(lock.skills));
}

/**
 * Locally-owned skill names: directories under .agents/skills that are NOT in
 * skills-lock.json. Computed dynamically so skills created by /evolve are
 * allowlisted automatically.
 */
export function localSkillNames(root: string = repoRoot): string[] {
  const skillsDir = join(root, ".agents/skills");
  if (!existsSync(skillsDir)) return [];
  const lockManaged = lockManagedSkillNames(root);
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !lockManaged.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

/** Full allowlist patterns: static entries + per-local-skill paths. */
export function allowlistPatterns(root: string = repoRoot): string[] {
  const patterns = [...STATIC_ALLOWLIST];
  for (const name of localSkillNames(root)) {
    patterns.push(`.agents/skills/${name}/`, `.claude/skills/${name}`, `.hermes/skills/${name}`);
  }
  return patterns;
}

/** True if a repo-relative path is allowed to change in a self-evolution PR. */
export function isAllowlisted(path: string, root: string = repoRoot): boolean {
  return allowlistPatterns(root).some((pattern) =>
    pattern.endsWith("/") ? path.startsWith(pattern) : path === pattern,
  );
}
