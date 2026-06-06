/**
 * Architecture boundary rules for the han-monorepo-template workspace.
 *
 * Loaded by Oxlint as a JS plugin via the `lint.jsPlugins` entry in the
 * root `vite.config.ts`. Three rules:
 *
 * - `architecture/package-boundaries` — workspace packages may only import
 *   the `@han-monorepo-template/*` packages listed in PACKAGE_RULES, and relative
 *   imports must not escape the owning package.
 * - `architecture/public-surface` — `@han-monorepo-template/*` imports must go
 *   through the public subpaths listed in PUBLIC_SURFACE (no `/src/` deep
 *   imports).
 * - `architecture/app-layers` — within apps, lower layers must not import
 *   higher layers, and `features/<a>` must not import `features/<b>`.
 */

/**
 * Allowed `@han-monorepo-template/*` dependencies per workspace package.
 * `typeOnly` entries are importable with `import type` only — they must
 * never contribute runtime code to that package's bundle.
 */
const PACKAGE_RULES = {
  "apps/web": { allow: ["env"], typeOnly: ["api"] },
  "apps/native": { allow: ["env"], typeOnly: ["api"] },
  "apps/server": { allow: ["api", "auth", "env"], typeOnly: [] },
  "packages/api": { allow: ["auth", "db", "env"], typeOnly: [] },
  "packages/auth": { allow: ["db", "env"], typeOnly: [] },
  "packages/db": { allow: ["env"], typeOnly: [] },
  "packages/env": { allow: [], typeOnly: [] },
  "packages/config": { allow: [], typeOnly: [] },
  "packages/evolution": { allow: [], typeOnly: [] },
};

/**
 * Public import surface per `@han-monorepo-template/*` package. A trailing `/*`
 * allows any subpath under that prefix. Everything else is internal.
 */
const PUBLIC_SURFACE = {
  api: [".", "./context", "./routers/index"],
  auth: ["."],
  db: [".", "./schema/*"],
  env: ["./server", "./web", "./native"],
};

/**
 * Layer ranks per workspace package. Imports may only point at the same
 * or a lower rank. A layer is the first path segment under `srcRoot`
 * (file extensions stripped, so `index.ts` is the layer `index`).
 * `featureSliced` layers follow Feature-Sliced Design slice rules:
 * cross-slice imports are forbidden (`features/<a>` -> `features/<b>`)
 * and imports from other layers must go through the slice's public API
 * (`@/features/<slice>`, i.e. its index file — no deep imports).
 */
const APP_LAYERS = {
  // FSD layers (https://feature-sliced.design/). The router directories
  // (web `routes/` for TanStack Router, native `app/` for Expo Router)
  // sit on top as thin delegation layers in place of FSD's `app` layer.
  "apps/web": {
    srcRoot: "apps/web/src",
    ranks: { routes: 6, pages: 5, widgets: 4, features: 3, entities: 2, shared: 1 },
    featureSliced: ["pages", "widgets", "features", "entities"],
  },
  "apps/native": {
    srcRoot: "apps/native",
    ranks: { app: 6, pages: 5, widgets: 4, features: 3, entities: 2, shared: 1 },
    featureSliced: ["pages", "widgets", "features", "entities"],
  },
  // oRPC layering: domain routers sit on top and are aggregated in
  // routers/index.ts; `index` holds the procedure base (`o`,
  // public/protectedProcedure); middlewares build on the base; `context`
  // bridges Hono -> oRPC and stays at the bottom. Keeping `index` below
  // `routers` forbids re-exporting appRouter from index.ts, which would
  // create a routers -> index -> routers cycle.
  "packages/api": {
    srcRoot: "packages/api/src",
    ranks: { routers: 3, middlewares: 2, index: 1, lib: 1, context: 0 },
    featureSliced: [],
  },
};

const WORKSPACE_SCOPE = "@han-monorepo-template/";

/** Workspace app package names — never importable from other workspaces. */
const APP_PACKAGE_NAMES = new Set(["web", "native", "server"]);

/** Normalize a filename to a `/`-separated repo-relative path, or null. */
function repoRelativePath(filename) {
  const normalized = filename.replaceAll("\\", "/");
  const match = normalized.match(/\/(apps|packages)\/([^/]+)\/(.*)$/);
  if (!match) return null;
  return {
    packageDir: `${match[1]}/${match[2]}`,
    relPath: `${match[1]}/${match[2]}/${match[3]}`,
  };
}

