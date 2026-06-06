"use client";

// TODO: Replace this placeholder with your product's real dashboard content.

import { Card } from "@heroui/react";
import { Trans } from "@lingui/react/macro";

export function HomePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Card className="max-w-2xl">
        <Card.Header>
          <Card.Title>
            <Trans>Welcome to your dashboard</Trans>
          </Card.Title>
          <Card.Description>
            <Trans>
              This is a placeholder home page. Build your product's dashboard here, or start from
              the Settings and Help pages in the sidebar.
            </Trans>
          </Card.Description>
        </Card.Header>
      </Card>
    </div>
  );
}
