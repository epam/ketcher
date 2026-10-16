# React/Redux modernisation: roadmap

Tracking: umbrella #12222. This change is sub-project #0 (#12223). Each later sub-project gets its own OpenSpec change and issue when it starts.

## Goals of the initiative

- Both UI packages build Redux the same way, on the latest RTK, as recorded in `adr.md`.
- Nothing non-serialisable in state; pure reducers; the editor reached through a per-instance holder.
- One store per editor instance, with no state shared across instances.
- Function components and typed hooks only.
- RTK Query for results Indigo computes from the structure.
- No behaviour or visual change, measured by the existing unit and e2e suites (no baseline updates) and by the metrics ratchet.
- `master` releasable after every merged PR, including each sub-task of a sub-project (design Decision 1). The initiative can stop after any PR without leaving anything half-broken.

## How each sub-project is run

1. **Coverage review.** Its OpenSpec change starts with a coverage review of the areas it touches, listing:
   - which unit and e2e tests exercise each area;
   - where characterisation tests are needed;
   - which manual checks its PRs need, from the Decision 1 list.
2. **Characterisation tests first.** Any needed characterisation tests are the first tasks, ahead of the refactors. New e2e specs need an approved test plan before any spec code is written.
3. **Task size.** Tasks are sized so each one is a PR that passes the full gate on its own. Where a migration can't be split that way, the new path is added alongside the old one and callers move over PR by PR.

## Sub-projects

| #   | Sub-project                                                                                                                | Depends on          | Behaviour change           | Issue  |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------- | ------ |
| 0   | Foundation: ADR and specs, RTK upgrade, react `configureStore`, strict typed hooks, lint guardrails, metrics, test helpers | —                   | none                       | #12223 |
| 1   | Per-instance stores and shared-state bug fixes                                                                             | 0                   | fixes Duo-mode bugs        | tbd    |
| 2   | Editor out of state: macromolecules first, then react                                                                      | 0, 1                | none                       | tbd    |
| 3   | Slices and pure reducers                                                                                                   | 2 (partly parallel) | none                       | tbd    |
| 4   | RTK Query for computed Indigo results                                                                                      | 0; react part: 2    | none (fixes a result race) | tbd    |
| 5   | Selector performance: monomer library                                                                                      | 3 (entity adapter)  | none (faster)              | tbd    |
| 6   | Components: class → function, `connect` → hooks                                                                            | 0                   | none                       | tbd    |
| 7   | Modal and form state, joint with UI-kit #4 (#12196)                                                                        | 6, UI-kit #2        | none                       | tbd    |
| 8   | Cleanup                                                                                                                    | all                 | none                       | tbd    |

### #0 Foundation, in this change

The ADR and specs; RTK 2.13 and react-redux 9.3 in both packages; dependency cleanup; react on `configureStore`; dev checks configured explicitly with tracked exceptions; strict typed hooks; lint bans with allowlists; the metrics ratchet; `renderWithStore` helpers. See `design.md`.

### #1 Per-instance stores and shared-state bug fixes

Each fix is its own PR, filed as an ordinary bug ticket so it can ship early:

- **`ketcher-react`: `globalThis.currentState`.** It is written on every reduce and read by `ui/action/copyAs.js` and `ui/action/copyImageToClipboard.js`. Those actions move to thunks that use `getState`, and the global is removed.
- **`ketcher-react`: the module-level `initOptionsState`.** It is mutated per instance with `Object.assign`, and is replaced by a value built per instance.
- **`ketcher-macromolecules`: the singleton store.** `export const store = configureAppStore()` becomes a factory called per `EditorContainer`, with its own `<Provider>`. `RootState` and `AppDispatch` are inferred from the factory's return type.
- **Verification.** A Duo-mode e2e check that copy and the macro editor state stay separate per instance. Draft an e2e test plan per `.memory-bank/testing/e2e-test-plan-template.md` first.

### #2 Editor out of state

**Macromolecules first**, as the reference implementation:

