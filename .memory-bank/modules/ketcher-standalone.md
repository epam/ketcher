# ketcher-standalone

> Self-contained Ketcher bundle: ships Indigo WASM and requires no backend server.

## Responsibility

Provides a `StandaloneStructService` implementation that runs the Indigo cheminformatics engine entirely in the browser via WebAssembly. This enables Ketcher to work offline without a backend HTTP service.

## Public Interfaces

- Default export from `src/index.ts` — factory function (or provider) that creates a standalone-configured `Ketcher` instance
- `StandaloneStructService` (internal) — implementation of `StructService` from `ketcher-core`

## Internal Structure

```
src/
├── index.ts                    # Entry: re-exports infrastructure/services
├── emptyIndex.js               # Shim entry so bundlers resolve Emscripten's import.meta.url (see file)
└── infrastructure/
    └── services/
        ├── index.ts            # Exports StandaloneStructService(Provider)
        └── struct/
            ├── standaloneStructService.ts          # HTTP-free StructService impl; imports worker via _indigo-worker-import-alias_
            ├── standaloneStructServiceProvider.ts  # StructServiceProvider (mode: 'standalone')
            ├── indigoWorker.ts                     # Web worker; imports Indigo via _indigo-ketcher-import-alias_
            ├── indigoWorker.types.ts               # Command / message types
            ├── constants.ts                        # Init event names (render vs no-render)
            └── indigoWorkerImports/                # Two worker-loading strategies swapped at build time
                ├── useWasmLoader.ts                # web-worker-loader strategy (CJS-capable)
                └── useOffMainThreadPlugin.ts       # OMT native-worker strategy (ESM only)
```

Build config lives at package root: `rollup.config.mjs` (six-variant config), `.babelrc`, `package.json` (`build`/`start` scripts + `exports` map).

## How It Works

1. On import, loads the Indigo WASM binary (compiled from C++ Indigo toolkit).
2. Registers a `StandaloneStructService` that satisfies the `StructService` interface.
3. All format conversions, aromatize/dearomatize, layout, calculate, check operations are performed locally in WASM — no HTTP requests.

## Build Setup

The package is built with **Rollup** (`rollup.config.mjs`). A single config file emits **six different bundles** by re-running Rollup once per build type. The `build` script chains all runs together via `cross-env`, controlling each variant through two environment variables:

- `INDIGO_MODULE_NAME` — selects which config from `modulesMap` to build (defaults to `base64`).
- `SEPARATE_INDIGO_RENDER` — inlined via `@rollup/plugin-replace` into `process.env.SEPARATE_INDIGO_RENDER`; when `true` the render module is loaded separately (the "NoRender" variants).

Every variant shares `baseConfig` (node polyfills, resolve, commonjs, TypeScript, Babel with runtime helpers, cleanup, replace, e.t.c) and differs only in **output dir/format**, which **indigo-ketcher package** it aliases, and **how the Indigo worker is loaded**.

### Two Alias Seams

The config swaps two placeholder imports per build via `@rollup/plugin-alias`:

- `_indigo-ketcher-import-alias_` (used in `indigoWorker.ts`) → resolved to one of the `indigo-ketcher` sub-packages: `indigo-ketcher`, `indigo-ketcher/binaryWasm`, `indigo-ketcher/jsNoRender`, or `indigo-ketcher/binaryWasmNoRender`.
- `_indigo-worker-import-alias_` (used in `standaloneStructService.ts`) → resolved to one of two worker-loading strategies in `src/.../indigoWorkerImports/`:
  - `useWasmLoader.ts` — uses `rollup-plugin-web-worker-loader` (`web-worker:` import). **Can** produce CJS output.
  - `useOffMainThreadPlugin.ts` — uses native `new Worker(new URL(...), { type: 'module' })` handled by `@surma/rollup-plugin-off-main-thread` (OMT). **Cannot** produce CJS output (ESM-only).

`src/emptyIndex.js` is a shim entry so bundlers can resolve the `import.meta.url` reference Emscripten emits in the generated WASM glue.

