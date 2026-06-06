"use client";

import type { NavItem } from "../config/nav-items";

import { Avatar } from "@heroui/react";
import { useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";

import { FOOTER_ITEMS, NAV_ITEMS } from "../config/nav-items";

interface DashboardSidebarProps {
  pathname: string;
  basePath: string;
}

export function DashboardSidebar({ basePath, pathname }: DashboardSidebarProps) {
  const { t } = useLingui();

  return (
    <aside className="border-border bg-surface hidden w-64 shrink-0 flex-col border-r md:flex">
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar className="size-9">
          <Avatar.Image
            alt="Kate Moore"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue-light.jpg"
          />
          <Avatar.Fallback>KM</Avatar.Fallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <span className="text-foreground text-sm font-medium leading-tight">Kate Moore</span>
          <span className="text-muted text-xs font-medium leading-tight">{t`Admin`}</span>
        </div>
      </div>
      <nav aria-label={t`Dashboard navigation`} className="flex flex-1 flex-col gap-1 px-2 py-2">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.href} basePath={basePath} item={item} pathname={pathname} />
        ))}
      </nav>
      <nav aria-label={t`Account`} className="flex flex-col gap-1 px-2 py-3">
        {FOOTER_ITEMS.map((item) => (
          <SidebarNavItem key={item.href} basePath={basePath} item={item} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}

interface SidebarNavItemProps {
  basePath: string;
  item: NavItem;
  pathname: string;
}

function SidebarNavItem({ basePath, item, pathname }: SidebarNavItemProps) {
  const { t } = useLingui();
  const Icon = item.icon;
  const fullHref = basePath + item.href;
  const label = t(item.label);
  const isCurrent =
    item.href === "/"
      ? pathname === fullHref || pathname === basePath || pathname === `${basePath}/`
      : pathname === fullHref || pathname.startsWith(`${fullHref}/`);

  return (
    <Link
      aria-current={isCurrent ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isCurrent
          ? "bg-accent-soft text-accent-soft-foreground"
          : "text-muted hover:bg-surface-secondary hover:text-foreground"
      }`}
      to={fullHref}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
