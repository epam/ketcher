Tracking: #12223 (umbrella #12222).

## Why

The two UI packages manage state in different ways, and both keep things in Redux that Redux can't handle.

- **`ketcher-react` uses hand-rolled legacy Redux.**
  - It is built on `createStore`, `redux-thunk` and switch reducers, with no Redux Toolkit.
  - The root reducer is custom. Its `INIT` case calls `setEditor()`, a side effect inside a reducer, and it injects `editor`, `server` and `options` into every action.
  - State holds the Editor instance, the structure service (sometimes a rejected Promise), Promise resolve/reject functions for dialogs, `Struct` libraries and a function.
  - 36 files use `connect`. Typed hooks exist but only 3 files use them.
  - 12 class components remain, among them the form system and the canvas wrapper.
- **`ketcher-macromolecules` uses RTK 2.8, but has the same core problems.**
  - The `CoreEditor` instance is created inside a reducer and kept in state, with `serializableCheck: false`.
  - DOM nodes, entity class instances and callbacks are in state.
  - `localStorage` is read and written inside 7 reducers.
  - Six selectors read live editor fields, so the UI is only correct when something else happens to re-render it.
  - The monomer library list recomputes, re-sorts and copies the whole library on every render.
- **State is shared across editor instances.**
  - `ketcher-react` writes every new state to `globalThis.currentState`, which the copy actions read.
  - Macromolecules creates one module-level store for all instances.
  - Both are wrong when several editors share a page (Duo mode).
- **The packages diverge** in store setup, conventions and typing, so knowledge and helpers don't transfer between them.

This change is the first step of a multi-step initiative (see `roadmap.md`). It records the target conventions as an ADR and capability specs, upgrades both packages to the latest Redux Toolkit, and puts guardrails in place: strict typed hooks, lint bans with shrinking allowlists, and a metrics ratchet in CI. Nothing new can then be written the old way, and later sub-projects have a fixed target. It is behaviour-neutral by design.

## What Changes

- **Conventions:**
  - An ADR (`adr.md`, moved to `.memory-bank/adr/` when the change is archived) and capability specs defining one Redux and React setup for both packages.
  - It covers store per editor instance, no non-serialisable state, and pure reducers.
  - The editor is reached through a per-instance holder.
  - Side effects are placed in thunks, listener middleware and RTK Query.
  - Selectors are memoised and narrow; only function components and typed hooks are allowed.
- **Upgrade:**
  - Both packages move to `@reduxjs/toolkit@^2.13.0` and `react-redux@^9.3.0`, with one deduplicated copy.
  - The direct `redux`, `redux-thunk`, `reselect`, `redux-saga` and `immer` dependencies are removed. They either come with RTK or are unused.
- **`ketcher-react` store:**
  - `createStore` becomes `configureStore`, wrapping the existing root reducer unchanged.
  - The dev checks are configured explicitly, with tracked exceptions.
  - The devtools sanitizers move to the `devTools` option, and the manual devtools-compose code is removed.
- **Typed hooks, strict:**
  - Both packages define `useAppSelector` and `useAppDispatch` with `.withTypes()`.
  - `ketcher-react` gets a complete store state type.
  - Every raw `useSelector`/`useDispatch` call is replaced.
- **Guardrails:**
  - Lint bans legacy Redux APIs, `connect`, raw hooks, direct `reselect`/`immer`/`redux` imports and new class components. Existing files sit in generated allowlists that may only shrink.
  - A metrics script reports the remaining counts, and CI fails when any count rises.
- **Release gate:**
  - Every PR in the initiative, including each sub-task of a sub-project, leaves `master` releasable with no regression.
  - Each PR passes the full unit and e2e suites (no baseline updates) and every build.
  - Thinly covered areas get characterisation tests before they're refactored.
  - Paths the suites can't reach are checked by hand.
- **Tests:** each package gets a `renderWithStore` helper built on its real store factory.

## Capabilities

### New Capabilities

- `state-management`: how each UI package creates and configures its Redux store, what may live in state, where side effects go, how selectors are written, when RTK Query is used, and the dependency-version policy.
- `react-components`: the component model (function components only), typed hooks only, no `connect`, React 18 compatibility, and how a component is converted without changing behaviour.
- `modernization-guardrails`: the lint allowlists, the metrics ratchet, the test helpers, the coverage-before-change rule, and the release gate every migration PR must pass.

### Modified Capabilities

<!-- No existing spec-level capabilities are changing. -->

## Impact

- **`ketcher-react`:**
  - store creation in `src/script/ui/state/index.js`;
  - `state/hooks.ts` and `state/store.types.ts`;
  - the files that call raw hooks or import `reselect`;
  - `package.json` dependencies;
  - a new test helper.
- **`ketcher-macromolecules`:**
  - `src/state/store.ts`, with explicit dev-check configuration;
  - `hooks/stateHooks.ts`;
  - the files that call raw hooks or import `immer`;
  - `package.json` dependencies;
  - a new test helper.
- **`ketcher-core`:** no change.
- **Repo:**
  - `eslint.config.mjs`;
  - a generated allowlist and the script that generates it;
  - a metrics script and CI step;
  - the root lockfile.
- **Hosts:** no visible change. The published API, the `Editor` component props, the CSS and all `data-testid`s stay the same. The bundled Redux libraries change version but stay internal.
- **Coordination with the UI-kit initiative (#12192):**
  - Both changes extend `no-restricted-imports` in `eslint.config.mjs`, and a later flat-config block replaces an earlier one's rule instead of merging it, so both must go through one shared helper.
  - Both need a metrics script. Whichever lands first creates it, and the other extends it.