### The Six Build Types

| `INDIGO_MODULE_NAME`     | `SEPARATE_INDIGO_RENDER` | Output dir                | Format | indigo-ketcher alias                | Worker loader                       | WASM delivery                                         |
| ------------------------ | ------------------------ | ------------------------- | ------ | ----------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| `base64` (default)       | —                        | `dist`                    | ESM    | `indigo-ketcher`                    | `useWasmLoader` (web-worker-loader) | WASM inlined as base64                                |
| `base64Cjs`              | —                        | `dist/cjs`                | CJS    | `indigo-ketcher`                    | `useWasmLoader`                     | WASM inlined as base64                                |
| `wasm`                   | —                        | `dist/binaryWasm`         | ESM    | `indigo-ketcher/binaryWasm`         | `useOffMainThreadPlugin` (OMT)      | separate `.wasm` file copied via `rollup-plugin-copy` |
| `base64WithoutRender`    | `true`                   | `dist/jsNoRender`         | ESM    | `indigo-ketcher/jsNoRender`         | `useWasmLoader`                     | WASM inlined as base64, render module split out       |
| `base64WithoutRenderCjs` | `true`                   | `dist/cjs/jsNoRender`     | CJS    | `indigo-ketcher/jsNoRender`         | `useWasmLoader`                     | WASM inlined as base64, render module split out       |
| `wasmWithoutRender`      | `true`                   | `dist/binaryWasmNoRender` | ESM    | `indigo-ketcher/binaryWasmNoRender` | `useOffMainThreadPlugin` (OMT)      | separate `.wasm` file, render module split out        |

Two dimensions drive these six variants:

1. **WASM delivery** — _base64_ (WASM inlined into the JS bundle, larger JS but no extra fetch) vs _binaryWasm_ (separate `.wasm` fetched at runtime).
2. **Render bundling** — _default_ (Indigo render bundled in) vs _NoRender_ (`SEPARATE_INDIGO_RENDER=true`, the Indigo render engine is loaded separately to shrink the initial bundle). The NoRender path emits `STRUCT_SERVICE_NO_RENDER_INITIALIZED_EVENT` instead of `STRUCT_SERVICE_INITIALIZED_EVENT` on init (see `standaloneStructService.ts`).

CJS output only exists for the base64 variants because the OMT (used by the binaryWasm variants) cannot emit CJS.

### Package Entry Points (`package.json` `exports`)

- `.` → `dist/main.js` (ESM) / `dist/cjs/main.js` (CJS) — the default base64 build.
- `./dist/binaryWasm` → `dist/binaryWasm/main.js` (ESM only).
- `./dist/jsNoRender` → `dist/jsNoRender/main.js` (ESM) / `dist/cjs/jsNoRender/main.js` (CJS).
- `./dist/binaryWasmNoRender` → `dist/binaryWasmNoRender/main.js` (ESM only).

### Dev Workflow

- `npm run build` — production; runs all six variants sequentially (`NODE_ENV=production`, source maps on).
- `npm run start` — development watch mode; builds only the default `base64` variant (`NODE_ENV=development`).

## Dependencies

- `ketcher-core` (StructService interface)
- Indigo WASM (bundled binary)

## Dependents

- End-user applications that need offline/standalone operation
- `example/` (uses standalone for the demo build)

## Assumptions & Constraints

- When using standalone mode, the `StructService.convert()` and similar calls are synchronous in the Indigo WASM sense but are wrapped in Promises to match the `StructService` async interface.
- WASM binary size is significant. Choose a build variant accordingly: base64 variants inline the WASM (no extra fetch, larger JS); binaryWasm variants ship a separate `.wasm`. NoRender variants reduce initial bundle size by splitting out the Indigo render engine.
- Adding/removing a build variant requires changes in three coordinated places: `modulesMap` in `rollup.config.mjs`, the `build` script chain in `package.json`, and the `exports` map in `package.json`.
