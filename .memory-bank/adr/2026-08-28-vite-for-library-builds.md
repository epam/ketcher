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

**Known-wrong metadata is preserved deliberately.** `ketcher-standalone`'s `main` and `module`
fields point at `dist/index.js` and `dist/index.modern.js`, but the build emits `dist/main.js`.
Its `exports` map is correct, so modern resolvers are unaffected and only tooling that ignores
`exports` sees the broken paths. Correcting them could change resolution for consumers who are
currently working by accident, so they are left as-is and should be fixed in a deliberate
version bump instead.

**Published packages ship modern syntax, and that is a breaking change.** The Rollup builds ran
`@babel/preset-env` with no explicit target, which downleveled output toward ES5. Dropping Babel
drops that too: `ketcher-core`'s `Editor.modern.js` went from 18 downlevel helpers and 1 raw
`class` to 0 and 6, and `ketcher-macromolecules`' `dist/index.js` fell from 3.56 MB to 602 KB.

This is the failure mode the frozen contract exists to catch: the build stays green, tests pass,
`example-ssr` renders, and only a consumer on an older browser breaks — at runtime, silently.
The reduction in supported browsers is therefore handled as a **major version bump** rather than
hidden behind build configuration. Consumers who need the old floor should transpile these
packages in their own build, which is now the ordinary expectation for a library shipping ESM.

The bump lands as a single commit after the migration completes, so that four interdependent
`package.json` files are not churning while the builds are still changing. It needs the release
owner's agreement before it ships.

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
