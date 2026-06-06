/**
 * Minimal YAML-frontmatter reader for SKILL.md files. Handles string scalars
 * and indented multi-line continuations (folded style).
 */
export function parseFrontmatter(markdown: string): Record<string, string> | undefined {
  const match = /^---\n([\s\S]*?)\n---/.exec(markdown);
  if (!match?.[1]) return undefined;
  const fields: Record<string, string> = {};
  let currentKey: string | undefined;
  for (const line of match[1].split("\n")) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (kv?.[1] !== undefined && kv[2] !== undefined) {
      currentKey = kv[1];
      fields[currentKey] = kv[2].trim();
      continue;
    }
    // Indented continuation line belongs to the previous key.
    if (currentKey && /^\s+\S/.test(line)) {
      fields[currentKey] = `${fields[currentKey]} ${line.trim()}`.trim();
    }
  }
  return fields;
}
