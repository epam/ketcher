## ADDED Requirements

### Requirement: Redux Toolkit as the only Redux toolchain

`ketcher-react` and `ketcher-macromolecules` SHALL depend on `@reduxjs/toolkit` and `react-redux` for Redux, at the versions recorded in the ADR (`@reduxjs/toolkit@^2.13.0` and `react-redux@^9.3.0` at adoption), resolved to a single copy in the lockfile. Neither package SHALL declare `redux`, `redux-thunk`, `reselect` or `redux-saga` as a direct dependency, and source files SHALL import those APIs only from `@reduxjs/toolkit`.

There is one tracked exception. `ketcher-macromolecules` MAY declare `immer`, at the major version `@reduxjs/toolkit` depends on, for `castDraft` only, which RTK doesn't re-export. Only the files on the `castDraft` allowlist may import it, and the import and the dependency SHALL be removed once the class instances they cast are out of state.

#### Scenario: One installed copy

- **WHEN** dependencies are installed from the lockfile
- **THEN** exactly one version of `@reduxjs/toolkit` and one version of `react-redux` SHALL be installed for both packages

#### Scenario: Importing a bundled library directly

- **WHEN** a source file imports from `reselect`, `immer`, `redux` or `redux-thunk`
- **THEN** lint SHALL fail, unless the file is on the allowlist for that rule

#### Scenario: Assigning a class instance in a reducer

- **WHEN** a reducer has to store a value Immer's draft types can't express, such as a class instance or a readonly array
- **THEN** it SHALL use `castDraft` on that value, in a file on the `castDraft` allowlist
- **AND** it SHALL NOT assert the type of the whole state with `as`

#### Scenario: Version bump

- **WHEN** a newer version of `@reduxjs/toolkit` or `react-redux` is adopted
- **THEN** the bump SHALL be its own PR, which links the release notes it was checked against
- **AND** it SHALL pass the same gates as any other migration PR

#### Scenario: No scheduled bumps

- **WHEN** a release is prepared and a newer RTK or react-redux exists
- **THEN** no bump SHALL be required
- **AND** bumps SHALL be made only when a sub-project needs a fix or API, a security advisory applies, or a peer dependency requires it

---

### Requirement: Stores are created with configureStore and explicit dev checks

Each package SHALL create its store with `configureStore`. `serializableCheck` and `immutableCheck` SHALL be configured explicitly. Every path or action exempted from a check, and every check that is disabled, SHALL be listed in one exported exception constant per package. That list SHALL only shrink.

#### Scenario: Legacy store creation

- **WHEN** a source file calls `createStore`, `applyMiddleware`, `compose` or `combineReducers` from `redux`
- **THEN** lint SHALL fail, unless the file is on the allowlist

#### Scenario: React store after this change

- **WHEN** the `ketcher-react` store is created
- **THEN** it SHALL be created by `configureStore` around the existing root reducer, with the devtools sanitizers passed through the `devTools` option
- **AND** reducer behaviour SHALL be unchanged, as shown by the unit tests and by the e2e suite passing without baseline updates

#### Scenario: Macromolecules immutability check

- **WHEN** an action is dispatched in a development build of `ketcher-macromolecules`
- **THEN** the immutability check SHALL NOT traverse the `CoreEditor` instance

#### Scenario: A new exception

- **WHEN** a change adds an entry to a package's dev-check exception list
- **THEN** the metrics check SHALL fail

---

### Requirement: One store per editor instance

Each editor instance SHALL get its own store, created by a factory and provided by its own `<Provider>`. No module-level store instance and no global variable SHALL hold Redux state, and no module-level object SHALL be mutated per instance.

#### Scenario: Two editors on one page

- **WHEN** two editor instances are mounted on the same page
- **THEN** each SHALL read and write only its own store
- **AND** an action dispatched in one instance SHALL NOT change the state the other reads

#### Scenario: Known violations are tracked

- **WHEN** this change is merged
- **THEN** each existing violation SHALL be listed in `roadmap.md` under sub-project #1: `globalThis.currentState`, the module-level `initOptionsState`, and the macromolecules singleton store

---

### Requirement: Serialisable state and pure reducers

New state SHALL hold only serialisable data: no class instances, DOM nodes, functions or Promises. The editor and the structure service SHALL be reached through a per-instance holder: a context hook in components, and the `extra` argument in thunks, listeners and RTK Query `queryFn`s. Reducers SHALL NOT have side effects: no construction or destruction of editors, no storage access, no callbacks, no dispatching.

#### Scenario: Persisting a preference

- **WHEN** a user preference must be saved to `localStorage`
- **THEN** a listener middleware entry SHALL save it in reaction to the action
- **AND** the reducer SHALL only update state

#### Scenario: Values derived from the editor

- **WHEN** the UI needs a value that the editor owns, such as the current mode
- **THEN** the value SHALL be mirrored into state by a single listener on editor events
- **AND** selectors SHALL NOT read fields of the live editor instance

---

### Requirement: Side effects have one place per kind

Side effects SHALL be placed as follows:

- imperative effects triggered by the UI go in thunks;
- effects that react to actions go in listener middleware;
- results Indigo computes from the structure go in RTK Query endpoints.

Sagas and observables SHALL NOT be used.

#### Scenario: A reactive effect

- **WHEN** logic must run whenever a given action is dispatched, such as a debounce, a timer or persistence
- **THEN** it SHALL be implemented with `createListenerMiddleware`, typed with `startListening.withTypes()`

#### Scenario: A thunk that already works

- **WHEN** an existing thunk works and its callers need no pending or error state
- **THEN** it MAY stay a plain thunk instead of being rewritten with `createAsyncThunk`

---

### Requirement: RTK Query for computed Indigo results only

An Indigo call whose result depends only on the structure and its options, and which can repeat for the same input, SHALL be an RTK Query endpoint. Each package SHALL have one API slice using `fakeBaseQuery` and a `queryFn` per endpoint, with the structure service taken from `extra`. Endpoint arguments SHALL be serialisable. The cache key SHALL be derived from a hash of the structure plus the options. Errors SHALL be stored as plain data, not `Error` objects. Calls that change the structure, and loading or saving files, SHALL NOT use RTK Query.

#### Scenario: The same input again

- **WHEN** properties are requested for a structure and options that were calculated recently
- **THEN** the cached result SHALL be returned without calling Indigo

#### Scenario: Responses arrive out of order

- **WHEN** the selection changes while an earlier calculation is still running
- **THEN** the UI SHALL show only the result for the current arguments

#### Scenario: Nothing to calculate

- **WHEN** the current input can't be calculated, for example because the structure is empty
- **THEN** the query SHALL be skipped with `skipToken`

---

### Requirement: Memoised, narrow selectors

Derived data SHALL come from selectors defined in a slice's `selectors` field or with `createSelector` (imported from `@reduxjs/toolkit`). Derived data SHALL NOT be computed by plain functions called during render. Selector inputs SHALL be individual fields, never a whole slice. Reselect's development checks SHALL stay enabled. A derived list SHALL keep item identity stable when the underlying items don't change.

#### Scenario: An unrelated field changes

- **WHEN** a field that a selector doesn't take as input changes
- **THEN** the selector SHALL return the previous result by reference

#### Scenario: Marking items

- **WHEN** a derived list needs a per-item flag, such as "favourite"
- **THEN** the flag SHALL come from a separate lookup, for example a set of ids
- **AND** each item SHALL NOT be copied to add it
