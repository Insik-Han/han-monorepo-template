import type { MessageDescriptor } from "@lingui/core";
import type { ComponentType } from "react";

import { msg } from "@lingui/core/macro";
import { CircleHelp, House, LogOut, Settings } from "lucide-react";

export type NavItem = {
  readonly href: string;
  readonly label: MessageDescriptor;
  readonly icon: ComponentType<{ className?: string }>;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", icon: House, label: msg`Dashboard` },
  { href: "/settings", icon: Settings, label: msg`Settings` },
] as const;

export const FOOTER_ITEMS: readonly NavItem[] = [
  { href: "/help", icon: CircleHelp, label: msg`Help & Information` },
  { href: "/logout", icon: LogOut, label: msg`Log out` },
] as const;
