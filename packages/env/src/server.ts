/// <reference types="@cloudflare/workers-types" />
// oxlint-disable-next-line typescript/triple-slash-reference -- env.d.ts provides the global Env type
/// <reference path="../env.d.ts" />
// For Cloudflare Workers, env is accessed via cloudflare:workers module
// Types are defined in env.d.ts based on the wrangler.jsonc bindings
export { env } from "cloudflare:workers";
