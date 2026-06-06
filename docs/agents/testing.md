# Testing

This repo follows the **Testing Trophy** (Kent C. Dodds): static analysis at the base (already covered by `vp check` — Oxlint + tsgo), a small unit layer, **integration tests as the bulk**, and a thin E2E layer on top. Prefer integration tests that drive real entry points (oRPC client, Hono `app.request()`, rendered components) over mocking internals.

## Runner per package

| Package                | Runner               | Layer       | Notes                                                                      |
| ---------------------- | -------------------- | ----------- | -------------------------------------------------------------------------- |
| `packages/env`         | `vp test` (Vitest)   | unit        | zod validation via dynamic import + `vi.stubEnv`                           |
| `packages/api`         | `vp test`            | integration | `createRouterClient(appRouter, { context })` — no HTTP needed              |
| `packages/db`          | `vp test`            | integration | in-memory libsql + real migrations (D1 is SQLite-compatible)               |
| `apps/server`          | `vp test`            | integration | Hono `app.request()` with mocked `env/server` and `auth`                   |
| `apps/web`             | `vp test`            | integration | jsdom + Testing Library; HeroUI and Lingui macros work as-is               |
| `apps/native`          | **jest** (jest-expo) | integration | Vitest does not support React Native — do not try to switch                |
| `apps/web/e2e`         | Playwright           | e2e         | `vp run --filter ./apps/web test:e2e`; boots `vp dev` via `webServer`      |
| `apps/native/.maestro` | Maestro              | e2e         | `vp run --filter ./apps/native test:e2e`; needs a dev build on a simulator |

`packages/auth` has no dedicated suite — its behavior is covered through the server integration tests.

## How to run

```bash
vp run test                              # turbo test — all unit/integration suites
vp run --filter ./apps/web test:e2e      # Playwright (browsers: npx playwright install chromium)
vp run --filter ./apps/native test:e2e   # Maestro (install: curl -Ls https://get.maestro.mobile.dev | bash)
vp test watch                            # watch mode, run inside a package
```

E2E is a separate `test:e2e` turbo task and is **not** part of the default `test` pipeline or the pre-commit hook.

## Conventions

- Colocate `*.test.ts(x)` next to the source under `src/` (native: anywhere under `app/`/`shared/`). Playwright specs use `.spec.ts` under `apps/web/e2e/`.
- Vitest config lives in the `test` block of each package's `vite.config.ts` — never create a `vitest.config.ts`.
- Do not add `vitest` as a dependency: the catalog overrides it to `@voidzero-dev/vite-plus-test`, and `vp test` provides the runtime.
- Test files are linted by the architecture plugin too: imports must stay within the package's allow-list; use relative imports for same-package helpers.
- Web tests get providers/setup from `apps/web/src/test/setup.ts`; native tests should render through `apps/native/shared/test/render.tsx` (`renderWithProviders`, async — RNTL 14 renders asynchronously).

## The `cloudflare:workers` constraint

`packages/env/src/server.ts` re-exports `env` from `cloudflare:workers`, a virtual module that only resolves inside the Workers runtime. `db`, `auth`, `api`(runtime), and `server` transitively depend on it, so under node-based Vitest:

- **packages/api**: build the `Context` by hand and call procedures through `createRouterClient` — the auth chain never loads (its import is type-only).
- **packages/db**: don't call `createDb()`; instantiate `drizzle-orm/libsql` against `:memory:` and apply `src/migrations/*.sql` directly.
- **apps/server**: `vi.mock("@han-monorepo-template/env/server")` and `vi.mock("@han-monorepo-template/auth")` at the top of the test file, then import the app.

This mocking is a deliberate stopgap: `@cloudflare/vitest-pool-workers` does not support Vitest 4 yet ([workers-sdk#11064](https://github.com/cloudflare/workers-sdk/issues/11064)). **TODO**: when it ships, migrate `apps/server` tests onto the workers pool and drop the mocks.

## Native (jest-expo) specifics

- `apps/native/jest.config.js` extends jest-expo's `transformIgnorePatterns` allow-list. If a new ESM-only dependency fails with `Cannot use import statement outside a module`, add its package name there.
- `.mjs`/`.mts` files are routed through babel-jest via the extra `transform` entry (jest-expo only covers `.[jt]sx?` by default).
- Reanimated 4 detects Jest itself; `react-native-worklets/jest/resolver.js` handles the `.native` module resolution. Safe-area-context is mocked in `jest.setup.js`.
- jest stays on **v29**: jest-expo 56 is built against the jest 29 toolchain.
