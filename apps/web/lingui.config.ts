import { defineConfig } from "@lingui/cli";
import { formatter } from "@lingui/format-po";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "ja", "ko"],
  // No `#: file:line` references in catalogs — they churn on unrelated source
  // edits and turn the CI freshness gate (i18n:check) into noise.
  format: formatter({ lineNumbers: false }),
  catalogs: [
    {
      path: "<rootDir>/src/shared/i18n/locales/{locale}/messages",
      include: ["src"],
      exclude: ["**/node_modules/**", "**/*.test.*", "**/*.spec.*", "src/routeTree.gen.ts"],
    },
  ],
});
