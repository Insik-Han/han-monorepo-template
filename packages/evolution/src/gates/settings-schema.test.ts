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
  // Both hook registries must stay valid: Claude Code reads .claude/settings.json,
  // Codex reads .codex/hooks.json. Both point at the shared .agents/hooks scripts.
  const hookRegistries = [".claude/settings.json", ".codex/hooks.json"] as const;

  it.each(hookRegistries)("%s parses and validates", (file) => {
    const raw = readFileSync(join(repoRoot, file), "utf8");
    const parsed: unknown = JSON.parse(raw);
    const result = settingsSchema.safeParse(parsed);
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.success).toBe(true);
  });

  it.each(hookRegistries)(
    "%s hook commands point into .agents/hooks and reference existing files",
    (file) => {
      const raw = readFileSync(join(repoRoot, file), "utf8");
      const settings = settingsSchema.parse(JSON.parse(raw));
      for (const matchers of Object.values(settings.hooks ?? {})) {
        for (const matcher of matchers ?? []) {
          for (const hook of matcher.hooks) {
            expect
              .soft(
                hook.command.includes(".claude/hooks/"),
                `stale hook path (.claude/hooks moved to .agents/hooks): ${hook.command}`,
              )
              .toBe(false);
            const scriptMatch = /\.agents\/hooks\/[\w./-]+\.mjs/.exec(hook.command);
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
    },
  );
});