/** Resolve a relative specifier against a repo-relative importer path. */
function resolveRelative(importerRelPath, specifier) {
  const segments = importerRelPath.split("/").slice(0, -1);
  for (const part of specifier.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (segments.length === 0) return null;
      segments.pop();
    } else {
      segments.push(part);
    }
  }
  return segments.join("/");
}

/** Split `@han-monorepo-template/<pkg>[/<subpath>]` into its parts, or null. */
function parseWorkspaceSpecifier(specifier) {
  if (!specifier.startsWith(WORKSPACE_SCOPE)) return null;
  const rest = specifier.slice(WORKSPACE_SCOPE.length);
  const slash = rest.indexOf("/");
  if (slash === -1) return { pkg: rest, subpath: "." };
  return { pkg: rest.slice(0, slash), subpath: `./${rest.slice(slash + 1)}` };
}

function isAllowedSurface(surface, subpath) {
  for (const entry of surface) {
    if (entry === subpath) return true;
    if (entry.endsWith("/*") && subpath.startsWith(entry.slice(0, -1))) return true;
  }
  return false;
}

/** Map a repo-relative path inside an app to its layer name, or null. */
function layerOf(appConfig, relPath) {
  if (!relPath.startsWith(`${appConfig.srcRoot}/`)) return null;
  const segment = relPath
    .slice(appConfig.srcRoot.length + 1)
    .split("/")[0]
    .replace(/\.(?:ts|tsx|js|jsx)$/, "");
  return segment in appConfig.ranks ? segment : null;
}

/** Feature slice name (`features/<slice>`) for a repo-relative path. */
function sliceOf(appConfig, relPath, layer) {
  const rest = relPath.slice(`${appConfig.srcRoot}/${layer}/`.length);
  const slash = rest.indexOf("/");
  return slash === -1 ? rest : rest.slice(0, slash);
}

/** Turn an in-app import into a repo-relative path, or null. */
function resolveAppImport(appConfig, importerRelPath, specifier) {
  if (specifier.startsWith("@/")) return `${appConfig.srcRoot}/${specifier.slice(2)}`;
  if (specifier.startsWith(".")) return resolveRelative(importerRelPath, specifier);
  return null;
}

function isTypeOnly(node) {
  if (node.importKind === "type" || node.exportKind === "type") return true;
  // `import { type A, type B } from "x"` is also runtime-free.
  if (node.type === "ImportDeclaration" && node.specifiers?.length > 0) {
    return node.specifiers.every((s) => s.importKind === "type");
  }
  return false;
}

/** Visit every node kind that carries a module specifier literal. */
function specifierVisitors(check) {
  const fromSource = (node) => {
    if (node.source?.type === "Literal" && typeof node.source.value === "string") {
      check(node, node.source);
    }
  };
  return {
    ImportDeclaration: fromSource,
    ExportAllDeclaration: fromSource,
    ExportNamedDeclaration: fromSource,
    ImportExpression: fromSource,
    TSImportType: fromSource,
  };
}

const packageBoundariesRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce the workspace dependency graph between apps/* and packages/*.",
    },
    messages: {
      forbiddenPackage:
        "'{{from}}' must not import '{{to}}'. Allowed @han-monorepo-template imports: {{allowed}}.",
      typeOnlyPackage:
        "'{{from}}' may import '{{to}}' as types only. Use `import type` so no server code reaches this bundle.",
      escapedPackage:
        "Relative import '{{specifier}}' escapes '{{from}}'. Import the workspace package via '@han-monorepo-template/*' instead.",
      appImport:
        "'{{from}}' must not import the app package '{{to}}'. Apps are entry points, not libraries — move shared code into a '@han-monorepo-template/*' package.",
    },
  },
  create(context) {
    const location = repoRelativePath(context.filename);
    const rules = location && PACKAGE_RULES[location.packageDir];
    if (!rules) return {};

    return specifierVisitors((node, source) => {
      const specifier = source.value;

      const workspace = parseWorkspaceSpecifier(specifier);
      if (workspace) {
        if (rules.allow.includes(workspace.pkg)) return;
        if (rules.typeOnly.includes(workspace.pkg)) {
          if (isTypeOnly(node)) return;
          context.report({
            node: source,
            messageId: "typeOnlyPackage",
            data: { from: location.packageDir, to: specifier },
          });
          return;
        }
        context.report({
          node: source,
          messageId: "forbiddenPackage",
          data: {
            from: location.packageDir,
            to: specifier,
            allowed: [...rules.allow, ...rules.typeOnly].join(", ") || "(none)",
          },
        });
        return;
      }

      const bareName = specifier.split("/")[0];
      if (APP_PACKAGE_NAMES.has(bareName)) {
        context.report({
          node: source,
          messageId: "appImport",
          data: { from: location.packageDir, to: specifier },
        });
        return;
      }

      if (specifier.startsWith(".")) {
        const resolved = resolveRelative(location.relPath, specifier);
        if (resolved !== null && !resolved.startsWith(`${location.packageDir}/`)) {
          context.report({
            node: source,
            messageId: "escapedPackage",
            data: { specifier, from: location.packageDir },
          });
        }
      }
    });
  },
};

const publicSurfaceRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Restrict @han-monorepo-template/* imports to each package's public subpaths.",
    },
    messages: {
      privateSubpath:
        "'{{specifier}}' is not part of @han-monorepo-template/{{pkg}}'s public surface ({{allowed}}).",
    },
  },
  create(context) {
    return specifierVisitors((_node, source) => {
      const workspace = parseWorkspaceSpecifier(source.value);
      if (!workspace) return;
      const surface = PUBLIC_SURFACE[workspace.pkg];
      if (!surface || isAllowedSurface(surface, workspace.subpath)) return;
      context.report({
        node: source,
        messageId: "privateSubpath",
        data: {
          specifier: source.value,
          pkg: workspace.pkg,
          allowed: surface.join(", "),
        },
      });
    });
  },
};

const appLayersRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce one-way layer dependencies and feature-slice isolation inside apps.",
    },
    messages: {
      upwardImport:
        "Layer '{{fromLayer}}' must not import layer '{{toLayer}}' ({{specifier}}). Dependencies flow downward only.",
      crossFeature:
        "Slice '{{fromLayer}}/{{fromSlice}}' must not import sibling slice '{{toLayer}}/{{toSlice}}' ({{specifier}}). Share code via a lower layer instead.",
      publicApi:
        "Import slice '{{toLayer}}/{{toSlice}}' through its public API ('@/{{toLayer}}/{{toSlice}}'), not its internals ({{specifier}}).",
    },
  },
  create(context) {
    const location = repoRelativePath(context.filename);
    const appConfig = location && APP_LAYERS[location.packageDir];
    if (!appConfig) return {};
    const fromLayer = layerOf(appConfig, location.relPath);
    if (!fromLayer) return {};

    return specifierVisitors((_node, source) => {
      const resolved = resolveAppImport(appConfig, location.relPath, source.value);
      if (resolved === null) return;
      const toLayer = layerOf(appConfig, resolved);
      if (!toLayer) return;

      if (appConfig.ranks[toLayer] > appConfig.ranks[fromLayer]) {
        context.report({
          node: source,
          messageId: "upwardImport",
          data: { fromLayer, toLayer, specifier: source.value },
        });
        return;
      }

      if (!appConfig.featureSliced.includes(toLayer)) return;
      const toSlice = sliceOf(appConfig, resolved, toLayer);

      if (fromLayer === toLayer) {
        const fromSlice = sliceOf(appConfig, location.relPath, fromLayer);
        if (fromSlice === toSlice) return; // same slice — internals are free
        context.report({
          node: source,
          messageId: "crossFeature",
          data: { fromLayer, fromSlice, toLayer, toSlice, specifier: source.value },
        });
        return;
      }

      // Downward import into a sliced layer must hit the slice's public
      // API (its root index), never a file inside the slice.
      const sliceRoot = `${appConfig.srcRoot}/${toLayer}/${toSlice}`;
      if (resolved !== sliceRoot && resolved !== `${sliceRoot}/index`) {
        context.report({
          node: source,
          messageId: "publicApi",
          data: { toLayer, toSlice, specifier: source.value },
        });
      }
    });
  },
};

export default {
  meta: { name: "architecture" },
  rules: {
    "package-boundaries": packageBoundariesRule,
    "public-surface": publicSurfaceRule,
    "app-layers": appLayersRule,
  },
};
