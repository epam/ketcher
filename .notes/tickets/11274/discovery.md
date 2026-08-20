# Discovery: #11274 - react-hooks/exhaustive-deps refactor in Editor.tsx

## Title + Link
**Refactor: `react-hooks/exhaustive-deps` rule violation clean up from `packages\ketcher-react\src\Editor.tsx` file**
URL: https://github.com/epam/ketcher/issues/11274

## Assignment Verification
- Verified: The issue is assigned to `skorphil` via GitHub API.

## Scope and Acceptance Criteria
Clean up `react-hooks/exhaustive-deps` rule violations in `packages/ketcher-react/src/Editor.tsx`.

> **What problem `does react-hooks/exhaustive-deps` detect?**
> It checks whether hooks such as `useEffect`, `useMemo`, and `useCallback` list all reactive values used inside their callback in the dependency array.
>
> **How is it usually fixed?**
> Add every reactive value used by the callback to the dependency array. Other common solutions include:
> - moving constants or stable helper functions outside the component;
> - defining helper functions inside the effect;
> - using functional state updates to avoid unnecessary dependencies;
> - restructuring the component so the effect has fewer responsibilities;
> - removing the effect or memoization if it is unnecessary.

**Problem locations:**
`packages/ketcher-react/src/Editor.tsx`

## Affected Packages/Files
- `packages/ketcher-react/src/Editor.tsx`

## Context from Memory Bank
### Architecture
`Editor.tsx` is the entry point for `ketcher-react`. It orchestrates the coexistence of `MicromoleculesEditor` and `MacromoleculesEditor` (lazy-loaded). It manages the global `isPolymerEditorTurnedOn` flag on the `window` object and handles the switching logic between the two editors.

### Testing
- Unit tests: `packages/ketcher-react/src/__tests__/Editor.test.tsx` (if exists) or similar.
- E2E tests: `ketcher-autotests/` should cover the switching logic between modes.

### Invariants
- `A1`: Mode switching must ensure both editors are notified to sync their state (micromolecules vs macromolecules).
- `A2`: The `ketcher` facade must be initialized and passed via `onInit`.

## Code Reconnaissance
Hook usages in `packages/ketcher-react/src/Editor.tsx`:

1. **`useEffect` (lines 69-96)**
   - **Current deps**: `[macromoleculesEditor]`
   - **Referenced**: `macromoleculesEditor`, `togglePolymerEditor`
   - **Missing**: `togglePolymerEditor` (which captures `setShowPolymerEditor`).
   - **Reason**: `togglePolymerEditor` is a local function capturing state setters.

2. **`useEffect` (lines 98-102)**
   - **Current deps**: `[]`
   - **Referenced**: `window`
   - **Missing**: none (window is stable).

3. **`useEffect` (lines 104-114)**
   - **Current deps**: `[showPolymerEditor]`
   - **Referenced**: `moleculesEditor`, `macromoleculesEditor`, `showPolymerEditor`
   - **Missing**: `moleculesEditor`, `macromoleculesEditor`.

4. **`useEffect` (lines 116-126)**
   - **Current deps**: `[moleculesEditor, macromoleculesEditor]`
   - **Referenced**: `ketcher`, `moleculesEditor`, `macromoleculesEditor`, `props.disableMacromoleculesEditor`, `props.onInit`
   - **Missing**: `ketcher`, `props.disableMacromoleculesEditor`, `props.onInit`.

## Reflective Design Prompt
**Why was this solution made in the first place?**
The omissions were likely intentional to prevent unnecessary re-executions of the effects. 
- In the `onInit` effect (line 116), including `props.onInit` might trigger the initialization callback multiple times if the parent component passes a new function reference on every render.
- In the mode switching effect (line 104), the developer likely wanted to trigger the switch only when `showPolymerEditor` changes, assuming `moleculesEditor` and `macromoleculesEditor` are already present or don't need to trigger the switch themselves when they arrive.

## Risks and Edge Cases
- **Infinite Loops**: Adding `moleculesEditor` or `macromoleculesEditor` to dependency arrays might cause infinite loops if their setters or the objects themselves change frequently (though they are state-managed here).
- **`onInit` memoization**: `props.onInit` and internal `onInitMoleculesEditor`/`onInitMacromoleculesEditor` should probably be wrapped in `useCallback` to maintain stability if they are used as dependencies elsewhere.
- **Stable Module Singletons**: `ketcherProvider` is a singleton, but its usage inside hooks should still be verified.
- **Window flags**: `window.isPolymerEditorTurnedOn` is a side effect that must stay in sync with `showPolymerEditor` state.
- **Async Macromolecules import**: `MacromoleculesEditorComponent` is lazy-loaded, so `macromoleculesEditor` state will be null until it loads and calls `onInit`.

## Existing Work
- none

## Sources Consulted
- `.memory-bank/architecture.md`
- `.memory-bank/testing.md`
- `packages/ketcher-react/src/Editor.tsx`
- GitHub Issue #11274

Written by AI on behalf of Philipp S.
