/**
 * Canonical parser for docs/agents/learnings.md entries.
 *
 * NOTE: .agents/hooks/lib/learnings.mjs intentionally duplicates this logic —
 * hooks cannot import workspace TypeScript. Keep both in sync (guarded by
 * src/learnings-format.test.ts fixtures). See docs/agents/self-evolution.md.
 *
 * Entry format:
 *   ## <ISO timestamp> · category:<slug> · status:<undigested|digested>
 *   - target: <repo-relative path>
 *   - rationale: <why this learning matters>
 *   - evidence: <session id / correction count>
 *   - hash: <dedup hash>
 */
export type LearningStatus = "undigested" | "digested";

export interface LearningEntry {
  timestamp: string;
  category: string;
  status: LearningStatus;
  target: string;
  rationale: string;
  evidence: string;
  hash: string;
}

const HEADER_PATTERN = /^## (\S+) · category:(\S+) · status:(undigested|digested)\s*$/;
const FIELD_PATTERN = /^- (target|rationale|evidence|hash):\s*(.*)$/;

export function parseLearnings(markdown: string): LearningEntry[] {
  const entries: LearningEntry[] = [];
  let current: Partial<LearningEntry> | undefined;

  const flush = () => {
    if (!current) return;
    const { timestamp, category, status, target, rationale, evidence, hash } = current;
    if (timestamp && category && status && target && rationale && evidence && hash) {
      entries.push({ timestamp, category, status, target, rationale, evidence, hash });
    }
    current = undefined;
  };

  for (const line of markdown.split("\n")) {
    const header = HEADER_PATTERN.exec(line);
    if (header) {
      flush();
      current = {
        timestamp: header[1],
        category: header[2],
        status: header[3] as LearningStatus,
      };
      continue;
    }
    const field = current && FIELD_PATTERN.exec(line);
    if (field?.[1] && field[2] !== undefined) {
      current![field[1] as "target" | "rationale" | "evidence" | "hash"] = field[2].trim();
    }
  }
  flush();
  return entries;
}
