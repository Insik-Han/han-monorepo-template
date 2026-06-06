import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import Loader from "@/shared/ui/loader";
import { routeTree } from "./routeTree.gen";
import { orpc, queryClient } from "@/shared/api/orpc";
import { initI18n } from "@/shared/i18n";

// Activate English synchronously (so the SPA-shell prerender and the first
// client render always have messages), then switch to the detected locale.
initI18n();

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultPendingComponent: () => <Loader />,
    context: { orpc, queryClient },
    Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
      return (
        <I18nProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </I18nProvider>
      );
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
