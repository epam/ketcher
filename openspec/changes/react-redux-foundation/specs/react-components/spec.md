## ADDED Requirements

### Requirement: Function components only

Components in `ketcher-react` and `ketcher-macromolecules` SHALL be function components. The only exception SHALL be error boundaries, which React requires to be classes. Existing class components SHALL be listed on an allowlist that only shrinks.

#### Scenario: Adding a class component

- **WHEN** a source file declares a class extending `Component` or `PureComponent` and the file is not on the allowlist
- **THEN** lint SHALL fail

#### Scenario: Converting a class component

- **WHEN** a class component is converted to a function component
- **THEN** the rendered DOM SHALL be unchanged
- **AND** the e2e suite SHALL pass without updating any baseline
- **AND** the file SHALL be removed from the allowlist in the same PR

---

### Requirement: Typed hooks only

Each package SHALL define `useAppSelector` and `useAppDispatch` with `useSelector.withTypes<RootState>()` and `useDispatch.withTypes<AppDispatch>()`, in one file. Other files SHALL NOT import `useSelector`, `useDispatch` or `TypedUseSelectorHook` from `react-redux`. `useStore` MAY be imported only by the typed-hooks file and by tests.

#### Scenario: A raw hook

- **WHEN** a component imports `useSelector` or `useDispatch` from `react-redux`
- **THEN** lint SHALL fail

#### Scenario: An inline selector

- **WHEN** a component calls `useAppSelector` with an inline selector
- **THEN** the selector's `state` argument SHALL be typed as the package's root state, with no annotation

#### Scenario: Dispatching a thunk

- **WHEN** a component dispatches a thunk through `useAppDispatch`
- **THEN** it SHALL type-check without casts

#### Scenario: After this change

- **WHEN** this change is merged
- **THEN** no source file outside the typed-hooks files SHALL import `useSelector`, `useDispatch` or `TypedUseSelectorHook`

---

### Requirement: No connect

Components SHALL read the store through the typed hooks, not through `connect`. Existing `connect` usages SHALL be listed on an allowlist that only shrinks.

#### Scenario: Adding connect

- **WHEN** a source file not on the allowlist imports `connect` or `legacy_connect` from `react-redux`
- **THEN** lint SHALL fail

#### Scenario: Replacing connect

- **WHEN** a `connect`ed component is moved to hooks
- **THEN** each `mapStateToProps` field SHALL become a typed-hook selector that returns either a stable reference or a primitive
- **AND** if the component relied on `connect`'s render bailout, it SHALL be wrapped in `React.memo`

---

### Requirement: Compatible with React 18 and 19

While the published peer range includes React 18, components SHALL use only APIs available in both React 18 and 19. In particular, components that take refs SHALL keep `forwardRef` and SHALL NOT rely on `ref` as a plain prop. The React Compiler SHALL NOT be enabled during the migration.

#### Scenario: Forwarding a ref

- **WHEN** a function component must accept a ref
- **THEN** it SHALL use `forwardRef`
