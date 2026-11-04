# Build and toolchain

How the repository builds and the output rules a build change must keep. Exact commands and options
live in `package.json` scripts and `vite.config.mjs`; this file holds order, reasons, and contracts.

Every target builds with **Vite 8 (Rolldown)** and plain npm scripts sequenced with `npm-run-all2`,
except `example-ssr` (Next.js) and `ketcher-autotests` (no bundler).

## Targets

| Target                            | Kind    | Output                                                                 |
| --------------------------------- | ------- | ---------------------------------------------------------------------- |
| `packages/ketcher-core`           | library | One file per source module, CJS and ESM                                |
| `packages/ketcher-react`          | library | One bundle per format, plus extracted `index.css`                      |
| `packages/ketcher-macromolecules` | library | One bundle per format, plus extracted `index.css`                      |
| `packages/ketcher-standalone`     | library | Six variants of one bundle ([module](./modules/ketcher-standalone.md)) |
| `example`                         | app     | Static site per mode (`standalone`, `remote`)                          |
| `demo`                            | app     | Static site that consumes the published packages                       |
| `example-ssr`                     | app     | Next.js build                                                          |

## Order

`npm run build` runs `build:packages`, then `build:example`. `build:packages` builds `ketcher-core`,
then `ketcher-standalone` and `ketcher-macromolecules` in parallel, then `ketcher-react`.

The order follows type resolution. `ketcher-standalone`, `ketcher-macromolecules`, and
`ketcher-react` resolve `ketcher-core` declarations from its built `dist/`. `ketcher-react` also
resolves `ketcher-macromolecules` declarations from its `dist/`. `ketcher-macromolecules` depends on
`ketcher-react` in `package.json` but types it from local stubs (`src/types/ketcher-react`), which
breaks the cycle. `build:demo` builds the packages first.

For development, each package's `npm start` runs `vite build --watch` next to `tsc --watch --noEmit`.
Start `ketcher-core` first for the same reason ([DEVNOTES.md](../DEVNOTES.md)).

## How each package builds

Every library runs `prebuild` (clean and generate), `vite build` (JavaScript and CSS),
`tsc --emitDeclarationOnly` (types), then `tsc-alias` (rewrites path aliases in the `.d.ts` files).

- **ketcher-core.** `prebuild` compiles the KET JSON schema (`npm run ajv`). `preserveModules` with
  `preserveModulesRoot: 'src'` keeps the per-file layout that consumers rely on for per-file
  tree-shaking. Rolldown rewrites the bare `require("raphael")` in `raphael-ext.ts` into a
  `__require` helper that consumer bundlers drop, so one plugin restores the plain `require`, and a
  second fails the build if any other `__require(` reaches ESM. The call stays behind the
  `typeof window` guard, since a top-level import throws under Node SSR.
  `optimization.inlineConst: false` keeps constant modules as emitted files: their `.d.ts` still
  ships and would otherwise describe a value that is not there.
- **ketcher-react.** `prebuild` runs `i18n:generate` ([modules/i18n.md](./modules/i18n.md)). CSS
  lands in `dist/index.css`. `ketcher-macromolecules` is external, so the dynamic
  `import('ketcher-macromolecules')` in `src/Editor.tsx` stays a bare `import()`. Declarations use
  `tsc --noCheck` with a `tsconfig.build.json` that limits `paths` to the aliases this bundle uses.
- **ketcher-macromolecules.** Same `prebuild` as react. Both formats start with a banner that loads
  the sibling `index.css`. `@rolldown/plugin-emotion` supplies Emotion's compile-time transform.
- **ketcher-standalone.** `packages/ketcher-standalone/scripts/build.mjs` runs Vite once per entry of `VARIANTS`, then `tsc`
  once, and copies the declarations into every variant directory. Variants, aliases, and the
  per-variant gotchas are in [modules/ketcher-standalone.md](./modules/ketcher-standalone.md).
- **example.** `MODE` (`standalone` or `remote`) comes from the environment. The config aliases the
  four packages to their **source**, so `example` never exercises a published `dist/`. A production
  build splits chunks by package and vendor group, writes `build/`, then copies into `dist/<MODE>`;
  `npm run serve:*` serves `remote` on `127.0.0.1:4001` and `standalone` on `4002`. The dev server
  serves sources, so check a change against a production build as well.
- **demo.** Minimal config over the published packages; `PUBLIC_URL` sets `base`.
- **example-ssr.** `next build`, resolving packages through their `exports` maps.

## Shared configuration (`build-config/`)

