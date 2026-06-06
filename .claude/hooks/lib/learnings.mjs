// Learnings buffer helpers for Claude Code hooks.
//
// NOTE: this intentionally duplicates packages/evolution/src/learnings-format.ts
// — hooks cannot import workspace TypeScript. Keep both in sync; the format is
// pinned by packages/evolution/src/learnings-format.test.ts and specified in
// docs/agents/self-evolution.md.

import { createHash } from "node:crypto";
import { appendFileSync, existsSync, readFileSync } from "node:fs";

const HEADER_PATTERN = /^## (\S+) · category:(\S+) · status:(undigested|digested)\s*$/;
const FIELD_PATTERN = /^- (target|rationale|evidence|hash):\s*(.*)$/;

/** @typedef {{timestamp: string, category: string, status: "undigested"|"digested", target: string, rationale: string, evidence: string, hash: string}} LearningEntry */

/** @returns {LearningEntry[]} */
export function parseLearnings(markdown) {
  const entries = [];
  let current;
  const flush = () => {
    if (
      current?.timestamp &&
      current.category &&
      current.status &&
      current.target &&
      current.rationale &&
      current.evidence &&
      current.hash
    ) {
      entries.push(current);
    }
    current = undefined;
  };
  for (const line of markdown.split("\n")) {
    const header = HEADER_PATTERN.exec(line);
    if (header) {
      flush();
      current = { timestamp: header[1], category: header[2], status: header[3] };
      continue;
    }
    const field = current && FIELD_PATTERN.exec(line);
    if (field) current[field[1]] = field[2].trim();
  }
  flush();
  return entries;
}

/** Dedup hash over the semantic identity of a learning. */
export function learningHash({ category, target, rationale }) {
  const normalized = [category, target, rationale]
    .map((s) => String(s).toLowerCase().replace(/\s+/g, " ").trim())
    .join("|");
  return createHash("sha256").update(normalized).digest("hex").slice(0, 8);
}

/** @returns {LearningEntry[]} */
export function readLearnings(bufferPath) {
  if (!existsSync(bufferPath)) return [];
  return parseLearnings(readFileSync(bufferPath, "utf8"));
}

export function formatEntry({ timestamp, category, status, target, rationale, evidence, hash }) {
  return [
    `## ${timestamp} · category:${category} · status:${status}`,
    `- target: ${target}`,
    `- rationale: ${rationale}`,
    `- evidence: ${evidence}`,
    `- hash: ${hash}`,
    "",
  ].join("\n");
}

function tokens(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 3),
  );
}

/** Word-level Jaccard similarity — catches same learning reworded by the model. */
export function rationaleSimilarity(a, b) {
  const setA = tokens(a);
  const setB = tokens(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let shared = 0;
  for (const word of setA) if (setB.has(word)) shared += 1;
  return shared / (setA.size + setB.size - shared);
}

const SIMILARITY_THRESHOLD = 0.4;

function isDuplicate(candidate, existing) {
  return existing.some(
    (entry) =>
      entry.target === candidate.target &&
      rationaleSimilarity(entry.rationale, candidate.rationale) >= SIMILARITY_THRESHOLD,
  );
}

/**
 * Append candidate learnings that are not already in the buffer.
 * Identity = exact hash; near-duplicates = same target + similar rationale.
 * @returns {number} how many entries were appended
 */
export function appendLearnings(bufferPath, candidates) {
  const existing = readLearnings(bufferPath);
  const seen = new Set(existing.map((entry) => entry.hash));
  const fresh = [];
  for (const candidate of candidates) {
    const hash = learningHash(candidate);
    if (seen.has(hash)) continue;
    if (isDuplicate(candidate, [...existing, ...fresh])) continue;
    seen.add(hash);
    fresh.push({ ...candidate, status: "undigested", hash });
  }
  if (fresh.length > 0) {
    appendFileSync(bufferPath, `\n${fresh.map(formatEntry).join("\n")}`);
  }
  return fresh.length;
}
