import { defineConfig } from "@lingui/cli";
import { formatter } from "@lingui/format-po";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "ja", "ko"],
  // No `#: file:line` references in catalogs — they churn on unrelated source
  // edits and would turn CI's auto-extract push (i18n-extract job) into noise.
  format: formatter({ lineNumbers: false }),
  catalogs: [
    {
      path: "<rootDir>/shared/i18n/locales/{locale}/messages",
      include: ["app", "features", "shared"],
      exclude: ["**/node_modules/**", "**/*.test.*", "**/*.spec.*"],
    },
  ],
});
