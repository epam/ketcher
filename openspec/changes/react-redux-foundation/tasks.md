# React/Redux Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking. Mark each box as soon as it is done, not in a batch at the end.

**Goal:** Put both UI packages on the latest Redux Toolkit with one documented setup, without changing behaviour, and add the guardrails that keep new code from being written the old way. The guardrails are strict typed hooks, lint bans with shrinking allowlists, a metrics ratchet in CI and store-backed test helpers.

**Architecture:**

- **Dependencies.** `@reduxjs/toolkit` and `react-redux` are the only Redux dependencies of `ketcher-react` and `ketcher-macromolecules`. Every Redux, Reselect and redux-thunk import goes through `@reduxjs/toolkit`. The single exception is `castDraft` from `immer` in three macromolecules slices, which is allowlisted until sub-project #2.
- **`ketcher-react` store.** It moves from `createStore` to `configureStore`. The existing JS root reducer is wrapped unchanged, both dev checks are off as tracked exceptions, and the devtools sanitizers move to the `devTools` option.
- **`ketcher-macromolecules` store.** `RootState` and `AppDispatch` are inferred from a `combineSlices` root reducer. Today `RootState` is `any`, because the store is annotated as a plain `Store`. `immutableCheck` stops walking the live `CoreEditor`.
- **Typed hooks.** Both packages define `useAppSelector` and `useAppDispatch` with `.withTypes()`, and no file calls the raw hooks any more.
- **Guardrails.** One shared `no-restricted-imports` helper, a class-component syntax ban, generated allowlists, a metrics script with a committed baseline, and CI checks that fail when anything grows.

**Tech stack:**

- TypeScript 6, with React 19 and a peer range of `^18.2 || ^19`.
- `@reduxjs/toolkit` 2.13, `react-redux` 9.3, Reselect 5 and Immer 11, the last two via RTK.
- ESLint 10.9 flat config, Jest 30 with React Testing Library, and Node 24's `node:test` for the scripts.
- Rollup 2 with `rollup-plugin-peer-deps-external` (`includeDependencies: true`).
- Playwright e2e, in the `chromium` and `chromium-popup` projects, run through Docker.

**Spec:** `openspec/changes/react-redux-foundation/`. Read `proposal.md`, `design.md` (Decisions 1–15), `adr.md`, `roadmap.md` and `specs/*/spec.md`. Tracking: #12223 (umbrella #12222), split into one sub-issue and one branch per PR (see the execution protocol).

## Global Constraints

- **No behaviour or visual change.** The rendered DOM, styles, public API, `data-testid`s and action payloads that reducers read stay as they are. If a step seems to need a behaviour change, stop and ask.
- **Releasable after every merge** (design Decision 1). Every PR passes all of these:
  - unit tests, type checks and lint (`npm test`);
  - the full e2e suite, `chromium` and `chromium-popup`, with **no baseline updates**;
  - `npm run build`, which covers the packages and `example` in standalone and remote mode;
  - the `example-ssr` build.

  A PR that makes a host-visible change adds its entry to `openspec/changes/react-redux-foundation/release-notes.md` in the same PR, so the notes are right whichever release it ships in. In this plan those are PR 1 (step 1.14) and PR 2 (step 2.15), which change the dependencies hosts get.

- **Types follow runtime.** When inference reveals a wrong type, the type changes to match what the code actually stores or passes; the code doesn't change to match the type.
  - No new `as` type assertions or non-null assertions in source files (`@typescript-eslint/no-non-null-assertion` is already an error). Test files may cast partial fixtures and stand-in objects.
  - `castDraft` is allowed only in the allowlisted slice files.
  - Test fixtures are made complete rather than cast.
  - If a type can't be made honest without changing runtime behaviour, stop and ask.
- **New files are TypeScript.** Every new source or test file under `packages/*/src` is `.ts` or `.tsx`. Existing `.js` files may be edited in place; converting them belongs to the project's TypeScript migration. When a step moves code out of a JS file into a new file, the new file is TypeScript, and the step lists each change the conversion needs.
  - The repo scripts this plan adds under `scripts/` are TypeScript too. Node runs them directly by stripping their types (Node 22.18 and later; the repo requires 24.20). `scripts/package.json` marks them as ES modules, and `scripts/tsconfig.json` type-checks them. Only `eslint.config.mjs` stays `.mjs`.
- **Versions:** `@reduxjs/toolkit@^2.13.0` and `react-redux@^9.3.0`, or newer if `npm view` reports a newer release in Section 1. Use one deduplicated copy of each.
- **React 18 compatibility:** no React 19-only APIs; keep `forwardRef`.
- **No module-level state is added.** The macro module-level `store` singleton stays until sub-project #1. It isn't fixed here.
- **Commits:** never commit without the user's explicit approval (CLAUDE.md). The message format is `#<sub-issue> - <summary>`, where `<sub-issue>` is the PR group's sub-issue from the execution protocol, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. The pre-commit hook runs Prettier across every workspace, so back up unrelated uncommitted edits first.
- **E2E/Playwright:** this plan writes no new Playwright specs. If one turns out to be needed, ask the user first, read `.memory-bank/testing/testing.md`, and draft a plan per `.memory-bank/testing/e2e-test-plan-template.md`.
- **Memory bank:** don't update it in this change. That happens at `/opsx:archive`.

## Review Focus

1. **Redux DevTools in production.** RTK's `devTools` option defaults to `true`. The old store only used the extension when `NODE_ENV !== 'production'`, and hosts' production builds must still not connect to it. Covered in Section 2, step 2.6, by a test that runs with `NODE_ENV=production`.
2. **Reselect 4 → 5 in `ketcher-react`.**
   - Four selectors move to Reselect 5, which uses `weakMapMemoize` and has dev-mode input-stability and identity checks.
   - The props-based `filterLibSelector` in `TemplateDialog` must keep returning the same array for the same `lib` and `filter`.
   - Dev builds must not flood the console with warnings.
   - Covered in Section 1, step 1.9 (a test guard on the warnings) and step 1.10 (a memoisation test).
3. **RTK inlined into a published bundle.** If a Redux library stops being a declared dependency while code still imports it, rollup bundles it into `dist`. Hosts would then get a second copy of Redux. Covered by the `dist` checks at the end of Sections 1 and 2.
4. **Macro `immutableCheck` in dev.** The check walks state after every dispatch. Ignoring `editor.editor` must stop false "state mutation" errors from editor internals without hiding real mutations elsewhere. Covered in Section 4, step 4.3.
5. **Wrong types that hide real behaviour.** Inferring the macro `RootState` surfaces about 55 type errors.
   - Some reflect deliberate runtime behaviour. One example: since #7266, the concentration inputs store strings in fields typed `number`.
   - They must be fixed by changing types, never by changing behaviour.
   - Covered in Section 3, step 3.5, with a rule for each kind of error and a unit test for the concentration fields.

## Execution protocol

- **Start after PR #12224, which adds this plan, is merged.** The docs land on `master` first and close no issue.
- **PR grouping.** Each group is one PR with its own sub-issue of #12223 and its own branch off `master`. Each PR must pass the full release gate on its own and closes its sub-issue. #12223 closes with the last one. The groups are merged in this order, and each one starts only after the previous one is merged: each depends on the one before it.

  | PR  | Sub-issue | Branch                                  | Sections | Content                        |
  | --- | --------- | --------------------------------------- | -------- | ------------------------------ |
  | 1   | #12225    | `12225-upgrade-redux-toolkit`           | 0–1      | Upgrade and imports            |
  | 2   | #12226    | `12226-react-configure-store`           | 2        | `ketcher-react` store          |
  | 3   | #12227    | `12227-macro-store-types-dev-checks`    | 3–4      | Macro types and dev checks     |
  | 4   | #12228    | `12228-strict-typed-hooks`              | 5        | Typed hooks                    |
  | 5   | #12229    | `12229-react-redux-lint-metrics`        | 6–7      | Lint, metrics and CI           |
  | 6   | #12230    | `12230-render-with-store-release-notes` | 8–9      | Test helpers and release notes |

- For each PR group:
  1. Create its branch from an up-to-date `master`:
     ```bash
     git switch master && git pull --ff-only && git switch -c <branch> && npm ci
     ```
  2. For each section in the group:
     1. Complete its subtasks, ticking each one in this file as it's done.
     2. Run its **Code check**, and its **Release gate** where the section has one.
     3. **STOP:** ask the user for approval to commit, then commit only that section's files. The message starts with the group's sub-issue number (Global Constraints).
     4. Report the commit hash and `git show --stat HEAD`.
     5. Wait for the user's go-ahead before starting the next section.
  3. **STOP:** ask the user whether to push the branch and open the PR. Don't open a PR without their approval. The PR follows the repo's PR template, is titled `#<sub-issue> – <sub-issue title without the "[React/Redux] Foundation n/6: " prefix>`, and says `Closes #<sub-issue>` and `Part of #12223`.
  4. Start the next group only after this PR is merged.

- **Failing checks.** If a check fails, fix the problem inside the section. Never update test snapshots or e2e baselines to make a check pass.

---

## 0. Baselines (no code changes)

- [ ] 0.1 Create PR 1's branch from an up-to-date `master` and install:
  ```bash
  git switch master && git pull --ff-only && git switch -c 12225-upgrade-redux-toolkit && git status --short && npm ci
  ```
- [ ] 0.2 Create a local baseline folder that git ignores:
  ```bash
  mkdir -p .react-redux-baseline && grep -qx '.react-redux-baseline/' .git/info/exclude || echo '.react-redux-baseline/' >> .git/info/exclude
  ```
- [ ] 0.3 Build `ketcher-core` first. Both UI packages resolve `ketcher-core` to its `dist` for types and in Jest.
  - With a stale `dist`, the macro type check reports about 10 unrelated errors.
  - With a stale `dist`, about 41 `ketcher-react` unit tests fail with errors like `AttachmentGroup is not a constructor`.
  ```bash
  npm run build:core
  ```
- [ ] 0.4 Record the type-check, unit-test and dependency baselines:
  ```bash
  (cd packages/ketcher-react && npx tsc --noEmit -p .) > .react-redux-baseline/tsc-react.txt 2>&1; echo "react tsc exit $?"
  (cd packages/ketcher-macromolecules && npx tsc --noEmit -p .) > .react-redux-baseline/tsc-macro.txt 2>&1; echo "macro tsc exit $?"
  (cd packages/ketcher-react && npx jest) > .react-redux-baseline/jest-react.txt 2>&1; grep -E '^(Test Suites|Tests):' .react-redux-baseline/jest-react.txt
  (cd packages/ketcher-macromolecules && npx jest) > .react-redux-baseline/jest-macro.txt 2>&1; grep -E '^(Test Suites|Tests):' .react-redux-baseline/jest-macro.txt
  npm ls @reduxjs/toolkit react-redux redux reselect immer redux-thunk redux-saga --all > .react-redux-baseline/npm-ls.txt 2>&1
  ```
  - **Expected:** both type checks exit 0, and both Jest runs are green. On 2026-10-16, macro had 238 passing and 2 skipped tests.
  - If anything fails here, stop and report it. It's pre-existing, and the user decides whether to proceed.
- [ ] 0.5 Record the dev-mode console, the reference for Section 4.
  1. Build the packages and start the example: `npm run build:packages && npm run start:standalone -w example`.
  2. In the browser, open DevTools → Console, clear it, and do the following:
     - draw a benzene ring and undo;
     - open and close the Save dialog;
     - switch to the macromolecules mode;
     - add a peptide from the library to the canvas;
     - open the RNA builder and select a sugar;
     - open Calculate Properties;
     - switch to sequence mode and type `ACGT`.
  3. Save every error and warning that mentions `mutation`, `serializ`, `Selector` or `redux` in `.react-redux-baseline/console-dev.txt`.
  4. Note whether a "state mutation was detected" error appears for any path. This tells Section 4 which paths `immutableCheck` trips on today.
- [ ] 0.6 **Nothing to commit.** Continue to Section 1.

## 1. Upgrade RTK and react-redux; route Redux imports through RTK

`ketcher-react`'s store factory (`state/index.js`) keeps its `redux` and `redux-thunk` imports until Section 2. Everything else moves to RTK now.

**Files:**

- Modify: `packages/ketcher-react/package.json`, `packages/ketcher-macromolecules/package.json`, `package-lock.json`.
- Modify, imports only:
  - every file under `packages/ketcher-react/src` that imports from `redux`, `redux-thunk` or `reselect`, except `src/script/ui/state/index.js` (about 37 files);
  - `packages/ketcher-macromolecules/src/components/modal/Open/Open.tsx`;
  - `packages/ketcher-macromolecules/src/components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers/resetRnaBuilder.ts`.
- Modify: `packages/ketcher-react/src/setupTests.ts`, `packages/ketcher-macromolecules/src/setupTests.tsx`.
- Create: `packages/ketcher-react/src/script/ui/dialog/template/TemplateDialog.selectors.test.ts`.
- Create: `openspec/changes/react-redux-foundation/release-notes.md`, which collects the host-visible changes for the release notes. PR 2 adds to it.

**Interfaces produced:** none. These are import-path changes only. `ThunkDispatch`, `Dispatch`, `AnyAction`, `Action`, `Store`, `createSelector`, `createStore`, `legacy_createStore`, `combineReducers` and `applyMiddleware` are all exported by `@reduxjs/toolkit`.

- [ ] 1.1 Check the latest versions:
  ```bash
  npm view @reduxjs/toolkit version && npm view react-redux version && npm view @reduxjs/toolkit dependencies.immer
  ```
  If either version is newer than 2.13.0 or 9.3.0, use it. Update the version numbers in `adr.md`, `design.md` (Decision 4) and `specs/state-management/spec.md` in this section's commit. Note the `immer` range RTK depends on; it was `^11.0.0` for 2.13.0.
- [ ] 1.2 Read these release notes and write the relevant points to `.react-redux-baseline/release-notes.md`. They go into PR 1's description.
  - RTK v2.9.0 through the target version (GitHub releases of `reduxjs/redux-toolkit`).
  - react-redux v9.3.0.
  - The Immer 11.0.0 changelog.
  - Reselect's "Migrating to Reselect 5" guide, for `ketcher-react`'s move from 4.1.8.

  **Stop and ask** if any note changes the behaviour of these APIs:
  - `configureStore`, `getDefaultMiddleware`, `createSlice`, `createSelector`;
  - Immer's auto-freeze, `castDraft` or `current`;
  - `Provider`, `useSelector`, `useDispatch`, `connect`.

- [ ] 1.3 Edit `packages/ketcher-react/package.json` `dependencies`, keeping alphabetical order:
  - add `"@reduxjs/toolkit": "^2.13.0"`;
  - set `"react-redux": "^9.3.0"`;
  - remove `"reselect"`;
  - keep `"redux"` and `"redux-thunk"`. Section 2 removes them.
- [ ] 1.4 Edit `packages/ketcher-macromolecules/package.json` `dependencies`:
  - set `"@reduxjs/toolkit": "^2.13.0"` and `"react-redux": "^9.3.0"`;
  - add `"immer": "^11.0.0"`, the range RTK depends on from step 1.1. It is used for `castDraft` only (design Decision 4). Declaring it also stops rollup from bundling `castDraft` into `dist`, which happens today because `immer` is undeclared;
  - remove `"redux"` and `"redux-saga"`, which is unused.
- [ ] 1.5 Install and check that there's one copy of each:

  ```bash
  npm install
  npm ls @reduxjs/toolkit react-redux
  npm ls immer
  ```

  **Expected:**
  - one `@reduxjs/toolkit` version and one `react-redux` version, both shown as `deduped` under both packages;
  - the `immer` used by RTK and by macromolecules is the same 11.x copy. An unrelated Immer 9 from `react-scripts` may also be listed.

  If there are two RTK versions, run `npm dedupe` and check again.

