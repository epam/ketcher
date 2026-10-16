## Context

This change is sub-project **#0 (Foundation)** of the React/Redux modernisation initiative (#12222). The full initiative, the later sub-projects and how they interleave with the UI-kit initiative (#12192) are in `roadmap.md` in this folder. The decisions are summarised as an ADR in `adr.md`.

### Audit snapshot (2026-10-16)

| Area                     | `ketcher-react`                                                                                                                                                                                         | `ketcher-macromolecules`                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Store creation           | Legacy `createStore` + `applyMiddleware(thunk)` (`src/script/ui/state/index.js`, JS). One store per `initApp()` call.                                                                                   | `configureStore` (`src/state/store.ts`), but a **module-level singleton** shared by every editor instance.                                                                                  |
| Root reducer             | Hand-written. `INIT` calls `setEditor()`, and it injects `{editor, server, options}` into every action passed to `combineReducers`.                                                                     | Plain `reducer` map with 4 slices.                                                                                                                                                          |
| Dev checks               | None (not RTK)                                                                                                                                                                                          | `serializableCheck: false`; `immutableCheck` on, so it walks the live `CoreEditor` in dev                                                                                                   |
| Non-serialisable state   | Editor instance, structure service (or a rejected Promise), `modal.prop.onResult/onCancel`, `Struct` libraries in `templates`, `functionalGroups` and `saltsAndSolvents`, `options.getServerSettings()` | `CoreEditor` (created inside the `createEditor` reducer), `preview.target: Element`, `PolymerBond`, `BaseMonomer` and `onConfirm` in modal props, a `Struct` inside every `MonomerItemType` |
| Side effects in reducers | `INIT` → `setEditor()`; `globalThis.currentState` written on every reduce                                                                                                                               | `createEditor` and `destroyEditor` reducers; `localStorage` in 7 reducers                                                                                                                   |
| Shared across instances  | `globalThis.currentState`, read by `copyAs.js` and `copyImageToClipboard.js`; module-level `initOptionsState` mutated per instance                                                                      | The whole store                                                                                                                                                                             |
| React binding            | 37 `connect` files; raw `useSelector` in 10 files, raw `useDispatch` in 6; typed hooks (`withTypes`) in 3 files                                                                                         | 0 `connect`; typed hooks (`TypedUseSelectorHook`) in 50 files; raw `useSelector` in 5 files, raw `useDispatch` in 7                                                                         |
| Selectors                | `reselect@4` in 4 files; the store state type is partial (`store.types.ts` TODO)                                                                                                                        | `createSelector` in 4 places, some taking a whole slice as input; plain functions named `select*` called during render; 6 selectors read live editor fields                                 |
| Async                    | ~35–40 hand-written thunks; Indigo calls via `serverCall`                                                                                                                                               | No thunks; one hand-written async hook for Calculate Properties                                                                                                                             |
| Class components         | 12 (~3.8k LOC), none public, no error boundaries                                                                                                                                                        | 0                                                                                                                                                                                           |
| Tests                    | 8 test files build their own store                                                                                                                                                                      | 6 test files build their own store; slice tests exist                                                                                                                                       |
| Versions                 | `react-redux@^9.2.0`, `redux@^5.0.1`, `redux-thunk@^3.1.0`, `reselect@^4.0.0`, `redux-logger@^3.0.6`                                                                                                    | `@reduxjs/toolkit@^2.8.2`, `react-redux@^9.2.0`, `redux@^5.0.1`, `redux-saga@^1.1.3` (never imported)                                                                                       |

Latest versions on npm on 2026-10-16:

- `@reduxjs/toolkit` 2.13.0 (2026-09-29)
- `react-redux` 9.3.0
- `reselect` 5.3.0
- `immer` 11.1.21
- `redux` 5.0.1

Cross-cutting facts:

- **Separate stores.** The two packages share no Redux state (`.memory-bank/modules/ketcher-react.md`). Macromolecules is lazy-loaded by `ketcher-react` and mounts its own `<Provider>` inside react's tree.
- **Single Ketcher instance per id (invariant A6).** Ketcher instances must be reached through `ketcherProvider.getKetcher(id)`, not module-level references. `ketcher-core` also has a module-level `editorSingleton` that `CoreEditor` registers itself in. That singleton is out of scope here, but new code must not rely on it.
- **Peer range.** React `^18.2.0 || ^19.0.0`. The repo runs 19.2 and `@types/react` 19, so code must compile and run on both.
- **Lint.** `eslint.config.mjs` (flat config) already uses `no-restricted-imports` in three blocks (the `assert` bans). In flat config, a later block that sets the same rule for the same files _replaces_ the earlier value instead of merging it.
- **Prior art.** Branch `7118-Cannot-edit-concentration-values-of-unipositive-ions-and-oligonucleotides-in-Calculate-Properties-refactor` (June 2025) prototyped RTK Query (`createApi` + `fakeBaseQuery` + `queryFn`) for Calculate Properties, and moved its state out of `editorSlice`.

