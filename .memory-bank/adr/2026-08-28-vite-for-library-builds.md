# Vite for library builds

- **Date:** 2026-08-28
- **Status:** Accepted

## Decision

Build every package in this repository with **Vite 8** (Rolldown), replacing Rollup 2 in all four
publishable packages and `react-scripts` (webpack) in `demo`.

Two targets are explicitly excluded:

- **`example-ssr`** stays on Next.js. It is an SSR application with its own bundler; moving it
  to Vite would mean abandoning SSR or rewriting the app.
- **`ketcher-autotests`** has no bundler to migrate.

The **published contract is frozen**: every package keeps its current file names, output
formats, and `main`/`module`/`types`/`exports` entries, including entries that are currently
wrong (see _Consequences_).

## Context

The repository built its packages with Rollup 2 and its `demo` app with CRA `react-scripts` 5,
while `example` had already moved to Vite 8. That left three bundlers in one tree, each with its
own plugin ecosystem and failure modes.

The cost was not abstract. Build configuration had leaked across package boundaries:
`example/vite.config.js` imported constants directly from `packages/*/rollup.config.mjs` and
reconstructed every package's tsconfig path aliases by hand, so an app's build depended on the
libraries' build configs. `ketcher-react`'s Rollup config read
`../ketcher-macromolecules/dist/index.css` — a sibling's _build output_ — while the root
`build:packages` script built `ketcher-react` before `ketcher-macromolecules`, meaning clean
builds relied on stale output being present. And `ketcher-macromolecules` imported
`ketcher-core/dist/domain/entities/PolymerBond`, reaching through another package's emitted file
tree instead of its public API.

`react-scripts` is unmaintained, making `demo` the last webpack in the tree and a standing
security-audit liability.

## Alternatives considered

**Keep Rollup 2 for libraries, Vite for apps.** Defensible — Rollup is a mature library bundler
and the packages' output requirements are intricate. Rejected because it institutionalises the
split that motivated the work, and leaves the cross-package config leakage in place.

**Vite 7 for libraries, Vite 8 for `example`.** Vite 7 is Rollup-based, so existing Rollup
plugins (`rollup-plugin-typescript2`, `@rollup/plugin-strip`, `rollup-plugin-string`) would keep
working unchanged. Rejected: two Vite majors with different bundler cores underneath is the same
problem wearing a uniform, and it would mean migrating twice.

**Bundle `ketcher-core` into single-file ESM/CJS output.** Would sidestep any `preserveModules`
risk entirely. Rejected because it is a breaking change for consumers relying on per-file
tree-shaking, and it was never necessary — see below.

**`vite-plugin-dts` for declaration emission.** Rejected in favour of a plain
`tsc --emitDeclarationOnly` step. Type emission is not a bundler concern, and a third-party
plugin re-couples it to one; the repository is on TypeScript 6, where plugin lag is most acute.

## Rationale

Vite 8 removes Rollup entirely — `rollupOptions` is a deprecated alias proxied to
`rolldownOptions`, and there is no configuration to opt out. Adopting Vite 8 therefore means
adopting Rolldown, which made **`preserveModules` the pivotal unknown**: `ketcher-core` publishes
per-file unbundled output, Vite's documentation is silent on `preserveModules` in library mode,
and both the published contract and an in-repo deep import depend on it.

This was settled empirically before committing to the migration. A throwaway spike built
`ketcher-core` with `build.lib` plus
`build.rolldownOptions.output.preserveModules` / `preserveModulesRoot`, and diffed the result
against the Rollup baseline:

- **`preserveModules` works.** ~550 source modules mapped 1:1 by relative path in both `es` and
  `cjs` formats — genuinely per-file, not bundled. Relative import paths and the license banner
  were preserved.
- The only unexpected outputs were Rolldown's `_virtual/_rolldown/runtime.js` helper and a
  bundled `events` polyfill.

The spike also surfaced three behavioural differences from Rollup, each of which the migration
must configure against explicitly rather than inherit:

