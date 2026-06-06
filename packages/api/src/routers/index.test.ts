import { ORPCError, createRouterClient } from "@orpc/server";
import { describe, expect, it } from "vite-plus/test";

import type { Context } from "../context";

import { appRouter } from "./index";

// Drive the router through a real oRPC client with a hand-built context —
// no HTTP, no Workers runtime, but the full procedure + middleware pipeline.
function createTestClient(context: Context) {
  return createRouterClient(appRouter, { context });
}

const anonymous: Context = { auth: null, session: null };

const signedIn = {
  auth: null,
  session: {
    user: { id: "user_1", name: "Test User", email: "test@example.com" },
    session: { id: "session_1", userId: "user_1" },
  },
} as unknown as Context;

describe("appRouter", () => {
  it("healthCheck is public", async () => {
    const client = createTestClient(anonymous);

    await expect(client.healthCheck()).resolves.toBe("OK");
  });

  it("privateData rejects anonymous calls with UNAUTHORIZED", async () => {
    const client = createTestClient(anonymous);

    const error = await client.privateData().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ORPCError);
    expect((error as ORPCError<string, unknown>).code).toBe("UNAUTHORIZED");
  });

  it("privateData returns the session user when signed in", async () => {
    const client = createTestClient(signedIn);

    const result = await client.privateData();

    expect(result.message).toBe("This is private");
    expect(result.user).toMatchObject({ id: "user_1", email: "test@example.com" });
  });
});
