"use client";

import { Bell, Search, UserPlus } from "lucide-react";
import { Button } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";

import { IconButton } from "@/shared/ui/icon-button";

export interface DashboardNavbarProps {
  /** Title rendered in the navbar. Falls back to the home-page greeting. */
  title?: string;
}

export function DashboardNavbar({ title }: DashboardNavbarProps) {
  const { t } = useLingui();
  const resolvedTitle = title ?? t`Good morning, Kate`;

  return (
    <header className="border-border bg-surface flex h-14 items-center gap-3 border-b px-4">
      <h1 className="text-foreground truncate text-xl font-semibold">{resolvedTitle}</h1>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <IconButton label={t`Search`} size="sm" variant="tertiary">
          <Search className="size-4" />
        </IconButton>
        <IconButton label={t`Notifications`} size="sm" variant="tertiary">
          <Bell className="size-4" />
        </IconButton>
        <Button size="sm">
          <UserPlus className="size-4" />
          <Trans comment="Button that opens the invite-teammate flow">Invite</Trans>
        </Button>
      </div>
    </header>
  );
}