| Difference                                                                                           | Resolution                                                                                                                     |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Rolldown minifies library output by default                                                          | `build.minify: false` — publishing minified library code destroys downstream stack traces, and makes output diffing impossible |
| `events` (a Node builtin) is resolved to a local polyfill and bundled, where Rollup left it external | Explicit Node-builtin `external` list                                                                                          |
| `rollup-plugin-string` has no equivalent, so `.ket` imports fail to parse                            | A small inline raw-text transform in the shared build config                                                                   |

Babel is dropped along with the `@babel/runtime` runtime dependency, since Vite transpiles
natively. The one exception is `ketcher-macromolecules`, which keeps Emotion's Babel plugin:
it produces stable class names, and this repository's test suite is screenshot-based.

## Consequences

**The migration is verified against real consumers, not just builds.** Each package must build,
diff cleanly against its Rollup baseline, and then be exercised by `example-ssr` before the
Playwright suite runs. `example-ssr` is the only target that resolves the packages from `dist`
through their `exports` maps — `example` aliases them to source — so it is the sole check that
the frozen contract, the CJS `require` conditions, and SSR-safety actually hold.

**`ketcher-standalone` moved to Vite too, on a second attempt.** The first attempt aborted:
four of its six variants inline the Indigo worker via `rollup-plugin-web-worker-loader`, which
fails under Vite 8 with `Error: Missing field 'moduleType'`. The cause is structural — the plugin
bundles the worker by running a **nested Rollup build** inside its own `load` hook, seeded with
the outer build's entire plugin list. Under Rollup-only that was safe; under Vite 8 the outer
list holds Rolldown-oriented plugins, and re-invoking them through real Rollup 2 collides two
module-resolution contracts.

The abort was reconsidered because the only route past it — dropping the custom `web-worker:`
protocol for Vite's native `?worker&inline` — had been rejected as "changing source to suit the
bundler", and that framing was wrong. `useWasmLoader.ts` existed *only* to name a bundler plugin;
its replacement, `useViteInlineWorker.ts`, names the mechanism that replaced it. The same applies
to `useOffMainThreadPlugin.ts`, renamed to `useNativeWorkerUrl.ts`: it already used the plain
`new Worker(new URL(...), { type: 'module' })` form that Vite understands natively, so nothing
about it changed but the misleading name. Both shims are one file each, behind the
`_indigo-worker-import-alias_` placeholder that already existed to swap them per variant.

Keeping a second toolchain alive to avoid renaming two files was the worse trade.

**The `.wasm` for the two fetch variants is now emitted, not copied.** Indigo's emscripten glue
locates it with `new URL('<name>.wasm', import.meta.url)`. Vite's asset pipeline rewrites that,
and in library mode it inlines every asset it rewrites regardless of `assetsInlineLimit` — which
would have collapsed the two fetch variants into the base64 ones and added ~16 MB to each worker
chunk. `?no-inline` is the one escape hatch checked ahead of that lib-mode branch, so a small
pre-transform tags the reference and Vite emits the `.wasm` as a real file.

This replaces `rollup-plugin-copy` and is strictly safer than it was. The emitted path and the
URL that fetches it now come from the same rewrite, instead of a hand-written copy glob that had
to agree with a filename baked into a third-party dependency. That glob pointed at the workspace
root while the dependency installs into the package, so it silently matched nothing and shipped
two unusable variants for three weeks — fixed separately in commit `964c0f36`. Each variant now
also ships only the one binary it actually uses, rather than both.

The worker plugin must be registered under `worker.plugins`, not `plugins`: Vite bundles workers
through a separate pipeline, and the indigo import lives entirely inside the worker's graph.

**`base: './'` is required for this package.** These bundles are consumed from
`node_modules/ketcher-standalone/dist/...`, not served from a site root, so Vite's default
`base: '/'` would emit the worker and `.wasm` URLs as `/assets/...` — resolving only if the
consumer happened to copy them to their web root.

**Internal chunk layout changed; the published contract did not.** The worker and `.wasm` now
live in an `assets/` subdirectory with hashed names, and `indigoWorker.types.js` is folded into
the worker chunk. Nothing in the `exports` map or in any consumer references those paths. Two
minor artifacts also changed: the six `index.js.map` files are no longer emitted (the Rollup ones
had empty `sources` and `mappings`, and the new `index.js` carries no `sourceMappingURL`), and
the four inline variants emit an unused sourcemap alongside the Blob-inlined worker.