- A per-instance editor holder with a `useEditor()` hook, replacing `selectEditor` in about 30 files.
- `createEditor` and `destroyEditor` move from reducers to thunks. The canvas element and the callbacks no longer go through actions.
- An editor-status slice mirrored by one listener on editor events. It replaces the 6 selectors that read live editor fields (`selectIsSequenceMode`, `selectIsSequenceEditInRNABuilderMode`, `selectIsSequenceSyncEditMode`, `selectIsHandToolSelected`, `hasAntisenseChains`, `selectMonomers`) and the hooks that copy them into local state.
- `preview` and the modal `additionalProps` hold ids and plain values, not DOM nodes, entities or callbacks.
- Then turn `serializableCheck` on and empty the exception list.

**Then `ketcher-react`, copying the pattern:**

- The editor and server move to `extra`, and the identity reducers for `editor` and `server` are removed.
- The root reducer is rewritten with `combineSlices`: `INIT` loses its side effect, and nothing is injected into actions any more. Every reducer that reads `action.editor`, `action.server` or `action.options` gets what it needs another way.
- `options.getServerSettings()` becomes a selector.
- Turn on both checks, with the remaining exceptions listed.

**Risk:** high. The timing of `actionState` is sensitive (`sleep(0)` workarounds), and `StructEditor` wires the editor events, so `StructEditor` is converted only after this sub-project (#6).

### #3 Slices and pure reducers

- **Macromolecules:** `localStorage` persistence moves to listener middleware. That covers favourites, the phosphate filter and the cached custom presets. The toast timer becomes a listener.
- **`ketcher-react`:** `createSlice` with the `selectors` field, simple slices first:
  1. `notifications`, `floatingTools`, `common`, `requestsStatuses`, `abbreviationLookup`, `toolbar`;
  2. `templates`, `functionalGroups`, `saltsAndSolvents`, with the libraries in entity adapters once `Struct` no longer sits in state;
  3. `options`;
  4. `actionState`, with the debounced `UPDATE` replaced by a listener using the `cancelActiveListeners` and `delay` debounce pattern.
- `modal` and `form` are excluded here; see #7.

### #4 RTK Query for computed Indigo results

- **Pilot:** macromolecules Calculate Properties.
  - Re-implement the `createApi` / `fakeBaseQuery` / `queryFn` approach from the June 2025 `7118-…-refactor` branch on the current code.
  - Move `macromoleculesProperties` out of `editorSlice`.
  - The early-exit rules (no structure, disconnected monomers, several fragments) become a selector that returns either arguments or `skipToken`.
  - Debounce the KET argument during selection drags.
- **Then `ketcher-react`** Analyse (replacing `ANALYSE_LOADING`/`CHANGE_ANALYSE`) and Check's data, which need the server through `extra` from #2. Check's dialog UI stays with #7.
- **Rules:** see design Decision 8.

### #5 Selector performance: monomer library

- `selectFilteredMonomers`: narrow inputs, not all of `state.library`. Stop copying every item to add `favorite`; keep favourites as a set of ids.
- `MonomerList` and the RNA elements views: the grouping, sorting and ambiguous-monomer derivations that run during render move into memoised selectors. The per-item `new AmbiguousMonomer(...)` is computed once per library load.
- Profile before and after with the React Profiler, and record the numbers in the PR.
- **Ordering with UI-kit:** do this before UI-kit #3 converts `monomerLibraryItem/styles.ts` (its Emotion runtime hot spot), as a separate behaviour-only PR.

### #6 Components: class → function, `connect` → hooks

Behaviour-only. One file or feature per PR. Scheduled around the UI-kit migration so a file isn't refactored right before the kit rewrites it.

| Work                                                                                                | When                                                                           |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `Input.tsx` (468 LOC, `PureComponent` + `forwardRef`, chooses its sub-component in the constructor) | Before UI-kit #2.2 (Switch/Checkbox/Radio)                                     |
| `combobox.tsx` (109 LOC)                                                                            | Before UI-kit #2.7 (Combobox)                                                  |
| `component/view/Tabs`                                                                               | Skip if the kit Tabs (UI-kit #2.4) replaces and deletes it; otherwise any time |
| `Modal.container`, `InfoModal` → hooks                                                              | Before UI-kit #2.10 (Dialog)                                                   |
| Simple containers: toolbar containers, `ElementWithDropdown`, `AppHidden`                           | Any time                                                                       |
| `Portal`, `OpenButton`, `ClipArea`, `PeriodTable` + `ElementsTable`                                 | Any time, not in the same PR as a kit change to the same file                  |
| Dialogs outside the form system: Open, Text, ExtendedTable, Analyse, Miew, Recognize, About         | Any time                                                                       |
| `StructEditor` (`UNSAFE_componentWillReceiveProps`, editor event wiring)                            | Last, after #2                                                                 |
| Dialogs using the form system, plus `Save` (748 LOC) and `template-attach` (470 LOC)                | In or after #7                                                                 |

**Per-file recipe:**

1. Characterisation unit tests with `renderWithStore` if none exist.
2. Convert.
3. Remove the file from the allowlist.
4. Unit tests and e2e must be green with no baseline updates.

### #7 Modal and form state, joint with UI-kit #4

- **4a, behaviour:**
  - `Form` becomes a function component. Its context value stops being the class instance.
  - The form slice gets an explicit `createSlice` contract, keeping values in Redux.
  - Modal callbacks go to a registry outside the store, keyed by modal id.
  - The 12 dialogs using the form system move to hooks.
  - Characterisation tests for `form.tsx` come first. It has none today, and UI-kit #4 also requires them.
- **4b, markup:** UI-kit #4 moves `Field`, `Label` and the inputs onto kit primitives with the 4a contract unchanged.
- **Later and optional:** moving form values to local state, once the server callbacks in Check and Save no longer write to them.

### #8 Cleanup

- Empty every allowlist and delete the files.
- No dev-check exceptions remain; both checks are on in both stores.
- Remove `redux-logger` if it is still unused.
- Decide whether `combineSlices` should merge the two stores.
- Memory-bank updates per the CLAUDE.md archive rules.

## Interleaving with the UI-kit initiative (#12192)

| UI-kit step                                     | Before it                              | Same PR                                              | After it                           |
| ----------------------------------------------- | -------------------------------------- | ---------------------------------------------------- | ---------------------------------- |
| #0+#1 Foundation                                | React/Redux #0, #1 (independent)       | —                                                    | —                                  |
| #2.2 Switch/Checkbox/Radio                      | `Input.tsx` → function                 | —                                                    | —                                  |
| #2.4 Tabs                                       | —                                      | Legacy `Tabs` deleted by the kit swap, not converted | —                                  |
| #2.7 Combobox                                   | `combobox.tsx` → function              | —                                                    | —                                  |
| #2.10 Dialog                                    | `Modal.container`, `InfoModal` → hooks | —                                                    | Dialogs using the form system (#7) |
| #3 Emotion → CSS Modules (`monomerLibraryItem`) | Selector performance (#5)              | —                                                    | —                                  |
| #4 Form rework                                  | 4a (behaviour)                         | —                                                    | 4b (markup) is UI-kit #4 itself    |

## Ideas backlog

- A shared `createAppStore` helper exported from `ketcher-react`, if the two factories grow alike enough.
- Turning on the React Compiler once components are hooks-based and the `eslint-plugin-react-hooks` v7 rules are clean.
- `useSyncExternalStore`-based hooks for single-use editor values (allowed by Decision 6).
- Removing `ketcher-core`'s module-level `editorSingleton` once nothing in the UI packages relies on it.
- Merging both stores with `combineSlices` (#8 decision).

## Starting metrics (2026-10-16, origin/master `1fd976254e`)

| Metric                              | `ketcher-react` | `ketcher-macromolecules` |
| ----------------------------------- | --------------- | ------------------------ |
| Class components                    | 12              | 0                        |
| Files using `connect`               | 36              | 0                        |
| Files calling raw `useSelector`     | 10              | 5                        |
| Files calling raw `useDispatch`     | 6               | 7                        |
| Files using typed hooks             | 3               | 50                       |
| Files importing `reselect`          | 4               | 0                        |
| Files importing `immer` directly    | 0               | 3                        |
| Test files building their own store | 8               | 6                        |
| Dev checks disabled                 | both (no RTK)   | `serializableCheck`      |
| `@reduxjs/toolkit`                  | —               | ^2.8.2 (locked 2.8.2)    |
| `react-redux`                       | ^9.2.0          | ^9.2.0                   |
