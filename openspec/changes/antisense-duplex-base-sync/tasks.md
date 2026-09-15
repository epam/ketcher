> **Ordering note:** the two blanket antisense guards are lifted last, in section 13. Until then every duplex edit path stays unreachable, so each intermediate commit is inert from the user's point of view and nothing half-built is exposed.

## 1. Preserve bond type when replacing a monomer

- [x] 1.1 In `DrawingEntitiesManager.replaceMonomer.ts`, capture each collected bond's type alongside its endpoints and attachment points in `polymerBondInfoList`
- [x] 1.2 Pass that type as the fifth argument to `createPolymerBond` when recreating each bond, so a `HydrogenBond` is rebuilt as a `HydrogenBond` rather than defaulting to a covalent single bond
- [x] 1.3 Add a unit test in `__tests__/domain/entities/` proving that replacing an H-bonded base leaves a `HydrogenBond` instance in `polymerBonds` and in the partner monomer's `hydrogenBonds` array, and leaves nothing on the pseudo attachment point
- [x] 1.4 Commit this fix on its own, before any feature work

## 2. Pure complement resolution

- [x] 2.1 Create the helper module under `packages/ketcher-core/src/domain/helpers/` for antisense base synchronization
- [x] 2.2 Implement a deoxyribose predicate that matches a sugar label against `RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA`, following the existing precedent in `Nucleoside`, `Nucleotide` and the sequence item renderers
- [x] 2.3 Implement the pure resolver taking the previous natural analogue, the new base's library item, and the opposite nucleotide's sugar; return nothing when the analogue is unchanged, otherwise look up `DrawingEntitiesManager.antisenseChainBasesMap` selected by the deoxyribose predicate
- [x] 2.4 Return nothing rather than throwing when the new analogue has no entry in the table
- [x] 2.5 Unit test: unchanged analogue returns nothing (rule 1.2)
- [x] 2.6 Unit test: adenine maps to uracil on ribose and to thymine on deoxyribose
- [x] 2.7 Unit test: a modified sense base resolves through its natural analogue rather than its label
- [x] 2.8 Unit test: the ambiguous IUPAC codes round-trip through the table
- [x] 2.9 Unit test: an unrecognized analogue returns nothing

## 3. Duplex traversal and the blocked-pair predicate

- [x] 3.1 Implement traversal from an edited base monomer to its H-bonded partner base, handling both the split nucleotide/nucleoside shape and the unsplit nucleotide shape
- [x] 3.2 Implement the eligibility predicate: the base reaches its sugar through the R1 to R3 pairing and that sugar has at least one backbone connection, reusing the existing helpers in `domain/helpers/monomers.ts`
- [x] 3.3 Implement the selected-pair predicate used by both the blocking rule and the propagation guard
- [x] 3.4 Unit tests on a canvas fixture, following `__tests__/domain/entities/antisenseChain.test.ts`, for each predicate including the negative cases

## 4. The mirror command builder

- [x] 4.1 Implement the command builder: take the edited base and its partner, resolve the target label to a library item through an injected callback so the domain layer never imports the editor, and merge operations into the caller's `Command` rather than creating a new one
- [x] 4.2 Keep the builder direction-agnostic, so the same function serves a sense-to-antisense and an antisense-to-sense edit
- [x] 4.3 Guard: skip when `needToEditAntisense` is false (rule 2.1)
- [x] 4.4 Guard: skip when the opposite base monomer is itself selected, reusing the `monomer.selected` check the deletion path applies (rule 1.1)
- [x] 4.5 Branch between in-place item swap and full replace on the same ambiguous-base condition the RNA Builder path already uses, so the two cannot drift apart
- [x] 4.6 Leave the opposite nucleotide's sugar and phosphate untouched
- [x] 4.7 Unit test: a sense base change rewrites the paired base
- [x] 4.8 Unit test: an antisense base change rewrites the paired sense base, and the table is chosen from the sense nucleotide's own sugar
- [x] 4.9 Unit test: one undo restores both strands together
- [x] 4.10 Unit test: the hydrogen bond survives the ambiguous-base path
- [x] 4.11 Unit test: no mirroring when sync editing is off
- [x] 4.12 Unit test: no mirroring when the opposite base is selected
- [x] 4.13 Unit test: the paired nucleotide keeps its own sugar and phosphate
- [x] 4.14 Unit test: a modification on the rewritten base is discarded

## 5. Carry the selected strand into the write-back layer

