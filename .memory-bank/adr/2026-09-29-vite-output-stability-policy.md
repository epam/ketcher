# Vite output stability policy and shared build contracts

- **Date:** 2026-09-29
- **Status:** Accepted

## Decision

### Browser target

All Vite package and app builds explicitly use `baseline-widely-available`. With Vite 8.3.1 this
targets Chrome/Edge 111+, Firefox 114+, and Safari 16.4+. This is a JavaScript syntax target,
not a source-level Babel target or a promise to polyfill runtime APIs.

### Published output policy

Published package outputs are stable by default: preserve filenames, output formats, and
JavaScript `import`/`require` mappings in ordinary build changes. A correctness or consumer
compatibility change may deliberately alter them when its scope and reason are documented and
verified.

Two such standalone changes are intentional:

- **#11993 — remove invalid `require` conditions.** The `./dist/binaryWasm` and
  `./dist/binaryWasmNoRender` export subpaths had `require` conditions pointing to ESM entries
  with no corresponding CJS builds. Those conditions are removed; the package retains `require`
  conditions only for entries with actual CJS output.
- **#11999 — replace hashed worker and `.wasm` names with fixed names.** The fetch variants now
  ship `assets/indigoWorker.js`, `assets/indigo-ketcher-<version>.wasm`, and
  `assets/indigo-ketcher-norender-<version>.wasm`. Literal names let external bundlers reliably
  include each worker and its matching binary. Packed Vite and webpack consumers verify both
  variants.

The separate #11992 type and `./package.json` export corrections expose existing package metadata
and declarations; they do not redefine JavaScript entry points.

### Build-time transforms and shared props

Use Vite's native JavaScript/TypeScript transpilation instead of Babel. The macromolecules build
uses `@rolldown/plugin-emotion` for Emotion's compile-time transform. Keep the React host and
macromolecules editor on one monomer-library prop contract by deriving the host's corresponding
fields from the editor's exported props rather than maintaining duplicate declarations.

## Context

The original Vite migration ADR described the published runtime contract as frozen and recorded
the browser baseline there. Later build tickets corrected metadata and changed standalone asset
names intentionally, making an absolute no-change promise inaccurate. The same tickets made the
browser target explicit, completed the Babel-to-Vite transform migration, and aligned duplicated
React/macromolecules prop definitions.

The baseline values are Vite 8.3.1's `baseline-widely-available` browser set. The four published
packages declare Node `>=24.20.0`; the package-metadata gate therefore scopes ATW's Node 16
`unexpected-module-syntax` allowance to known ESM import resolutions only. The same finding on a
CJS resolution remains an error.

## Alternatives considered

- **Leave the browser target implicit.** Rejected because an explicit setting documents the
  actual emitted syntax and makes an accidental baseline change visible.
- **Freeze every published path without exceptions.** Rejected because it would preserve invalid
  `require` mappings and block the fixed asset names needed by consumer bundlers. Unrestricted
  output changes were also rejected; deviations must be justified and tested.
- **Keep Babel for the Emotion transform.** Rejected in favor of Vite's native transpilation plus
  the Rolldown Emotion plugin, which retains the Emotion metadata needed by the build.
- **Maintain parallel prop declarations.** Rejected because they can drift; the React host now
  derives the shared fields from the macromolecules editor contract.

## Rationale

The browser baseline is explicit and consistent across Vite targets without implying runtime
polyfills. Stable-by-default outputs protect consumers while allowing narrowly scoped corrections
for invalid export conditions and statically detectable worker/WASM references. The packed
consumer check verifies the latter with real bundlers, and `check:package-metadata` verifies
export/type resolution from all four packed libraries. Sharing the editor prop definition keeps
the integration boundary synchronized without moving React-only concerns into the core domain.

## Consequences

- Changing the Vite browser baseline requires an explicit support decision and aligned
  documentation; it does not change Babel targets or add polyfills.
- Published filenames, formats, and JavaScript `import`/`require` mappings remain stable by
  default. Intentional exceptions must be called out with the affected paths and consumer impact.
- Standalone worker/WASM filenames are fixed and covered for both fetch variants by the Vite and
  webpack consumer builds. The two ESM-only variants intentionally have no CJS `require`
  conditions.
- The packed metadata gate checks all JavaScript/type export entrypoints; publint checks the packed
  CSS subpaths. Its Node 24 compatibility allowance is limited to the exact known Node 16
  ESM-import resolutions, so a CJS resolution that points to ESM still fails.
- The React integration and macromolecules editor share one source of truth for their monomer
  library props.

## Related

- [ADR 2026-08-28 — Vite for library builds](./2026-08-28-vite-for-library-builds.md)
- [Build and toolchain architecture](../architecture.md)