**`main`/`module` metadata is fixed, not preserved.** `ketcher-standalone`'s `main` and `module`
fields used to point at `dist/index.js` (an empty placeholder built from `src/emptyIndex.js`,
which exists only to satisfy an emscripten-generated `import.meta.url`/`require('url')`
resolution quirk) and `dist/index.modern.js` (a file the build never emitted at all). This ADR
originally decided to leave that broken metadata in place until a deliberate version bump — this
is that version bump. `main` now points to `dist/cjs/main.js` and `module` to `dist/main.js`,
matching the `exports` map's `require`/`import` conditions for the `.` entry exactly. This is a
deliberate, scoped exception to "the published contract is frozen": only the `.` entry's
`main`/`module` changed; `types` (`dist/index.d.ts`) was already correct despite the name
collision with the empty JS placeholder, and none of the six sub-path `exports` entries
(`./dist/binaryWasm`, `./dist/jsNoRender`, `./dist/binaryWasmNoRender`, …) were touched.

**The major version bump is not about syntax level — that framing was wrong.** The original
justification was that dropping Babel drops ES5 downleveling too: `@babel/preset-env` ran with
no explicit target under Rollup, so `ketcher-core`'s `Editor.modern.js` went from 18 downlevel
helpers and 1 raw `class` to 0 and 6 once Babel was removed, and `ketcher-macromolecules`'
`dist/index.js` fell from 3.56 MB to 602 KB.

That comparison was against npm's published `3.18.0`, not against this repository's current
`master`. Master's own `3.20.0-rc.1` — built before this migration, still on Rollup 2 — already
ships the same modern syntax (native `class`, optional chaining, `async`), because master
separately upgraded to Babel 8, which changed `@babel/preset-env`'s default targets independently
of this migration. **This branch does not change the syntax level relative to master.** The
syntax-level regression is real only against the last npm release, `3.18.0`; it is not something
this migration introduces on top of master, so citing it as this migration's reason for a major
version overstates its cause. The ADR and any changelog should give the breaking changes below as
the reason instead.

**The major version bump is justified by six other breaking changes:**

1. **Lazy monomer library API.** `CoreEditor` no longer loads the default monomer library in its
   constructor; a synchronous read of `monomersLibrary`/`monomersLibraryParsedJson` now returns
   empty until the async load resolves, and the `updateMonomersLibrary` event (dispatched after
   the library changes) now fires later too. (`replaceMonomersLibrary` is a method a consumer
   calls directly, not an event — it doesn't "fire" on its own.)
2. **`ketcher-standalone` asset layout.** The worker and `.wasm` for the two fetch-based variants
   (`binaryWasm`, `binaryWasmNoRender`) now live in an `assets/` subdirectory with hashed names,
   one `.wasm` per variant instead of both.
3. **Module worker from a Blob URL.** Inline (base64) builds construct their worker from a Blob
   URL instead of a classic base64 worker — a problem for browsers without module-worker support
   and for strict `worker-src` CSP policies.
4. **CSS Modules class name format.** Rolldown's CSS Modules hashing convention differs from
   `rollup-plugin-postcss`'s (`X-module_root__hash` → `_root_hash_N`). Global class names are
   unaffected. Fixed since the original review — see below.
5. **Dropped CJS `.d.ts` and CSS source maps.** `ketcher-react/dist/cjs/**/*.d.ts` (507 files)
   and `ketcher-macromolecules`'s `dist/index.css.map` are no longer emitted.
6. **`ketcher-standalone` `main`/`module` now resolve to real files.**
   `require('ketcher-standalone')` used to return `{}` (`main` pointed at an empty placeholder
   built from `src/emptyIndex.js`); it now returns the package's real named exports (see the
   metadata correction above). Fixing wrong metadata is still a behavior change for a consumer
   that relied on — or merely tolerated — `require('ketcher-standalone')` being empty.

### Breaking changes vs 3.18.0

