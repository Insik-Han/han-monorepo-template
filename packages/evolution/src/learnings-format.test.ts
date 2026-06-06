import { describe, expect, it } from "vite-plus/test";
import { parseLearnings } from "./learnings-format";

const SAMPLE = `# Learnings

Append-only buffer. See docs/agents/self-evolution.md.

## 2026-06-06T14:22Z · category:testing · status:undigested
- target: docs/agents/testing.md
- rationale: vp test needs --filter for single-package runs
- evidence: session abc123, 2 corrections
- hash: 9f3a1c

## 2026-06-05T09:00Z · category:i18n · status:digested
- target: docs/agents/i18n.md
- rationale: extract must run before translate
- evidence: session def456, 1 correction
- hash: 77be02
`;

describe("learnings-format", () => {
  it("parses well-formed entries", () => {
    const entries = parseLearnings(SAMPLE);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({
      timestamp: "2026-06-06T14:22Z",
      category: "testing",
      status: "undigested",
      target: "docs/agents/testing.md",
      rationale: "vp test needs --filter for single-package runs",
      evidence: "session abc123, 2 corrections",
      hash: "9f3a1c",
    });
    expect(entries[1]?.status).toBe("digested");
  });

  it("drops incomplete entries instead of throwing", () => {
    const incomplete = "## 2026-06-06T14:22Z · category:x · status:undigested\n- target: a.md\n";
    expect(parseLearnings(incomplete)).toEqual([]);
  });

  it("ignores prose outside entries", () => {
    expect(parseLearnings("# Learnings\n\nNothing yet.\n")).toEqual([]);
  });
});
