import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Absolute path to the repository root, derived from this file's location. */
export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
