## 1. Geometry and Resolution Helpers (ketcher-core)

- [x] 1.1 Add named constants for the bond-proximity thresholds (outer/inner, TBD with UX) and the 3 Å minimum bond length
- [x] 1.2 Implement a pure function for the phosphate-preset bond extension (sides B = 0.75 Å, A = 1.5 Å, angle α → C; extend to 2C) with unit tests, including both bond orientations
- [x] 1.3 Implement circular-structure detection for a bond (endpoints stay connected after removal) with unit tests
- [x] 1.4 Implement the shift-set computation for linear chains (right/bottom part) and circular structures (past the perpendicular line, angles preserved) with unit tests
- [x] 1.5 Implement the insertion AP resolver (`resolveMonomerInsertion`/`resolvePresetInsertion` in `insertionHelpers.ts`: R3–R1 sugar/base, otherwise R1↔R2 complement) as its own table, independent of `bondConnectionHelpers.ts` and `SequenceMode.ts` — see design.md Decision 2; return AP pair or a failure reason (preset / single-AP / multi-AP); unit tests per default-bond rule

## 2. Insertion Command (ketcher-core)

- [x] 2.1 Build the insertion as one command (implemented in `LibraryItemDragDropHandler.executeInsertion` + `insertion.ts`, not as a `DrawingEntitiesManager` method — accepted deviation, see design.md Decision 3): delete bond, add monomer, add two bonds, apply shifts
- [x] 2.2 Add preset variant (sugar/phosphate/base placement, sugar–phosphate midpoint, flip on antisense chain)
- [x] 2.3 Verify undo/redo restore the original bond in one step

## 3. Drag Handling (ketcher-core)

- [x] 3.1 Add the bond-proximity check to `LibraryItemDragDropHandler`, evaluated only when no replacement target is active and racing the AP-proximity check by distance (closer one wins) — see design.md Decision 1
- [x] 3.2 Route drop on an indicated bond to the insertion path; resolve APs; open the AP dialog or error modal on failure
- [x] 3.3 Trigger snake layout after insertion in Snake mode; apply Flex layout per geometry helpers
- [x] 3.4 Clear bond state on drag end, cancel, and right-click

## 4. UI (ketcher-macromolecules / ketcher-react)

- [x] 4.1 Add the bond indicator transient view with near/nearer sizes
- [x] 4.2 Add the two Close-only error modals (reuse `openErrorModal`; strings are constants in core, like the existing "Deletion of bonds" dialog)
- [x] 4.3 Build the new three-monomer *Select Attachment Points* dialog (`InsertionConnection`) with AP buttons for the new monomer's two sides, matching the existing filled-blue-pill AP presentation. Use a dedicated `UsageInMacromolecule` value so the existing *Select Attachment Points* / *Edit Attachment Points* dialog (`MonomerConnections`) is not touched.
- [x] 4.4 Wire **Connect** in the AP dialog to the insertion command when opened from a bond drop

## 5. Replacement Update (req. 8)

- [x] 5.1 Apply the variable bond extension when a phosphate-containing preset replaces a monomer in a circular structure
- [x] 5.2 Add unit tests for the circular replacement case
- [x] 5.3 Document req. 8 as a MODIFIED requirement delta against the `monomer-replacement-drag-drop` capability (`specs/monomer-replacement-drag-drop/spec.md`) — missing until this spec review

## 6. Verification

- [x] 6.1 Run `npm run test:types` and package unit tests
- [x] 6.2 Run `verify-ketcher` for Flex and Snake insertion, both error modals, and the dialog flow
- [ ] 6.3 Write the E2E test plan per `.memory-bank/testing/testing.md` and ask the user to proceed before writing specs

## 7. Memory Bank (at archive)

- [ ] 7.1 Add `.memory-bank/features/monomer-insertion-drag-drop.md`; update `modules/monomer-drag-and-drop.md`; remove the now-resolved req. 8 limitation if listed
