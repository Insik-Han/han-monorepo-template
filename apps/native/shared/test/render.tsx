import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { render } from "@testing-library/react-native";
import { HeroUINativeProvider } from "heroui-native";
import type { ReactElement, ReactNode } from "react";

// An empty catalog is enough: the Lingui macro embeds the English source
// as the fallback message.
i18n.load("en", {});
i18n.activate("en");

function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider i18n={i18n}>
      <HeroUINativeProvider>{children}</HeroUINativeProvider>
    </I18nProvider>
  );
}

/** Render a component inside the same providers the app shell uses. */
export async function renderWithProviders(ui: ReactElement) {
  // RNTL 14 renders asynchronously (concurrent React).
  return await render(ui, { wrapper: Providers });
}
