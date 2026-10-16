<!-- Draft ADR. Per the memory-bank rules it moves to `.memory-bank/adr/2026-10-16-redux-and-react-conventions.md` when this change is archived. -->

# One Redux and React setup for both UI packages, on the latest Redux Toolkit

## Decision

`ketcher-react` and `ketcher-macromolecules` each keep their own Redux store, and both build it the same way.

- **One store per editor instance.** A factory builds it with `configureStore` from the latest `@reduxjs/toolkit` (2.13.0 at adoption) and `react-redux` (9.3.0). There is no module-level store and no global state.
- **State holds serialisable data only.**
  - The editor and the structure service live in a per-instance holder. Components reach them through a context hook; thunks, listeners and RTK Query `queryFn`s reach them through the `extra` argument.
  - Values the UI reads from the editor are mirrored into state by one listener on editor events.
- **Reducers are pure.** Side effects go to one place each:
  - thunks for imperative actions triggered by the UI;
  - listener middleware for reactive effects (persistence, debounce, timers);
  - RTK Query for results Indigo computes from the structure (Calculate Properties, Analyse, Check).

  Transforms and file conversion stay as thunks.

- **Selectors** are memoised, have narrow inputs, and keep item identity stable. They are defined in the slice `selectors` field or with `createSelector`. Libraries use entity adapters.
- **Components.** Function components only, error boundaries excepted. No `connect`. Only the typed hooks `useAppSelector` and `useAppDispatch`, created with `.withTypes()`.
- **Compatibility.** The code stays compatible with React 18 while the peer range includes it. The React Compiler is deferred.
- **Enforcement.** Lint rules with shrinking allowlists, and a metrics ratchet in CI.
- **Behaviour.** The migration doesn't change behaviour or visuals. Each PR changes either state wiring or markup, never both.
- **Releasable at every merge.** Every PR, including each sub-task of a sub-project, leaves `master` releasable with no regression.
  - Work lands on `master` in small steps; there's no integration branch.
  - Thin coverage is filled with characterisation tests before the code is changed.

## Context

The audit on 2026-10-16 found the following.

- **`ketcher-react` uses hand-rolled legacy Redux.**
  - It is built on `createStore` and `redux-thunk`, with a custom root reducer.
  - The root reducer calls `setEditor()` and injects the editor, server and options into every action.
  - State holds the Editor instance, the service, Promise callbacks and `Struct` libraries.
  - 36 files use `connect`, and 12 class components remain.
- **`ketcher-macromolecules` uses RTK, but with the same core problems.**
  - It creates `CoreEditor` inside a reducer and keeps it in state.
  - DOM nodes, entity instances and callbacks are in state.
  - `localStorage` is used inside reducers.
  - Some selectors read live editor fields that never trigger a re-render.
  - The monomer library list recomputes and copies the whole library on render.
- **Both share state across editor instances**: `globalThis.currentState` in react, and a module-level singleton store in macro.
- **The two setups diverge**, so knowledge, helpers and review standards don't transfer between packages.

## Alternatives considered

- **One app-wide store** with macromolecules slices injected into react's store. Rejected for now:
  - the stores have different lifetimes;
  - macromolecules is a separately published package;
  - no state is shared between the packages today.

  `combineSlices` keeps this possible later.

- **A shared store-factory helper exported from `ketcher-react`.** Deferred, since it saves about 40 lines at the cost of more coupling between the packages.
- **Keeping class instances in state with `serializableCheck` off.** That is today's macro setup. Rejected because it hides every new violation and contradicts an essential rule in Redux's style guide.
- **`ketcher-core`'s module-level editor singleton as the access path.** Rejected because it is wrong when several editors are on one page.
- **Not using RTK Query at all**, on the grounds that Indigo calls are one-off. Rejected: Calculate Properties runs interactively on every selection change and benefits from caching, from showing only the latest result, and from status handling.
- **RTK Query for every Indigo call.** Rejected because caching a transform is wrong.
- **The relaxed typed-hooks rule**: raw `useSelector` allowed with typed named selectors, only `useAppDispatch` required. Rejected in favour of a single rule without exceptions.
- **A form library** (react-hook-form, TanStack Form) during the migration. Rejected: the forms keep their JSON-schema contract, and form values stay in Redux until the UI-kit form rework settles them.
- **Combined "modernise this component" PRs** that change state and markup together. Rejected because a screenshot diff in them can't be traced to one cause.
- **A long-lived integration branch per sub-project**, merged when the sub-project is done. Rejected: it postpones finding regressions and produces one large, risky merge.
- **Checking for RTK and react-redux updates every release.** Not enforced now. The check is cheap, but each bump costs a full regression run, and RTK 2.x minors rarely carry anything the code needs.

## Rationale

- **Fewer setups.** One convention set means one way to review state code, and lets test helpers and patterns move between packages.
- **Instance isolation.** One store per instance, plus the editor kept outside state, removes the shared-state bugs that appear when several editors are on one page. It also lets Redux's dev checks work as intended. Invariant A6 already requires per-id access for Ketcher instances.
- **Pure reducers and fixed side-effect placement** make the side effects testable and keep the devtools trustworthy.
- **Latest RTK.** Starting from the current RTK means later sub-projects are written once against `combineSlices`, `create.asyncThunk`, listeners, entity adapters and reselect 5, not migrated twice.
- **Strict typed hooks.** react-redux can't infer the app state type, because the store reaches the hooks through context at runtime. There are also two root state types in the repo, so a global declaration can't be correct for both.
- **Safety net.** Behaviour-only PRs keep the DOM unchanged, so the e2e screenshot baselines serve as their parity check.

## Consequences

- **Dependencies.** Both packages depend on `@reduxjs/toolkit` and `react-redux` only. `redux`, `reselect`, `immer` and `redux-thunk` are imported from `@reduxjs/toolkit`, and `redux-saga` is removed.
- **RTK versions.** Both packages are upgraded to the latest at adoption. After that, versions are bumped when there's a reason, not on a release schedule. The repo has no automated dependency bot.
- **Testing cost.** The release gate makes each PR slower:
  - the full e2e suite and every build run on each PR;
  - characterisation tests come before refactors of thinly covered code;
  - PRs that touch paths the suites can't reach, such as several editors on one page, remote mode or SSR, also need manual checks.
- **Lint.** It rejects new `connect`, raw hooks, legacy store APIs and class components.
  - Existing violations sit in generated allowlists that may only shrink.
  - All restricted imports go through one shared `no-restricted-imports` helper, because flat config replaces the rule instead of merging it. The UI-kit initiative's `@mui`/`@emotion` bans use the same helper.
- **Dev checks.** They are configured explicitly in both stores. Known violations are listed as exceptions and counted by the metrics script until the editor-out-of-state work removes them.
- **Forms and modals.**
  - Form values remain in Redux for the duration of the migration.
  - Modal callbacks move to a registry outside the store.
  - The form component's behaviour refactor lands before its markup moves onto UI-kit primitives.
- **Memory bank.** At archive, these facts are corrected:
  - `modules/ketcher-react.md`, which lists "redux-toolkit" as a dependency it doesn't have today;
  - `modules/ketcher-macromolecules.md`, which describes the editor stored in the slice.
