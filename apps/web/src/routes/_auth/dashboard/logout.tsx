import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import Loader from "@/shared/ui/loader";
import { authClient } from "@/shared/api/auth-client";

export const Route = createFileRoute("/_auth/dashboard/logout")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    void authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          void navigate({ to: "/" });
        },
      },
    });
  }, [navigate]);

  return <Loader />;
}
