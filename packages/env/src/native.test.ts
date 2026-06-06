import { afterEach, describe, expect, it, vi } from "vite-plus/test";

// `createEnv` validates at module load, so each case stubs the runtime env
// first and then imports a fresh copy of the module.
describe("env/native", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("parses a valid EXPO_PUBLIC_SERVER_URL", async () => {
    vi.stubEnv("EXPO_PUBLIC_SERVER_URL", "http://localhost:3000");

    const { env } = await import("./native");

    expect(env.EXPO_PUBLIC_SERVER_URL).toBe("http://localhost:3000");
  });

  it("rejects a non-URL EXPO_PUBLIC_SERVER_URL", async () => {
    vi.stubEnv("EXPO_PUBLIC_SERVER_URL", "not-a-url");

    await expect(import("./native")).rejects.toThrow();
  });

  it("treats an empty string as missing", async () => {
    vi.stubEnv("EXPO_PUBLIC_SERVER_URL", "");

    await expect(import("./native")).rejects.toThrow();
  });
});
