import { createFileRoute } from "@tanstack/react-router";

import { SettingsPage } from "@/pages/settings";

export const Route = createFileRoute("/_auth/dashboard/settings")({
  component: SettingsPage,
});
