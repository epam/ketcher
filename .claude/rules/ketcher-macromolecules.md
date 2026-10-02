---
paths:
  - "packages/ketcher-macromolecules/**"
description: "ketcher-macromolecules: Redux Toolkit slices, emotion/MUI UI, core-owned editor"
---

# ketcher-macromolecules

Deep dives: [modules/ketcher-macromolecules.md](../../.memory-bank/modules/ketcher-macromolecules.md),
[modules/editor-engine.md](../../.memory-bank/modules/editor-engine.md),
[modules/monomer-library.md](../../.memory-bank/modules/monomer-library.md).

The editor itself — `CoreEditor`, modes, macro tools, D3 renderers, `DrawingEntitiesManager` — lives
in **ketcher-core** (see `ketcher-core.md`). This package is its React shell.

## State — Redux Toolkit, no sagas

- Store: `packages/ketcher-macromolecules/src/state/store.ts#configureAppStore`; slices under
  `state/common/editorSlice.ts`, `state/library/`, `state/modal/`, `state/rna-builder/`, with their
  selectors inside the slice files; typed hooks in
  `packages/ketcher-macromolecules/src/hooks/stateHooks.ts#useAppDispatch`.
- `redux-saga` is declared in `package.json` and imported nowhere. Do not introduce it.
- The editor instance is created in
  `packages/ketcher-macromolecules/src/state/common/editorSlice.ts#new CoreEditor(` and reports back
  through the subscriptions in `src/EditorEvents.tsx`.

## UI

- Styling is emotion `styled` (a `styles.ts` next to the component) on the MUI theme merged with
  `theming/defaultTheme`; a few `.module.less`. Match the folder you are in.
- `Icon` and `IconButton` come from `ketcher-react`. `components/shared/icon/icon.tsx` is dead code
  whose imports point at a missing folder — do not extend it.
- `tsc` sees `ketcher-react` through the local stub `src/types/ketcher-react.d.ts`, not the real
  package: a new import from `ketcher-react` needs a declaration in that stub.

## Tests

Co-located `src/**/*.test.tsx`. `src/setupTests.tsx` provides the globals `withThemeProvider` and
`withThemeAndStoreProvider`; `ketcher-react` and `react-contexify` are replaced by `src/testMocks/`.
Jest **and** `tsc` here resolve `ketcher-core` through its built `dist`.
