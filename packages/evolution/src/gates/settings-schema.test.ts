import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { z } from "zod";
import { repoRoot } from "../repo";

const hookCommand = z.object({
  type: z.literal("command"),
  command: z.string().min(1),
  timeout: z.number().int().positive().optional(),
  async: z.boolean().optional(),
});

const hookMatcher = z.object({
  matcher: z.string().optional(),
  hooks: z.array(hookCommand).min(1),
});

const hookEvent = z.enum([
  "PreToolUse",
  "PostToolUse",
  "UserPromptSubmit",
  "Notification",
  "Stop",
  "SubagentStop",
  "SessionStart",
  "SessionEnd",
  "PreCompact",
]);

// Unknown top-level keys are tolerated (zod strips them); the keys the
// evolution engine touches are validated strictly.
const settingsSchema = z.object({
  $schema: z.string().optional(),
  plansDirectory: z.string().optional(),
  hooks: z.partialRecord(hookEvent, z.array(hookMatcher)).optional(),
});

describe("settings-schema gate", () => {
  it(".claude/settings.json parses and validates", () => {
    const raw = readFileSync(join(repoRoot, ".claude/settings.json"), "utf8");
    const parsed: unknown = JSON.parse(raw);
    const result = settingsSchema.safeParse(parsed);
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.success).toBe(true);
  });

  it("hook commands reference existing files when they point into .claude/hooks", () => {
    const raw = readFileSync(join(repoRoot, ".claude/settings.json"), "utf8");
    const settings = settingsSchema.parse(JSON.parse(raw));
    for (const matchers of Object.values(settings.hooks ?? {})) {
      for (const matcher of matchers ?? []) {
        for (const hook of matcher.hooks) {
          const scriptMatch = /\.claude\/hooks\/[\w./-]+\.mjs/.exec(hook.command);
          if (!scriptMatch) continue;
          const scriptPath = join(repoRoot, scriptMatch[0]);
          expect
            .soft(
              (() => {
                try {
                  readFileSync(scriptPath);
                  return true;
                } catch {
                  return false;
                }
              })(),
              `hook script missing: ${scriptMatch[0]}`,
            )
            .toBe(true);
        }
      }
    }
  });
});
