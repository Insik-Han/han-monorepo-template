import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*.{js,jsx,ts,tsx}": "vp check --fix",
    // Re-extract lingui catalogs when app sources change and stage them, so
    // catalogs follow their sources into the same commit (CI's i18n-extract
    // job is the backstop). Function form: lint-staged must not append file
    // args — `lingui extract` runs over the whole app. The explicit `git add`
    // is needed because lint-staged only re-stages the matched source files.
    "apps/web/src/**/*.{ts,tsx}": () => [
      "vp run web#i18n:extract",
      "git add -- apps/web/src/shared/i18n/locales",
    ],
    "apps/native/{app,features,shared}/**/*.{ts,tsx}": () => [
      "vp run native#i18n:extract",
      "git add -- apps/native/shared/i18n/locales",
    ],
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
