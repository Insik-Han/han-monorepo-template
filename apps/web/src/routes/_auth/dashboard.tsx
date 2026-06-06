import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/widgets/app-shell";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppShell basePath="/dashboard">
      <Outlet />
    </AppShell>
  );
}
