import { Trans } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";

import { ModeToggle } from "@/features/theme";
import UserMenu from "./user-menu";

export default function Header() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          <Link to="/">
            <Trans comment="Top navigation link to the landing page">Home</Trans>
          </Link>
          <Link to="/dashboard">
            <Trans comment="Top navigation link to the dashboard">Dashboard</Trans>
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