| Change | Who it affects | Status on this branch |
| --- | --- | --- |
| The monomer library is empty until it loads. `CoreEditor` no longer loads it in its constructor, so a synchronous read of `monomersLibrary`/`monomersLibraryParsedJson` returns empty, and the `updateMonomersLibrary` event fires later. | Anyone who reads the library directly — and more broadly than "macromolecules-mode users only": `getKet`, `setMolecule`, `addFragment`, and both `convert()` calls now wait for the library, so any API call loads and parses the ~3.5 MB library even without opening macromolecules mode. For npm/bundler consumers it arrives as a **code-split JS chunk** pulled in via dynamic import — only `example`'s standalone build fetches it as a separately hosted asset. | The clobbering race between this load and a consumer's own `updateMonomersLibrary`/`replaceMonomersLibrary` call is fixed: both methods now `await` the default library load first, with a regression test covering the ordering (including the reverse race, where the consumer's own call is what starts the default load). |
| `binaryWasm`/`binaryWasmNoRender` asset layout: files live in `assets/` with hashed names, and each variant ships one `.wasm` instead of both. | Anyone copying these files by a hard-coded path. | Layout itself is unchanged. The consumer-bundler blocker (the worker/`.wasm` `new URL(...)` calls were emitted as computed expressions a consumer's bundler can't statically detect, so the worker chunk and/or `.wasm` were dropped from the consumer's own build → 404 at runtime) is fixed: both are now emitted as the literal `new Worker(new URL('./assets/indigoWorker-<hash>.js', import.meta.url), { type: 'module' })` form in `main.js`, and, inside that worker chunk itself, `new URL('./indigo-ketcher-<version>-<hash>.wasm', import.meta.url)` — relative to the *worker* file, not `main.js`, since both land flat in the same `assets/` directory. CI builds a throwaway Vite consumer and a webpack 5 consumer against the packed `dist`, each importing and instantiating both the `binaryWasm` and `binaryWasmNoRender` variants, and asserts every consumer's build emits a `.wasm` and a worker chunk per variant. The webpack consumer needs no extra bundler config: webpack 5's default asset handling already emits the `new URL('./x.wasm', import.meta.url)` reference as a real output file with no `module.rules` entry required (verified empirically before deciding not to add one). |
| Inline builds now use a module worker created from a Blob URL (before: a classic worker from base64). | Browsers without module workers (Firefox < 114, Safari < 15), strict `worker-src` CSP rules. | Unchanged. |
| CSS Modules class names changed format (`X-module_root__hash` → `_root_hash_N`). Global class names are unchanged. | Consumers who style Ketcher's internal classes. | Fixed — see below. |
| `ketcher-react/dist/cjs/**/*.d.ts` (507 files) and CSS source maps are no longer shipped. | Deep imports of the CJS types; CSS debugging in devtools only. | Unchanged. |
| The CSS minifier drops some vendor prefixes and writes colors as `#rrggbbaa`. | Old browsers only. | Unchanged. |
| `ketcher-standalone`'s `main`/`module` now resolve to real files instead of an empty placeholder / an unemitted file. `require('ketcher-standalone')` returns real named exports instead of `{}`. | Anyone who imported `ketcher-standalone` via `main`/`module` and relied on (or tolerated) getting nothing back. | Deliberate, scoped exception to "the published contract is frozen" (see the metadata correction above) — the wrong metadata is fixed as part of this version bump, not preserved. |

**Fixed since the original review (no longer breaking vs 3.18.0):**

- **No `__esModule` marker in `ketcher-standalone/dist/cjs/main.js`.** Same root cause as
  `ketcher-core`/`ketcher-react` (Rollup 2 emitted the marker on CJS output; Rolldown does not by
  default, silently changing default-import interop for CJS consumers). Fixed by adding
  `esModule: true` to `rolldownOptions.output` — the same mechanism the other two packages
  already used.
- **CSS Modules class names now match the Rollup baseline exactly.** Vite's default
  (`postcss-modules`' own bare default) differs from Rolldown's `_root_hash_N` cited above — it's
  `_${name}_${hash}_${lineNumber}`, since `ketcher-react`'s and `ketcher-macromolecules`' Vite
  configs left `css.modules` unset. `rollup-plugin-postcss` (used by both on `master`) does not
  leave its own default either: it explicitly hard-codes
  `generateScopedName: '[name]_[local]__[hash:base64:5]'`. Both packages' `vite.config.mjs` now
  set the same pattern via `css.modules.generateScopedName`, producing byte-identical class names
  (e.g. `App-module_canvas__<hash>`, `ActionButton-module_selected__<hash>`) to the `master`
  Rollup build.

**Not breaking:** `exports`, `types`, `sideEffects`, peer dependencies, and `engines` match
master's build. `ketcher-react` briefly leaked the bundler helper `__toESM` as an extra CJS
export (harmless, but flagged for cleanup); it has since been stripped by a dedicated
`renderChunk` plugin. `ketcher-standalone`'s `main`/`module` are **not** in this list — see the
breaking-changes table above.

The bump lands as a single commit after the migration completes, so that four interdependent
`package.json` files are not churning while the builds are still changing. It needs the release
owner's agreement before it ships.

**`vite` is pinned to exactly `8.0.16` in all four packages, not only in `ketcher-standalone`.**
For `ketcher-standalone` the reason is on record, in the commit that tightened its range from
`^8.0.16` to `8.0.16` (`c325be7cfd`, "Restore master tooling reverted by merge 21e59ce41"): its
`.wasm` emission for the two fetch variants depends on Vite's asset plugin evaluating the
`?no-inline` tag *ahead of* the `if (build.lib) return true` branch that otherwise inlines every
rewritten asset in library mode (see "The `.wasm` for the two fetch variants is now emitted, not
copied" above) — a patch release could reorder or change that check and silently re-inline the
~16 MB `.wasm` into the JS bundle. No equivalent reason is recorded for `ketcher-core`,
`ketcher-react`, or `ketcher-macromolecules`: each package's first Vite migration commit
(`fec1d845e5`, `908791e094`, `38bf23024c` respectively) introduces the exact `"vite": "8.0.16"`
pin directly, with no explanation in the commit message, mirroring the exact-pin style `example`
already used for its own (pre-migration) Vite dependency. `c325be7cfd`'s own message calls
`ketcher-standalone` "the only loose Vite range" at that point, implying the other three were
already exact-pinned by convention rather than for a documented technical reason. No further
justification for those three was found in git history or this ADR; one should not be invented —
if the release owner wants a stated reason, the most likely candidate is the same class of risk
as `ketcher-standalone`'s (an undocumented Rolldown behavior — `preserveModules`, tree-shaking
scope, minify defaults — that this ADR's spike had to determine empirically and that a patch bump
could silently change), but that is speculation, not a recorded fact.

**CSS source maps are lost for `ketcher-macromolecules`.** Producing a single `dist/index.css`
requires `build.cssCodeSplit: false`, and in that path Vite 8.0.16 emits the extracted CSS via a
plain `emitFile` call with no sourcemap generation — no configuration produces `index.css.map`.
This affects CSS debugging in devtools only; it is not part of the published contract.

**Type emission becomes an explicit build step.** Each package runs
`tsc --emitDeclarationOnly` (plus `tsc-alias` where path aliases are used) alongside its Vite
build. Declarations no longer appear as a side effect of bundling, so a broken `tsconfig` now
fails the build loudly rather than silently emitting nothing.

**Build configuration is shared, not reached for.** Constants previously read out of the
packages' Rollup configs move to a root `build-config/` directory that every package and
`example` import from, ending the dependency of an application's build on a library's build
config. (The directory is named `build-config/`, not `build/`, because `.gitignore` carries a
bare `build` pattern that silently ignores any directory of that name at any depth.)

**Rolldown plugin compatibility remains partly unproven.** The spike covered `ketcher-core`
only. PostCSS extraction, `svgr`, and `rollup-plugin-typescript2`'s replacement in
`ketcher-react` and `ketcher-macromolecules` are untested, and Vite 8 has already dropped
`output.format: 'system'` and `'amd'` over Rolldown gaps — "full plugin compatibility" is a
claim, not a guarantee.