- [ ] 1.6 Rewrite the imports in `ketcher-react`, leaving the store factory alone:
  ```bash
  cd packages/ketcher-react/src
  grep -rlE "from '(redux|redux-thunk|reselect)'" . | grep -v '^./script/ui/state/index.js$' > /tmp/react-redux-imports.txt
  xargs sed -i '' -E "s#from '(redux|redux-thunk|reselect)';#from '@reduxjs/toolkit';#" < /tmp/react-redux-imports.txt
  cd ../../..
  npx eslint --fix $(sed 's#^\./#packages/ketcher-react/src/#' /tmp/react-redux-imports.txt)
  ```
  `eslint --fix` merges the duplicate imports this creates (`import/no-duplicates`). For example, `Save.tsx` gets two `import type` lines from `@reduxjs/toolkit`. Then make sure nothing is left:
  ```bash
  grep -rnE "from '(redux|redux-thunk|reselect)'" packages/ketcher-react/src
  ```
  **Expected:** only `src/script/ui/state/index.js`.
- [ ] 1.7 Rewrite the two `redux` imports in macromolecules the same way. Then check for leftovers; the only expected matches are the three `castDraft` imports.

  ```bash
  sed -i '' "s#from 'redux';#from '@reduxjs/toolkit';#" \
    packages/ketcher-macromolecules/src/components/modal/Open/Open.tsx \
    packages/ketcher-macromolecules/src/components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers/resetRnaBuilder.ts
  npx eslint --fix packages/ketcher-macromolecules/src/components/modal/Open/Open.tsx packages/ketcher-macromolecules/src/components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/helpers/resetRnaBuilder.ts
  grep -rnE "from '(redux|redux-thunk|reselect|redux-saga|immer)'" packages/ketcher-macromolecules/src
  ```

  **Expected:** only these three lines remain:
  - `state/common/editorSlice.ts:17`;
  - `state/modal/modalSlice.ts:16`;
  - `state/rna-builder/rnaBuilderSlice.ts:46`.

  Each is `import { castDraft } from 'immer';`.

- [ ] 1.8 Write the failing memoisation test `packages/ketcher-react/src/script/ui/dialog/template/TemplateDialog.selectors.test.ts`. It pins Review Focus 2.

  First export the selector for tests. In `TemplateDialog.tsx`, change `const filterLibSelector = createSelector(` to `export const filterLibSelector = createSelector(`.

  ```ts
  import { filterLibSelector } from './TemplateDialog';

  describe('filterLibSelector', () => {
    const lib = [
      { struct: { name: 'Benzene' }, props: { group: 'Aromatics' } },
      { struct: { name: 'Cyclohexane' }, props: { group: 'Cycloalkanes' } },
    ];

    it('returns the same result for new props objects with the same lib and filter', () => {
      const first = filterLibSelector({ lib, filter: 'benz' } as never);
      const second = filterLibSelector({ lib, filter: 'benz' } as never);

      expect(second).toBe(first);
    });

    it('recomputes when the filter changes', () => {
      const first = filterLibSelector({ lib, filter: 'benz' } as never);
      const second = filterLibSelector({ lib, filter: 'cyclo' } as never);

      expect(second).not.toBe(first);
    });
  });
  ```

  The `as never` casts are allowed here: test files may cast partial props. If `filterLib` needs more fields on `lib` items than this fixture has, copy the shape it reads from `filterLib` in `TemplateDialog.tsx`.

- [ ] 1.9 Add a guard to both test setups, so a Reselect dev-check warning fails the test that triggers it. Append to `packages/ketcher-react/src/setupTests.ts` and to `packages/ketcher-macromolecules/src/setupTests.tsx`:

  ```ts
  // Reselect 5's dev checks warn when a selector would recompute on every
  // call. Fail the test instead, so a badly written selector can't land
  // (react-redux-foundation, Decision 10).
  const RESELECT_WARNINGS =
    /An input selector returned a different result|The result function returned its own inputs/;
  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (RESELECT_WARNINGS.test(String(args[0]))) {
      throw new Error(`Reselect dev check: ${String(args[0])}`);
    }
    originalWarn(...args);
  };
  ```

  - It replaces `console.warn` once, without `beforeEach` or `restoreAllMocks`, so tests that spy on `console.warn` themselves keep working: their spy wraps this function and restores it afterwards.
  - The error is thrown inside the selector call, so it fails the render or the assertion that triggered it.
  - On 2026-10-16 the macromolecules suite printed no Reselect warnings, so the guard shouldn't break any existing test there. If it breaks a `ketcher-react` test after the Reselect 5 move, the selector named in the error needs fixing. The fix must change memoisation only, and its result must stay equal. Stop and ask if it would change a result.

- [ ] 1.10 Run the new test: `cd packages/ketcher-react && npx jest src/script/ui/dialog/template/TemplateDialog.selectors.test.ts`. **Expected:** PASS. It should also pass on the old Reselect 4, so it's a characterisation test.
- [ ] 1.11 **Code check:**
  - `npm run build:core && npm test -w packages/ketcher-react -w packages/ketcher-macromolecules` passes. That covers Prettier, stylelint, ESLint, types, `dpdm` and unit tests.
  - The unit counts equal the Section 0 baselines plus the 2 new tests.
- [ ] 1.12 **Bundle check**, for Review Focus 3:
  ```bash
  npm run build:packages
  grep -rlE --include='*.js' "weakMapMemoize|createSelectorCreator|An input selector returned a different result" packages/ketcher-react/dist packages/ketcher-macromolecules/dist
  grep -rohE --include='*.js' "from ?[\"'](@reduxjs/toolkit|immer|reselect|redux)[\"']" packages/ketcher-react/dist packages/ketcher-macromolecules/dist | sort | uniq -c
  ```
  **Expected:**
  - the first `grep` prints nothing, which means Reselect and RTK aren't bundled;
  - the second shows imports of `@reduxjs/toolkit` from both packages, `immer` from macromolecules, and `redux` from `ketcher-react` only.
- [ ] 1.13 **Release gate** (PR 1):
  - `npm run build` and the `example-ssr` build: `cd example-ssr && npm run build && npm run lint && npm run test:types`.
  - Ask the user to run the full e2e suite through CI, or locally with `npm run docker:test` and `npm run docker:test-popup` in `ketcher-autotests`. **Expected:** green with no baseline updates.
  - Manual check: repeat the step 0.5 walkthrough. The console shows no new errors or warnings compared with `console-dev.txt`.
- [ ] 1.14 Create `openspec/changes/react-redux-foundation/release-notes.md` with this PR's host-visible changes:
  - `ketcher-react` now depends on `@reduxjs/toolkit` and no longer on `reselect`. Hosts that imported `reselect` through Ketcher's dependency tree must declare it.
  - `ketcher-macromolecules` no longer depends on `redux` or `redux-saga`. It declares `immer` (11.x), which it was already using undeclared.
  - No UI, behaviour or public API change.

  **STOP:** ask to commit, including `release-notes.md`, using the message `#12225 - Upgrade Redux Toolkit and route Redux imports through it`.

## 2. `ketcher-react` on `configureStore`

**Files:**

- Create:
  - `packages/ketcher-react/src/script/ui/state/rootReducer.ts`, holding the reducers moved out of `index.js` and converted to TypeScript (step 2.3 lists every change);
  - `packages/ketcher-react/src/script/ui/state/devTools.ts`, holding `sanitizeForDevTools` moved out of `index.js` and converted to TypeScript;
  - `packages/ketcher-react/src/script/ui/state/devTools.test.ts`;
  - `packages/ketcher-react/src/script/ui/state/store.ts`;
  - `packages/ketcher-react/src/script/ui/state/store.test.ts`.
