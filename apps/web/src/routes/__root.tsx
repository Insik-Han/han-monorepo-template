import type { QueryClient } from "@tanstack/react-query";
import { Toast, useTheme } from "@heroui/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Header } from "@/widgets/header";
import { orpc } from "@/shared/api/orpc";

import appCss from "../index.css?url";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  shellComponent: RootDocument,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      },
      {
        title: "han-monorepo-template",
      },
      {
        name: "description",
        content: "han-monorepo-template is a web application",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Apply the theme app-wide, regardless of which routes render a toggle.
  // https://heroui.com/docs/react/getting-started/dark-mode#react-with-usetheme
  useTheme("system");

  const isDashboard = useLocation({
    select: (location) => location.pathname.startsWith("/dashboard"),
  });

  return (
    <>
      <Toast.Provider placement="bottom end" />
      <div className={isDashboard ? "grid h-svh" : "grid h-svh grid-rows-[auto_1fr]"}>
        {isDashboard ? null : <Header />}
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
