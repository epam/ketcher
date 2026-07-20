## 1. Refactor shared modal-invocation logic

- [x] 1.1 Extract `shouldInvokeModal` from `Bond.ts` into a standalone pure function (e.g. `shouldInvokeConnectionModal`) in `DrawingEntitiesManager` or a new `bondHelpers` utility in `ketcher-core`
- [x] 1.2 Replace the inline `shouldInvokeModal` calls in `Bond.ts` with the extracted function, verifying existing bond-tool behavior is unchanged
- [x] 1.3 Add unit tests for the extracted function covering all existing cases (Chem, UnresolvedMonomer, RNA+Peptide, Peptide–Peptide >2 APs, single-AP auto-connect)

## 2. Flex-mode dropped monomer repositioning

- [x] 2.1 After `createPolymerBond` succeeds in Flex mode and `dragDropBondTarget` was set, compute the dropped monomer's target position using the target AP canonical angle, body radii, and standard bond length
- [x] 2.2 Apply the computed position to the dropped monomer (and all monomers in the dropped preset group) via a `MoveMonomerOperation` before committing to history
- [x] 2.3 Verify that open-canvas drops (no proximity hit) are unaffected and monomer lands at cursor position as before

## 3. Preset mirroring in Flex mode (req. 3.3.1)

- [x] 3.1 After bond creation for a preset drop in Flex mode, determine whether the bonded preset component is the first or last in its internal chain topology (using `ChainsCollection` traversal)
- [x] 3.2 Determine whether the target canvas monomer is the first or last in its chain topology (same traversal API)
- [x] 3.3 If both are on the same topology side (both first or both last), mirror the preset horizontally: negate x-offsets of each preset monomer relative to the bond insertion point, then apply `MoveMonomerOperation` for each
- [x] 3.4 Add Playwright E2E test: drop a preset onto the first monomer of an existing chain in Flex mode and verify the preset is mirrored (first-to-first case)

## 4. Non-standard bond notification on drag-drop path

- [x] 4.1 In the drag-drop bond creation path (`Editor.ts` placement handler), after bond is created, call the shared `shouldInvokeConnectionModal` (from task 1.1) and check for the non-standard (same-group AP) condition
- [x] 4.2 Fire the existing "You have connected monomers with attachment points of the same group" notification toast when the condition is met on the drag-drop path
- [x] 4.3 Add a Playwright E2E test: drag a monomer and drop onto a same-group AP, verify the toast appears

## 5. Preset AP fallback and modal edge cases (req. 3.3)

- [x] 5.1 Audit `findPresetMonomerForBonding` in `Editor.ts` against req. 3.3: ensure the sugar → phosphate → base fallback is complete and handles the case where all three have no free APs (silently skip bond, place preset without bonding)
- [x] 5.2 Ensure that when `findPresetMonomerForBonding` returns a monomer but `getValidSourcePoint` returns null and the monomer has ≥2 free APs, the _Select Attachment Points_ dialog opens with the drag-drop path flag (`isDragDropBondModalOpen = true`)
- [x] 5.3 Add unit tests for `findPresetMonomerForBonding`: R1 target → component with free R2, R2 target → component with free R1, Rn target (n>2) → sugar fallback, phosphate fallback, base fallback, all-exhausted → null

## 6. Undo/redo batching for drop-and-bond

- [x] 6.1 Wrap the monomer placement and bond creation operations in the drag-drop placement handler into a single `CommandsHistory` batch so they undo/redo as one atomic step
- [x] 6.2 Add a Playwright E2E test: drop-and-bond then undo → both the bond and the placed monomer are removed; then redo → both are restored

## 7. Acceptance tests (Playwright E2E)

- [x] 7.1 Test: Drag monomer near canvas monomer AP → AP highlight appears with `+` indicator; drag away → highlight clears
- [x] 7.2 Test: Drop amino acid onto another amino acid's R1 in Flex mode → R1-R2 bond created automatically, no dialog
- [x] 7.3 Test: Drop a Sugar monomer onto an RNABase's free AP → R3-R1 bond created
- [x] 7.4 Test: Drop a Chem monomer onto a canvas monomer → _Select Attachment Points_ dialog opens
- [x] 7.5 Test: Drop a preset onto a canvas monomer R1 → bond established with preset component having free R2 (req. 3.1)
- [x] 7.6 Test: Drop a preset onto a canvas monomer R2 → bond established with preset component having free R1 (req. 3.2)
- [x] 7.7 Test: Drop monomer and bond in Snake mode → snake layout re-executes, all monomers repositioned
- [x] 7.8 Test: Drop monomer near AP in Flex mode → dropped monomer snaps to standard bond-length distance from target

## 8. Memory bank and spec updates

- [ ] 8.1 Update `.memory-bank/features/macromolecules.md` to add the new drag-and-drop bonding scenario and guarantee
- [ ] 8.2 Confirm no changes needed to `architecture.md`, `domain.md`, or `glossary.md` (this change is behavioral, not architectural)