- Rename: `packages/ketcher-react/src/script/ui/state/index.js` to `index.ts`, which then holds re-exports only.
- Modify:
  - `packages/ketcher-react/src/script/ui/state/index.test.js` (stays JS; it's an existing file);
  - `packages/ketcher-react/src/script/ui/state/hooks.ts`;
  - `packages/ketcher-react/src/script/ui/state/action/index.ts`, `functionalGroups/index.ts` and `saltsAndSolvents/index.ts`, to export their state types;
  - `packages/ketcher-react/src/script/ui/App/initApp.tsx`;
  - `packages/ketcher-react/package.json` and `package-lock.json`;
  - `openspec/changes/react-redux-foundation/release-notes.md`, to add this PR's entries.

**Interfaces produced:**

- `createAppStore(params: CreateAppStoreParams): AppStore`, where `CreateAppStoreParams` is `{ options: Record<string, unknown>; server: StructService | null | undefined; setEditor: (editor: unknown) => void; preloadedState?: PreloadedRootState; extra?: unknown }`.
- `type AppStore = ReturnType<typeof createAppStore>` and `type AppDispatch = AppStore['dispatch']`, exported from `state/store.ts` and re-exported from `state/hooks.ts`.
- `sanitizeForDevTools<S>(value: S): S`, from `state/devTools.ts`.
- From `state/rootReducer.ts`:
  - `getRootReducer(setEditor: (editor: unknown) => void)`, returning `(state: PreloadedRootState | undefined, action: RootAction) => RootState`;
  - `buildInitialState(options: Record<string, unknown>, server: StructService | null | undefined): PreloadedRootState`;
  - `SET_SERVER` and `setServer(server: StructService | null | undefined): SetServerAction`;
  - the types `RootState` (inferred from the combined reducers), `PreloadedRootState`, `RootAction` and `SetServerAction`.
- `StoreState` in `store.types.ts`, which the hooks use, is unchanged in this section. Section 5 makes it an alias of `RootState`.

- [ ] 2.1 Write the characterisation test `store.test.ts` against the **current** factory. Every expectation must pass before the refactor. If one fails on unchanged code, the test is wrong: change it to the observed value and note the change in the section report.

  ```ts
  import createStore, { setServer } from './index';

  const errorHandler = jest.fn();
  const editorOptions = {
    buttons: { clear: { hidden: true } },
    customButtons: [{ id: 'custom', imageLink: '', title: 'Custom' }],
    errorHandler,
    mode: 'test-mode',
  };

  const makeStore = (server: unknown = { id: 'server' }) =>
    createStore(editorOptions, server, jest.fn());

  describe('ketcher-react store', () => {
    afterEach(() => {
      delete (globalThis as { currentState?: unknown }).currentState;
    });

    it('builds the initial state from the editor options', () => {
      const server = { id: 'server' };
      const state = makeStore(server).getState();

      expect(Object.keys(state).sort()).toEqual([
        'abbreviationLookup',
        'actionState',
        'common',
        'editor',
        'floatingTools',
        'functionalGroups',
        'modal',
        'notifications',
        'options',
        'requestsStatuses',
        'saltsAndSolvents',
        'server',
        'templates',
        'toolbar',
      ]);
      expect(state.options.app).toEqual({ errorHandler, mode: 'test-mode' });
      expect(state.options.buttons).toBe(editorOptions.buttons);
      expect(state.options.customButtons).toBe(editorOptions.customButtons);
      expect(state.server).toBe(server);
      expect(state.editor).toBeNull();
      expect(state.modal).toBeNull();
    });

    it('runs thunks with dispatch and getState', () => {
      const server = { id: 'server' };
      const store = makeStore(server);

      const result = store.dispatch(
        (_dispatch: unknown, getState: () => { server: unknown }) =>
          getState().server,
      );

      expect(result).toBe(server);
    });

    it('replaces the server on SET_SERVER', () => {
      const store = makeStore();
      const nextServer = { id: 'next' };

      store.dispatch(setServer(nextServer));

      expect(store.getState().server).toBe(nextServer);
    });
  });
  ```

- [ ] 2.2 Run `cd packages/ketcher-react && npx jest src/script/ui/state/store.test.ts`. **Expected:** PASS on the unchanged code.
- [ ] 2.3 Move the reducers into a new `state/rootReducer.ts`, converted to TypeScript.
  1. Export the reducer state types that `RootState` names. Without them, the declaration build fails with TS4023. These are type-only changes, moved here from Section 5:
     - `state/action/index.ts`: `type ActionState = {` becomes `export type ActionState = {`;
     - `state/functionalGroups/index.ts`: `interface FGState {` becomes `export interface FGState {`;
     - `state/saltsAndSolvents/index.ts`: `interface SaltsAndSolventsState {` becomes `export interface SaltsAndSolventsState {`.
  2. Create `state/rootReducer.ts` with the licence header. Move these from `index.js`:
     - the `shared` `combineReducers` call;
     - `getRootReducer`;
     - `SET_SERVER` and `setServer`;
     - the reducer imports they use (`./options`, `./templates`, `./abbreviationLookup`, `./common`, `./action`, `./functionalGroups`, `./saltsAndSolvents`, `./modal`, `./request`, `./toolbar`, `./floatingTools`, `./notifications`);
     - `pick` from `lodash/fp`.
  3. Import `combineReducers` from `@reduxjs/toolkit`, not `redux`, and `type StructService` from `ketcher-core`.
  4. Make these changes and no others. None of them changes what the reducer returns.
     - Give the two inline reducers parameter types:
       ```ts
       // A rejected promise in standalone mode until a service is set.
       type ServerState = StructService | Promise<never> | null;
       ```
       `server: (store: ServerState = null) => store` and `editor: (store: unknown = null) => store`. `editor` stays `unknown` until react-redux #2 moves it out of state.
     - After `shared`, add the types:
       ```ts
       export type RootState = ReturnType<typeof shared>;
       type SharedAction = Parameters<typeof shared>[1];

       // What the combined reducer accepts: the full state, or the partial state
       // the store starts with. Keys whose reducer declares a narrow action type
       // (common, abbreviationLookup, requestsStatuses, floatingTools) are `never`
       // here, so they can't be preloaded. Moving them to createSlice
       // (react-redux #3) lifts that.
       export type PreloadedRootState = NonNullable<
         Parameters<typeof shared>[0]
       >;

       interface InitAction {
         type: 'INIT';
         editor: unknown;
         server?: StructService | null;
       }

       interface UpdateAction {
         type: 'UPDATE';
       }

       export interface SetServerAction {
         type: typeof SET_SERVER;
         server?: StructService | null;
       }

       export type RootAction =
         InitAction | UpdateAction | SetServerAction | SharedAction;
       ```
     - Type the inner function as `function root(state: PreloadedRootState | undefined, action: RootAction): RootState`.
     - In the `INIT` and `UPDATE` cases, replace
       ```js
       const data = { ...action };
       delete data.type;
       if (data) {
         updatedState = { ...updatedState, ...data };
       }
       ```
       with
       ```ts
       const { type: _type, ...data } = action;
       updatedState = { ...updatedState, ...data };
       ```
       TypeScript rejects `delete` on a required property, and `if (data)` was always true. Keep the existing comment above the `INIT` copy.
     - Read the previous server as `updatedState?.server` in the `INIT` and `SET_SERVER` cases. The type allows an undefined state; at runtime the store always passes its preloaded state, so the value read is the same.
     - Replace
       ```js
       const finalState =
         sh === updatedState.shared
           ? updatedState
           : {
               ...updatedState,
               ...sh,
             };
       ```
       with `const finalState = { ...updatedState, ...sh };`. State never has a `shared` key, so the comparison was always false; TypeScript reports it as TS2339. Mention this in the section report.
     - Type the action creator: `export function setServer(server: StructService | null | undefined): SetServerAction`.
     - `globalThis.currentState = finalState;` stays as it is. It compiles because `noImplicitAny` is off, and react-redux #1 removes it.
  5. Add `buildInitialState`, built from the old factory's first lines:
     ```ts
     export function buildInitialState(
       options: Record<string, unknown>,
       server: StructService | null | undefined,
     ): PreloadedRootState {
       const { buttons = {}, customButtons, ...restOptions } = options;

       // TODO: redux localStorage here
       return {
         actionState: null,
         editor: null,
         modal: null,
         // Mutates the module-level initOptionsState; fixed in react-redux #1.
         options: Object.assign(initOptionsState, {
           app: restOptions,
           buttons,
           customButtons,
         }),
         server: server || Promise.reject(new Error('Standalone mode!')),
         templates: initTmplsState,
         notifications: initNotificationsState,
       };
     }
     ```
  6. Run `npx tsc -p packages/ketcher-react/tsconfig.json --noEmit`. **Expected:** no errors in `rootReducer.ts`. A prototype of this file type-checked against the reducers on `master` on 2026-10-16. If an error appears anyway, fix the type, not the code (Global Constraints), or stop and ask.

- [ ] 2.4 Move `NOT_SERIALIZED`, `sanitizeForDevTools` and the comment above them out of `index.js` into a new `state/devTools.ts`, keeping the licence header and the comment. Convert it like this, with the same results for every state and action value:

  ```ts
  const NOT_SERIALIZED = '<not serialized>';
  const LIVE_OBJECT_KEYS = [
    'editor',
    'server',
    'functionalGroups',
    'saltsAndSolvents',
  ];

  function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object';
  }

  // RTK types both sanitizers as returning the type they receive. This one
  // returns a different shape, which DevTools only serialises. The overload
  // states RTK's contract; the body is type-checked against `unknown`.
  export function sanitizeForDevTools<S>(value: S): S;
  export function sanitizeForDevTools(value: unknown): unknown {
    if (!isRecord(value)) {
      return value;
    }

    const sanitized: Record<string, unknown> = { ...value };

    LIVE_OBJECT_KEYS.forEach((key) => {
      if (key in sanitized) {
        sanitized[key] = NOT_SERIALIZED;
      }
    });

    const { templates } = sanitized;
    if (isRecord(templates) && templates.lib) {
      sanitized.templates = { ...templates, lib: NOT_SERIALIZED };
    }

    if (sanitized.lib) {
      sanitized.lib = NOT_SERIALIZED;
    }

    return sanitized;
  }
  ```

  - The overload is the one place in this section where a type isn't checked. It is narrower than an `as`: it covers only the return type, and the body stays checked. Call it out in the PR description.
  - The step 2.5 tests pin the behaviour, so run them against this file before deleting the JS original from `index.js` in step 2.9.

- [ ] 2.5 Write `state/devTools.test.ts`:

  ```ts
  import { sanitizeForDevTools } from './devTools';

  describe('sanitizeForDevTools', () => {
    it('replaces live objects and the template library', () => {
      const state = {
        editor: {},
        server: {},
        functionalGroups: { lib: [] },
        saltsAndSolvents: { lib: [] },
        templates: { lib: [{}], filter: 'benz' },
        options: { app: {} },
      };

      expect(sanitizeForDevTools(state)).toEqual({
        editor: '<not serialized>',
        server: '<not serialized>',
        functionalGroups: '<not serialized>',
        saltsAndSolvents: '<not serialized>',
        templates: { lib: '<not serialized>', filter: 'benz' },
        options: { app: {} },
      });
      expect(state.editor).toEqual({});
    });

    it('replaces lib on actions and passes primitives through', () => {
      expect(sanitizeForDevTools({ type: 'TMPL_INIT', lib: [{}] })).toEqual({
        type: 'TMPL_INIT',
        lib: '<not serialized>',
      });
      expect(sanitizeForDevTools(null)).toBeNull();
      expect(sanitizeForDevTools('x')).toBe('x');
    });
  });
  ```

- [ ] 2.6 Add the failing configuration tests to `store.test.ts`, after the existing `describe`. They cover Review Focus 1.
  - Add `import type { createAppStore as CreateAppStore } from './store';` to the imports. A type-only import can be used with `typeof`, and it keeps `@typescript-eslint/consistent-type-imports` happy.
  - The tests load the module with `await import`, not `require`, because of `@typescript-eslint/no-require-imports`.

  ```ts
  describe('ketcher-react store configuration', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      delete (window as { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: unknown })
        .__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    });

    // RTK reads the extension global when it is first imported, so each test
    // loads a fresh copy of RTK and the store after setting it.
    const loadWithExtension = async () => {
      const extensionCompose = jest.fn(
        () =>
          (...enhancers: Array<(next: unknown) => unknown>) =>
          (createStoreFn: unknown) =>
            enhancers.reduceRight(
              (acc, enhancer) => enhancer(acc),
              createStoreFn,
            ),
      );
      (
        window as { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: unknown }
      ).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = extensionCompose;
      let createAppStore: typeof CreateAppStore | undefined;
      await jest.isolateModulesAsync(async () => {
        ({ createAppStore } = await import('./store'));
      });
      if (!createAppStore) throw new Error('store module did not load');
      return { createAppStore, extensionCompose };
    };

    it('connects Redux DevTools with the sanitizers in development', async () => {
      process.env.NODE_ENV = 'development';
      const { createAppStore, extensionCompose } = await loadWithExtension();

      createAppStore({ options: {}, server: null, setEditor: jest.fn() });

      expect(extensionCompose).toHaveBeenCalledTimes(1);
      const [devToolsOptions] = extensionCompose.mock.calls[0] as [
        {
          stateSanitizer: (value: unknown) => unknown;
          actionSanitizer: (value: unknown) => unknown;
          trace: boolean;
        },
      ];
      expect(devToolsOptions.trace).toBe(false);
      expect(devToolsOptions.stateSanitizer({ editor: {} })).toEqual({
        editor: '<not serialized>',
      });
      expect(devToolsOptions.actionSanitizer({ lib: [] })).toEqual({
        lib: '<not serialized>',
      });
    });

    it('never connects Redux DevTools in production', async () => {
      process.env.NODE_ENV = 'production';
      const { createAppStore, extensionCompose } = await loadWithExtension();

      createAppStore({ options: {}, server: null, setEditor: jest.fn() });

      expect(extensionCompose).not.toHaveBeenCalled();
    });

    it('passes the extra argument to thunks and accepts a preloaded state', async () => {
      const { createAppStore } = await loadWithExtension();
      const extra = { holder: true };
      // A complete ModalState: the preloaded state is type-checked.
      const modal = {
        name: 'test-dialog',
        form: { errors: {}, valid: true, result: {} },
        prop: null,
        parentModal: null,
      };
      const store = createAppStore({
        options: {},
        server: null,
        setEditor: jest.fn(),
        preloadedState: { modal },
        extra,
      });

      const seen = store.dispatch(
        (_dispatch: unknown, _getState: unknown, extraArg: unknown) => extraArg,
      );

      expect(seen).toBe(extra);
      expect(store.getState().modal).toEqual(modal);
    });
  });
  ```

- [ ] 2.7 Run `npx jest src/script/ui/state/store.test.ts`. **Expected:** the new tests FAIL, because `./store` is missing. The characterisation tests still pass.
- [ ] 2.8 Create `state/store.ts`:

  ```ts
  import { configureStore } from '@reduxjs/toolkit';
  import type { StructService } from 'ketcher-core';
  import { logger } from 'redux-logger';
  import { sanitizeForDevTools } from './devTools';
  import {
    buildInitialState,
    getRootReducer,
    type PreloadedRootState,
  } from './rootReducer';

  export interface CreateAppStoreParams {
    options: Record<string, unknown>;
    server: StructService | null | undefined;
    setEditor: (editor: unknown) => void;
    preloadedState?: PreloadedRootState;
    /** The thunk extra argument; react-redux #2 puts the editor holder here. */
    extra?: unknown;
  }

  export function createAppStore({
    options,
    server,
    setEditor,
    preloadedState,
    extra,
  }: CreateAppStoreParams) {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const withLogger =
      isDevelopment && process.env.KETCHER_ENABLE_REDUX_LOGGER === 'true';

    return configureStore({
      reducer: getRootReducer(setEditor),
      preloadedState: {
        ...buildInitialState(options, server),
        ...preloadedState,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          thunk: { extraArgument: extra },
          // Off, as before; tracked as exceptions in Section 4.
          immutableCheck: false,
          serializableCheck: false,
        }).concat(withLogger ? [logger] : []),
      devTools: isDevelopment && {
        stateSanitizer: sanitizeForDevTools,
        actionSanitizer: sanitizeForDevTools,
        trace: false,
      },
    });
  }

  export type AppStore = ReturnType<typeof createAppStore>;
  export type AppDispatch = AppStore['dispatch'];
  ```

  - If `tsc` rejects the conditional `.concat`, use `withLogger ? middleware.concat(logger) : middleware` on a local `const middleware`, and keep both branches' types the same.
  - Every type here is inferred from `rootReducer.ts`; there are no annotations to keep in sync. The store's state type is `RootState`, while the hooks still use `StoreState` until Section 5.
  - `redux-logger` has no type declarations, so `logger` is `any` (allowed because `noImplicitAny` is off). That matches how `index.js` used it.
  - RTK reads the DevTools extension global when it is first imported. The old code read it when the store was created. Extensions inject the global before page scripts run, so the two are equivalent.

- [ ] 2.9 Rename `state/index.js` to `state/index.ts` with `git mv`, and reduce it to re-exports:

  ```ts
  export { onAction, load } from './shared';
  export { SET_SERVER, setServer } from './rootReducer';
  export { createAppStore } from './store';
  ```

  Everything else in the old `index.js` goes: the default-export factory, the devtools compose code, the reducers and sanitiser now in `rootReducer.ts` and `devTools.ts`, and the `redux`, `redux-thunk` and `redux-logger` imports. `store.ts` now imports `redux-logger`. `store.ts` and `rootReducer.ts` must not import from `./index`, or `test:circ` reports a cycle.

  Then update the callers:
  1. Find them with `grep -rn "from '\(\.\./\)*state'\|from './index'\|state/index'" packages/ketcher-react/src`.
  2. In `App/initApp.tsx`, replace `import createStore, { setServer } from '../state';` with `import { createAppStore, setServer } from '../state';`. Replace `createStore(options, server, setEditor)` with `createAppStore({ options, server, setEditor })`.
  3. In `index.test.js` and `store.test.ts`, import `{ createAppStore, setServer }` and call `createAppStore({ options: …, server: …, setEditor: … })`. In `store.test.ts`, the stand-in servers become `{ id: 'server' } as unknown as StructService`, since `createAppStore` and `setServer` now type their argument; test files may cast stand-in objects (Global Constraints).
  4. Adapt the `makeStore` helper and the first `createStore` call in `index.test.js`.

- [ ] 2.10 In `state/hooks.ts`, take the dispatch type from the store:
  ```ts
  import { useDispatch, useSelector } from 'react-redux';
  import type { AppDispatch } from './store';
  import type { StoreState } from './store.types';

  export type { AppDispatch };

  export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
  export const useAppSelector = useSelector.withTypes<StoreState>();
  ```
- [ ] 2.11 Remove `"redux"` and `"redux-thunk"` from `packages/ketcher-react/package.json` and run `npm install`. Then check:
  ```bash
  grep -rnE "from '(redux|redux-thunk|reselect)'" packages/ketcher-react/src
  npm ls redux redux-thunk
  ```
  **Expected:**
  - nothing in `src`;
  - `redux` and `redux-thunk` appear only under `@reduxjs/toolkit`.
- [ ] 2.12 Run `npx jest src/script/ui/state`. **Expected:** all PASS, including `index.test.js`, which still checks `globalThis.currentState`.
- [ ] 2.13 **Code check:**
  - `npm test -w packages/ketcher-react` passes. This includes `test:circ`, so the new `store.ts` must not create an import cycle.
  - `npm run build:packages`, then rerun the step 1.12 bundle check. **Expected:** `ketcher-react/dist` no longer imports `redux`, and still imports `@reduxjs/toolkit`.
- [ ] 2.14 **Release gate** (PR 2): the same as step 1.13. Every component reads this store, so the manual walkthrough is required. In addition:
  - With the Redux DevTools extension installed, open it on the example in development. **Expected:** the editor, server and libraries show as `<not serialized>`, and the tab stays responsive.
  - Run `KETCHER_ENABLE_REDUX_LOGGER=true npm run start:standalone -w example`. **Expected:** actions are logged.
  - Run a production build (`npm run build:example:standalone`) and serve `example/build`. **Expected:** the extension shows no store.
- [ ] 2.15 Add to `release-notes.md`:
  - `ketcher-react` no longer depends on `redux` or `redux-thunk`; both come with `@reduxjs/toolkit`. Hosts that imported them through Ketcher's dependency tree must declare them.
  - Redux DevTools still connect only in development builds, with the same sanitised state.

  **STOP:** ask to commit, including `release-notes.md`, using the message `#12226 - Create the ketcher-react store with configureStore`.

## 3. Macromolecules: inferred store types

Today `const store: Store = configureStore(...)` makes `RootState` `any`, so every typed hook and selector in macromolecules is unchecked. This section makes the types real. On 2026-10-16 that surfaced 55 type errors in about 20 files.

**Files:**

- Modify:
  - `packages/ketcher-macromolecules/src/state/store.ts`;
  - `src/state/common/editorSlice.ts`;
  - `src/state/library/librarySlice.ts`;
  - `src/state/rna-builder/rnaBuilderSlice.ts`;
  - `src/setupTests.tsx`;
  - `src/typings.d.ts`, wherever the `withStoreProvider` globals are declared;
  - the files `tsc` reports (expected list in step 3.4).
- Create: `packages/ketcher-macromolecules/src/state/common/editorSlice.concentrations.test.ts`.

**Interfaces produced:**

- `rootReducer`, a `combineSlices` reducer.
- `type RootState = ReturnType<typeof rootReducer>`.
- `configureAppStore(preloadedState?: Partial<RootState>): AppStore`.
- `type AppStore = ReturnType<typeof configureAppStore>`.
- `type AppDispatch = AppStore['dispatch']`.
- `store`, unchanged: still the module-level singleton until #1.

- [ ] 3.1 Write the characterisation test `editorSlice.concentrations.test.ts`. It pins the runtime behaviour #7266 introduced: the inputs dispatch strings.

  ```ts
  import {
    editorReducer,
    setOligonucleotidesValue,
    setUnipositiveIonsValue,
  } from 'state/common';

  describe('Calculate Properties concentration values', () => {
    const initial = editorReducer(undefined, { type: 'test/init' });

    it('start as numbers', () => {
      expect(initial.unipositiveIonsValue).toBe(140);
      expect(initial.oligonucleotidesValue).toBe(200);
    });

    it('store the string the input dispatches, unchanged', () => {
      const afterIons = editorReducer(initial, setUnipositiveIonsValue('0'));
      const afterOligos = editorReducer(
        afterIons,
        setOligonucleotidesValue('12.5'),
      );

      expect(afterOligos.unipositiveIonsValue).toBe('0');
      expect(afterOligos.oligonucleotidesValue).toBe('12.5');
    });
  });
  ```

  Run it: `cd packages/ketcher-macromolecules && npx jest src/state/common/editorSlice.concentrations.test.ts`. **Expected:** PASS today, because the payload types aren't enforced while `RootState` is `any`. If `state/common` doesn't export the action creators, import them from `state/common/editorSlice`.

- [ ] 3.2 Rewrite `state/store.ts`, below the licence header:

  ```ts
  import { combineSlices, configureStore } from '@reduxjs/toolkit';
  import { editorReducer } from 'state/common';
  import { libraryReducer } from 'state/library';
  import { modalReducer } from 'state/modal';
  import { toastMiddleware } from 'state/modal/toastMiddleware';
  import { rnaBuilderReducer } from 'state/rna-builder';

  export const rootReducer = combineSlices({
    editor: editorReducer,
    modal: modalReducer,
    library: libraryReducer,
    rnaBuilder: rnaBuilderReducer,
  });

  export type RootState = ReturnType<typeof rootReducer>;

  export function configureAppStore(preloadedState: Partial<RootState> = {}) {
    return configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          // TODO: Currently storing the whole editor (with functions within) in the state violates this check. Ideally find a way to store serializable data only
          serializableCheck: false,
        }).concat(toastMiddleware),
      preloadedState,
    });
  }

  export type AppStore = ReturnType<typeof configureAppStore>;
  export type AppDispatch = AppStore['dispatch'];

  // Module-level singleton shared by every editor instance; react-redux #1
  // replaces it with one store per EditorContainer.
  export const store = configureAppStore();
  ```

- [ ] 3.3 Remove the annotations that hide or break inference:
  - `export const editorSlice: Slice<EditorState> = createSlice({` becomes `export const editorSlice = createSlice({`. Remove `Slice` from that file's RTK import.
  - `export const librarySlice: Slice = createSlice({` becomes `export const librarySlice = createSlice({`. Remove `Slice` from that file's RTK import.
  - Inside the `reducers` objects of `librarySlice` and `rnaBuilderSlice`, case reducers annotated `state: RootState` become `state`. That's 5 in each file. The annotation is wrong: a case reducer gets its slice's state. With an inferred `RootState` it is also circular (TS2456 and TS2502). Use this script, which only touches text between `createSlice(` and the first exported selector:
    ```bash
    python3 - <<'EOF'
    for path, end in [
        ('packages/ketcher-macromolecules/src/state/library/librarySlice.ts', 'export const selectLibrarySlice'),
        ('packages/ketcher-macromolecules/src/state/rna-builder/rnaBuilderSlice.ts', 'export const selectRnaBuilderSlice'),
    ]:
        text = open(path).read()
        start = text.index('= createSlice(')
        stop = text.index(end)
        text = text[:start] + text[start:stop].replace('state: RootState', 'state') + text[stop:]
        open(path, 'w').write(text)
    EOF
    ```
    Selectors outside `createSlice` keep `state: RootState`. That's correct and not circular.
- [ ] 3.4 Run `cd packages/ketcher-macromolecules && npx tsc --noEmit -p . 2>&1 | tee /tmp/macro-tsc.txt | grep -c 'error TS'`.
  - **Expected:** about 55 errors in these files:
    - `state/rna-builder/rnaBuilderSlice.ts` (9), `state/library/librarySlice.ts` (5), `state/common/editorSlice.ts` (4);
    - `PresetPreview.test.tsx` (6), `Editor.tsx` (4), `EditorEvents.tsx` (3), `MacromoleculePropertiesWindow.tsx` (3);
    - `setupTests.tsx`, `useSetRnaPresets.ts`, `useRecalculateMacromoleculeProperties.ts`, `RnaElementsTabsView.tsx`, `RnaElementsAccordionView.tsx` and `Delete.tsx` (2 each);
    - `librarySlice.test.ts`, `rnaBuilderSlice.test.ts`, `MonomerItem.tsx`, `CalculateMacromoleculePropertiesButton.tsx`, `TopMenuComponent.tsx` and `LeftMenuComponent.tsx` (1 each).
  - If you see TS2456 or TS2502, a type still references `RootState` inside something that feeds `rootReducer`'s type. Find it before fixing anything else.
- [ ] 3.5 Fix every error under the "types follow runtime" rule (Global Constraints). Apply these rules in order, and record each fix with its rule number in the section report:
  1. **The payload doesn't match what the reducer stores** (Review Focus 5). Example: `MacromoleculePropertiesWindow.tsx:848,852` dispatches `value.toString()`. Since #7266 the state really holds `number | string`.
     - Change the state fields `unipositiveIonsValue` and `oligonucleotidesValue` to `number | string`, with the comment `// A number initially; the inputs store the typed string since #7266.`
     - Change both reducers' payloads to `PayloadAction<number | string>`.
     - In `useRecalculateMacromoleculeProperties.ts:99,102`, wrap the operands of `/` in `Number(...)`. `/` already coerces with `Number`, so the result is identical.
     - Don't touch the `toString()` calls.
     - Any other reader that needs a conversion that **differs** from JS coercion (`+`, `===`, `Math.*`): stop and ask.
  2. **The reducer ignores its payload, but callers pass one.** Example: `toggleMacromoleculesPropertiesWindowVisibility({})` and `destroyEditor(null)`.
     - Run `grep -rn "action.payload" <slice file>` within that reducer, and check `toastMiddleware.ts` and `EditorEvents.tsx` for reads of that action type.
     - If nothing reads the payload, remove the argument at the call sites. The action's payload changes from `{}` or `null` to `undefined`, which nothing observes except the devtools.
     - If something reads it, type the payload as what's passed (rule 1).
  3. **"Expected at least 1 argument" (TS2555).** Callers dispatch without a payload, but the reducer declares one. Make the payload optional, `PayloadAction<T | undefined>`, only if the reducer already handles `undefined`. Otherwise stop and ask.
  4. **A draft type rejects a class instance or a readonly array.** Example: `rnaBuilderSlice.ts:163`, where `LabeledNodesWithPositionInSequence[]` isn't assignable to `WritableDraft<…>[]`.
     - Wrap only that value in `castDraft(...)`.
     - This is allowed only in the three files that already import `castDraft` (design Decision 4). Elsewhere, stop and ask.
     - Never use `as` on the whole state, and never return `{ ...state, … }` to dodge the draft type.
  5. **Wrong argument types inside components.** Examples: `Editor.tsx`'s theme as `DeepPartial<EditorTheme>` vs `DeepPartial<ThemeType>`, and the canvas as `SVGSVGElement | null`.
     - Fix the declared payload type to what the component really passes, e.g. `canvas: SVGSVGElement | null` if the reducer handles `null`, or the narrower theme type that's actually used.
     - If the reducer doesn't handle `null`, the component must narrow it with an `if` that keeps today's behaviour. Show the diff in the section report.
  6. **Test fixtures that don't match their types** (`PresetPreview.test.tsx`, the slice tests). Complete the fixture objects with the missing required fields, using the values the components already treat as defaults. Don't add casts.
  7. **`setupTests.tsx` globals.** Type `initialState` as `Partial<RootState>` in `withStoreProvider` and `withThemeAndStoreProvider`, and in their declarations in `typings.d.ts`.
- [ ] 3.6 Run `npx tsc --noEmit -p .`. **Expected:** the same output as `.react-redux-baseline/tsc-macro.txt`, which is zero errors.
- [ ] 3.7 Run `npx jest`. **Expected:** green, with the counts from step 0.4 plus the 2 new tests.
- [ ] 3.8 **Code check:** run `npm test -w packages/ketcher-macromolecules` and `npm run build:macromolecules`.
  - The build emits declarations, so it catches TS2742 or TS4023 ("inferred type cannot be named") on the slices. That's why the `Slice` annotations may have been added originally.
  - If it fails, annotate with the full generic form, `Slice<EditorState, typeof editorReducers, 'editor'>`. To do that, move the `reducers` object into a `const editorReducers = { … } satisfies SliceCaseReducers<EditorState>`. Don't go back to the bare `Slice`.
- [ ] 3.9 **No commit yet.** PR 3 also contains Section 4, so the release gate runs at step 4.9. Ask the user whether to commit this section on its own now. The message would be `#12227 - Infer macromolecules store types`.

## 4. Dev checks: explicit configuration with tracked exceptions

**Files:**

- Create: `packages/ketcher-react/src/script/ui/state/devChecks.ts` and `devChecks.test.ts`.
- Create: `packages/ketcher-macromolecules/src/state/devChecks.ts` and `devChecks.test.ts`.
- Modify: `packages/ketcher-react/src/script/ui/state/store.ts` and `packages/ketcher-macromolecules/src/state/store.ts`.

**Interfaces produced** (the same in both packages, by convention per design Decision 2; there's no shared runtime helper):

- `interface DevCheckException { check: 'serializableCheck' | 'immutableCheck'; path: string; reason: string; removedBy: string }`. A `path` of `'*'` means the whole check is off.
- `const DEV_CHECK_EXCEPTIONS: readonly DevCheckException[]`. The metrics script counts entries by their `removedBy:` keys.
- `devCheckOptions(exceptions): { serializableCheck: false | { ignoredPaths: string[] }; immutableCheck: false | { ignoredPaths: string[] } }`.

- [ ] 4.1 Write the failing `packages/ketcher-macromolecules/src/state/devChecks.test.ts`. Write the same file in `ketcher-react` under `src/script/ui/state/`, changing the second `it` to expect both checks `false`.

  ```ts
  import { DEV_CHECK_EXCEPTIONS, devCheckOptions } from './devChecks';

  describe('devCheckOptions', () => {
    it('turns a check off when an exception covers the whole store', () => {
      expect(
        devCheckOptions([
          {
            check: 'serializableCheck',
            path: '*',
            reason: 'r',
            removedBy: '#2',
          },
          {
            check: 'immutableCheck',
            path: 'a.b',
            reason: 'r',
            removedBy: '#2',
          },
        ]),
      ).toEqual({
        serializableCheck: false,
        immutableCheck: { ignoredPaths: ['a.b'] },
      });
    });

    it('matches this store’s exceptions', () => {
      expect(devCheckOptions(DEV_CHECK_EXCEPTIONS)).toEqual({
        serializableCheck: false,
        immutableCheck: { ignoredPaths: ['editor.editor'] },
      });
    });

    it('documents every exception', () => {
      for (const exception of DEV_CHECK_EXCEPTIONS) {
        expect(exception.reason.length).toBeGreaterThan(20);
        expect(exception.removedBy).toMatch(/^react-redux #\d$/);
      }
    });
  });
  ```

- [ ] 4.2 Create `packages/ketcher-macromolecules/src/state/devChecks.ts`:

  ```ts
  /**
   * Redux dev-check exceptions for this store (react-redux-foundation,
   * Decision 12). The list may only shrink; scripts/react-redux/metrics.ts
   * counts its entries.
   */
  export interface DevCheckException {
    check: 'serializableCheck' | 'immutableCheck';
    /** A dot-separated state path, or '*' when the check is off for the whole store. */
    path: string;
    reason: string;
    removedBy: string;
  }

  export const DEV_CHECK_EXCEPTIONS: readonly DevCheckException[] = [
    {
      check: 'serializableCheck',
      path: '*',
      reason:
        'State holds the CoreEditor, DOM elements, entity instances and modal callbacks.',
      removedBy: 'react-redux #2',
    },
    {
      check: 'immutableCheck',
      path: 'editor.editor',
      reason:
        'The live CoreEditor changes itself between dispatches; walking it is slow and reports its internals as state mutations.',
      removedBy: 'react-redux #2',
    },
  ];

  type CheckOptions = false | { ignoredPaths: string[] };

  export function devCheckOptions(exceptions: readonly DevCheckException[]): {
    serializableCheck: CheckOptions;
    immutableCheck: CheckOptions;
  } {
    const optionsFor = (check: DevCheckException['check']): CheckOptions => {
      const entries = exceptions.filter(
        (exception) => exception.check === check,
      );
      if (entries.some((exception) => exception.path === '*')) {
        return false;
      }
      return { ignoredPaths: entries.map((exception) => exception.path) };
    };

    return {
      serializableCheck: optionsFor('serializableCheck'),
      immutableCheck: optionsFor('immutableCheck'),
    };
  }
  ```

  - **`ketcher-react`'s copy** has the same code, with these two entries, both `path: '*'` and `removedBy: 'react-redux #2'`:
    - `serializableCheck`, reason: "The root reducer injects the editor, server and options into every action; state holds the editor, the server, modal callbacks and Struct libraries."
    - `immutableCheck`, reason: "State holds the live editor and server, which change themselves between dispatches."
  - **If step 0.5 recorded "state mutation" errors** for macro paths other than `editor.editor`, such as `editor.preview.target` or `modal.additionalProps`, add one `immutableCheck` entry per path. Give each a reason naming the live object, update the test's expected `ignoredPaths`, and list them in the section report.

- [ ] 4.3 Add a failing store test to `packages/ketcher-macromolecules/src/state/devChecks.test.ts`. It covers Review Focus 4.

  ```ts
  import { configureAppStore } from './store';

  describe('macromolecules store dev checks', () => {
    const initial = configureAppStore().getState();

    it('ignores changes inside the live editor', () => {
      // A stand-in for CoreEditor: it changes itself between dispatches.
      const liveEditor = { handlers: [] as number[] };
      const store = configureAppStore({
        editor: { ...initial.editor, editor: liveEditor as never },
      });

      liveEditor.handlers.push(1);

      expect(() => store.dispatch({ type: 'test/noop' })).not.toThrow();
    });

    it('still reports mutations elsewhere in state', () => {
      const nested = { value: 1 };
      const store = configureAppStore({
        modal: { ...initial.modal, additionalProps: { nested } as never },
      });

      nested.value = 2;

      expect(() => store.dispatch({ type: 'test/noop' })).toThrow(/mutation/i);
    });
  });
  ```

  - **Why the preloaded objects aren't frozen.** RTK's slice reducers only run Immer, which freezes, when a case reducer matches. A no-op action returns the preloaded state untouched, so `immutableCheck` is what notices the change.
  - **The casts are test-only stand-ins.** If the modal state has no `additionalProps` field, use any object-valued field outside `editor.editor`.

- [ ] 4.4 Run `npx jest src/state/devChecks.test.ts`.
  - **Expected:**
    - `ignores changes inside the live editor` FAILS, because the editor is still walked;
    - `still reports mutations elsewhere in state` PASSES;
    - `devCheckOptions` FAILS, because `devChecks.ts` doesn't exist yet. Create the file from step 4.2 first, then rerun.
- [ ] 4.5 Use the exceptions in both stores.
  - Macro `state/store.ts`: replace the `getDefaultMiddleware({ … serializableCheck: false })` argument with `getDefaultMiddleware(devCheckOptions(DEV_CHECK_EXCEPTIONS))`, add `import { DEV_CHECK_EXCEPTIONS, devCheckOptions } from './devChecks';`, and delete the TODO comment, which the exception's `reason` replaces.
  - React `state/store.ts`: replace `immutableCheck: false, serializableCheck: false` with `...devCheckOptions(DEV_CHECK_EXCEPTIONS)`, keeping `thunk: { extraArgument: extra }`.
- [ ] 4.6 Run both packages' `npx jest`. **Expected:** green.
- [ ] 4.7 Switch the macro test that worked around the check to the real factory.
  - `SequenceSyncEditModeButton.test.tsx` builds its own store with `immutableCheck: false` because of the editor (see its comment at lines 95–101).
  - Replace its `configureStore({ … } as never)` with `configureAppStore({ editor: { ...configureAppStore().getState().editor, editor: fakeEditor, activeTool: 'select-rectangle', isContextMenuActive: false, selectedMenuGroupItems: {} } })`.
  - Delete the comment and the `configureStore` and reducer imports.
  - Run it. **Expected:** PASS. If the `immutableCheck` now reports a path inside `fakeEditor`'s event objects, that path is under `editor.editor` and is ignored. Any other path is a real finding: stop and report it.
- [ ] 4.8 **Code check:** run `npm test -w packages/ketcher-react -w packages/ketcher-macromolecules`.
- [ ] 4.9 **Release gate** (PR 3, covering Sections 3 and 4): the same as step 1.13. In the manual walkthrough, compare the dev console with `console-dev.txt`. **Expected:** the same output, minus any "state mutation detected" errors for `editor.editor`.
- [ ] 4.10 **STOP:** ask to commit, using the message `#12227 - Configure Redux dev checks with tracked exceptions`. If Section 3 wasn't committed separately, use `#12227 - Infer macromolecules store types and configure dev checks`.

## 5. Strict typed hooks

**Files:**

- Modify:
  - `packages/ketcher-react/src/script/ui/state/store.types.ts`;
  - `packages/ketcher-react/src/script/ui/dialog/template/template-attach.tsx`;
  - `state/action/index.ts`, `state/functionalGroups/index.ts` and `state/saltsAndSolvents/index.ts`, only if step 2.3's type exports are missing;
  - `packages/ketcher-macromolecules/src/hooks/stateHooks.ts`.
- Modify: raw-hook call sites in `ketcher-react` (14 files):
  - `App/App.tsx`;
  - `dialog/AbbreviationLookup/AbbreviationLookup.container.tsx`, `dialog/AbbreviationLookup/AbbreviationLookup.tsx`, `dialog/AbbreviationLookup/hooks/useOptions.tsx`;
  - `dialog/template/TemplateDialog.tsx`;
  - `views/components/ContextMenu/hooks/useFunctionalGroupEoc.ts`, `views/components/ContextMenu/hooks/useFunctionalGroupRemove.ts`, `views/components/ContextMenu/menuItems/SelectionMenuItems.tsx`;
  - `views/components/MonomerCreationWizard/MonomerCreationWizard.tsx`, `MonomerCreationWizardFields.tsx`, `MonomerCreationWizardBackdrop.tsx`, `RnaPresetTabs.tsx`;
  - `views/modal/components/document/Open/components/CDXStructuresViewer/CDXStructuresViewer.tsx`;
  - `views/modal/components/toolbox/Atom/AtomElement/AtomElement.tsx`.

  All paths are under `src/script/ui/`.

- Modify: raw-hook call sites in macromolecules (11 files), all under `src/components/`:
  - `DragGhost/DragGhost.tsx`, `Ruler/RulerArea.tsx`, `preview/Preview.tsx`;
  - `monomerLibrary/monomerLibraryItem/hooks/useLibraryItemDrag.tsx`, `monomerLibrary/monomerLibraryItem/hooks/useDisabledForSequenceMode.ts`;
  - `monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/RnaEditorExpanded.tsx`;
  - `monomerLibrary/RnaBuilder/RnaElementsView/RnaElements.tsx`, `RnaElementsTabsView.tsx`, `RnaElementsAccordionView.tsx`, `PresetPhosphateFilterPopup.tsx`;
  - `monomerLibrary/RnaPresetGroup/RnaPresetGroup.tsx`.

**Interfaces produced:**

- `StoreState`, now `RootState` from `rootReducer.ts`: every key the store has, typed by its reducer. `templates`, `functionalGroups` and `saltsAndSolvents` are `any` until react-redux #3, and `modal` is `ModalState | null`, where `ModalState` comes from `state/modal`.
- Macro `useAppSelector` and `useAppDispatch`, made with `.withTypes()`.

- [ ] 5.1 Check that `ActionState`, `FGState` and `SaltsAndSolventsState` are exported. Step 2.3 exported them; if any isn't, export it as a type-only change.
- [ ] 5.2 Make `StoreState` the state type inferred from the reducers.
  1. In `store.types.ts`:
     - Delete the TODO comment, the `TemplatesState`, `ModalState` and `StoreState` interfaces, and the `Struct` and `OptionsState` type imports. Keep the `export type { … } from './options/types'` re-export.
     - Before deleting them, run `grep -rn "TemplatesState\|store.types'" packages/ketcher-react/src` and confirm that only `StoreState` is imported from this file. On 2026-10-16 its users were `state/hooks.ts`, `dialog/template/template-attach.tsx` and `views/modal/components/process/Analyse/Analyse.tsx`, and nothing used `TemplatesState` or this file's `ModalState`. The file isn't part of the package's public exports.
     - Add:
       ```ts
       import type { RootState } from './rootReducer';

       // Inferred from the reducers, so it follows what they actually store.
       // Reducers that spread untyped action data make their key `any`
       // (templates, functionalGroups, saltsAndSolvents); those keys become
       // typed when react-redux #3 moves the reducers to createSlice.
       export type StoreState = RootState;
       ```
  2. Fix the one error this surfaces. In `dialog/template/template-attach.tsx`, `mapStateToProps` reads `store.modal.form`, and `modal` is `null` while no dialog is open (TS18047). Change it to `store.modal?.form`.
     - The attach dialog only renders while its modal is open, so every reachable state reads the same value; only the unreachable `null` case no longer throws.
     - Note for the section report: the spread of `store.templates.attach`, which is `any`, makes the whole props object `any`. That hides that `ModalFormState` doesn't match the dialog's `FormState`. React-redux #3 surfaces it when `templates` gets a type.
  3. Run `cd packages/ketcher-react && npx tsc --noEmit -p .` and `npm run test:circ`.
     - **Expected:** both clean. A trial on 2026-10-16, with Section 2's `rootReducer.ts` and step 5.4's hook rewrite applied, found only the `template-attach.tsx` error.
     - `store.types.ts` imports `rootReducer.ts` for a type only, and `dpdm -T` ignores type imports, so this creates no cycle.
     - If `tsc` reports other errors, they are in code that reads a key whose type is now accurate. Fix them under the step 3.5 rules.
- [ ] 5.3 Make the macro hooks use `.withTypes()`. In `hooks/stateHooks.ts`, replace the `react-redux` import and the two hook lines with:
  ```ts
  import { useDispatch, useSelector } from 'react-redux';
  …
  export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
  export const useAppSelector = useSelector.withTypes<RootState>();
  ```
- [ ] 5.4 Replace the raw hooks with this script. It adds the right relative import in `ketcher-react` and the `hooks` alias import in macromolecules.

  ```bash
  python3 - <<'EOF'
  import os, re
  REACT_HOOKS = 'packages/ketcher-react/src/script/ui/state/hooks'
  FILES = {
      'react': """App/App.tsx dialog/AbbreviationLookup/AbbreviationLookup.container.tsx
  dialog/AbbreviationLookup/AbbreviationLookup.tsx dialog/AbbreviationLookup/hooks/useOptions.tsx
  dialog/template/TemplateDialog.tsx views/components/ContextMenu/hooks/useFunctionalGroupEoc.ts
  views/components/ContextMenu/hooks/useFunctionalGroupRemove.ts views/components/ContextMenu/menuItems/SelectionMenuItems.tsx
  views/components/MonomerCreationWizard/MonomerCreationWizard.tsx views/components/MonomerCreationWizard/MonomerCreationWizardFields.tsx
  views/components/MonomerCreationWizard/MonomerCreationWizardBackdrop.tsx views/components/MonomerCreationWizard/RnaPresetTabs.tsx
  views/modal/components/document/Open/components/CDXStructuresViewer/CDXStructuresViewer.tsx
  views/modal/components/toolbox/Atom/AtomElement/AtomElement.tsx""".split(),
      'macro': """DragGhost/DragGhost.tsx Ruler/RulerArea.tsx preview/Preview.tsx
  monomerLibrary/monomerLibraryItem/hooks/useLibraryItemDrag.tsx
  monomerLibrary/monomerLibraryItem/hooks/useDisabledForSequenceMode.ts
  monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/RnaEditorExpanded.tsx
  monomerLibrary/RnaBuilder/RnaElementsView/RnaElements.tsx
  monomerLibrary/RnaBuilder/RnaElementsView/RnaElementsTabsView.tsx
  monomerLibrary/RnaBuilder/RnaElementsView/RnaElementsAccordionView.tsx
  monomerLibrary/RnaBuilder/RnaElementsView/PresetPhosphateFilterPopup.tsx
  monomerLibrary/RnaPresetGroup/RnaPresetGroup.tsx""".split(),
  }
  ROOTS = {
      'react': 'packages/ketcher-react/src/script/ui/',
      'macro': 'packages/ketcher-macromolecules/src/components/',
  }
  IMPORT = re.compile(r"import \{([^}]*)\} from 'react-redux';\n")
  for pkg, files in FILES.items():
      for rel in files:
          path = ROOTS[pkg] + rel
          text = open(path).read()
          match = IMPORT.search(text)
          names = [n.strip() for n in match.group(1).split(',') if n.strip()]
          used = [h for h in ('useSelector', 'useDispatch') if h in names]
          rest = [n for n in names if n not in used]
          typed = sorted({'useSelector': 'useAppSelector', 'useDispatch': 'useAppDispatch'}[h] for h in used)
          if pkg == 'react':
              source = os.path.relpath(REACT_HOOKS, os.path.dirname(path))
              source = source if source.startswith('.') else './' + source
          else:
              source = 'hooks'
          replacement = (f"import {{ {', '.join(rest)} }} from 'react-redux';\n" if rest else '')
          text = text[:match.start()] + replacement + text[match.end():]
          existing = re.search(rf"import \{{([^}}]*)\}} from '{re.escape(source)}';", text)
          if existing:
              merged = sorted({n.strip() for n in existing.group(1).split(',') if n.strip()} | set(typed))
              text = text.replace(existing.group(0), f"import {{ {', '.join(merged)} }} from '{source}';")
          else:
              first_import = re.search(r'^import ', text, re.M).start()
              text = text[:first_import] + f"import {{ {', '.join(typed)} }} from '{source}';\n" + text[first_import:]
          text = re.sub(r'\buseSelector\(', 'useAppSelector(', text)
          text = re.sub(r'\buseDispatch\(', 'useAppDispatch(', text)
          text = re.sub(r'\buseSelector<[^>]*>\(', 'useAppSelector(', text)
          text = re.sub(r'\buseDispatch<[^>]*>\(', 'useAppDispatch(', text)
          open(path, 'w').write(text)
          print(pkg, rel, used)
  EOF
  CHANGED=$(git diff --name-only -- packages/ketcher-react/src packages/ketcher-macromolecules/src)
  npx eslint --fix $CHANGED && npx prettier --write $CHANGED
  ```

  - `eslint --fix` runs on the changed files only, so it can't autofix unrelated warnings elsewhere.
  - If the script raises because a file has no single-line `react-redux` import, edit that file by hand the same way.
  - The new import goes above the first `import` line. `import/order` and Prettier settle its final position.

- [ ] 5.5 Check that only the definition files still use the raw hooks:
  ```bash
  grep -rnE "\b(useSelector|useDispatch|TypedUseSelectorHook)\b" packages/ketcher-react/src packages/ketcher-macromolecules/src | grep -v -E "state/hooks.ts|hooks/stateHooks.ts"
  ```
  **Expected:** no matches, except mocks in test files that `jest.mock('react-redux')`. List any you find; Section 6 decides whether they're exempt.
- [ ] 5.6 Run `npx tsc --noEmit -p .` in both packages. Typed hooks now check the inline selectors. Fix any errors under the step 3.5 rules.
- [ ] 5.7 **Code check:** run `npm test -w packages/ketcher-react -w packages/ketcher-macromolecules`.
- [ ] 5.8 **Release gate** (PR 4): the same as step 1.13.
- [ ] 5.9 **STOP:** ask to commit, using the message `#12228 - Use typed Redux hooks only`.

## 6. Lint guardrails

**Coordination with the UI-kit plan** (`openspec/changes/ui-kit-foundation/tasks.md`, Section 7). That plan inlines a `restrictedImports(...patterns)` helper in `eslint.config.mjs`. Whichever change lands second moves its bans onto the other's mechanism.

- **If UI-kit Section 7 hasn't landed:** build the helper below. Then update the UI-kit plan's Section 7 in its own branch to call `restrictedImportBlocks`, with `LEGACY_STYLING_ALLOWLIST` as an exemption list.
- **If it has landed:** replace its helper and the extra blocks with `restrictedImportBlocks`. Express its restrictions as `{ id: 'legacyStyling', patterns: [LEGACY_STYLING_RESTRICTION], exempt: LEGACY_STYLING_ALLOWLIST }` and `{ id: 'deepKitImport', patterns: [DEEP_KIT_IMPORT_RESTRICTION] }`. Keep the kit-folder block as it is: it applies to `src/ui-kit/**` only, and it must list every restriction that applies there.

**Files:**

- Create:
  - `scripts/lint/restrictedImports.ts` and `scripts/lint/restrictedImports.test.ts`;
  - `scripts/react-redux/rules.ts`, holding the restrictions, selectors and permanent exemptions;
  - `scripts/react-redux/collect.ts`, the source scanners shared with the metrics;
  - `scripts/react-redux/allowlists.ts`, the CLI with `--write` and `--check`;
  - `scripts/react-redux/allowlists.generated.json`, generated;
  - `scripts/package.json`, which marks the scripts as ES modules, and `scripts/tsconfig.json`, which type-checks them. If the UI-kit change (#12231) has added them already, modify them instead;
  - `scripts/react-redux/collect.test.ts` and `scripts/react-redux/lintRules.test.ts`.
- Modify: `eslint.config.mjs`, and the root `package.json` (scripts).

**Interfaces produced:**

- `restrictedImportBlocks(files: string[], restrictions: Restriction[]): Linter.Config[]`, from `scripts/lint/restrictedImports.ts`. A `Restriction` is `{ id: string; paths?: RestrictedPath[]; patterns?: RestrictedPattern[]; exempt?: string[] }`, where `exempt` holds repo-relative file paths and no globs. `Linter` is ESLint's type namespace.
- From `rules.ts`: `REDUX_RESTRICTIONS(allowlists: Allowlists): Restriction[]`, `CLASS_COMPONENT_SELECTORS`, `PERMANENT_EXEMPTIONS`, `UI_SOURCE_GLOBS`, `VIOLATION_KINDS`, and the types `ViolationKind` (`'connect' | 'classComponents' | 'legacyStoreApis' | 'storeConstruction' | 'castDraft'`) and `Allowlists` (`Record<ViolationKind, string[]>`).
- `collectViolations(rootDir: string): Allowlists`, from `collect.ts`. Each list is sorted and repo-relative, and permanent exemptions are excluded. `collect.ts` also exports `sourceFiles(rootDir: string): string[]` and `importedNames(text: string, moduleName: string): Set<string>`.
- `allowlists.generated.json`, the generated `Allowlists`. It is data only, so it is JSON; `eslint.config.mjs` and the tests import it with `with { type: 'json' }`.
- From `allowlists.ts`: `compareAllowlists(current, committed, base?)`, each a `Partial<Allowlists>`, returning `string[]`; and `gitShow(ref: string, path: string): string | undefined`.
- CLI: `node scripts/react-redux/allowlists.ts --write | --check [--base <git-ref>]`.
  - `--check` fails when a regenerated list differs from the committed one.
  - With `--base`, it also fails when the committed list has an entry the base ref's list doesn't.

- [ ] 6.1 Write the failing helper test `scripts/lint/restrictedImports.test.ts`:

  ```ts
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import type { Linter } from 'eslint';
  import {
    restrictedImportBlocks,
    type Restriction,
  } from './restrictedImports.ts';

  const A: Restriction = { id: 'a', paths: [{ name: 'a' }] };
  const B: Restriction = {
    id: 'b',
    paths: [{ name: 'b' }],
    exempt: ['x.ts', 'y.ts'],
  };
  const C: Restriction = {
    id: 'c',
    patterns: [{ group: ['c/*'] }],
    exempt: ['y.ts'],
  };
  const rule = (block: Linter.Config | undefined) =>
    block?.rules?.['no-restricted-imports'];

  test('the base block applies every restriction', () => {
    const [base] = restrictedImportBlocks(['src/**'], [A, B, C]);
    assert.deepEqual(base?.files, ['src/**']);
    assert.deepEqual(rule(base), [
      'error',
      { paths: [{ name: 'a' }, { name: 'b' }], patterns: [{ group: ['c/*'] }] },
    ]);
  });

  test('each file gets one block with only the restrictions that still apply', () => {
    const [, ...blocks] = restrictedImportBlocks(['src/**'], [A, B, C]);
    const byFile = new Map(
      blocks.flatMap((block) =>
        (block.files ?? []).map(
          (file): [string, Linter.RuleEntry | undefined] => [
            String(file),
            rule(block),
          ],
        ),
      ),
    );
    assert.deepEqual(byFile.get('x.ts'), [
      'error',
      { paths: [{ name: 'a' }], patterns: [{ group: ['c/*'] }] },
    ]);
    assert.deepEqual(byFile.get('y.ts'), [
      'error',
      { paths: [{ name: 'a' }], patterns: [] },
    ]);
    assert.equal(blocks.length, 2);
  });

  test('a file exempt from everything turns the rule off', () => {
    const [, block] = restrictedImportBlocks(
      ['src/**'],
      [{ ...A, exempt: ['z.ts'] }],
    );
    assert.deepEqual(block, {
      files: ['z.ts'],
      rules: { 'no-restricted-imports': 'off' },
    });
  });

  test('glob characters in exempt paths are rejected', () => {
    assert.throws(
      () =>
        restrictedImportBlocks(['src/**'], [{ ...A, exempt: ['a/[id].ts'] }]),
      /glob/,
    );
  });
  ```

- [ ] 6.2 Implement `scripts/lint/restrictedImports.ts`:

  ```ts
  /**
   * Builds the flat-config blocks for `no-restricted-imports` in the UI packages.
   *
   * In flat config, the last matching block that sets a rule replaces it, so
   * two blocks that each ban something for overlapping files silently drop one
   * set of bans. Every ban therefore goes through this helper, which gives each
   * file exactly one effective value: the base block applies every
   * restriction, and one extra block per distinct set of exemptions applies the
   * rest. Used by react-redux-foundation and ui-kit-foundation.
   */
  import type { Linter } from 'eslint';

  /** One entry of the rule's `paths` option. */
  export interface RestrictedPath {
    name: string;
    message?: string;
    importNames?: string[];
    allowImportNames?: string[];
  }

  /** One entry of the rule's `patterns` option. */
  export interface RestrictedPattern {
    group: string[];
    message?: string;
    importNames?: string[];
  }

  export interface Restriction {
    id: string;
    paths?: RestrictedPath[];
    patterns?: RestrictedPattern[];
    /** Repo-relative files the restriction doesn't apply to; no globs. */
    exempt?: string[];
  }

  const GLOB_CHARS = /[[\]{}()*?!]/;

  const ruleValue = (active: Restriction[]): Linter.RuleEntry =>
    active.length === 0
      ? 'off'
      : [
          'error',
          {
            paths: active.flatMap((restriction) => restriction.paths ?? []),
            patterns: active.flatMap(
              (restriction) => restriction.patterns ?? [],
            ),
          },
        ];

  export function restrictedImportBlocks(
    files: string[],
    restrictions: Restriction[],
  ): Linter.Config[] {
    const exemptIdsByFile = new Map<string, Set<string>>();
    for (const restriction of restrictions) {
      for (const file of restriction.exempt ?? []) {
        if (GLOB_CHARS.test(file)) {
          throw new Error(`Exempt paths are exact files, not globs: ${file}`);
        }
        const ids = exemptIdsByFile.get(file) ?? new Set<string>();
        ids.add(restriction.id);
        exemptIdsByFile.set(file, ids);
      }
    }

    const filesByExemptIds = new Map<string, string[]>();
    for (const [file, ids] of exemptIdsByFile) {
      const key = [...ids].sort().join(',');
      filesByExemptIds.set(key, [...(filesByExemptIds.get(key) ?? []), file]);
    }

    return [
      { files, rules: { 'no-restricted-imports': ruleValue(restrictions) } },
      ...[...filesByExemptIds].map(([key, groupFiles]) => {
        const exemptIds = new Set(key.split(','));
        return {
          files: groupFiles.sort(),
          rules: {
            'no-restricted-imports': ruleValue(
              restrictions.filter(
                (restriction) => !exemptIds.has(restriction.id),
              ),
            ),
          },
        };
      }),
    ];
  }
  ```

- [ ] 6.3 Set up type checking for the scripts, and add the script that runs them. The UI-kit change (#12231) sets up the same two files. If it has landed, only add this change's entries (`lint/**/*.ts`, `react-redux/**/*.ts`, `react-redux/**/*.json`) to the existing `include`.
  1. Create `scripts/package.json`, so that Node and `tsc` treat the scripts as ES modules. Without it the root `package.json`, which has no `"type"`, makes `tsc` read them as CommonJS and reject every `import` (`TS1295`):
     ```json
     {
       "private": true,
       "type": "module"
     }
     ```
  2. Create `scripts/tsconfig.json`. Node runs the scripts by stripping their types without checking them, so this config is what checks them:
     ```jsonc
     {
       // Repo scripts run by Node directly, which strips the types without
       // checking them; this config checks them (npm run test:guardrail-scripts).
       "compilerOptions": {
         "target": "es2024",
         "module": "nodenext",
         "strict": true,
         "noEmit": true,
         "allowImportingTsExtensions": true,
         "erasableSyntaxOnly": true,
         "verbatimModuleSyntax": true,
         "resolveJsonModule": true,
         "skipLibCheck": true,
         "types": ["node"],
       },
       "include": [
         "lint/**/*.ts",
         "react-redux/**/*.ts",
         "react-redux/**/*.json",
       ],
     }
     ```
     - `erasableSyntaxOnly` rejects syntax Node can't strip, such as `enum` and parameter properties.
     - `verbatimModuleSyntax` requires `import type` for types, because Node keeps every other import.
     - Relative imports name the `.ts` file, as Node requires (`allowImportingTsExtensions`).
     - The existing `scripts/build-run.mjs` isn't included and stays as it is. Don't run it to try things out: it deletes the packages' `dist` folders and starts a full build.
  3. Add the root script `"test:guardrail-scripts": "tsc -p scripts/tsconfig.json && node --test 'scripts/lint/*.test.ts' 'scripts/react-redux/*.test.ts'"`.
  - `node --test` needs glob patterns; Node 25 treats a directory argument as a module path and fails.
  - If the UI-kit change has landed, its `test:ui-kit-scripts` stays as it is. Both scripts run `tsc` over the whole `scripts/` config, so each checks the other's files too.

  Run it. **Expected:** `tsc` reports nothing, and the helper tests PASS.

- [ ] 6.4 Create `scripts/react-redux/rules.ts`:

  ```ts
  /** Lint rules of react-redux-foundation (design Decisions 4, 9, 11, 14). */
  import type { Restriction } from '../lint/restrictedImports.ts';

  export type ViolationKind =
    | 'connect'
    | 'classComponents'
    | 'legacyStoreApis'
    | 'storeConstruction'
    | 'castDraft';

  export const VIOLATION_KINDS: ViolationKind[] = [
    'connect',
    'classComponents',
    'legacyStoreApis',
    'storeConstruction',
    'castDraft',
  ];

  /** Repo-relative files per kind; the shape of `allowlists.generated.json`. */
  export type Allowlists = Record<ViolationKind, string[]>;

  export const UI_SOURCE_GLOBS = [
    'packages/ketcher-react/**/*.{ts,tsx,js,jsx}',
    'packages/ketcher-macromolecules/**/*.{ts,tsx,js,jsx}',
  ];

  const SPEC = 'openspec/changes/react-redux-foundation';

  /** Files that legitimately use a banned API for good; never generated, never shrinking. */
  export const PERMANENT_EXEMPTIONS: {
    rawHooks: string[];
    storeConstruction: string[];
    classComponents: string[];
  } = {
    rawHooks: [
      'packages/ketcher-react/src/script/ui/state/hooks.ts',
      'packages/ketcher-macromolecules/src/hooks/stateHooks.ts',
    ],
    storeConstruction: [
      'packages/ketcher-react/src/script/ui/state/store.ts',
      'packages/ketcher-macromolecules/src/state/store.ts',
    ],
    // Error boundaries must be classes; none exist yet.
    classComponents: [],
  };

  export const REDUX_RESTRICTIONS = (allowlists: Allowlists): Restriction[] => [
    {
      id: 'bundledLibraries',
      paths: ['redux', 'redux-thunk', 'reselect', 'redux-saga'].map((name) => ({
        name,
        message: `Import from '@reduxjs/toolkit' instead (${SPEC}, Decision 4).`,
      })),
    },
    {
      id: 'immer',
      paths: [
        {
          name: 'immer',
          message: `Immer's API comes from '@reduxjs/toolkit' (${SPEC}, Decision 4).`,
        },
      ],
      exempt: allowlists.castDraft,
    },
    {
      id: 'immerOtherThanCastDraft',
      paths: [
        {
          name: 'immer',
          allowImportNames: ['castDraft'],
          message: `Only castDraft may come from 'immer' (${SPEC}, Decision 4).`,
        },
      ],
    },
    {
      id: 'legacyStoreApis',
      paths: [
        {
          name: '@reduxjs/toolkit',
          importNames: [
            'createStore',
            'legacy_createStore',
            'applyMiddleware',
            'compose',
            'combineReducers',
          ],
          message: `Use configureStore and combineSlices (${SPEC}, Decision 4).`,
        },
      ],
      exempt: allowlists.legacyStoreApis,
    },
    {
      id: 'storeConstruction',
      paths: [
        {
          name: '@reduxjs/toolkit',
          importNames: ['configureStore'],
          message: `Build stores with the package's factory, or renderWithStore in tests (${SPEC}, Decision 15).`,
        },
      ],
      exempt: [
        ...PERMANENT_EXEMPTIONS.storeConstruction,
        ...allowlists.storeConstruction,
      ],
    },
    {
      id: 'connect',
      paths: [
        {
          name: 'react-redux',
          importNames: ['connect'],
          message: `Use useAppSelector and useAppDispatch instead of connect (${SPEC}, Decision 11).`,
        },
      ],
      exempt: allowlists.connect,
    },
    {
      id: 'rawHooks',
      paths: [
        {
          name: 'react-redux',
          importNames: [
            'useSelector',
            'useDispatch',
            'useStore',
            'TypedUseSelectorHook',
          ],
          message: `Use the package's typed hooks, useAppSelector and useAppDispatch (${SPEC}, Decision 9).`,
        },
      ],
      exempt: PERMANENT_EXEMPTIONS.rawHooks,
    },
  ];

  export const CLASS_COMPONENT_SELECTORS = [
    'ClassDeclaration',
    'ClassExpression',
  ]
    .flatMap((node) => [
      `${node}[superClass.name=/^(Pure)?Component$/]`,
      `${node}[superClass.property.name=/^(Pure)?Component$/]`,
    ])
    .map((selector) => ({
      selector,
      message: `Write a function component (${SPEC}, Decision 11). Error boundaries go in PERMANENT_EXEMPTIONS.classComponents.`,
    }));
  ```

- [ ] 6.5 Write the failing scanner test `scripts/react-redux/collect.test.ts`:

  ```ts
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
  import { tmpdir } from 'node:os';
  import { dirname, join } from 'node:path';
  import { collectViolations } from './collect.ts';

  const fixture = (files: Record<string, string>) => {
    const root = mkdtempSync(join(tmpdir(), 'react-redux-collect-'));
    for (const [file, text] of Object.entries(files)) {
      mkdirSync(dirname(join(root, file)), { recursive: true });
      writeFileSync(join(root, file), text);
    }
    return root;
  };

  const R = 'packages/ketcher-react/src';
  const M = 'packages/ketcher-macromolecules/src';

  test('finds each kind of violation, including multi-line imports', () => {
    const root = fixture({
      [`${R}/a.tsx`]: "import {\n  connect,\n} from 'react-redux';\n",
      [`${R}/b.tsx`]: 'class B extends React.PureComponent<Props> {}\n',
      [`${R}/c.tsx`]: 'export default class C extends Component {}\n',
      [`${R}/d.test.tsx`]:
        "import { combineReducers, createStore } from '@reduxjs/toolkit';\n",
      [`${M}/e.test.tsx`]:
        "import { configureStore } from '@reduxjs/toolkit';\n",
      [`${M}/f.ts`]: "import { castDraft } from 'immer';\n",
      [`${M}/g.ts`]:
        "import { createSlice } from '@reduxjs/toolkit';\nclass Model {}\n",
      [`${R}/script/ui/state/store.ts`]:
        "import { configureStore } from '@reduxjs/toolkit';\n",
    });

    assert.deepEqual(collectViolations(root), {
      connect: [`${R}/a.tsx`],
      classComponents: [`${R}/b.tsx`, `${R}/c.tsx`],
      legacyStoreApis: [`${R}/d.test.tsx`],
      storeConstruction: [`${M}/e.test.tsx`],
      castDraft: [`${M}/f.ts`],
    });
  });

  test('ignores node_modules and dist', () => {
    const root = fixture({
      [`packages/ketcher-react/node_modules/x/a.js`]:
        "import { connect } from 'react-redux';\n",
      [`packages/ketcher-react/dist/a.js`]:
        "import { connect } from 'react-redux';\n",
    });
    assert.deepEqual(collectViolations(root).connect, []);
  });
  ```

- [ ] 6.6 Implement `scripts/react-redux/collect.ts`:

  ```ts
  /** Scans UI package sources for the patterns the react-redux lint rules ban. */
  import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
  import { join } from 'node:path';
  import {
    PERMANENT_EXEMPTIONS,
    VIOLATION_KINDS,
    type Allowlists,
    type ViolationKind,
  } from './rules.ts';

  const PACKAGES = [
    'packages/ketcher-react',
    'packages/ketcher-macromolecules',
  ];
  const SKIP = /(^|[\\/])(node_modules|dist|build|coverage)([\\/]|$)/;
  const SOURCE = /\.(ts|tsx|js|jsx)$/;

  const escape = (text: string) => text.replace(/[/.]/g, '\\$&');

  export const importedNames = (
    text: string,
    moduleName: string,
  ): Set<string> => {
    const names = new Set<string>();
    const re = new RegExp(
      `import\\s+(?:type\\s+)?\\{([^}]*)\\}\\s*from\\s*['"]${escape(moduleName)}['"]`,
      'g',
    );
    for (const match of text.matchAll(re)) {
      for (const part of (match[1] ?? '').split(',')) {
        const name = part
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)[0];
        if (name) names.add(name);
      }
    }
    return names;
  };

  const CLASS_COMPONENT =
    /class\s+\w*\s*(?:<[^>{]*>)?\s*extends\s+(?:React\.)?(?:Pure)?Component\b/;
  const LEGACY_STORE_APIS = [
    'createStore',
    'legacy_createStore',
    'applyMiddleware',
    'compose',
    'combineReducers',
  ];

  const CHECKS: Record<ViolationKind, (text: string, file: string) => boolean> =
    {
      connect: (text) => importedNames(text, 'react-redux').has('connect'),
      classComponents: (text) => CLASS_COMPONENT.test(text),
      legacyStoreApis: (text) =>
        LEGACY_STORE_APIS.some((name) =>
          importedNames(text, '@reduxjs/toolkit').has(name),
        ),
      storeConstruction: (text, file) =>
        importedNames(text, '@reduxjs/toolkit').has('configureStore') &&
        !PERMANENT_EXEMPTIONS.storeConstruction.includes(file),
      castDraft: (text) => importedNames(text, 'immer').has('castDraft'),
    };

  /** Repo-relative, forward-slash paths of the UI packages' source files. */
  export function sourceFiles(rootDir: string): string[] {
    return PACKAGES.flatMap((pkg) => {
      const absolute = join(rootDir, pkg);
      if (!existsSync(absolute)) return [];
      return readdirSync(absolute, { recursive: true, encoding: 'utf8' })
        .filter((file) => SOURCE.test(file) && !SKIP.test(file))
        .filter((file) => statSync(join(absolute, file)).isFile())
        .map((file) => `${pkg}/${file.split('\\').join('/')}`);
    }).sort();
  }

  export function collectViolations(rootDir: string): Allowlists {
    const result: Allowlists = {
      connect: [],
      classComponents: [],
      legacyStoreApis: [],
      storeConstruction: [],
      castDraft: [],
    };
    for (const file of sourceFiles(rootDir)) {
      const text = readFileSync(join(rootDir, file), 'utf8');
      for (const kind of VIOLATION_KINDS) {
        if (CHECKS[kind](text, file)) result[kind].push(file);
      }
    }
    return result;
  }
  ```

- [ ] 6.7 Run `npm run test:guardrail-scripts`. **Expected:** PASS.
- [ ] 6.8 Implement the CLI `scripts/react-redux/allowlists.ts`:

  ```ts
  /**
   * Generates and checks the react-redux lint allowlists. They may only shrink:
   * --check fails when the committed lists aren't what the source tree gives,
   * and, with --base, when a list has an entry the base ref's list doesn't.
   */
  import { execFileSync } from 'node:child_process';
  import { readFileSync, writeFileSync } from 'node:fs';
  import { dirname, join, resolve } from 'node:path';
  import { fileURLToPath, pathToFileURL } from 'node:url';
  import { parseArgs } from 'node:util';
  import { collectViolations } from './collect.ts';
  import { VIOLATION_KINDS, type Allowlists } from './rules.ts';

  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const GENERATED = 'scripts/react-redux/allowlists.generated.json';

  /** The file at a git ref, or undefined when the ref doesn't have it yet. */
  export function gitShow(ref: string, path: string): string | undefined {
    try {
      return execFileSync('git', ['show', `${ref}:${path}`], {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch {
      return undefined;
    }
  }

  export function compareAllowlists(
    current: Partial<Allowlists>,
    committed: Partial<Allowlists>,
    base?: Partial<Allowlists>,
  ): string[] {
    const problems: string[] = [];
    for (const kind of VIOLATION_KINDS) {
      const now = new Set(current[kind] ?? []);
      const listed = new Set(committed[kind] ?? []);
      for (const file of now)
        if (!listed.has(file))
          problems.push(`${kind}: new violation in ${file}`);
      for (const file of listed)
        if (!now.has(file))
          problems.push(
            `${kind}: ${file} is fixed; run --write to shrink the list`,
          );
      if (base) {
        const before = new Set(base[kind] ?? []);
        for (const file of listed)
          if (!before.has(file))
            problems.push(`${kind}: ${file} was added to the allowlist`);
      }
    }
    return problems;
  }

  function main() {
    const { values } = parseArgs({
      options: {
        write: { type: 'boolean' },
        check: { type: 'boolean' },
        base: { type: 'string' },
      },
    });
    const current = collectViolations(ROOT);
    if (values.write) {
      writeFileSync(
        join(ROOT, GENERATED),
        `${JSON.stringify(current, null, 2)}\n`,
      );
      for (const kind of VIOLATION_KINDS)
        console.log(`${kind}: ${current[kind].length}`);
      return;
    }
    if (values.check) {
      const committed: Partial<Allowlists> = JSON.parse(
        readFileSync(join(ROOT, GENERATED), 'utf8'),
      );
      const baseText = values.base
        ? gitShow(values.base, GENERATED)
        : undefined;
      if (values.base && !baseText) {
        console.warn(
          `${values.base} has no ${GENERATED} yet; skipping the growth check.`,
        );
      }
      const base: Partial<Allowlists> | undefined = baseText
        ? JSON.parse(baseText)
        : undefined;
      const problems = compareAllowlists(current, committed, base);
      if (problems.length) {
        console.error(problems.join('\n'));
        process.exit(1);
      }
    }
  }

  if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href
  ) {
    main();
  }
  ```

  Add these tests for `compareAllowlists` to `collect.test.ts`:

  ```ts
  import { compareAllowlists } from './allowlists.ts';

  test('compareAllowlists reports new violations, stale entries and growth', () => {
    assert.deepEqual(
      compareAllowlists(
        { connect: ['a.tsx', 'new.tsx'] },
        { connect: ['a.tsx', 'fixed.tsx', 'added.tsx'] },
        { connect: ['a.tsx', 'fixed.tsx'] },
      ),
      [
        'connect: new violation in new.tsx',
        'connect: fixed.tsx is fixed; run --write to shrink the list',
        'connect: added.tsx is fixed; run --write to shrink the list',
        'connect: added.tsx was added to the allowlist',
      ],
    );
  });
  ```

- [ ] 6.9 Generate the lists: `node scripts/react-redux/allowlists.ts --write`.
  - **Expected counts:**
    - `connect` 37. The audit's 36 missed `import { connect, useDispatch }`;
    - `classComponents` 12;
    - `castDraft` 3;
    - `legacyStoreApis` about 7: `rootReducer.ts` plus react tests such as `sgroup.test.tsx`, `RnaPresetTabs.test.tsx`, `Save.test.utils.tsx`, `InfoModal.test.utils.tsx`, `settings-integration.test.tsx` and `useSettings.test.tsx`;
    - `storeConstruction` 0. On 2026-10-16 only `SequenceSyncEditModeButton.test.tsx` imported `configureStore` directly, and step 4.7 moved it to the factory. The other macro tests already use `configureAppStore`.
  - Put the counts in the section report.
  - If `classComponents` isn't 12, compare it with the list in `design.md`'s audit snapshot before going on.
- [ ] 6.10 Write the failing lint-integration test `scripts/react-redux/lintRules.test.ts`. It runs the real config:

  ```ts
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import { dirname, resolve } from 'node:path';
  import { fileURLToPath } from 'node:url';
  import { ESLint } from 'eslint';
  import REACT_REDUX_ALLOWLISTS from './allowlists.generated.json' with { type: 'json' };

  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const eslint = new ESLint({ cwd: repoRoot });
  const LINT_RULES = ['no-restricted-imports', 'no-restricted-syntax'];
  const messages = async (code: string, filePath: string) => {
    const [result] = await eslint.lintText(code, {
      filePath: resolve(repoRoot, filePath),
    });
    return (result?.messages ?? []).filter(
      (message) =>
        message.ruleId !== null && LINT_RULES.includes(message.ruleId),
    );
  };

  /** The first entry of an allowlist; the test needs at least one. */
  const firstListed = (list: string[]) => {
    const [file] = list;
    assert.ok(file, 'the allowlist is empty; pick another fixture');
    return file;
  };

  const REACT_FILE = 'packages/ketcher-react/src/script/ui/probe.tsx';
  const MACRO_FILE = 'packages/ketcher-macromolecules/src/components/probe.tsx';

  test('bans raw hooks and connect in both packages, reporting each', async () => {
    for (const file of [REACT_FILE, MACRO_FILE]) {
      const found = await messages(
        "import { connect, useSelector } from 'react-redux';\n",
        file,
      );
      assert.equal(found.length, 2, file);
    }
  });

  test('bans bundled libraries and legacy store APIs', async () => {
    for (const source of [
      "import { createSelector } from 'reselect';\n",
      "import type { Dispatch } from 'redux';\n",
      "import { produce } from 'immer';\n",
      "import { combineReducers } from '@reduxjs/toolkit';\n",
      "import { configureStore } from '@reduxjs/toolkit';\n",
    ]) {
      assert.ok((await messages(source, REACT_FILE)).length > 0, source);
    }
  });

  test('bans class components', async () => {
    const found = await messages(
      "import { Component } from 'react';\nexport class Probe extends Component {}\n",
      REACT_FILE,
    );
    assert.equal(found[0]?.ruleId, 'no-restricted-syntax');
  });

  test('allowlisted files keep the bans they are not exempt from', async () => {
    const connectFile = firstListed(REACT_REDUX_ALLOWLISTS.connect);
    assert.equal(
      (await messages("import { connect } from 'react-redux';\n", connectFile))
        .length,
      0,
    );
    assert.equal(
      (
        await messages(
          "import { useSelector } from 'react-redux';\n",
          connectFile,
        )
      ).length,
      1,
    );
  });

  test('castDraft files may import castDraft and nothing else from immer', async () => {
    const file = firstListed(REACT_REDUX_ALLOWLISTS.castDraft);
    assert.equal(
      (await messages("import { castDraft } from 'immer';\n", file)).length,
      0,
    );
    assert.equal(
      (await messages("import { produce } from 'immer';\n", file)).length,
      1,
    );
  });

  test('the typed-hook files may use the raw hooks', async () => {
    assert.equal(
      (
        await messages(
          "import { useDispatch, useSelector } from 'react-redux';\n",
          'packages/ketcher-react/src/script/ui/state/hooks.ts',
        )
      ).length,
      0,
    );
  });

  test('assert stays banned everywhere', async () => {
    for (const file of [
      REACT_FILE,
      firstListed(REACT_REDUX_ALLOWLISTS.connect),
    ]) {
      assert.ok(
        (await messages("import assert from 'assert';\n", file)).length > 0,
        file,
      );
    }
  });
  ```

  Run `npm run test:guardrail-scripts`. **Expected:** the lint tests FAIL, because the config doesn't have the rules yet.

- [ ] 6.11 Wire the rules into `eslint.config.mjs`.
  1. After the existing imports, add:
     ```js
     import { restrictedImportBlocks } from './scripts/lint/restrictedImports.ts';
     import {
       CLASS_COMPONENT_SELECTORS,
       PERMANENT_EXEMPTIONS,
       REDUX_RESTRICTIONS,
       UI_SOURCE_GLOBS,
     } from './scripts/react-redux/rules.ts';
     import REACT_REDUX_ALLOWLISTS from './scripts/react-redux/allowlists.generated.json' with { type: 'json' };

     const ASSERT_RESTRICTION = {
       id: 'assert',
       paths: [
         {
           name: 'assert',
           message:
             "Node's 'assert' module breaks browser bundlers (see issue #3733). Use `import { assert } from 'ketcher-core'` instead.",
         },
       ],
     };
     ```
  2. In the block whose `files` are `packages/ketcher-react/**/*.{ts,tsx,js,jsx}` and `packages/ketcher-macromolecules/**/*.{ts,tsx,js,jsx}`, delete its `'no-restricted-imports'` entry. Leave the other rules alone.
  3. Directly after that block, add:
     ```js
     ...restrictedImportBlocks(UI_SOURCE_GLOBS, [
       ASSERT_RESTRICTION,
       ...REDUX_RESTRICTIONS(REACT_REDUX_ALLOWLISTS),
     ]),
     {
       files: UI_SOURCE_GLOBS,
       rules: { 'no-restricted-syntax': ['error', ...CLASS_COMPONENT_SELECTORS] },
     },
     // Flat config rejects an empty `files` list, so the block disappears once
     // the last class component is converted.
     ...[
       [...PERMANENT_EXEMPTIONS.classComponents, ...REACT_REDUX_ALLOWLISTS.classComponents],
     ]
       .filter((files) => files.length > 0)
       .map((files) => ({ files, rules: { 'no-restricted-syntax': 'off' } })),
     ```
     ESLint loads `eslint.config.mjs` with Node's own `import`, so the `.ts` imports work through Node's type stripping. This was checked on 2026-10-16 with ESLint 10.9.0 on Node 22.22 and 25.8; CI runs 24.20.
     Leave the `ketcher-core` and `ketcher-standalone` blocks unchanged: they aren't UI packages, and nothing else bans imports there.
  4. Make sure no other block that matches UI package files sets `no-restricted-syntax`: `grep -n "no-restricted-syntax" eslint.config.mjs`. If one does, merge its selectors into `CLASS_COMPONENT_SELECTORS` instead.
- [ ] 6.12 Run `npm run test:guardrail-scripts`. **Expected:** all PASS.
- [ ] 6.13 **Code check:**
  - `npm test` at the root passes. That proves every allowlisted file lints clean and nothing else violates the rules.
  - `node scripts/react-redux/allowlists.ts --check` exits 0.
- [ ] 6.14 **No commit yet.** PR 5 also contains Section 7. Ask the user whether to commit this section on its own now. The message would be `#12229 - Ban legacy Redux and class components with shrinking allowlists`.

## 7. Metrics ratchet and CI

**Coordination.** If the UI-kit change's `scripts/ui-kit/metrics.ts` has landed (#12235), add these counters to it under a `reactRedux` key and reuse its `--check`/`--write` CLI, instead of creating `scripts/react-redux/metrics.ts`. Otherwise create the script below; the UI-kit change then adds its counters here.

**Files:**

- Create: `scripts/react-redux/metrics.ts`, `scripts/react-redux/metrics.test.ts` and `scripts/react-redux/metrics-baseline.json` (generated).
- Modify: root `package.json` and `.github/workflows/ci.yml`.

**Interfaces produced:**

- `collectMetrics(rootDir: string): Record<string, PackageMetrics>`, keyed by `ketcher-react` and `ketcher-macromolecules`. `PackageMetrics` has the number fields `classComponents`, `connectFiles`, `rawHookFiles`, `legacyReduxImportFiles`, `castDraftFiles`, `testsBuildingOwnStore`, `devCheckExceptions` and `storesWithCheckDisabled`.
- `compareMetrics(current: MetricsTable, baseline: MetricsTable): string[]`, where `MetricsTable` is `Record<string, Partial<Record<string, number>>>`, the shape of `metrics-baseline.json`. It reports every count that differs, so a drop must be committed as well.
- CLI: `node scripts/react-redux/metrics.ts --write | --check [--base <git-ref>]`. With `--base`, it also fails if the committed baseline went up against the base ref's baseline.

- [ ] 7.1 Write the failing `scripts/react-redux/metrics.test.ts`:

  ```ts
  import { test } from 'node:test';
  import assert from 'node:assert/strict';
  import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
  import { tmpdir } from 'node:os';
  import { dirname, join } from 'node:path';
  import { collectMetrics, compareMetrics } from './metrics.ts';

  const fixture = (files: Record<string, string>) => {
    const root = mkdtempSync(join(tmpdir(), 'react-redux-metrics-'));
    for (const [file, text] of Object.entries(files)) {
      mkdirSync(dirname(join(root, file)), { recursive: true });
      writeFileSync(join(root, file), text);
    }
    return root;
  };

  test('collectMetrics counts per package', () => {
    const root = fixture({
      'packages/ketcher-react/src/a.tsx':
        "import { connect } from 'react-redux';\nclass A extends Component {}\n",
      'packages/ketcher-react/src/b.tsx':
        "import { useSelector } from 'react-redux';\n",
      'packages/ketcher-react/src/c.test.tsx':
        "import { createStore } from '@reduxjs/toolkit';\n",
      'packages/ketcher-react/src/script/ui/state/devChecks.ts':
        "  { check: 'serializableCheck', path: '*', reason: 'x', removedBy: 'react-redux #2' },\n" +
        "  { check: 'immutableCheck', path: '*', reason: 'x', removedBy: 'react-redux #2' },\n",
      'packages/ketcher-macromolecules/src/d.ts':
        "import { castDraft } from 'immer';\nimport { x } from 'reselect';\n",
      'packages/ketcher-macromolecules/src/state/devChecks.ts':
        "  { check: 'immutableCheck', path: 'editor.editor', reason: 'x', removedBy: 'react-redux #2' },\n",
    });

    assert.deepEqual(collectMetrics(root), {
      'ketcher-react': {
        classComponents: 1,
        connectFiles: 1,
        rawHookFiles: 1,
        legacyReduxImportFiles: 0,
        castDraftFiles: 0,
        testsBuildingOwnStore: 1,
        devCheckExceptions: 2,
        storesWithCheckDisabled: 1,
      },
      'ketcher-macromolecules': {
        classComponents: 0,
        connectFiles: 0,
        rawHookFiles: 0,
        legacyReduxImportFiles: 1,
        castDraftFiles: 1,
        testsBuildingOwnStore: 0,
        devCheckExceptions: 1,
        storesWithCheckDisabled: 0,
      },
    });
  });

  test('compareMetrics reports increases and unrecorded decreases', () => {
    assert.deepEqual(
      compareMetrics(
        { 'ketcher-react': { connectFiles: 35, classComponents: 13 } },
        { 'ketcher-react': { connectFiles: 36, classComponents: 12 } },
      ),
      [
        'ketcher-react.connectFiles: 36 -> 35 (lower: run --write and commit the baseline)',
        'ketcher-react.classComponents: 12 -> 13 (higher)',
      ],
    );
  });
  ```

- [ ] 7.2 Implement `scripts/react-redux/metrics.ts`:

  ```ts
  /** React/Redux migration burn-down (react-redux-foundation, Decision 14). */
  import { existsSync, readFileSync, writeFileSync } from 'node:fs';
  import { dirname, join, resolve } from 'node:path';
  import { fileURLToPath, pathToFileURL } from 'node:url';
  import { parseArgs } from 'node:util';
  import { gitShow } from './allowlists.ts';
  import { collectViolations, importedNames, sourceFiles } from './collect.ts';
  import { PERMANENT_EXEMPTIONS } from './rules.ts';

  // A type alias, not an interface, so it fits MetricsTable's index signature.
  export type PackageMetrics = {
    classComponents: number;
    connectFiles: number;
    rawHookFiles: number;
    legacyReduxImportFiles: number;
    castDraftFiles: number;
    testsBuildingOwnStore: number;
    devCheckExceptions: number;
    storesWithCheckDisabled: number;
  };

  /** Counts per package; the shape of `metrics-baseline.json`. */
  export type MetricsTable = Record<string, Partial<Record<string, number>>>;

  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const BASELINE = 'scripts/react-redux/metrics-baseline.json';
  const DEV_CHECKS: Record<string, string> = {
    'ketcher-react': 'packages/ketcher-react/src/script/ui/state/devChecks.ts',
    'ketcher-macromolecules':
      'packages/ketcher-macromolecules/src/state/devChecks.ts',
  };
  const TEST_FILE = /\.(test|spec)\.[jt]sx?$|test\.utils\.[jt]sx?$|__tests__\//;
  const RAW_HOOKS = [
    'useSelector',
    'useDispatch',
    'useStore',
    'TypedUseSelectorHook',
  ];
  const LEGACY_IMPORT =
    /from\s*['"](redux|redux-thunk|reselect|redux-saga)['"]/;

  export function collectMetrics(
    rootDir: string,
  ): Record<string, PackageMetrics> {
    const violations = collectViolations(rootDir);
    const files = sourceFiles(rootDir);
    const read = (file: string) => readFileSync(join(rootDir, file), 'utf8');
    const metrics: Record<string, PackageMetrics> = {};
    for (const [pkg, devChecksFile] of Object.entries(DEV_CHECKS)) {
      const inPkg = (list: string[]) =>
        list.filter((file) => file.startsWith(`packages/${pkg}/`));
      const devChecks = existsSync(join(rootDir, devChecksFile))
        ? read(devChecksFile)
        : '';
      metrics[pkg] = {
        classComponents: inPkg(violations.classComponents).length,
        connectFiles: inPkg(violations.connect).length,
        rawHookFiles: inPkg(files).filter(
          (file) =>
            !PERMANENT_EXEMPTIONS.rawHooks.includes(file) &&
            RAW_HOOKS.some((name) =>
              importedNames(read(file), 'react-redux').has(name),
            ),
        ).length,
        legacyReduxImportFiles: inPkg(files).filter((file) =>
          LEGACY_IMPORT.test(read(file)),
        ).length,
        castDraftFiles: inPkg(violations.castDraft).length,
        testsBuildingOwnStore: new Set(
          [
            ...inPkg(violations.legacyStoreApis),
            ...inPkg(violations.storeConstruction),
          ].filter((file) => TEST_FILE.test(file)),
        ).size,
        devCheckExceptions: (devChecks.match(/\bremovedBy:/g) ?? []).length,
        storesWithCheckDisabled: /path:\s*'\*'/.test(devChecks) ? 1 : 0,
      };
    }
    return metrics;
  }

  export function compareMetrics(
    current: MetricsTable,
    baseline: MetricsTable,
  ): string[] {
    const problems: string[] = [];
    for (const [pkg, counts] of Object.entries(baseline)) {
      for (const [key, before] of Object.entries(counts)) {
        const now = current[pkg]?.[key];
        if (now === undefined || before === undefined) continue;
        if (now > before)
          problems.push(`${pkg}.${key}: ${before} -> ${now} (higher)`);
        if (now < before) {
          problems.push(
            `${pkg}.${key}: ${before} -> ${now} (lower: run --write and commit the baseline)`,
          );
        }
      }
    }
    return problems;
  }

  function main() {
    const { values } = parseArgs({
      options: {
        write: { type: 'boolean' },
        check: { type: 'boolean' },
        base: { type: 'string' },
      },
    });
    const current = collectMetrics(ROOT);
    console.table(current);
    if (values.write) {
      writeFileSync(
        join(ROOT, BASELINE),
        `${JSON.stringify(current, null, 2)}\n`,
      );
      return;
    }
    if (values.check) {
      const committed: MetricsTable = JSON.parse(
        readFileSync(join(ROOT, BASELINE), 'utf8'),
      );
      const problems = compareMetrics(current, committed);
      const baseText = values.base ? gitShow(values.base, BASELINE) : undefined;
      if (values.base && !baseText) {
        console.warn(
          `${values.base} has no ${BASELINE} yet; skipping the growth check.`,
        );
      }
      if (baseText) {
        const base: MetricsTable = JSON.parse(baseText);
        problems.push(
          ...compareMetrics(committed, base)
            .filter((line) => line.endsWith('(higher)'))
            .map((line) => `baseline raised: ${line}`),
        );
      }
      if (problems.length) {
        console.error(`React/Redux metrics:\n${problems.join('\n')}`);
        process.exit(1);
      }
    }
  }

  if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href
  ) {
    main();
  }
  ```

  `allowlists.ts` only runs its CLI when executed directly, so importing `gitShow` from it is safe.

- [ ] 7.3 Run `npm run test:guardrail-scripts`. **Expected:** PASS. Then write the baseline with `node scripts/react-redux/metrics.ts --write`, and paste the table into the section report.
  - **Expected `ketcher-react`:** `classComponents` 12, `connectFiles` 37, `rawHookFiles` 0, `legacyReduxImportFiles` 0, `castDraftFiles` 0, `testsBuildingOwnStore` about 6, `devCheckExceptions` 2, `storesWithCheckDisabled` 1.
  - **Expected `ketcher-macromolecules`:** `castDraftFiles` 3, `testsBuildingOwnStore` 0, `devCheckExceptions` 2, `storesWithCheckDisabled` 1, and 0 for the rest.
- [ ] 7.4 Add root scripts:
  - `"check:react-redux": "node scripts/react-redux/allowlists.ts --check && node scripts/react-redux/metrics.ts --check"`;
  - `"check:react-redux:base": "node scripts/react-redux/allowlists.ts --check --base FETCH_HEAD && node scripts/react-redux/metrics.ts --check --base FETCH_HEAD"`.
- [ ] 7.5 In `.github/workflows/ci.yml`, in the `build` job, add these steps directly after `Run tests`. The checkout is shallow, so the base branch is fetched first. On pushes, `github.base_ref` is empty and the job compares with `master`.
  ```yaml
  - name: Guardrail script tests
    run: npm run test:guardrail-scripts
  - name: Fetch base branch for ratchet checks
    run: git fetch --no-tags --depth=1 origin ${{ github.base_ref || 'master' }}
  - name: React/Redux allowlists and metrics
    run: npm run check:react-redux:base
  ```
- [ ] 7.6 **Code check:**
  - `npm run test:guardrail-scripts && npm run check:react-redux` passes.
  - Simulate a regression. Add `import { connect } from 'react-redux';` to an allowlist-free file. `npm test -w packages/ketcher-react` fails on lint, and `npm run check:react-redux` reports a new violation. Revert the change.
  - Simulate an unrecorded fix. Remove a file from `allowlists.generated.json`. `npm run check:react-redux` passes the metrics check but fails the allowlist check, because the file still violates. Revert.
- [ ] 7.7 **Release gate** (PR 5): the same as step 1.13. Behaviour can't change here, so the e2e run may be the PR's CI run. In addition, check that the new CI steps run and pass on the PR.
- [ ] 7.8 **STOP:** ask to commit, using the message `#12229 - Track React/Redux migration metrics in CI`. If Section 6 wasn't committed separately, use `#12229 - Add React/Redux lint guardrails and metrics ratchet`.

## 8. `renderWithStore` test helpers

**Files:**

- Create:
  - `packages/ketcher-react/src/script/ui/state/testing/renderWithStore.tsx`;
  - `packages/ketcher-macromolecules/src/testUtils/TestThemeProvider.tsx`, the only place macro tests get the Emotion theme from;
  - `packages/ketcher-macromolecules/src/testUtils/renderWithStore.tsx`.
- Modify:
  - `packages/ketcher-react/src/script/ui/views/modal/components/InfoModal/InfoModal.test.utils.tsx`, the react demonstration;
  - `packages/ketcher-macromolecules/src/components/SequenceSyncEditModeButton/SequenceSyncEditModeButton.test.tsx`, the macro demonstration, which already uses the factory after Section 4;
  - `packages/ketcher-macromolecules/src/setupTests.tsx`, whose `withThemeProvider` and `withThemeAndStoreProvider` globals switch to `TestThemeProvider`;
  - `scripts/react-redux/allowlists.generated.json` and `metrics-baseline.json`, regenerated.

**Interfaces produced:**

- React: `renderWithStore(ui: ReactElement, { options?, server?, preloadedState?, extra? } = {}): RenderResult & { store: AppStore }`.
- Macro: `TestThemeProvider({ children }: { children: ReactNode })`, from `src/testUtils/TestThemeProvider.tsx`. It provides the merged MUI and `ketcher` theme that Emotion `styled` components read.
- Macro: `renderWithStore(ui: ReactElement, { preloadedState?: Partial<RootState> } = {}): RenderResult & { store: AppStore }`. It wraps the tree in `TestThemeProvider` and the store, as `withThemeAndStoreProvider` does.
- **Temporary part:** `TestThemeProvider` exists only because macro components are styled with Emotion. UI-kit #5 (#12197), which removes Emotion, deletes it. `renderWithStore` and the `setupTests` globals then wrap only the store and keep their signatures, so the tests that call them don't change. This section lands long before that, so `roadmap.md` records the handover under "Interleaving with the UI-kit initiative".
  - The macro store has no `extra` argument until #2, which adds the editor holder.
  - `design.md` Decision 15 names `extra` for both packages. Note in the PR that macro gets it in #2.

- [ ] 8.1 Write the react helper `state/testing/renderWithStore.tsx`:

  ```tsx
  import { render, type RenderResult } from '@testing-library/react';
  import type { ReactElement } from 'react';
  import { Provider } from 'react-redux';
  import {
    createAppStore,
    type AppStore,
    type CreateAppStoreParams,
  } from '../store';

  type Options = Partial<
    Pick<
      CreateAppStoreParams,
      'options' | 'server' | 'preloadedState' | 'extra'
    >
  >;

  /** Renders `ui` against the real store factory (react-redux-foundation, Decision 15). */
  export function renderWithStore(
    ui: ReactElement,
    { options = {}, server = null, preloadedState, extra }: Options = {},
  ): RenderResult & { store: AppStore } {
    const store = createAppStore({
      options,
      server,
      setEditor: () => undefined,
      preloadedState,
      extra,
    });
    return { ...render(<Provider store={store}>{ui}</Provider>), store };
  }
  ```

  Pass `server: null` and you get today's standalone default: a rejected promise. To avoid unhandled-rejection noise in tests, the helper passes `null` and the factory's `buildInitialState` turns it into `Promise.reject(...)`. If Jest reports unhandled rejections, pass `server: {}` as the default instead and say so in the report.

- [ ] 8.2 Switch `InfoModal.test.utils.tsx` to it, keeping `renderWithMockStore`'s signature so the tests that call it don't change:

  ```tsx
  import type { ReactElement } from 'react';
  import { renderWithStore } from '../../../../state/testing/renderWithStore';

  interface InfoModalMockState {
    options: { app: { errorMessage: string } };
  }

  export function renderWithMockStore(
    component: ReactElement,
    initialState: InfoModalMockState = {
      options: { app: { errorMessage: 'Error' } },
    },
  ) {
    return renderWithStore(component, { options: initialState.options.app });
  }
  ```

  - Check the relative path with `ls`.
  - If any InfoModal test passes its own `store` argument, keep that test on its own store and leave the file on the allowlist. Note it in the report.
  - Run `npx jest src/script/ui/views/modal/components/InfoModal`. **Expected:** PASS.

- [ ] 8.3 Put the macro test theme in one place, `src/testUtils/TestThemeProvider.tsx`:

  ```tsx
  import { ThemeProvider } from '@emotion/react';
  import { createTheme } from '@mui/material/styles';
  import { merge } from 'lodash';
  import type { ReactNode } from 'react';
  import { defaultTheme } from 'theming/defaultTheme';

  // Temporary: Emotion `styled` components read `theme.ketcher.*` from this
  // provider. It is deleted with Emotion in UI-kit #5 (#12197); renderWithStore
  // and the setupTests globals then wrap only the store, with the same
  // signatures.
  const theme = merge(createTheme(), { ketcher: defaultTheme });

  export function TestThemeProvider({ children }: { children: ReactNode }) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  }
  ```

  Then switch `setupTests.tsx` to it:
  1. Import `{ TestThemeProvider }` from `./testUtils/TestThemeProvider`.
  2. In `withThemeProvider` and `withThemeAndStoreProvider`, replace `<ThemeProvider theme={mergedTheme}>` and its closing tag with `<TestThemeProvider>` and `</TestThemeProvider>`.
  3. Delete `muiTheme`, `mergedTheme` and the `createTheme`, `ThemeProvider`, `merge` and `defaultTheme` imports, which nothing else uses.
  - The theme is built the same way as before, once per test file, so the 28 test files that use the globals see the same theme.
  - Run `npx jest` in `packages/ketcher-macromolecules`. **Expected:** the same pass count as the Section 0 baseline.
  - **If UI-kit Section 7 has landed,** its `@mui`/`@emotion` import ban flags this file. That isn't a new usage: the imports move here from `setupTests.tsx`, which lint ignores. Add the file to that allowlist, regenerate the UI-kit metrics, and say so in the PR.

- [ ] 8.4 Write the macro helper `src/testUtils/renderWithStore.tsx`:

  ```tsx
  import { render, type RenderResult } from '@testing-library/react';
  import type { ReactElement } from 'react';
  import { Provider } from 'react-redux';
  import { configureAppStore, type AppStore, type RootState } from 'state';
  import { TestThemeProvider } from './TestThemeProvider';

  /** Renders `ui` against the real store factory (react-redux-foundation, Decision 15). */
  export function renderWithStore(
    ui: ReactElement,
    { preloadedState = {} }: { preloadedState?: Partial<RootState> } = {},
  ): RenderResult & { store: AppStore } {
    const store = configureAppStore(preloadedState);
    return {
      ...render(
        <TestThemeProvider>
          <Provider store={store}>{ui}</Provider>
        </TestThemeProvider>,
      ),
      store,
    };
  }
  ```

  - `state/index.ts` re-exports `store.ts`, so `AppStore` is available from `'state'`.
  - Add a `testUtils` path to `tsconfig.json` and a Jest `moduleNameMapper` entry only if relative imports are awkward. Relative imports are fine.

- [ ] 8.5 Move `SequenceSyncEditModeButton.test.tsx`'s `renderComponents` to `renderWithStore(<><SequenceSyncEditModeButton /><EditorEvents /></>, { preloadedState: { editor: { …same editor fields as step 4.7… } } })`. Remove its `withThemeProvider` and `Provider` usage. Run it. **Expected:** PASS.
- [ ] 8.6 Rerun `node scripts/react-redux/allowlists.ts --write` and `node scripts/react-redux/metrics.ts --write`.
  - **Expected:** `legacyStoreApis` loses `InfoModal.test.utils.tsx`, and `testsBuildingOwnStore` drops by one in `ketcher-react`. `storeConstruction` stays empty.
- [ ] 8.7 **Code check:** run `npm test`, `npm run test:guardrail-scripts` and `npm run check:react-redux`.
- [ ] 8.8 **STOP:** ask to commit, using the message `#12230 - Add renderWithStore test helpers`.

## 9. Final release gate and release notes check

**Files:**

- Modify, only if something is missing: `openspec/changes/react-redux-foundation/release-notes.md`.
- Modify: `openspec/changes/react-redux-foundation/roadmap.md`, its "Starting metrics" table only.

- [ ] 9.1 Read `release-notes.md` and check that it has these entries, each added by the PR that made the change. Correct any that is missing or no longer matches what shipped:
  - `ketcher-react` depends on `@reduxjs/toolkit` and no longer on `reselect` (PR 1, step 1.14), `redux` or `redux-thunk` (PR 2, step 2.15);
  - `ketcher-macromolecules` no longer depends on `redux` or `redux-saga`, and declares `immer` 11.x (PR 1);
  - Redux DevTools still connect only in development builds, with the same sanitised state (PR 2);
  - no UI, behaviour or public API change.
- [ ] 9.2 In `roadmap.md`, add an "After #0" column to the starting-metrics table with the numbers from `metrics-baseline.json`. Don't edit the memory bank (CLAUDE.md).
- [ ] 9.3 **Final release gate**, on PR 6's branch. It is based on a `master` that has PRs 1–5, so every section is in place:
  - `npm ci && npm run build && npm test && npm run test:guardrail-scripts && npm run check:react-redux`;
  - the `example-ssr` build, lint and types;
  - the full e2e suite (`chromium` and `chromium-popup`) with no baseline updates;
  - the step 0.5 walkthrough in both standalone and remote mode (`npm run start:remote -w example`). The console matches `console-dev.txt`, minus the expected `editor.editor` mutation errors.
  - **Duo mode:** open the example with two editors, if the example exposes that, or the macromolecules toggle twice in a row. Edit in one and check that the other is unchanged. Known shared-state bugs (#1) are allowed, but nothing new may appear.
- [ ] 9.4 Cross-check the spec, and list each requirement with the section that implements it in the PR 6 description. Requirements whose implementation belongs to later sub-projects are listed as "convention recorded, enforced by lint". Examples: the editor holder, and RTK Query rules.
- [ ] 9.5 **STOP:** ask to commit, using the message `#12230 - Record the React/Redux foundation's final metrics`. Then ask whether to push the branch and open PR 6, as in the execution protocol.
