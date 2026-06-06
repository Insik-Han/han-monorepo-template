"use client";

import type { MessageDescriptor } from "@lingui/core";
import type { ReactNode } from "react";

import { useLingui } from "@lingui/react/macro";
import { useLocation } from "@tanstack/react-router";
import { useMemo } from "react";

import { FOOTER_ITEMS, NAV_ITEMS } from "../config/nav-items";

import { DashboardNavbar } from "./dashboard-navbar";
import { DashboardSidebar } from "./dashboard-sidebar";

// Combined lookup so every registered route maps to its label descriptor in
// O(1). Hoisted per `server-hoist-static-io` — computed once at module load.
const ROUTE_LABELS = new Map<string, MessageDescriptor>(
  [...NAV_ITEMS, ...FOOTER_ITEMS].map((item) => [item.href, item.label]),
);

export interface AppShellProps {
  children: ReactNode;
  /**
   * Prefix used for navigation and active-state matching.
   * Empty in the standalone template; `/templates/dashboard` when embedded in the frontend preview.
   */
  basePath?: string;
}

export function AppShell({ basePath = "", children }: AppShellProps) {
  const { t } = useLingui();
  const pathname = useLocation({ select: (location) => location.pathname });

  const homeGreeting = t`Good morning, Kate`;

  // Derive the navbar title from the current route during render —
  // no useState + useEffect mirror (`rerender-derived-state-no-effect`).
  const title = useMemo(() => {
    const relative = pathname.slice(basePath.length) || "/";

    if (relative === "/" || relative === "") return homeGreeting;

    const label = ROUTE_LABELS.get(relative);

    return label ? t(label) : homeGreeting;
  }, [pathname, basePath, homeGreeting, t]);

  return (
    <div className="bg-background flex min-h-dvh">
      <DashboardSidebar basePath={basePath} pathname={pathname} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardNavbar title={title} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
