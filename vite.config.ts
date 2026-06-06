import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*.{js,jsx,ts,tsx}": "vp check --fix",
  },
  fmt: {
    ignorePatterns: [
      ".agents/**",
      ".claude/**",
      ".hermes/**",
      "**/routeTree.gen.ts",
      // Append-only learnings buffers — written by hooks, must not be reflowed.
      "docs/agents/learnings.md",
      "docs/agents/learnings-archive.md",
    ],
  },
  lint: {
    ignorePatterns: [".agents/**", ".claude/**", ".hermes/**", "**/routeTree.gen.ts"],
    plugins: ["typescript", "unicorn", "oxc"],
    categories: {
      correctness: "error",
    },
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "architecture/package-boundaries": "error",
      "architecture/public-surface": "error",
      "architecture/app-layers": "error",
    },
    env: {
      builtin: true,
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
      {
        name: "architecture",
        specifier: "./packages/config/oxlint/architecture-plugin.js",
      },
    ],
  },
});
