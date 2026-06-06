# Architecture boundaries

Architecture rules are enforced by a custom Oxlint JS plugin at
`packages/config/oxlint/architecture-plugin.js`, registered via `lint.jsPlugins`
in the root `vite.config.ts`. They run on every `vp check` / `vp lint` and in the
pre-commit hook — no separate tool or CI step.

## Rules

### `architecture/package-boundaries`

Workspace packages may only import the `@han-monorepo-template/*` packages below.
Cross-package imports must always go through the `@han-monorepo-template/*` package
name: relative imports must never escape the owning package, and the app
packages (`web`, `native`, `server`) are entry points — nothing may import
them.

| From            | Allowed imports      | Type-only |
| --------------- | -------------------- | --------- |
| `apps/web`      | `env`                | `api`     |
| `apps/native`   | `env`                | `api`     |
| `apps/server`   | `api`, `auth`, `env` | —         |
| `packages/api`  | `auth`, `db`, `env`  | —         |
| `packages/auth` | `db`, `env`          | —         |
| `packages/db`   | `env`                | —         |
| `packages/env`  | (none)               | —         |

"Type-only" means `import type` is required — client apps consume the oRPC
router contract as types and must never bundle server code.

### `architecture/public-surface`

`@han-monorepo-template/*` imports must use each package's public subpaths. Deep imports
(e.g. `@han-monorepo-template/db/src/...`) are forbidden.

| Package | Public surface                      |
| ------- | ----------------------------------- |
| `api`   | `.`, `./context`, `./routers/index` |
| `auth`  | `.`                                 |
| `db`    | `.`, `./schema/*`                   |
| `env`   | `./server`, `./web`, `./native`     |

### `architecture/app-layers`

Within a package, imports flow downward only (same rank is allowed). A layer is
the first path segment under the package's source root, with file extensions
stripped (`index.ts` is the layer `index`).

`apps/web` and `apps/native` follow [Feature-Sliced Design](https://feature-sliced.design/):

- `apps/web/src`: `routes` → `pages` → `widgets` → `features` → `entities` →
  `shared`. The `routes/` directory is TanStack Router's file-route layer —
  keep route files thin (re-export from `pages`).
- `apps/native`: `app` → `pages` → `widgets` → `features` → `entities` →
  `shared`. The `app/` directory is Expo Router's route layer — keep screens
  thin; FSD layers live as sibling directories.

Sliced layers (`pages`, `widgets`, `features`, `entities`) follow FSD slice
rules, enforced by the same lint rule:

- **No cross-slice imports**: `features/<a>` must not import `features/<b>` (or
  any sibling slice on the same layer). Share code via a lower layer.
- **Public API only**: other layers must import a slice through its root index
  (`@/features/auth`), never its internals (`@/features/auth/ui/sign-in-form`).
  Within a slice, internal imports are free. `shared` is segment-based, not
  sliced — `@/shared/ui/loader` is imported directly.

Slice layout convention: `ui/` for components, `model/` for data and state,
`config/` for static config, with a root `index.ts` as the public API.

`packages/api/src` uses its own oRPC layering: `routers` → `middlewares` →
`index` / `lib` → `context`.

## Adding API routes (Hono + oRPC)

The Hono app lives in `apps/server` and mounts the oRPC router; `packages/api`
stays transport-agnostic apart from `context.ts` (Hono `Context` → oRPC
context). To add a domain router:

1. Create `packages/api/src/routers/<domain>.ts` using `publicProcedure` /
   `protectedProcedure` from `../index`.
2. Aggregate it into `appRouter` in `packages/api/src/routers/index.ts`.

No rule changes are needed for this — the public surface stays
`./routers/index`, and clients keep consuming `AppRouterClient` type-only. The
layering above enforces the growth path: shared middlewares go in
`src/middlewares/`, helpers in `src/lib/`, and `index.ts` must not re-export
`appRouter` (that would create a `routers → index → routers` cycle). Only if
`apps/server` someday needs a new entry from the package (e.g. an exported
handler) does `PUBLIC_SURFACE` need a new subpath.

## Changing the rules

Edit the `PACKAGE_RULES`, `PUBLIC_SURFACE`, or `APP_LAYERS` constants in
`packages/config/oxlint/architecture-plugin.js`, then keep the tables in this
document in sync. Adding a new workspace package or a new layer directory
requires updating the plugin, otherwise it is not checked.
