## ADDED Requirements

### Requirement: Generated allowlists that only shrink

Each lint ban introduced by this initiative SHALL have an allowlist of the existing files that violate it. A script SHALL generate the allowlists from the source tree. CI SHALL fail when a regenerated allowlist contains a file the committed list does not.

#### Scenario: A file stops violating a rule

- **WHEN** a file on an allowlist no longer violates that rule
- **THEN** regenerating the allowlist SHALL remove it
- **AND** the PR that fixed the file SHALL commit the shorter list

#### Scenario: Adding to an allowlist by hand

- **WHEN** a PR adds a file to an allowlist
- **THEN** CI SHALL fail

---

### Requirement: One restricted-imports configuration

All `no-restricted-imports` bans for UI package sources SHALL be built by one shared helper in `eslint.config.mjs`. That covers the existing `assert` bans, this initiative's bans, and the UI-kit initiative's `@mui`/`@emotion` bans. No later config block SHALL silently replace an earlier block's bans.

#### Scenario: Two initiatives ban imports for the same files

- **WHEN** a file imports both a banned Redux API and a banned MUI module
- **THEN** lint SHALL report both violations

---

### Requirement: Progress metrics with a CI ratchet

A metrics script SHALL report, for each package:

- class components;
- files using `connect`;
- files calling raw `useSelector` or `useDispatch`;
- files importing `redux`, `reselect`, `immer` or `redux-thunk` directly;
- entries in the dev-check exception list;
- stores with a dev check disabled.

The current counts SHALL be committed as a baseline. CI SHALL fail when any count is higher than the baseline.

#### Scenario: A regression

- **WHEN** a PR adds a `connect` usage or a dev-check exception
- **THEN** the metrics check SHALL fail

#### Scenario: Progress

- **WHEN** a PR lowers a count
- **THEN** the PR SHALL update the committed baseline to the new count

---

### Requirement: A store-backed test helper

Each package SHALL provide a `renderWithStore` test helper that builds the store with the package's real factory, accepts a preloaded state and an `extra` argument, and wraps the rendered tree in the providers the editor uses. New component tests that need a store SHALL use it.

#### Scenario: Testing a connected component

- **WHEN** a test renders a component that reads the store
- **THEN** it SHALL build the store through `renderWithStore`
- **AND** it SHALL NOT hand-assemble reducers

---

### Requirement: Releasable after every merge

Every PR in this initiative SHALL leave `master` releasable, with no regression. That applies to each sub-task of a sub-project, not only to the last one. Work SHALL land on `master` in small PRs, not on a long-lived integration branch. No PR SHALL rely on a later PR to restore behaviour it broke. Wherever old and new patterns coexist, both SHALL work.

#### Scenario: A sub-task is merged

- **WHEN** one sub-task's PR is merged and the rest of its sub-project is not
- **THEN** `master` SHALL pass every gate in "Migration PR gates"
- **AND** it SHALL be releasable as it stands

#### Scenario: A change that needs several steps

- **WHEN** a migration can't be split into steps that each keep behaviour intact
- **THEN** the steps SHALL be reordered, or the new path SHALL be added alongside the old one and the callers moved over PR by PR
- **AND** it SHALL NOT be merged in a broken intermediate state

#### Scenario: A host-visible change is merged

- **WHEN** a PR changes something hosts can observe, such as the declared dependencies or the Redux DevTools behaviour
- **THEN** the same PR SHALL add the change to the release notes

#### Scenario: The initiative pauses

- **WHEN** work stops after any merged PR
- **THEN** the product SHALL work as it did before the initiative began, with the guardrails still enforced

---

### Requirement: Coverage before change

Before a PR rewires an area, its author SHALL check which tests exercise that area. Where the coverage wouldn't catch a regression, characterisation tests SHALL be added first:

- unit tests through `renderWithStore` for components, slices, thunks and listeners;
- e2e specs where only an end-to-end flow can catch the regression, following the repo's e2e rules: an approved test plan comes before any spec code.

The characterisation tests SHALL pass against the old code before the refactor is applied.

#### Scenario: An area with thin coverage

- **WHEN** a PR converts a component that no unit or e2e test renders
- **THEN** characterisation tests SHALL land before the conversion, in an earlier PR or an earlier commit of the same PR
- **AND** they SHALL pass both before and after the conversion

#### Scenario: Paths automated tests don't reach

- **WHEN** a PR touches behaviour the suites don't cover, such as several editors on one page, remote mode, the SSR example, the public `ketcher` API, the clipboard, or undo and redo
- **THEN** the PR description SHALL list the paths that were checked by hand

---

### Requirement: Migration PR gates

A PR in this initiative SHALL change either state or component wiring, or markup, but not both. A wiring PR SHALL:

1. leave the rendered DOM unchanged;
2. pass the full e2e suite, both `chromium` and `chromium-popup`, without updating any baseline image;
3. pass the unit tests, type checks and lint;
4. build the packages, the `example` app in standalone and remote mode, and `example-ssr`;
5. not raise any metric above its baseline.

#### Scenario: An e2e baseline changes in a wiring PR

- **WHEN** a wiring PR updates an existing e2e baseline image
- **THEN** that update SHALL be treated as a regression, not as an accepted change
