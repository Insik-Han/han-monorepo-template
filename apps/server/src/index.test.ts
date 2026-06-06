import { describe, expect, it, vi } from "vite-plus/test";

// The real bindings only exist inside the Workers runtime
// (`cloudflare:workers` is a virtual module), and
// @cloudflare/vitest-pool-workers does not support Vitest 4 yet
// (https://github.com/cloudflare/workers-sdk/issues/11064).
// TODO: migrate to vitest-pool-workers and drop these mocks once it ships.
vi.mock("@han-monorepo-template/env/server", () => ({
  env: {
    CORS_ORIGIN: "http://localhost:3001",
    BETTER_AUTH_URL: "http://localhost:3000",
    BETTER_AUTH_SECRET: "test-secret",
  },
}));

vi.mock("@han-monorepo-template/auth", () => ({
  createAuth: () => ({
    api: {
      // Anonymous by default — privateData should reject.
      getSession: async () => null,
    },
    handler: async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
  }),
}));

// Imported after the mocks so the Hono app wires up against them.
const { default: app } = await import("./index");

describe("server app", () => {
  it("responds to the health check route", async () => {
    const res = await app.request("/");

    expect(res.status).toBe(200);
    await expect(res.text()).resolves.toBe("OK");
  });

  it("delegates /api/auth/* to the auth handler", async () => {
    const res = await app.request("/api/auth/session");

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  describe("oRPC over /rpc", () => {
    const callRpc = async (path: string) =>
      app.request(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });

    it("serves public procedures", async () => {
      const res = await callRpc("/rpc/healthCheck");

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toMatchObject({ json: "OK" });
    });

    it("rejects protected procedures for anonymous callers", async () => {
      const res = await callRpc("/rpc/privateData");

      expect(res.status).toBe(401);
    });

    it("falls through to 404 for unknown procedures", async () => {
      const res = await callRpc("/rpc/nope");

      expect(res.status).toBe(404);
    });
  });
});
