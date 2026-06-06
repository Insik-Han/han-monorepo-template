/**
 * Rename the project after duplicating this template.
 *
 *   vp run rename <new-name>    (kebab-case, e.g. `vp run rename my-app`)
 *
 * Rewrites every occurrence of the current project name across the repo:
 * package names and the workspace scope (`@<name>/*`), wrangler project and
 * D1 database names, the Expo name/slug/deep-link scheme, the Maestro appId
 * (dashes stripped), and docs. Afterwards run `vp install` to regenerate
 * the lockfile and `vp check` to verify.
 *
 * Re-runnable: the script reads the current name from the root package.json,
 * so it also works on an already-renamed copy.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  ".turbo",
  ".expo",
  ".tanstack",
  ".vite-hooks",
  ".agents",
  ".claude",
  ".codex",
  ".cursor",
  ".gemini",
  ".hermes",
  "dist",
  "coverage",
  "test-results",
  "tmp",
]);

const SKIP_FILES = new Set(["pnpm-lock.yaml", "skills-lock.json"]);

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".icns",
  ".ttf",
  ".otf",
  ".woff",
  ".woff2",
  ".zip",
  ".jar",
  ".keystore",
  ".p8",
  ".p12",
]);

function isKebabCase(value: string): boolean {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(value);
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stats = statSync(path, { throwIfNoEntry: false });
    if (!stats) continue;
    if (stats.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) yield* walk(path);
    } else if (stats.isFile()) {
      if (SKIP_FILES.has(entry)) continue;
      if (BINARY_EXTENSIONS.has(entry.slice(entry.lastIndexOf(".")))) continue;
      yield path;
    }
  }
}

function main() {
  const newName = process.argv[2];
  if (!newName || !isKebabCase(newName)) {
    console.error("Usage: vp run rename <new-name>   (kebab-case, e.g. my-app)");
    process.exit(1);
  }

  const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    name: string;
  };
  const currentName = rootPkg.name;
  if (currentName === newName) {
    console.log(`Already named "${newName}" — nothing to do.`);
    return;
  }

  // e.g. "han-monorepo-template" → "hanmonorepotemplate", used in bundle identifiers (Maestro appId).
  const currentCompact = currentName.replaceAll("-", "");
  const newCompact = newName.replaceAll("-", "");

  let changed = 0;
  for (const path of walk(ROOT)) {
    const content = readFileSync(path, "utf8");
    const next = content.replaceAll(currentName, newName).replaceAll(currentCompact, newCompact);
    if (next !== content) {
      writeFileSync(path, next);
      changed += 1;
      console.log(`  rewrote ${relative(ROOT, path)}`);
    }
  }

  console.log(`\nRenamed "${currentName}" → "${newName}" in ${changed} files.`);
  console.log(`\nNext steps:`);
  console.log(`  1. vp install              # regenerate the lockfile for the new scope`);
  console.log(`  2. vp check                # verify lint/types still pass`);
  console.log(
    `  3. wrangler d1 create ${newName}-db   # create the D1 database (update database_id in apps/server/wrangler.jsonc)`,
  );
  console.log(`  4. grep -ri "${currentName}" .  # confirm nothing was missed`);
}

main();