- [x] 5.1 Add the strand marker to `LabeledNodesWithPositionInSequence` in `application/editor/tools/Tool.ts`
- [x] 5.2 Populate it in `generateLabeledNodes` by comparing the selected node against the two-stranded node's `antisenseNode`, both already in scope
- [x] 5.3 In `SequenceMode.modifySequenceInRnaBuilder`, resolve the node to modify from the marker instead of hardcoding `senseNode`, for the sugar, base and phosphate branches alike
- [x] 5.4 In `SequenceMode.replaceSelectionsWithMonomer`, resolve the node to replace with the same rule `SequenceRenderer.selections` applies internally: the sense node when its monomer is selected, otherwise the antisense node
- [x] 5.5 Extend `SequenceItemContextMenu/helpers.test.ts` with a fixture proving an antisense selection is marked as antisense and a sense selection as sense
- [x] 5.6 Confirm a sense-only selection still resolves to the sense node, so existing single-strand behavior is unchanged

## 6. Strand-aware backbone rebuild in the library replace path

- [x] 6.1 In `SequenceMode.replaceSelectionWithMonomer`, take the previous and next neighbors from the strand being edited rather than from `senseNode`
- [x] 6.2 In `SequenceMode.replaceSelectionsWithMonomer`, seed `previousReplacedNode` from the same strand
- [x] 6.3 Follow the existing precedent for antisense ordering: the `isAntisenseEditMode` branch in `insertNewSequenceFragment` and the antisense neighbor selection in the no-selection branch of `insertMonomerFromLibrary`
- [x] 6.4 Preserve the hydrogen bond to the opposite strand across the replacement, as the existing code already does through `preservedHydrodenBonds`
- [x] 6.5 Unit test: replacing a monomer in the middle of an antisense strand reconnects it to the same antisense neighbors and leaves the strand a single chain
- [x] 6.6 Unit test: replacing at the start and at the end of an antisense strand

## 7. Mirror from the RNA Builder update path

- [x] 7.1 Call the command builder inside the existing per-node loop in `modifySequenceInRnaBuilder`, before `ReinitializeModeOperation` and `history.update`
- [x] 7.2 Pass the edited base from the strand resolved in task 5, so the mirror runs in the correct direction
- [x] 7.3 Verify the mirrored operations tolerate the command's existing undo ordering

## 8. Mirror from the select-and-replace-from-library path

- [x] 8.1 Call the command builder inside the existing per-node loop in `replaceSelectionsWithMonomer`
- [x] 8.2 Verify compatibility with the existing `setUndoOperationReverse` and `setUndoOperationsByPriority` calls on that command

## 9. Carry the blocked-pair flag into the RNA Builder payload

- [x] 9.1 Add the blocked-pair field to `LabeledNodesWithPositionInSequence`, alongside `hasAntisense` and the strand marker
- [x] 9.2 Populate it in `generateLabeledNodes`: true when sync editing is on, the node's base is H-bonded to the opposite node's base, both bases satisfy the eligibility predicate from section 3, and the opposite base monomer is itself selected
- [x] 9.3 Extend `SequenceItemContextMenu/helpers.test.ts` with fixtures covering: only sense selected, both strands selected, both selected but not H-bonded, a base whose sugar has no backbone connection, and both strands selected with sync editing off

## 10. Show `[disabled]` instead of `[multiple]`

- [x] 10.1 In `sequenceEdit.ts`, thread the blocked flag into `getNucleotideMonomerGroupName` and return `[disabled]` in place of `[multiple]` when blocked
- [x] 10.2 Keep showing the single base symbol when blocked and all selected bases are identical (rule 1.3.1)
- [x] 10.3 Confirm `[multiple]` still appears in non-sync mode for a heterogeneous selection
- [x] 10.4 Extend `sequenceEdit.test.ts` with the `[disabled]`, identical-symbol, and non-sync `[multiple]` cases

## 11. Disable the base library and show the error toast

- [x] 11.1 In `useDisabledForSequenceMode`, return true for every item in the bases group when the flag is set
- [x] 11.2 In `RnaEditorExpanded.selectGroup`, dispatch the error toast via `editor.events.error.dispatch` when the clicked group is bases and the flag is set
- [x] 11.3 Use the exact string: "Modification of bases is disabled in sync mode when both the sense and antisense strands are selected. Go to non-sync mode for base modification."
- [x] 11.4 Confirm the sugar and phosphate sections remain editable while bases are blocked
- [x] 11.5 Confirm nothing is blocked in non-sync mode

## 12. Block library replacement on a both-strands selection

- [x] 12.1 In `replaceSelectionsWithMonomer`, refuse the replacement when the monomer is a base, the selection contains a selected H-bonded pair, and sync editing is on
- [x] 12.2 Surface the same error string through `editor.events.error.dispatch`
- [x] 12.3 Confirm the string is identical in both packages; `ketcher-core` cannot import from `ketcher-macromolecules`, so the duplication is intentional

