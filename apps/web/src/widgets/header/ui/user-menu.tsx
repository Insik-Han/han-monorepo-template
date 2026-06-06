import { Button, Dropdown, Header, Label, Separator, Skeleton } from "@heroui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link, useNavigate } from "@tanstack/react-router";

import { authClient } from "@/shared/api/auth-client";

export default function UserMenu() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="outline">
          <Trans>Sign In</Trans>
        </Button>
      </Link>
    );
  }

  return (
    <Dropdown>
      <Button size="sm" variant="outline">
        {session.user.name}
      </Button>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu aria-label={t`User menu`}>
          <Dropdown.Section>
            <Header>
              <Trans>My Account</Trans>
            </Header>
            <Dropdown.Item id="email" textValue={session.user.email}>
              <Label>{session.user.email}</Label>
            </Dropdown.Item>
          </Dropdown.Section>
          <Separator />
          <Dropdown.Section>
            <Dropdown.Item
              id="sign-out"
              textValue={t`Sign out`}
              onAction={() => {
                void authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      void navigate({
                        to: "/",
                      });
                    },
                  },
                });
              }}
            >
              <Label className="text-danger">
                <Trans>Sign Out</Trans>
              </Label>
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
