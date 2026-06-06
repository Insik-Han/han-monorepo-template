/// <reference types="@cloudflare/workers-types" />

// This file defines types for the cloudflare:workers environment manually.

export interface CloudflareEnv {
  DB: D1Database;
  CORS_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

declare global {
  type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
  namespace Cloudflare {
    export interface Env extends CloudflareEnv {}
  }
}