## 13. Lift the blanket antisense guards

- [x] 13.1 In `SequenceItemContextMenu.tsx`, stop disabling "Modify in RNA Builder..." on `menuProps.hasAntisense`
- [x] 13.2 In `SequenceMode.insertMonomerFromLibrary`, remove the `isSelectionsContainAntisenseChains` early return, which returns silently today; the refusal from section 12 takes its place
- [x] 13.3 Leave the `isSelectionsContainAntisenseChains` guard in `insertPresetFromLibrary` untouched; preset replacement on a duplex is out of scope
- [x] 13.4 Confirm `hasAntisense` still has a consumer after this change, and remove it if it no longer does
- [ ] 13.5 Manual smoke check in sequence mode: edit a sense base, edit an antisense base, select both strands of a pair, replace a nucleotide mid-antisense-strand, and repeat with sync editing off — NOT DONE: requires a browser; handed to the human reviewer (matrix in the Task 13 report)

---

> **Correction after manual testing.** Sections 14 to 18 follow from the false premise recorded in the design's Context: the selection layer is not strand-aware. Sections 1 to 13 stay as they were; these repair what that premise broke.

## 14. Record which strand each selection gesture targeted

- [x] 14.1 Add a tri-state record for the strand the current selection gesture targeted: sense, antisense, or both, with a setter that does NOT call `initialize()`. It lives on `SequenceRenderer`, beside the caret it already keeps, so the select tool can write it without importing the mode
- [x] 14.2 Do not reuse `_isAntisenseEditMode`; it tracks the caret's location rather than a gesture result, and its setter re-lays-out the canvas
- [x] 14.3 In `SelectBase.mousedownEntity`, record the clicked row from the renderer's `isAntisenseNode`
- [x] 14.4 On shift-extension, combine the newly clicked row with the rows already represented in the selection
- [x] 14.5 In `SequenceMode.mousedown` and `mousedownBetweenSequenceItems`, record the row an edit-mode drag begins on
- [x] 14.6 In `shiftArrowSelectionInEditMode`, record the caret's row
- [x] 14.7 Record both strands for select-all
- [x] 14.8 For the selection rectangle, derive the targeted strand from which monomers are actually selected; it is geometric and selects only what it covers, so no record is needed
- [x] 14.9 Reset the record whenever the selection is cleared, so a stale strand cannot steer the next edit
- [x] 14.10 Unit-test the resolution of the record, including the derive-from-selection path

## 15. Route every strand decision through the record

- [x] 15.1 Make `getSelectedStrandType` answer from the record instead of from `senseNode.monomer.selected`, which is always true on a duplex
- [x] 15.2 Keep the return type strictly binary; answer uniformly only when the record names one strand, and resolve each position from its own selection state when there is no record or the record is "both"
- [x] 15.3 Confirm `splitSelectionRangeByStrand` and the reverse-iteration seed in `replaceSelectionsWithMonomer` still hold once the strand comes from the record
- [x] 15.4 Check the two branches of `insertMonomerFromLibrary`, which pick the strand by different mechanisms, and make them agree

## 16. One edit per position, not one per strand

- [x] 16.1 Emit one entry per position for the targeted strand instead of one per selected strand, by filtering before `generateLabeledNodes` runs rather than inside it
- [x] 16.2 Filter the flat selection once at the top of `generateSequenceContextMenuProps`, before any count, title or enablement flag is derived from it, so every user-facing number is N; keep every entry when both strands were targeted
- [x] 16.2a Check each context menu item's enablement against the narrowed list, since those flags are derived from the same flat selection
- [x] 16.3 Confirm the update confirmation names N nucleotides rather than 2N
- [x] 16.4 Confirm the RNA Builder writes the chosen base once, to the targeted strand only

## 17. Re-scope the both-strands block

- [x] 17.1 Make the blocked-pair predicate key off the record saying both strands were targeted, not off both partners being selected
- [x] 17.2 Confirm a one-strand gesture on a duplex is no longer blocked, so propagation is reachable with sync editing on
- [x] 17.3 Confirm a gesture that genuinely covers both rows is still blocked, with the mandated message
- [x] 17.4 Confirm no empty entry reaches the undo history when a replacement leaves the opposite strand unchanged

## 18. Report the refusals the user can currently only guess at

- [ ] 18.1 In `insertPresetFromLibrary`, dispatch a message saying preset replacement is not supported on a duplex, instead of returning silently
- [ ] 18.2 In `StyledToast`, replace the fixed height with a minimum height, stop stretching the content, and widen the container so the mandated message is not clipped
- [ ] 18.3 Flag the toast size change to the team that owns the Playwright screenshots