## Goals / Non-Goals

**Goals:**

- One documented Redux and React setup that both packages converge on.
- Both packages on the latest RTK and react-redux, with no direct dependencies on libraries RTK already provides.
- `ketcher-react` on `configureStore`, without changing reducer behaviour.
- Typed hooks only, in both packages.
- Guardrails that stop new legacy code and make progress measurable.
- Test helpers so later sub-projects can test against a real store.

**Non-Goals (this change):**

- Moving the editor or services out of state, or any slice rewrites (#2, #3).
- Fixing the shared-state bugs (#1). They are recorded here, and fixed in their own PRs.
- Converting class components or `connect` (#6).
- RTK Query endpoints (#4).
- Any change to rendered DOM, styles, public API or `data-testid`s.

## Decisions

### Decision 1 — Behaviour policy: no change, releasable after every merge, one axis per PR

**Choice.** The whole initiative is behaviour-neutral, and `master` stays releasable after every merged PR. That holds for each sub-task, not only at the end of a sub-project. There is no long-lived integration branch and no PR that leaves something broken for a later PR to fix. A half-migrated codebase is the normal state, with old and new patterns side by side, so both must work at every merge.

Each PR changes **either** behaviour wiring (state, hooks, component model) **or** markup (UI-kit swaps), never both. A behaviour PR must:

- leave the DOM unchanged;
- pass the full e2e suite (`chromium` and `chromium-popup`) without updating any baseline;
- pass the unit tests, type checks and lint;
- build the packages, the `example` app in both standalone and remote mode, and `example-ssr`.

**Coverage before change.** Green suites only prove something if they exercise the code being changed. So before a PR rewires an area, its author checks what covers it, and adds characterisation tests first where coverage is thin:

- unit tests with `renderWithStore` for components, slices, thunks and listeners;
- e2e specs where only an end-to-end flow can catch a regression, following the repo's e2e rules (a test plan, approved before any spec code is written).

The characterisation tests land before the refactor, or in the same PR as an earlier commit, so they're shown to pass on the old code.

**What automated tests don't reach.** Each sub-project's change lists the paths its PRs must check by hand, from this set:

- several editors on one page (Duo mode);
- the remote mode and the SSR example;
- the public `ketcher` API used by hosts;
- clipboard copy and paste;
- undo and redo across the changed actions.

The PR description records what was checked.

**Why.** Small, independently releasable steps keep each regression small and attributable, and let the initiative pause at any point without leaving debt behind. The ~28.5k screenshot baselines act as the parity check for behaviour refactors, and a screenshot diff can always be traced to one cause.

**The one exception.** When a UI-kit component replaces a legacy file and the file is deleted, the legacy class isn't converted first. The kit migration's characterisation stories are the gate instead.

**Alternatives considered.** Combined "modernise this component" PRs. They are faster per component, but a failing screenshot can't be bisected between the state change and the markup change.

### Decision 2 — Separate stores per package with identical conventions, not one app-wide store

**Choice.** Each package keeps its own store, built the same way. The two codebases follow one ADR, one lint configuration and the same file layout. There is no shared runtime helper at first; the factory is about 40 lines per package.

**Alternatives considered:**

- **One store for the whole app**, with macromolecules slices injected into react's store. Rejected for now, for four reasons:
  - Lifetimes differ: react's store lives per Ketcher instance, while macro mounts and unmounts on every mode switch.
  - Macromolecules is a separately published package, and a shared store would tie its state shape to `ketcher-react`.
  - No state is shared today.
  - React's store isn't on RTK yet.
- **A shared store-factory helper exported from `ketcher-react`.** Possible later. Today it would add coupling between the packages to save about 40 lines.

**Kept open.** Each package exposes its slices and a per-instance factory, so RTK 2's `combineSlices().inject()` can merge them later without a rewrite. This is revisited in #8.

### Decision 3 — One store per editor instance

**Choice.** A factory, for example `createAppStore({ ketcherId, extra })`, builds the store for each editor instance, and that instance renders its own `<Provider>`. No module-level store, no `globalThis` state, and no module-level objects mutated per instance.

**Why.** Duo mode and any host embedding several editors. Invariant A6 already requires per-id access for Ketcher instances, and this applies the same rule to state.

**Scope.** This change records the requirement. Sub-project #1 fixes the three known violations:

- `globalThis.currentState`;
- `initOptionsState`;
- the macro singleton store.

### Decision 4 — Latest RTK and react-redux, the modern API set, and bumps when needed

**Choice.** `@reduxjs/toolkit@^2.13.0` and `react-redux@^9.3.0` in both packages, deduplicated at the root. `redux` and `reselect` come only through RTK and are imported only from `@reduxjs/toolkit`.

**One exception: `castDraft`.** RTK re-exports Immer's runtime helpers, but not `castDraft`. Three macromolecules slices use it to store values Immer's draft types can't express: the `CoreEditor`, a preview that holds a DOM element and a `PolymerBond`, modal props that hold entity instances, and library items that hold a `Struct`.

- **Why it stays.** There is no cast-free alternative while those instances live in state, because the type system is right that they aren't draftable data. The alternatives tried were weaker:
  - returning `{ ...state, field }` from the reducer doesn't type-check, because it mixes draft and plain types;
  - adding `as SliceState` to that return compiles, but it asserts the whole state, where `castDraft` asserts just one value.
- **How it's tracked.** `castDraft` therefore stays, imported from `immer`, which macromolecules declares at RTK's Immer major. Lint allows the import only in the files on a `castDraft` allowlist.
- **When it goes.** #2 removes it together with the instances: the editor moves to the holder, previews and modal props hold ids and plain values, and library items stop carrying `Struct`. The dependency goes with it.

These APIs are the standard. Each one maps to a problem found in the audit:

| RTK API                                                                          | Used for                                                                                                                                                                      |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `configureStore` with both dev checks on, `Tuple` middleware, `devTools` options | Both stores                                                                                                                                                                   |
| `combineSlices`                                                                  | Both root reducers (from #2 in react)                                                                                                                                         |
| `createSlice` with the `selectors` field                                         | Every reducer and its selectors                                                                                                                                               |
| `create.asyncThunk` (via `buildCreateSlice` and `asyncThunkCreator`)             | Indigo calls that need pending and error state, such as react's `requestsStatuses`                                                                                            |
| `createListenerMiddleware` with `startListening.withTypes()`                     | <ul><li>Persistence to `localStorage`</li><li>The toast timer (replacing the custom `toastMiddleware`)</li><li>React's debounced `UPDATE` → `actionState` recompute</li></ul> |
| `createEntityAdapter`                                                            | The monomer library, presets and favourites; later react's template libraries                                                                                                 |
| `createSelector.withTypes<RootState>()` with reselect 5 dev checks on            | Every derived value                                                                                                                                                           |
| `.withTypes()` on hooks, thunks and listeners                                    | Typing everywhere                                                                                                                                                             |
| `isAnyOf`, `isAllOf` and `createAction`                                          | React's cross-cutting actions (`INIT`, `UPDATE`, `ACTION`)                                                                                                                    |
| `autoBatchEnhancer` (on by default)                                              | High-frequency actions such as hover previews, marked `prepareAutoBatched` once profiling shows a need                                                                        |

**Not adopted, with reasons:**

- **`createDynamicMiddleware`:** nothing needs middleware added at runtime.
- **Sagas and observables:** listener middleware covers reactive logic, and `redux-saga` is already unused.
- **RTK Query for everything:** only for computed results (Decision 8).

**Version policy.** This change upgrades both packages to the latest release (2.13.0 and 9.3.0). After that there is no schedule. A bump happens when there's a reason for it:

- a fix or API a sub-project needs;
- a security advisory;
- a peer-dependency requirement, such as a new React major.

The repo has no Dependabot or Renovate, so bumps are manual. Each bump is its own PR, and reading the release notes is part of it.

**Alternatives considered.**

- **Staying on the currently locked 2.8.2 and upgrading later.** Rejected: the foundation is when every later sub-project's patterns are fixed, so it should start from the current API.
- **Checking for RTK and react-redux updates every release cycle.** Not enforced for now. The check itself is cheap, but RTK 2.x minors are additive, so a scheduled bump rarely buys anything, while each bump still costs a full regression run under the gate in Decision 1. It can be revisited if the repo adopts a dependency bot.

### Decision 5 — The editor and services live outside state

**Choice.** A per-instance holder owns the editor and the structure service. Code reaches them in three ways:

- **in components,** through a `useEditor()` context hook;
- **in thunks, listeners and `queryFn`s,** through the `extra` argument;
- **in state,** only plain data the UI needs, such as flags and ids.

The holder is keyed by `ketcherId` and resolves through `ketcherProvider` where possible (A6).

**Scope.** This change records the rule and lists the current violations as tracked dev-check exceptions (Decision 12). Sub-project #2 implements the holder, macromolecules first.

**Alternatives considered:**

- **Keep the instances in state and leave `serializableCheck` off.** That is today's macro setup. It hides every new violation, and Redux's style guide marks it as an essential rule.
- **Use `ketcher-core`'s module-level `editorSingleton`.** It is a single global, so it is wrong for several instances.
- **Keep only an editor id in state and look it up on every use.** This is effectively how the holder is implemented internally. Components still need a hook so they don't repeat the lookup.

### Decision 6 — Editor-derived UI state goes through one bridge

**Choice.** Values the UI reads from the editor are mirrored into a small slice by one listener that subscribes to editor events. Examples: sequence mode, hand tool, antisense chains, and react's `actionState`. Selectors read the mirror, never the live editor.

**Why.** A selector that reads a live editor field doesn't re-render when the editor changes, because the store didn't change. Today this is patched in places with hooks that copy the value into local state and subscribe to editor events. `useSequenceEditInRNABuilderMode` is one example, and `SequenceSyncEditModeButton` repeats the pattern inline.

**Alternatives considered.** A `useSyncExternalStore` hook per value, subscribing to the editor directly. It avoids duplicating the value in state, but thunks and selectors can't use it, devtools can't show it, and every component subscribes separately. It is allowed only for a value read by a single leaf component.

### Decision 7 — Pure reducers; one place for each kind of side effect

| Kind                                                                                       | Where                              |
| ------------------------------------------------------------------------------------------ | ---------------------------------- |
| Imperative, triggered by the UI (load file, create or destroy the editor, run a transform) | A thunk, using `extra`             |
| Reactive ("when X happens, do Y": persistence, debounce, timers)                           | Listener middleware                |
| A result computed from the structure by Indigo                                             | An RTK Query endpoint (Decision 8) |
| Anything else in a reducer                                                                 | Not allowed                        |

Thunks that already work are not rewritten into `createAsyncThunk` unless pending, fulfilled or rejected state is actually needed.

### Decision 8 — RTK Query for computed Indigo results only

**Choice.** One API slice per package, with `fakeBaseQuery()` and a `queryFn` per endpoint that calls the structure service through `extra`. This works for both standalone (in-browser Indigo) and remote Indigo.

**In scope** (the result depends only on the structure and the options, and the call repeats):

- macromolecules Calculate Properties, the pilot;
- react Analyse;
- react Check (the data part).

**Out of scope:**

- transforms (`layout`, `clean`, `aromatize`, `automap`, ...);
- `convert` for open and save;
- `info`.

These change the structure or run once, so they stay as thunks.

**Rules:**

- Arguments are serialisable: the KET string and plain option values, never the editor.
- `serializeQueryArgs` keys the cache on a hash of the KET plus the options.
- `keepUnusedDataFor` is short.
- There are no tags: a result never goes stale.
- Errors are stored as strings, not `Error` objects.
- Interactive callers pass debounced or deferred arguments, and use `skipToken` when there is nothing to calculate.

**Why.** Each requirement below fixes a gap in today's hand-written Calculate Properties hook:

- results are cached by argument, where today every request goes to Indigo;
- only the latest arguments' result is shown, where today a slow earlier response can overwrite a newer one;
- loading and error state are built in, where today an Indigo rejection is unhandled because the `await` is outside the `try`.

**Alternatives considered:**

- **Not using RTK Query at all.** This was the initial position, based on Indigo calls being one-off. It was rejected after reviewing Calculate Properties, which runs interactively on every selection change.
- **Using RTK Query for every Indigo call.** Rejected because caching transforms is wrong.

### Decision 9 — Typed hooks only, strict

**Choice.** Each package defines `useAppSelector = useSelector.withTypes<RootState>()` and `useAppDispatch = useDispatch.withTypes<AppDispatch>()`. Lint bans:

- importing `useSelector`, `useDispatch` or `TypedUseSelectorHook` from `react-redux` anywhere except the file that defines the typed hooks;
- `useStore`, except in that file. Tests use the store that `renderWithStore` returns.

**Why.**

- react-redux has no way to infer the app's state type: the store reaches the hook at runtime through context.
- The old global `DefaultRootState` augmentation was removed in react-redux v8.
- A global type would be wrong here anyway, with two packages and two different root states.
- A raw `useSelector(selectFoo)` is typed when `selectFoo` is, but inline selectors aren't, and a raw `useDispatch()` rejects thunks.
- One rule with no exceptions is cheaper than a rule that depends on how each selector is written.

**Alternatives considered.** A relaxed rule: raw `useSelector` allowed with typed named selectors, and only `useAppDispatch` required. Rejected in favour of consistency.

**`ketcher-react` typing.** Its reducers are JS, so `RootState` is declared, and `store.types.ts` is completed for this change. It becomes inferred from the factory as reducers move to `createSlice`.

### Decision 10 — Selectors

- Selectors are defined in the slice's `selectors` field or with `createSelector`, never as plain functions called during render.
- Inputs are narrow: a field, never a whole slice.
- Reselect 5's dev-mode checks stay on: input stability and identity function.
- Item identities are preserved. Derived lists don't copy every item to add a flag; flags like favourites are kept as a set of ids and looked up per item.
- Libraries (monomers, presets, templates) use `createEntityAdapter` once they no longer hold class instances.
- Selectors that take props use `createSelector` with arguments, or a factory memoised per component.

### Decision 11 — Components

- **Function components only.** Error boundaries are the exception; `ketcher-react` has none today.
- **No `connect`.** Hooks are used instead.
- **React 18 compatibility while the peer range includes it:**
  - keep `forwardRef`, and don't rely on `ref` as a prop;
  - no `use()` for context, and no other React 19-only APIs.
- **React Compiler:** deferred until the code is hooks-based. The `eslint-plugin-react-hooks` v7 rules (already a dependency) are the first step.
- **Converting a class:**
  - `componentDidUpdate` becomes an effect with explicit deps;
  - instance fields become refs;
  - callbacks handed to the imperative editor or DOM listeners read the latest props through refs, to avoid stale closures;
  - imperative handles become `useImperativeHandle`;
  - render timing is checked against e2e screenshots.

### Decision 12 — Dev checks: explicit configuration and a tracked exception list

**Choice.** Both stores configure `serializableCheck` and `immutableCheck` explicitly. Paths and actions that currently violate a check are listed in one exported constant per package, and that list may only shrink. The metrics script counts its entries.

- **`ketcher-react`:** starts with both checks off. It is on `configureStore` for the first time, and its root reducer injects non-serialisable values into every action. Turning the checks on with ignored paths is part of #2, together with the root-reducer rewrite.
- **`ketcher-macromolecules`:**
  - `immutableCheck` ignores `editor.editor`, so it stops walking the live `CoreEditor` in dev.
  - `serializableCheck` stays off, and that is recorded as an exception until #2.

**Alternatives considered.** Turning both checks on now with large ignore lists. Rejected: the lists would cover most of the state, adding cost without adding signal.

### Decision 13 — Form and modal state

- Form values stay in Redux during the migration, for parity: the Check and Save dialogs and server callbacks write `UPDATE_FORM` into them.
- Modal resolve and reject callbacks move out of state into a registry keyed by modal id (#7).
- No form library (react-hook-form, TanStack Form) is adopted. The JSON-schema contract stays, as the UI-kit form rework (#12196) already plans.
- The form work is shared with UI-kit #4 and split in two:
  - **4a, behaviour:** `Form` becomes a function component, and the form slice gets an explicit contract.
  - **4b, markup:** the fields move onto kit primitives.

### Decision 14 — Enforcement and progress tracking

- **Lint.** `no-restricted-imports` and `no-restricted-syntax` rules ban:
  - `createStore`, `combineReducers`, `applyMiddleware` and `compose` from `redux`;
  - `connect`;
  - raw hooks and `TypedUseSelectorHook`;
  - `reselect`, `immer`, `redux` and `redux-thunk` imports (`castDraft` from `immer` is allowlisted until #2);
  - class components extending `Component` or `PureComponent`.
- **Allowlists.** Existing violations go in a generated allowlist file, one list per rule. A script regenerates the lists, and CI fails if a regenerated list grows.
- **One `no-restricted-imports` helper.** All restricted imports go through one helper that combines `paths` and `patterns`, because flat config replaces the rule rather than merging it. The UI-kit plan introduces the same kind of helper for `@mui`/`@emotion`, so whichever change lands second extends the first one's helper instead of adding a competing block.
- **Metrics.** A script reports:
  - class components;
  - `connect` files;
  - raw hook files;
  - legacy Redux imports;
  - dev-check exception entries;
  - stores with a check disabled.

  CI fails when any count increases. The UI-kit change plans a metrics script too; whichever lands first creates it, and the other adds its counters.

### Decision 15 — Test helpers

Each package gets a `renderWithStore(ui, { preloadedState, extra })` helper that builds the store with the package's real factory and wraps the UI in the providers the editor uses. New tests use it. In macromolecules, one of those providers is the Emotion theme. It lives in a single `TestThemeProvider`, which UI-kit #5 deletes when it removes Emotion (see the roadmap's interleaving section). The 8 react and 6 macro test files that build their own store move to it as they are touched, and the lint allowlist tracks those that remain.

## Risks / Trade-offs

- **`configureStore` around react's custom root reducer.** The reducer spreads action fields into state and injects values into actions. → It moves to TypeScript with type-only changes plus removing one always-false comparison, and runs with the checks off. Unit and e2e suites are the parity gate. The devtools sanitizers move to the `devTools` option one-for-one.
- **The RTK 2.8 → 2.13 upgrade in macromolecules.** Behaviour could change between minors. One change is confirmed from the published dependency ranges: Immer goes from `^10.0.3` (RTK 2.8.2) to `^11.0.0` (RTK 2.13.0). → Read the 2.9–2.13 release notes and the Immer 11 changelog as part of the task, then run the slice tests and the macro e2e projects.
- **Removing `redux-thunk` and `reselect` from `ketcher-react`.** Types come from `redux-thunk` (`ThunkDispatch`) in 5 components and `state/hooks.ts`. → `AppDispatch` is derived from the store type, and `ThunkDispatch` is imported from `@reduxjs/toolkit`.
- **Bundle contents.** RTK becomes a dependency of `ketcher-react`. Rollup treats it as external, as macro already does, so hosts install it rather than receiving it bundled. → Check `dist` for an inlined RTK, and check `example-ssr`.
- **Strict typed hooks need a complete `StoreState`.** Inline selectors on keys the type doesn't declare would fail to compile. → `store.types.ts` is completed in this change. Where a full type is impractical, the key is typed `unknown` with a TODO, never `any`.
- **Allowlist churn.** Files on the allowlist that are touched for other reasons still pass lint. → This is accepted. The ratchet only blocks growth, and the counts show progress.
- **Coordination with the UI-kit change.** Both edit `eslint.config.mjs` and add metrics. → Decision 14 makes the second one to land extend the first.

## Migration Plan

1. **Upgrade.** Bump RTK and react-redux in both packages, remove the redundant dependencies, deduplicate the lockfile, and run the unit tests and both builds.
2. **React store.** Switch to `configureStore` around the existing root reducer, configure the checks explicitly (off) and move the sanitizers to `devTools`. Run the unit tests and the e2e suite with no baseline updates.
3. **Macro store.** Configure the checks explicitly and add the `immutableCheck` ignored path for the editor.
4. **Typed hooks.** Define them with `.withTypes()` in both packages, complete react's `StoreState`, and replace raw hooks and `reselect` imports.
5. **Guardrails.** Add the lint rules, the allowlist generator and the allowlists, the metrics script with its baseline, and the CI step.
6. **Test helpers.** Add `renderWithStore` in each package, with one existing test moved to each as a demonstration.
7. **Gate.** Every step meets the Decision 1 gate on its own:
   - unit tests, type checks and lint green;
   - the full e2e suite green with no baseline updates;
   - the packages, `example` (standalone and remote) and `example-ssr` build.

   Steps 1 and 2 also get the manual checks from Decision 1, because they touch the store every component reads.

**Rollback:** each step is a separate PR, or at least a separate commit, with no data migration. Any step can be reverted on its own, and `master` is releasable after each.

## Open Questions

- Should RTK's devtools options keep `redux-logger` as an opt-in dev tool, or drop it? The default is to keep it behind the existing `KETCHER_ENABLE_REDUX_LOGGER` flag.
- Should `combineSlices` merge the two stores at the end (#8)? This is deliberately deferred until both packages follow the same conventions.
- Should the store factory be shared as a runtime helper exported from `ketcher-react`, or stay a convention? The default is a convention (Decision 2).
- Does the Vite migration (#10401) change how RTK is externalised in the library build? It should be checked if that PR merges first.
