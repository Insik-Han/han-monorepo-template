import { cleanup } from "@testing-library/react";
import { afterEach } from "vite-plus/test";

import { initI18n } from "@/shared/i18n";

// Activate the English catalog so <Trans> renders real strings instead of
// message IDs (mirrors what main.tsx does at app startup).
initI18n();

afterEach(() => {
  cleanup();
});
