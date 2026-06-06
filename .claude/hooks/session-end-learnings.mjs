#!/usr/bin/env node
// SessionEnd hook: extract durable learnings from the session transcript into
// docs/agents/learnings.md. Runs async — must never block or throw loudly.
// Spec: docs/agents/self-evolution.md.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { appendLearnings } from "./lib/learnings.mjs";

// Recursion guard: the headless `claude -p` spawned below fires SessionEnd
// itself on exit. Never remove this.
if (process.env.EVOLVE_HOOK_GUARD) process.exit(0);

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const bufferPath = join(repoRoot, "docs/agents/learnings.md");

const MODEL = "claude-haiku-4-5";
const MIN_USER_MESSAGES = 3;
const MIN_TRANSCRIPT_CHARS = 800;
const MAX_PROMPT_CHARS = 30_000;

const VALID_TARGET = (target) =>
  target === "AGENTS.md" ||
  target.startsWith("docs/agents/") ||
  target.startsWith(".agents/skills/") ||
  target.startsWith(".claude/");

function userMessages(transcriptPath) {
  const messages = [];
  for (const line of readFileSync(transcriptPath, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let record;
    try {
      record = JSON.parse(line);
    } catch {
      continue;
    }
    if (record.type !== "user" || record.message?.role !== "user") continue;
    const content = record.message.content;
    const texts = typeof content === "string" ? [content] : (content ?? []);
    for (const part of texts) {
      const text = typeof part === "string" ? part : part.type === "text" ? part.text : "";
      if (!text || text.startsWith("<") || text.startsWith("Caveat:")) continue;
      messages.push(text);
    }
  }
  return messages;
}

function extractJson(output) {
  const fenced = /```(?:json)?\n([\s\S]*?)```/.exec(output);
  const raw = fenced ? fenced[1] : output;
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) return [];
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const transcriptPath = input.transcript_path;
  if (!transcriptPath || !existsSync(transcriptPath)) process.exit(0);

  const messages = userMessages(transcriptPath);
  const corpus = messages.join("\n---\n");
  if (messages.length < MIN_USER_MESSAGES || corpus.length < MIN_TRANSCRIPT_CHARS) {
    process.exit(0);
  }

  const prompt = [
    "You analyze a coding-agent session for durable learnings about THIS repository's agent instructions.",
    "Below are the user's messages from one session, separated by ---.",
    "Extract ONLY learnings that should change repo instruction docs or skills:",
    "user corrections of agent behavior, repeated friction, instructions that proved wrong or missing.",
    "Ignore one-off task content, opinions, and anything already obvious.",
    'Output a JSON array (and nothing else): [{"category": "<kebab-slug>", "target": "<repo-relative doc or skill path>", "rationale": "<one sentence: what to change and why>"}]',
    "Valid targets: AGENTS.md, docs/agents/<topic>.md, .agents/skills/<name>/SKILL.md.",
    "Output [] if there is nothing durable. Be strict: most sessions yield [].",
    "",
    corpus.slice(0, MAX_PROMPT_CHARS),
  ].join("\n");

  const output = execFileSync("claude", ["-p", "--model", MODEL], {
    input: prompt,
    encoding: "utf8",
    timeout: 50_000,
    env: { ...process.env, EVOLVE_HOOK_GUARD: "1" },
  });

  const candidates = extractJson(output)
    .filter(
      (entry) =>
        typeof entry?.category === "string" &&
        typeof entry?.target === "string" &&
        typeof entry?.rationale === "string" &&
        VALID_TARGET(entry.target),
    )
    .map((entry) => ({
      timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
      category: entry.category.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      target: entry.target,
      rationale: entry.rationale.replace(/\s+/g, " ").trim(),
      evidence: `session ${input.session_id ?? "unknown"}`,
    }));

  const appended = appendLearnings(bufferPath, candidates);
  if (appended > 0) {
    console.error(`session-end-learnings: appended ${appended} learning(s)`);
  }
} catch (error) {
  // Hooks must fail quietly — a broken hook should never break sessions.
  console.error(`session-end-learnings: ${error?.message ?? error}`);
  process.exit(0);
}
