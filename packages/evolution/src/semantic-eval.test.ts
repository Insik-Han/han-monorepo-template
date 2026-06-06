import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { repoRoot } from "./repo";

/**
 * Semantic eval harness — judges whether the current instruction docs would
 * lead an agent to correct behavior. Local-only (spawns `claude -p`): enable
 * with SEMANTIC_EVAL=1. /evolve runs this before opening a PR and records the
 * scores in the PR body. Never required in CI.
 */
const enabled = process.env["SEMANTIC_EVAL"];

interface Scenario {
  id: string;
  doc: string;
  question: string;
  rubric: string;
}

interface Verdict {
  score: number;
  reason: string;
}

const MODEL = "claude-haiku-4-5";

function scenarios(): Scenario[] {
  const raw = readFileSync(join(repoRoot, "packages/evolution/datasets/agent-tasks.jsonl"), "utf8");
  return raw
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Scenario);
}

function judge(scenario: Scenario): Verdict {
  const doc = readFileSync(join(repoRoot, scenario.doc), "utf8");
  const prompt = [
    "You are evaluating an agent instruction document.",
    `An agent that has ONLY the document below must answer: "${scenario.question}"`,
    `Rubric: ${scenario.rubric}`,
    "First derive what the document tells the agent to do, then score against the rubric.",
    'Output strict JSON and nothing else: {"score": 0 | 1 | 2, "reason": "<one sentence>"}',
    "",
    "--- DOCUMENT ---",
    doc,
  ].join("\n");
  const output = execFileSync("claude", ["-p", "--model", MODEL], {
    input: prompt,
    encoding: "utf8",
    timeout: 90_000,
    // Recursion guard — headless runs fire SessionEnd too.
    env: { ...process.env, EVOLVE_HOOK_GUARD: "1" },
  });
  const match = /\{[\s\S]*\}/.exec(output);
  if (!match) throw new Error(`judge returned no JSON: ${output.slice(0, 200)}`);
  return JSON.parse(match[0]) as Verdict;
}

describe.skipIf(!enabled)("semantic eval", () => {
  for (const scenario of scenarios()) {
    it(
      scenario.id,
      () => {
        const verdict = judge(scenario);
        // eslint-disable-next-line no-console -- scores feed the PR body
        console.log(`semantic-eval ${scenario.id}: ${verdict.score}/2 — ${verdict.reason}`);
        expect(verdict.score, verdict.reason).toBeGreaterThanOrEqual(1);
      },
      120_000,
    );
  }
});
