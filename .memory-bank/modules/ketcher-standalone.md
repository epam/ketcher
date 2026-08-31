# ketcher-standalone

> Self-contained Ketcher bundle: ships Indigo WASM and requires no backend server.

## Responsibility

Provides a `StandaloneStructService` implementation that runs the Indigo cheminformatics engine entirely in the browser via WebAssembly. This enables Ketcher to work offline without a backend HTTP service.

## Public Interfaces

- Default export from `src/index.ts` — factory function (or provider) that creates a standalone-configured `Ketcher` instance
- `StandaloneStructService` (internal) — implementation of `StructService` from `ketcher-core`

## Internal Structure

| Path                                                                               | Purpose                                                                           |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/index.ts`                                                                     | Entry: re-exports infrastructure/services                                         |
| `src/emptyIndex.js`                                                                | Shim so bundlers resolve Emscripten's `import.meta.url`                           |
| `src/infrastructure/services/index.ts`                                             | Exports `StandaloneStructService(Provider)`                                       |
| `src/infrastructure/services/struct/standaloneStructService.ts`                    | HTTP-free `StructService` impl; imports worker via `_indigo-worker-import-alias_` |
| `src/infrastructure/services/struct/standaloneStructServiceProvider.ts`            | `StructServiceProvider` (mode: `'standalone'`)                                    |
| `src/infrastructure/services/struct/indigoWorker.ts`                               | Web worker; imports Indigo via `_indigo-ketcher-import-alias_`                    |
| `src/infrastructure/services/struct/indigoWorker.types.ts`                         | Command / message types                                                           |
| `src/infrastructure/services/struct/constants.ts`                                  | Init event names (render vs no-render)                                            |
| `src/infrastructure/services/struct/indigoWorkerImports/useViteInlineWorker.ts`    | Blob-inlined worker strategy (CJS-capable)                                        |
| `src/infrastructure/services/struct/indigoWorkerImports/useNativeWorkerUrl.ts`     | Separate-chunk worker strategy (ESM only)                                         |

Build config lives at package root: `vite.config.mjs` (six-variant config), `tsconfig.build.json` (declaration emit), `package.json` (`build`/`start` scripts + `exports` map).

## How It Works

1. On import, loads the Indigo WASM binary (compiled from C++ Indigo toolkit).
2. Registers a `StandaloneStructService` that satisfies the `StructService` interface.
3. All format conversions, aromatize/dearomatize, layout, calculate, check operations are performed locally in WASM — no HTTP requests.

## Build Setup

The package is built with **Vite 8** (`vite.config.mjs`). A single config file emits **six different bundles** by re-running `vite build` once per build type. The `build` script chains all runs together via `cross-env`, controlling each variant through two environment variables:

- `INDIGO_MODULE_NAME` — selects which entry from `VARIANTS` to build (defaults to `base64`).
- `SEPARATE_INDIGO_RENDER` — inlined via Vite's `define` into `process.env.SEPARATE_INDIGO_RENDER`; when `true` the render module is loaded separately (the "NoRender" variants).

Every variant shares one config and differs only in **output dir/format**, which **indigo-ketcher package** it aliases, and **how the Indigo worker is loaded**. Declarations are emitted once by `tsc -p tsconfig.build.json` and copied into all six output directories.

### Two Alias Seams

The config swaps two placeholder imports per build via Vite's `resolve.alias`:

- `_indigo-ketcher-import-alias_` (used in `indigoWorker.ts`) → resolved to one of the `indigo-ketcher` sub-packages: `indigo-ketcher`, `indigo-ketcher/binaryWasm`, `indigo-ketcher/jsNoRender`, or `indigo-ketcher/binaryWasmNoRender`.
- `_indigo-worker-import-alias_` (used in `standaloneStructService.ts`) → resolved to one of two worker-loading strategies in `src/.../indigoWorkerImports/`:
  - `useViteInlineWorker.ts` — imports the worker with Vite's `?worker&inline`, embedding it as a Blob. **Can** produce CJS output.
  - `useNativeWorkerUrl.ts` — uses `new Worker(new URL(...), { type: 'module' })`, which Vite emits as a separate chunk. **Cannot** produce CJS output (ESM-only).

  Both shims are named for the mechanism they use, not for a plugin. `_indigo-worker-import-alias_` must stay an ambient declaration (`indigoWorkerAlias.d.ts`) — mapping it to a concrete file through tsconfig `paths` makes TypeScript resolve it too, silently overriding the build-time alias and forcing every variant onto the same shim.

`src/emptyIndex.js` is a shim entry so bundlers can resolve the `import.meta.url` reference Emscripten emits in the generated WASM glue.

### The Six Build Types

| `INDIGO_MODULE_NAME`     | `SEPARATE_INDIGO_RENDER` | Output dir                | Format | indigo-ketcher alias                | Worker loader                       | WASM delivery                                         |
| ------------------------ | ------------------------ | ------------------------- | ------ | ----------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| `base64` (default)       | —                        | `dist`                    | ESM    | `indigo-ketcher`                    | `useViteInlineWorker` (`?worker&inline`) | WASM inlined as base64                          |
| `base64Cjs`              | —                        | `dist/cjs`                | CJS    | `indigo-ketcher`                    | `useViteInlineWorker`               | WASM inlined as base64                                |
| `wasm`                   | —                        | `dist/binaryWasm`         | ESM    | `indigo-ketcher/binaryWasm`         | `useNativeWorkerUrl`                | separate `.wasm` emitted as a build asset             |
| `base64WithoutRender`    | `true`                   | `dist/jsNoRender`         | ESM    | `indigo-ketcher/jsNoRender`         | `useViteInlineWorker`               | WASM inlined as base64, render module split out       |
| `base64WithoutRenderCjs` | `true`                   | `dist/cjs/jsNoRender`     | CJS    | `indigo-ketcher/jsNoRender`         | `useViteInlineWorker`               | WASM inlined as base64, render module split out       |
| `wasmWithoutRender`      | `true`                   | `dist/binaryWasmNoRender` | ESM    | `indigo-ketcher/binaryWasmNoRender` | `useNativeWorkerUrl`                | separate `.wasm` asset, render module split out       |

Two dimensions drive these six variants:

1. **WASM delivery** — _base64_ (WASM inlined into the JS bundle, larger JS but no extra fetch) vs _binaryWasm_ (separate `.wasm` fetched at runtime).
2. **Render bundling** — _default_ (Indigo render bundled in) vs _NoRender_ (`SEPARATE_INDIGO_RENDER=true`, the Indigo render engine is loaded separately to shrink the initial bundle). The NoRender path emits `STRUCT_SERVICE_NO_RENDER_INITIALIZED_EVENT` instead of `STRUCT_SERVICE_INITIALIZED_EVENT` on init (see `standaloneStructService.ts`).

CJS output only exists for the base64 variants: the binaryWasm ones load their worker with `new Worker(new URL(..., import.meta.url))`, which has no CJS equivalent.

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
- Adding/removing a build variant requires changes in three coordinated places: `VARIANTS` in `vite.config.mjs`, the `build` script chain in `package.json`, and the `exports` map in `package.json`.