Code and constants that more than one build uses live in the root `build-config/`; a package's build
config is imported by that package only. The directory is not named `build/` because `.gitignore`
has a bare `build` pattern that silently ignores any directory of that name. Each file's header says
what it provides.

`createReplaceValues` gives every package the same build-time constants when built from one commit:
`BUILD_DATE` comes from `SOURCE_DATE_EPOCH`, else the last commit time. A repo-root `.env` loads
without overriding shell variables. `KETCHER_MULTI_LANGUAGE_BUILD` is explained in
[modules/i18n.md](./modules/i18n.md).

## Output contract

A build change keeps these true, or records the exception here. Each rule names its guard; "none"
means check `dist/` by hand after changing it.

- **Browser target** is `baseline-widely-available`: Chrome/Edge 111+, Firefox 114+, Safari 16.4+ at
  Vite 8.3.1 (re-check when Vite changes). It sets syntax only and adds no polyfills. Changing it is a
  support decision. Guard: none.
- **Published outputs are stable by default**: package file names, output formats, and JavaScript
  `import`/`require` mappings stay the same across ordinary build changes. A correctness or consumer
  fix may change them when its scope and reason are written here. Guard: `check:package-metadata`,
  `check-standalone-consumer`. Current exceptions:
  - `./dist/binaryWasm` and `./dist/binaryWasmNoRender` have no `require` condition, since their
    targets are ESM-only. `./dist/jsNoRender` keeps its CJS target.
  - Worker and `.wasm` files have fixed `assets/` names instead of hashed ones.
  - The `exports` maps carry `types` conditions that point at emitted declarations, and expose
    `./package.json`.
  - `ketcher-standalone` `main` is `dist/cjs/main.js`, `module` is `dist/main.js`, matching the `.`
    export.
- **Every library build sets `build.lib`.** Without it Vite builds an app: standalone's public API is
  tree-shaken away, and dynamic `import()` is wrapped in a browser-only preload helper that breaks
  Node consumers (`example-ssr`). `modulePreload: false` goes with it. Guard: `example-ssr` build.
- **Library JavaScript is unminified** (`build.minify: false`), so downstream stack traces and output
  diffs stay readable. CSS is minified in production. Guard: none.
- **Production builds emit no JavaScript or CSS source maps**; watch builds do, except where Vite
  cannot (the macromolecules CSS bundle, and Blob-inlined workers in standalone). Guard: none.
- **`console.*` and `assert.*` are stripped** from each package's own `src/` in production; third-party
  glue (the Indigo worker) keeps its calls. Guard: none.
- **CJS output carries `__esModule`** (`esModule: true`); without it TypeScript and Babel interop
  build namespaces of non-configurable getters. Guard: none.
- **`example` does not apply CSS in `dist/index.css` order.** It bundles the packages' styles from
  source, so their order follows the example's module graph (chunk order in a production build, load
  order in the dev server), with or without CSS code splitting. Of two equally specific rules in
  different files, either can come last, so an override of a shared component's style wins by
  specificity or `!important`, never by file order. Guard: none (the Settings screenshot specs cover
  the Settings select only).
- **CSS Modules class names** follow `[name]_[local]__[hash:base64:5]` in react, macromolecules, and
  `example`, so consumers that match class names keep working. Guard: none.
- **Declarations come from `tsc`**, so a broken `tsconfig` fails the build.
- **Transpilation is Vite's own.** `@rolldown/plugin-emotion` covers Emotion.
- **One Vite version.** The four packages declare `^8.3.1`, `example` and `demo` pin `8.3.1`, and the
  lockfile holds a single entry. `check-standalone-consumer` installs its consumers at the locked
  version.

## Verification

Only the checks below touch published `dist/` output. CI runs them after `npm run build`. Run all
four before a PR that touches `vite.config.mjs`, `build-config/`, a package's `exports`, or a build
script.

- `npm run check:package-metadata` packs the four libraries and checks metadata, `exports`, and
  declaration resolution with publint and Are The Types Wrong. It fails when a runtime `.d.ts` has
  lost its `.js`. See [testing/testing.md](./testing/testing.md).
- `node scripts/check-standalone-consumer.mjs` installs packed `ketcher-core` and `ketcher-standalone`
  tarballs into Vite and webpack 5 consumers in an OS temp directory, asserts each emits a worker
  file and a matching `.wasm` for both binaryWasm variants, then loads each bundle in jsdom. The
  consumers live outside the repo so Node and npm cannot fall back to workspace links and hide
  undeclared dependencies.
- The `example-ssr` build proves the entry points load through `exports` and are SSR-safe.
- `npm run test:build-config` runs `node --test` suites for the `example` and `demo` Vite configs.
