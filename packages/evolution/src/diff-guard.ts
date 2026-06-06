import { isAllowlisted } from "./allowlist";

export interface DiffPartition {
  allowed: string[];
  violations: string[];
}

/** Split changed paths into allowlisted and violating sets. */
export function partitionByAllowlist(changedPaths: string[], root?: string): DiffPartition {
  const allowed: string[] = [];
  const violations: string[] = [];
  for (const path of changedPaths) {
    (isAllowlisted(path, root) ? allowed : violations).push(path);
  }
  return { allowed, violations };
}

/**
 * Throws when a self-evolution diff touches files outside the allowlist.
 * Callers pass the output of `git diff --name-only origin/main...HEAD`.
 */
export function assertChangedFilesAllowlisted(changedPaths: string[], root?: string): void {
  const { violations } = partitionByAllowlist(changedPaths, root);
  if (violations.length > 0) {
    throw new Error(
      `Self-evolution diff touches files outside the allowlist:\n` +
        violations.map((path) => `  - ${path}`).join("\n") +
        `\nSee packages/evolution/src/allowlist.ts and docs/agents/self-evolution.md.`,
    );
  }
}
