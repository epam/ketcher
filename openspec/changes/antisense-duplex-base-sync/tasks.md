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
- [x] 13.3 ~~Leave the `isSelectionsContainAntisenseChains` guard in `insertPresetFromLibrary` untouched; preset replacement on a duplex is out of scope~~ — SUPERSEDED by section 19: the guard is removed and preset replacement is supported
- [x] 13.4 Confirm `hasAntisense` still has a consumer after this change, and remove it if it no longer does
- [ ] 13.5 Manual smoke check in sequence mode: edit a sense base, edit an antisense base, select both strands of a pair, replace a nucleotide mid-antisense-strand, and repeat with sync editing off — NOT DONE: requires a browser; handed to the human reviewer (matrix in the Task 13 report)

---

> **Correction after manual testing.** Sections 14 to 18 follow from the false premise recorded in the design's Context: the selection layer is not strand-aware. Sections 1 to 13 stay as they were; these repair what that premise broke.

## 14. Record which strand each selection gesture targeted

- [x] 14.1 ~~Add a tri-state record for the strand the current selection gesture targeted: sense, antisense, or both, with a setter that does NOT call `initialize()`. It lives on `SequenceRenderer`, beside the caret it already keeps, so the select tool can write it without importing the mode~~ — SUPERSEDED by section 20
- [x] 14.2 Do not reuse `_isAntisenseEditMode`; it tracks the caret's location rather than a gesture result, and its setter re-lays-out the canvas
- [x] 14.3 ~~In `SelectBase.mousedownEntity`, record the clicked row from the renderer's `isAntisenseNode`~~ — SUPERSEDED by section 20
- [x] 14.4 ~~On shift-extension, combine the newly clicked row with the rows already represented in the selection~~ — SUPERSEDED by section 20
- [x] 14.5 ~~In `SequenceMode.mousedown` and `mousedownBetweenSequenceItems`, record the row an edit-mode drag begins on~~ — SUPERSEDED by section 20
- [x] 14.6 ~~In `shiftArrowSelectionInEditMode`, record the caret's row~~ — SUPERSEDED by section 20
- [x] 14.7 ~~Record both strands for select-all~~ — SUPERSEDED by section 20
- [x] 14.8 ~~For the selection rectangle, derive the targeted strand from which monomers are actually selected; it is geometric and selects only what it covers, so no record is needed~~ — SUPERSEDED by section 20
- [x] 14.9 ~~Reset the record whenever the selection is cleared, so a stale strand cannot steer the next edit~~ — SUPERSEDED by section 20
- [x] 14.10 ~~Unit-test the resolution of the record, including the derive-from-selection path~~ — SUPERSEDED by section 20

## 15. Route every strand decision through the record

- [x] 15.1 ~~Make `getSelectedStrandType` answer from the record instead of from `senseNode.monomer.selected`, which is always true on a duplex~~ — SUPERSEDED by section 20 and 22
- [x] 15.2 ~~Keep the return type strictly binary; answer uniformly only when the record names one strand, and resolve each position from its own selection state when there is no record or the record is "both"~~ — SUPERSEDED by section 20 and 22
- [x] 15.3 ~~Confirm `splitSelectionRangeByStrand` and the reverse-iteration seed in `replaceSelectionsWithMonomer` still hold once the strand comes from the record~~ — SUPERSEDED by section 22
- [x] 15.4 ~~Check the two branches of `insertMonomerFromLibrary`, which pick the strand by different mechanisms, and make them agree~~ — SUPERSEDED by section 22

## 16. One edit per position, not one per strand

- [x] 16.1 ~~Emit one entry per position for the targeted strand instead of one per selected strand, by filtering before `generateLabeledNodes` runs rather than inside it~~ — SUPERSEDED by section 21
- [x] 16.2 ~~Filter the flat selection once at the top of `generateSequenceContextMenuProps`, before any count, title or enablement flag is derived from it, so every user-facing number is N; keep every entry when both strands were targeted~~ — SUPERSEDED by section 21
- [x] 16.2a ~~Check each context menu item's enablement against the narrowed list, since those flags are derived from the same flat selection~~ — SUPERSEDED by section 21
- [x] 16.3 ~~Confirm the update confirmation names N nucleotides rather than 2N~~ — SUPERSEDED by section 24
- [x] 16.4 ~~Confirm the RNA Builder writes the chosen base once, to the targeted strand only~~ — SUPERSEDED by section 21

## 17. Re-scope the both-strands block

- [x] 17.1 ~~Make the blocked-pair predicate key off the record saying both strands were targeted, not off both partners being selected~~ — SUPERSEDED by section 20
- [x] 17.2 ~~Confirm a one-strand gesture on a duplex is no longer blocked, so propagation is reachable with sync editing on~~ — SUPERSEDED by section 20
- [x] 17.3 Confirm a gesture that genuinely covers both rows is still blocked, with the mandated message
- [x] 17.4 Confirm no empty entry reaches the undo history when a replacement leaves the opposite strand unchanged

## 18. Report the refusals the user can currently only guess at

- [x] 18.1 ~~In `insertPresetFromLibrary`, dispatch a message saying preset replacement is not supported on a duplex, instead of returning silently~~ — SUPERSEDED by section 19: the message and the refusal it explains are both removed
- [x] 18.2 In `StyledToast`, replace the fixed height with a minimum height, stop stretching the content, and widen the container so the mandated message is not clipped
- [ ] 18.3 Flag the toast size change to the team that owns the Playwright screenshots

---

> **Correction: preset replacement is in scope.** Section 19 replaces tasks 13.3 and 18.1. Issue items 1.1 and 1.2 cover updating a nucleotide by replacing it from the library, and a preset is the library item that does that; refusing it left those items unimplemented for the primary gesture. The same work closes a quieter hole in the both-strands refusal, which keyed off the monomer class rather than off whether the item carries a base.

## 19. Support preset replacement on a duplex

- [x] 19.1 Extract the both-strands refusal out of `replaceSelectionsWithMonomer` into one private method on `SequenceMode` that takes the selections and the item carrying the new base, and returns whether the edit is refused
- [x] 19.2 Key that method off any item that would set a new base: a `Base`-class monomer, an unsplit nucleotide, or a preset with a base; leave items that set no base unblocked
- [x] 19.3 Call it at the top of both `insertMonomerFromLibrary` and `insertPresetFromLibrary`, before any confirmation dialog, dispatching the mandated message verbatim and leaving the canvas unchanged
- [x] 19.4 Confirm a both-strands gesture with an unsplit nucleotide is now refused rather than rewriting the sense strand and leaving its partner stale
- [x] 19.5 Remove the `isSelectionsContainAntisenseChains` guard from `insertPresetFromLibrary`, and the helper itself if nothing else uses it
- [x] 19.6 Delete `PRESET_REPLACEMENT_UNSUPPORTED_ON_DUPLEX`, its re-export from `ketcher-core`'s index, and rewrite `SequenceMode.presetRefusal.test.ts` around the new behavior rather than deleting it
- [x] 19.7 In `replaceSelectionsWithPreset`, split each range with `splitSelectionRangeByStrand`, resolve `strandType` once per range, iterate antisense ranges in reverse, and seed `previousReplacedNode` from the chain-previous node of that strand
- [x] 19.8 Thread `strandType` into `replaceSelectionWithPreset`; resolve the node to replace, the next node handed to `insertNewSequenceFragment`, and the phosphate-dropping heuristic through `getNodeForStrand` and the direction-appropriate chain walker
- [x] 19.9 Make `selectionsCantPreserveConnectionsWithPreset` resolve its node per strand, as `getFirstMissingAttachmentPoint` and `selectionsContainLinkerNode` already do
- [x] 19.10 In the per-node loop, capture the previous natural analogue, the H-bonded partner and the edited base's eligibility BEFORE the delete, then call `createMirroredBaseCommand` with `preset.base` as the new item and merge the result into the same `Command`
- [x] 19.11 Confirm a preset with no base neither mirrors nor is refused, and that the column's hydrogen bond is dropped exactly as it is on a single-stranded chain today
- [x] 19.12 Unit-test preset replacement on the sense strand, on the antisense strand, the backbone and hydrogen bond after an antisense replacement, mirroring when the analogue changes, no mirroring when it does not, no mirroring in non-sync mode, and the both-strands refusal for a preset and for an unsplit nucleotide
- [x] 19.13 Confirm the original edit and its mirror remain a single undo step, and that no empty entry reaches the history
- [x] 19.14 Run the `ketcher-core` gate including `test:circ`, rebuild `ketcher-core`, then run the `ketcher-macromolecules` gate
- [ ] 19.15 Manual smoke check in sequence mode: replace a sense nucleotide with a preset, an antisense nucleotide with a preset, both strands with a preset, both strands with an unsplit nucleotide, and repeat with sync editing off — requires a browser; hand the matrix to the human reviewer

---

> **Correction after review: no gesture record; the n/m confirmation.** Sections 20 to 25 implement the design's revised Decisions 10–12 and new Decision 15, and supersede sections 14–16 and tasks 17.1–17.2 (struck through above). Each H-bonded pair is judged by what is actually selected. Clicks, shift-clicks, select-all and every edit-mode selection select both strands of a column, so they fall under the both-strands block. A view-mode drag over one row is the only gesture that selects one strand.
>
> **For agentic workers:** implement with superpowers:subagent-driven-development or superpowers:executing-plans, one section at a time, ticking each task as it is done (CLAUDE.md: never all at once). Read `design.md` Decisions 10, 11, 12, 14 and 15 and the `spec.md` requirements "The edited strand is read from the selection itself", "The strand that changes is the strand that is selected", "Base replacement propagates to the paired strand", "The update confirmation names the additional nucleotides" and "Base modification is blocked when the selection holds both bases of a pair" before starting.
>
> **Global constraints**
> - Refusal text stays verbatim: `Modification of bases is disabled in sync mode when both the sense and antisense strands are selected. Go to non-sync mode for base modification.`
> - Confirmation text, verbatim, when m > 0: `You are going to modify ${n} nucleotides, and that will change ${m} additional nucleotides. Are you sure?`; when m = 0 the existing `You are going to modify ${n} nucleotides. Are you sure?` is unchanged. No singular forms.
> - Modal title, button labels and test ids (`update-sequence-modal`, `update-sequence-modal-body`, `update-sequence-cancel-button`, `update-sequence-yes-button`) do not change.
> - `STRAND_TYPE` stays binary everywhere it reaches the write-back layer.
> - No Playwright work (out of scope; CLAUDE.md requires asking first).
> - Gates: in `packages/ketcher-core` run `npm test` (prettier, eslint, `tsc`, `test:circ`, jest); then `npm run build` in `packages/ketcher-core` so `ketcher-macromolecules` sees the new API; then `npm test` in `packages/ketcher-macromolecules`. Single jest files: `npx jest <path>` from the package directory.
>
> **Review focus** — inputs the spec implies that are easy to miss; each has a test in the owning section:
> 1. Shift+drag picking unpaired symbols on both rows: each selected base mirrors its own partner and nothing is refused (20.2).
> 2. A selection mixing one fully selected pair with one-strand positions: the whole base edit is refused, nothing changes (20.2).
> 3. A ragged duplex (antisense overhang) selected across the overhang: the overhang node is replaced, and no position is dropped or visited twice by the per-strand runs (22.1).
> 4. Undo after a both-strands library replacement restores both strands, both backbones and the hydrogen bond in one step (22.1).
> 5. An RNA Builder payload whose base is unchanged, or whose partner already carries the complement: m is 0 and the old text is shown (23.1, 24.1).

## 20. Judge each pair by the actual selection, and remove the gesture record (`ketcher-core`)

Files: `src/domain/helpers/antisenseBaseSync.ts`; `src/application/editor/modes/SequenceMode.ts`; `src/application/render/renderers/sequence/SequenceRenderer.ts`; `src/application/editor/tools/select/SelectBase.ts`; `src/application/editor/editorEvents.ts`; `src/application/editor/EditorHistory.ts`; `src/application/editor/Editor.ts`; `src/application/editor/modes/types/sequenceMode.ts`. Tests under `__tests__/`: `domain/entities/antisenseBaseSyncCommand.test.ts`, `application/editor/modes/SequenceMode.{antisenseDuplexSync,baseCarryingRefusal,presetRefusal,presetStrandAware}.test.ts`; delete `application/editor/modes/SequenceMode.targetedStrand.test.ts`, `application/editor/tools/select/SelectBase.targetedStrand.test.ts`, `application/render/renderers/sequence/SequenceRenderer.targetedStrand.test.ts`.

Produces (later sections rely on these exact names): `isSelectedAntisensePair(base?: BaseMonomer): boolean`; `resolveMirroredBaseTarget(params): MirroredBaseTarget | undefined` with `interface MirroredBaseTarget { partner: BaseMonomer; targetLabel: string }`; `createMirroredBaseCommand` without `bothStrandsTargeted`.

- [x] 20.1 Rewrite the predicate tests in `antisenseBaseSyncCommand.test.ts` (they fail until 20.3):
  - Replace the three `isSelectedAntisensePair(…, true|false)` tests with: true when both bases are selected and eligible; false when only one side is selected; false when both are selected but not hydrogen bonded (call with one argument).
  - Delete `does nothing when both strands were targeted` and its "even with partner and eligibility supplied explicitly" twin; drop `bothStrandsTargeted` from every other `createMirroredBaseCommand` call.
  - Add, in `describe('createMirroredBaseCommand')`:
    ```ts
    it('does nothing when the paired base is itself selected', () => {
      const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
      const labelBefore = antisenseBase.label;
      editor.drawingEntitiesManager.selectDrawingEntities([senseBase, antisenseBase]);
      const newBaseItem = resolveBaseLibraryItem('C');
      if (!newBaseItem) throw new Error('Library item C not found');

      const command = createMirroredBaseCommand({
        drawingEntitiesManager: editor.drawingEntitiesManager,
        editedBase: senseBase,
        previousNaturalAnalogue: 'A',
        newBaseMonomerItem: newBaseItem,
        isSyncEditMode: true,
        resolveBaseLibraryItem,
      });

      expect(command).toBeUndefined();
      expect(antisenseBase.label).toBe(labelBefore);
    });

    it('mirrors when only the edited base is selected', () => {
      const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
      editor.drawingEntitiesManager.selectDrawingEntities([senseBase]);
      const newBaseItem = resolveBaseLibraryItem('C');
      if (!newBaseItem) throw new Error('Library item C not found');

      createMirroredBaseCommand({
        drawingEntitiesManager: editor.drawingEntitiesManager,
        editedBase: senseBase,
        previousNaturalAnalogue: 'A',
        newBaseMonomerItem: newBaseItem,
        isSyncEditMode: true,
        resolveBaseLibraryItem,
      });

      expect(antisenseBase.label).toBe('G');
    });
    ```
  - Add `describe('resolveMirroredBaseTarget')` (same `beforeEach`/`afterEach` as `createMirroredBaseCommand`): returns `{ partner: antisenseBase, targetLabel: 'G' }` for sense A→C with sync on and nothing selected; `undefined` when sync is off; `undefined` when the partner is selected; `undefined` when the analogue is unchanged (A→A); `undefined` when the partner already carries the target — `buildDuplex(editor, 'C')` (antisense `G`), `previousNaturalAnalogue: 'T'`, new item `C`: the target is `G`, which the partner already is. Each case also asserts the antisense label is unchanged (the helper builds no command).
- [x] 20.2 Rewrite the `SequenceMode` suites so a one-strand selection is made the way a view-mode drag makes it — by selecting only that strand's monomers — instead of through the record:
  - In `SequenceMode.antisenseDuplexSync.test.ts` add the helper below; drop every `setTargetedStrand`/`resetTargetedStrand` call and every `expect(SequenceRenderer.targetedStrand)…`; drive Step 3 and Step 5 through `selectOnly([...])` instead of `dragAcrossBothPositions`; make Step 4's `selectBothStrandsAtPositionZero` select both strands without writing a record.
    ```ts
    // A view-mode drag over one row selects exactly the symbols it covers.
    const selectOnly = (nucleotides: Nucleotide[]) => {
      editor.drawingEntitiesManager.unselectAllDrawingEntities();
      editor.drawingEntitiesManager.selectDrawingEntities(
        nucleotides.flatMap((nucleotide) => nucleotide.monomers),
      );
    };
    ```
  - Add to `SequenceMode.antisenseDuplexSync.test.ts`:
    ```ts
    describe('selection decides, per pair', () => {
      it('treats an edit-mode drag as a both-strands selection and refuses base replacement', () => {
        const { senseNucleotides, antisenseNucleotides } = enterEditMode(editor);
        dragAcrossBothPositions(senseNucleotides[0], antisenseNucleotides[1]);
        const dispatchSpy = jest.spyOn(editor.events.error, 'dispatch');

        mode.insertMonomerFromLibrary(requireBaseLibraryItem(editor, 'C'));

        expect(dispatchSpy).toHaveBeenCalledWith(BASE_MODIFICATION_DISABLED_IN_SYNC_MODE);
        expect(senseNucleotides[0].rnaBase.label).toBe('A');
        expect(antisenseNucleotides[0].rnaBase.label).toBe('U');
        dispatchSpy.mockRestore();
      });

      it('mirrors each selected base to its own partner when unpaired symbols on both rows are selected', () => {
        const { senseNucleotides, antisenseNucleotides } = buildTwoPositionDuplex(editor);
        // sense position 0 (A, partner U) and antisense position 1 (G, partner C)
        selectOnly([senseNucleotides[0], antisenseNucleotides[1]]);
        const dispatchSpy = jest.spyOn(editor.events.error, 'dispatch');

        callReplaceSelectionsWithMonomer(mode, SequenceRenderer.selections, requireBaseLibraryItem(editor, 'U'));

        expect(dispatchSpy).not.toHaveBeenCalled();
        expect(antisenseNucleotides[0].rnaBase.label).toBe('A'); // sense A -> U mirrors its partner U -> A
        expect(senseNucleotides[1].rnaBase.label).toBe('A');     // antisense G -> U mirrors its partner C -> A (ribose)
        dispatchSpy.mockRestore();
      });

      it('refuses the whole base edit when one pair is fully selected among one-strand positions', () => {
        const { senseNucleotides, antisenseNucleotides } = buildTwoPositionDuplex(editor);
        selectOnly([senseNucleotides[0], antisenseNucleotides[0], senseNucleotides[1]]);
        const dispatchSpy = jest.spyOn(editor.events.error, 'dispatch');

        mode.insertMonomerFromLibrary(requireBaseLibraryItem(editor, 'U'));

        expect(dispatchSpy).toHaveBeenCalledWith(BASE_MODIFICATION_DISABLED_IN_SYNC_MODE);
        expect(senseNucleotides[1].rnaBase.label).toBe('C');
        expect(antisenseNucleotides[1].rnaBase.label).toBe('G');
        dispatchSpy.mockRestore();
      });
    });
    ```
    For the second test, if `insertMonomerFromLibrary`'s missing-attachment-point pre-check interferes for a lone base, keep calling the private `replaceSelectionsWithMonomer` as shown (it is the code under test).
  - In `SequenceMode.baseCarryingRefusal.test.ts`, `SequenceMode.presetRefusal.test.ts` and `SequenceMode.presetStrandAware.test.ts`: replace `setTargetedStrand('both')` with selecting both strands' monomers; replace one-strand setups that relied on a drag or click plus record with `selectOnly`-style selection of that strand only; delete the `targetedStrand` assertions and the `resetTargetedStrand` calls.
  - Delete `SequenceMode.targetedStrand.test.ts`, `SelectBase.targetedStrand.test.ts` and `SequenceRenderer.targetedStrand.test.ts`; the behavior they pinned no longer exists, and the edit-mode drag case is now covered by the first new test above.
- [x] 20.3 Run `npx jest __tests__/domain/entities/antisenseBaseSyncCommand.test.ts __tests__/application/editor/modes` in `packages/ketcher-core`; expect failures (signature and behavior not yet changed).
- [x] 20.4 In `antisenseBaseSync.ts`:
  - `isSelectedAntisensePair(base?: BaseMonomer)`: drop the `bothStrandsTargeted` parameter and its guard; keep `base.selected && partner.selected && isBaseEligibleForDuplexSync(base) && isBaseEligibleForDuplexSync(partner)`. Rewrite the doc comment: rule 1.3, judged from selection — a column-based gesture really does select both strands.
  - Add, above `createMirroredBaseCommand`:
    ```ts
    export interface MirroredBaseTarget {
      partner: BaseMonomer;
      targetLabel: string;
    }

    /**
     * The decision half of createMirroredBaseCommand: which base the edit
     * rewrites, and to what. Returns undefined when nothing will change -- sync
     * off, no eligible partner, the partner is itself selected (rule 1.1: "that
     * symbol is not selected itself"), the natural analogue is unchanged, or the
     * partner already carries the complement. Shared with
     * SequenceMode.countMirroredBaseChanges so the confirmation's count and the
     * edit cannot disagree.
     */
    export function resolveMirroredBaseTarget(params: {
      editedBase: BaseMonomer;
      previousNaturalAnalogue?: string;
      newBaseMonomerItem: MonomerOrAmbiguousType;
      isSyncEditMode: boolean;
      partner?: BaseMonomer;
      wasEditedBaseEligible?: boolean;
    }): MirroredBaseTarget | undefined {
      const {
        editedBase,
        previousNaturalAnalogue,
        newBaseMonomerItem,
        isSyncEditMode,
        partner: partnerCapturedBeforeEdit,
        wasEditedBaseEligible,
      } = params;

      if (!isSyncEditMode) {
        return undefined;
      }

      const partner = partnerCapturedBeforeEdit ?? getHydrogenBondedPartner(editedBase);
      const editedBaseEligible = wasEditedBaseEligible ?? isBaseEligibleForDuplexSync(editedBase);

      if (!partner || partner.selected || !editedBaseEligible || !isBaseEligibleForDuplexSync(partner)) {
        return undefined;
      }

      const targetLabel = resolveMirroredBaseLabel({
        previousNaturalAnalogue,
        newNaturalAnalogue: getLibraryItemNaturalAnalogue(newBaseMonomerItem),
        oppositeSugarLabel: getSugarFromRnaBase(partner)?.label,
      });

      if (!targetLabel || targetLabel === partner.label) {
        return undefined;
      }

      return { partner, targetLabel };
    }
    ```
  - `createMirroredBaseCommand`: remove `bothStrandsTargeted` (param, doc and destructuring) and replace everything from the sync check through `if (!targetLabel) return undefined;` with:
    ```ts
    const target = resolveMirroredBaseTarget(params);

    if (!target) {
      return undefined;
    }

    const { partner, targetLabel } = target;
    ```
    keeping the existing `resolveBaseLibraryItem(targetLabel)` lookup and the ambiguous/in-place branch below it. Keep the `partner`/`wasEditedBaseEligible` doc comments on the params object.
- [x] 20.5 Remove the gesture record:
  - `SequenceRenderer.ts`: delete the `TargetedStrand` type, `targetedStrandRecord`, `setTargetedStrand`, `resetTargetedStrand` and the `targetedStrand` getter, and the `setTargetedStrand(...)` block plus its comment at the top of `shiftArrowSelectionInEditMode`.
  - `SequenceMode.ts`: delete the `setTargetedStrand` calls in `mousedownBetweenSequenceItems`, `mousedown` and `mousemove` (and the comment above the `mousemove` one); delete `SequenceRenderer.resetTargetedStrand()` and its comment in `unselectAllEntities`; delete every `const bothStrandsTargeted = SequenceRenderer.targetedStrand === 'both';` and the `bothStrandsTargeted` arguments (in `modifySequenceInRnaBuilder`, `replaceSelectionsWithMonomer`, `replaceSelectionsWithPreset`); in `refuseIfBaseModificationBlocked` call `isSelectedAntisensePair(editedBase)` and update its doc comment ("a both-strands selection", not "record").
  - Reduce `getSelectedStrandType` to its per-position answer and replace its comment with one line ("Which strand is selected at this position; sense when both are."):
    ```ts
    function getSelectedStrandType(twoStrandedNode: ITwoStrandedChainItem): STRAND_TYPE {
      return twoStrandedNode.senseNode?.monomer.selected ? STRAND_TYPE.SENSE : STRAND_TYPE.ANTISENSE;
    }
    ```
  - `SelectBase.ts`: delete the record writes in the plain-click and shift-click branches (including `existingStrand` and the `clickedStrand` block) and the four `resetTargetedStrand()` calls with their comments; drop imports that become unused (`STRAND_TYPE` if so).
  - `editorEvents.ts`: delete `SequenceRenderer.setTargetedStrand('both')` and its comment in the select-all handler; drop the import if unused.
  - `EditorHistory.ts`: delete the redo-path `resetTargetedStrand()` and its comment.
  - `Editor.ts`: delete `isSequenceAntisenseEditMode`; `modes/types/sequenceMode.ts`: delete `isAntisenseEditMode` from the type if nothing else reads it (`grep -rn "isAntisenseEditMode" packages/*/src`; `SequenceMode` keeps its own getter).
  - `grep -rn "TargetedStrand\|targetedStrand\|bothStrandsTargeted\|isSequenceAntisenseEditMode" packages/ketcher-core/src packages/ketcher-core/__tests__` returns nothing.
- [x] 20.6 Run `npm test` in `packages/ketcher-core`; all green (the `ketcher-macromolecules` call to `isSelectedAntisensePair` is fixed in section 21).
- [x] 20.7 Commit: `#6595 - Judge duplex sync per pair from the selection and drop the gesture record`.

## 21. Context menu counts and blocked-pair flags follow the selection (`ketcher-macromolecules`)

Files: `src/components/contextMenu/SequenceItemContextMenu/helpers.ts`, `helpers.test.ts`, `SequenceItemContextMenu.test.tsx`. Consumes `isSelectedAntisensePair(base)` from section 20.

- [x] 21.1 Run `npm run build` in `packages/ketcher-core` so this package sees section 20's API.
- [x] 21.2 Rewrite the tests in `helpers.test.ts`: delete `describe('one entry per duplex position')`; replace `should return correct count for sense and antisense chain selection when both strands are targeted` with one that selects both strands of N positions and expects the title `${2 * N} nucleotides` and `selectedSequenceLabeledNodes` of length 2N, plus one that selects N positions on one strand and expects `${N} nucleotides`; in `describe('isInSelectedAntisensePair')` drop every record setup, rename the "record is 'both'" case to "is true when both hydrogen-bonded, eligible bases are selected and sync editing is on", and delete "is false when the record is SENSE…". Remove record references from `SequenceItemContextMenu.test.tsx` the same way.
- [x] 21.3 Run `npx jest src/components/contextMenu/SequenceItemContextMenu`; expect failures.
- [x] 21.4 In `helpers.ts`: delete `filterSelectionsToTargetedStrand` and its comment; in `generateSequenceContextMenuProps` use `const selectionsFlatten: NodeSelection[] = flatten(selections);`; in `generateLabeledNodes` delete `bothStrandsTargeted` and call `isSelectedAntisensePair(base)`; drop the `SequenceRenderer` import if unused.
- [x] 21.5 Run `npm test` in `packages/ketcher-macromolecules`; green.
- [x] 21.6 Commit: `#6595 - Count and flag the context menu from the actual selection`.

## 22. Library replacement visits each strand separately (`ketcher-core`)

Files: `src/application/editor/modes/SequenceMode.ts`; test `__tests__/application/editor/modes/SequenceMode.bothStrandsReplacement.test.ts` (new; copy the canvas/editor/history setup, `buildTwoPositionDuplex`, `selectOnly` and the prototype-cast caller pattern from `SequenceMode.antisenseDuplexSync.test.ts`, and add the same caller for `replaceSelectionsWithPreset`).

Produces: module-level `splitSelectionsIntoStrandRuns(selections: TwoStrandedNodesSelection): StrandRun[]` with `interface StrandRun { strandType: STRAND_TYPE; selectionRange: TwoStrandedNodeSelection[] }`. `getSelectedStrandType` and `splitSelectionRangeByStrand` are deleted.

- [x] 22.1 Write the failing tests, sync editing off unless stated (turn it off with the `_isSyncEditMode` prototype-cast already used in `antisenseDuplexSync`):
  - Both strands of both positions selected, replaced with the sugar `R` through `replaceSelectionsWithMonomer`: no original sense or antisense monomer of either position remains in `drawingEntitiesManager.monomers`; exactly four new `R` monomers exist; each pair of new sense monomers is bonded R2→R1, and the same holds for the new antisense pair.
  - Same replacement, then `history.undo()` once: `historyPointer` moves back by one; every original monomer id is back; `senseNucleotides[i].rnaBase.hydrogenBonds[0].getAnotherMonomer(senseNucleotides[i].rnaBase)` is `antisenseNucleotides[i].rnaBase` for both positions.
  - Both strands of position 0 selected, replaced through `replaceSelectionsWithPreset` with the RNA preset for `A` (get it the way `SequenceMode.presetStrandAware.test.ts` does): both position-0 nucleotides are new nucleotides; the two new bases are hydrogen bonded to each other; position 1 is untouched on both strands.
  - Ragged duplex: delete `antisenseNucleotides[1]`'s monomers from the fixture before rerendering (sense position 1 becomes an overhang), select sense positions 0–1 and antisense position 0, replace with `R`: sense positions 0 and 1 and antisense position 0 are replaced, each exactly once (count new `R` monomers = 3).
  - `selectionsContainLinkerNode` reaches the antisense node of a both-strands position. Call the private method through the prototype cast with a hand-built selection whose sense node is a real selected nucleotide and whose antisense node is a selected linker:
    ```ts
    const linkerNode = Object.assign(Object.create(LinkerSequenceNode.prototype), {
      monomer: { selected: true },
    }) as LinkerSequenceNode;
    const { senseNucleotides } = buildTwoPositionDuplex(editor);
    selectOnly([senseNucleotides[0]]);
    const selections = [[{
      node: { senseNode: senseNucleotides[0], antisenseNode: linkerNode },
      nodeIndexOverall: 0,
    }]] as unknown as TwoStrandedNodesSelection;

    expect(callSelectionsContainLinkerNode(mode, selections)).toBe(true);
    ```
    (`callSelectionsContainLinkerNode` follows the same prototype-cast pattern as `callReplaceSelectionsWithMonomer`; today it returns `false` because only the sense node is checked.)
- [x] 22.2 Run `npx jest __tests__/application/editor/modes/SequenceMode.bothStrandsReplacement.test.ts`; expect the replacement tests to fail on the antisense side (only sense is replaced today).
- [x] 22.3 In `SequenceMode.ts`, replace `getSelectedStrandType` and `splitSelectionRangeByStrand` (and its doc comment) with:
    ```ts
    interface StrandRun {
      strandType: STRAND_TYPE;
      selectionRange: TwoStrandedNodeSelection[];
    }

    /**
     * Splits the selection into maximal contiguous runs of positions whose
     * monomer on one strand is selected, every sense run first and then every
     * antisense run. A position with both strands selected appears in one run of
     * each, so replacement and its pre-checks reach every selected monomer while
     * each run stays one strand -- which the replacement loop's chain-order
     * iteration and previous-node seed depend on. Sense runs come first because
     * replacing a node re-bonds its hydrogen-bond partner to the new monomer, and
     * the antisense pass must find the new sense monomer there.
     */
    function splitSelectionsIntoStrandRuns(selections: TwoStrandedNodesSelection): StrandRun[] {
      const runs: StrandRun[] = [];

      [STRAND_TYPE.SENSE, STRAND_TYPE.ANTISENSE].forEach((strandType) => {
        selections.forEach((selectionRange) => {
          let currentRun: TwoStrandedNodeSelection[] | undefined;

          selectionRange.forEach((nodeSelection) => {
            if (!getNodeForStrand(nodeSelection.node, strandType)?.monomer.selected) {
              currentRun = undefined;
              return;
            }

            if (!currentRun) {
              currentRun = [];
              runs.push({ strandType, selectionRange: currentRun });
            }

            currentRun.push(nodeSelection);
          });
        });
      });

      return runs;
    }
    ```
- [x] 22.4 In `replaceSelectionsWithMonomer` and `replaceSelectionsWithPreset`, replace the `sameStrandSelectionRanges` block and `getSelectedStrandType(selectionRange[0].node)` with `splitSelectionsIntoStrandRuns(selections).forEach(({ strandType, selectionRange }) => { … })`; the loop body is unchanged. Update the comment above each to say each run is one strand and both strands of a position are visited.
- [x] 22.5 Make the pre-checks iterate the same runs: in `selectionsContainLinkerNode`, `getFirstMissingAttachmentPoint`, `selectionsCantPreserveConnectionsWithPreset` and `refuseIfBaseModificationBlocked`, replace the `selections.some(range => range.some(...))` / nested `for` over `selections` with iteration over `splitSelectionsIntoStrandRuns(selections)`, resolving `getNodeForStrand(nodeSelection.node, strandType)`. Keep each method's early-return semantics (`getFirstMissingAttachmentPoint` still returns the first missing point it finds).
- [x] 22.6 `grep -n "getSelectedStrandType\|splitSelectionRangeByStrand" packages/ketcher-core/src` returns nothing. Run `npm test` in `packages/ketcher-core`; green, including the suites from section 20.
- [x] 22.7 Commit: `#6595 - Replace both strands of a both-selected position from the library`.

## 23. Count the opposite bases an RNA Builder update will rewrite (`ketcher-core`)

Files: `src/application/editor/modes/SequenceMode.ts`; test `__tests__/application/editor/modes/SequenceMode.countMirroredBaseChanges.test.ts` (new; same setup as section 22's suite). Consumes `resolveMirroredBaseTarget` (section 20).

Produces: `public countMirroredBaseChanges(updatedSelection: LabeledNodesWithPositionInSequence[]): number` on `SequenceMode`.

- [x] 23.1 Write the failing tests (`buildTwoPositionDuplex`: sense A,C / antisense U,G; payload entries as in `antisenseDuplexSync`'s RNA Builder test, `type: Entities.Nucleotide`, `nodeIndexOverall`, `strandType`, `baseLabel`):
  - sense position 0 only selected, entry `{ nodeIndexOverall: 0, strandType: SENSE, baseLabel: 'C' }` → `1`.
  - sense positions 0 and 1 selected, entries `baseLabel: 'G'` for both → `1` (position 1 is already G: analogue unchanged).
  - sense position 0 selected, `baseLabel: 'A'` (unchanged) → `0`.
  - sync editing off, sense position 0 selected, `baseLabel: 'C'` → `0`.
  - both strands of position 0 selected, sense entry `baseLabel: 'C'` → `0` (partner selected).
  - fixture where the partner already carries the complement: sense position 0 selected, antisense position 0's base pre-set to `G` with `modifyMonomerItem`, entry `baseLabel: 'C'` → `0`.
  - after counting, every base label is unchanged and `history.historyStack.length` is unchanged (the count has no side effects).
- [x] 23.2 Run the new test file; expect failure (`countMirroredBaseChanges` is not a function).
- [x] 23.3 Extract the per-entry resolution at the top of `modifySequenceInRnaBuilder`'s loop into a private method, and use it there unchanged in behavior (`modifySequenceInRnaBuilder` keeps its `if (nodeIndexOverall === undefined) return;`):
    ```ts
    private resolveRnaBuilderEntry(
      editor: CoreEditor,
      labeledNucleoelement: LabeledNodesWithPositionInSequence,
      nodeIndexOverall: number,
    ) {
      const sugarMonomerItem = labeledNucleoelement.sugarLabel
        ? getRnaPartLibraryItem(editor, labeledNucleoelement.sugarLabel, KetMonomerClass.Sugar)
        : undefined;
      const baseMonomerItem = labeledNucleoelement.baseLabel
        ? labeledNucleoelement.rnaBaseMonomerItem ??
          getRnaPartLibraryItem(editor, labeledNucleoelement.baseLabel, KetMonomerClass.Base)
        : undefined;
      const phosphateMonomerItem = labeledNucleoelement.phosphateLabel
        ? getRnaPartLibraryItem(editor, labeledNucleoelement.phosphateLabel, KetMonomerClass.Phosphate)
        : undefined;
      const nodeToModify = getNodeForStrand(
        SequenceRenderer.getNodeByPointer(nodeIndexOverall),
        labeledNucleoelement.strandType,
      );

      return { nodeToModify, sugarMonomerItem, baseMonomerItem, phosphateMonomerItem };
    }
    ```
    (Use the editor type `modifySequenceInRnaBuilder` already receives from `provideEditorInstance()`.)
- [x] 23.4 Add the public method:
    ```ts
    // How many unselected opposite bases modifySequenceInRnaBuilder would
    // rewrite for this payload. Runs the same entry resolution and the same
    // mirror decision as the update, without building a command, so the RNA
    // Builder's confirmation can promise exactly what confirming does.
    public countMirroredBaseChanges(updatedSelection: LabeledNodesWithPositionInSequence[]): number {
      const editor = provideEditorInstance();
      const rewrittenPartners = new Set<BaseMonomer>();

      for (const labeledNucleoelement of updatedSelection) {
        const { nodeIndexOverall } = labeledNucleoelement;

        if (nodeIndexOverall === undefined) {
          continue;
        }

        const { nodeToModify, baseMonomerItem } = this.resolveRnaBuilderEntry(
          editor,
          labeledNucleoelement,
          nodeIndexOverall,
        );

        if (
          !baseMonomerItem ||
          !(nodeToModify instanceof Nucleotide || nodeToModify instanceof Nucleoside) ||
          !nodeToModify.rnaBase
        ) {
          continue;
        }

        const target = resolveMirroredBaseTarget({
          editedBase: nodeToModify.rnaBase,
          previousNaturalAnalogue: getMonomerNaturalAnalogue(nodeToModify.rnaBase),
          newBaseMonomerItem: baseMonomerItem,
          isSyncEditMode: this.isSyncEditMode,
        });

        if (target && getRnaPartLibraryItem(editor, target.targetLabel, KetMonomerClass.Base)) {
          rewrittenPartners.add(target.partner);
        }
      }

      return rewrittenPartners.size;
    }
    ```
- [x] 23.5 Run `npm test` in `packages/ketcher-core`; green (including `antisenseDuplexSync`'s RNA Builder test, which guards the extraction).
- [x] 23.6 Commit: `#6595 - Count the opposite bases an RNA Builder update will rewrite`.

## 24. The update confirmation names the additional nucleotides (`ketcher-macromolecules`)

Files: `src/helpers/countNucleoelents.ts`; `src/components/modal/UpdateSequenceInRNABuilder/UpdateSequenceInRNABuilder.tsx`, its test and snapshot; `src/components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded/RnaEditorExpanded.tsx`. Consumes `SequenceMode.countMirroredBaseChanges` (section 23).

Produces: `getCountOfMirroredNucleoelements(editor: CoreEditor | undefined, sequenceSelection: LabeledNodesWithPositionInSequence[]): number`.

- [x] 24.1 Run `npm run build` in `packages/ketcher-core`. Write the failing tests:
  - In `UpdateSequenceInRNABuilder.test.tsx`, mock the helper module, keeping the real `getCountOfNucleoelements`:
    ```ts
    jest.mock('helpers/countNucleoelents', () => ({
      ...jest.requireActual('helpers/countNucleoelents'),
      getCountOfMirroredNucleoelements: jest.fn(() => 0),
    }));
    import { getCountOfMirroredNucleoelements } from 'helpers/countNucleoelents';
    ```
    and add:
    ```ts
    it('names the additional nucleotides when the update will change some', () => {
      (getCountOfMirroredNucleoelements as jest.Mock).mockReturnValueOnce(2);
      render(
        withThemeAndStoreProvider(<UpdateSequenceInRNABuilder {...mockProps} />, {
          rnaBuilder: { sequenceSelection: threeSenseDuplexPositions },
        }),
      );

      expect(screen.getByTestId('update-sequence-modal-body')).toHaveTextContent(
        'You are going to modify 3 nucleotides, and that will change 2 additional nucleotides. Are you sure?',
      );
    });
    ```
    (move `threeSenseDuplexPositions` up to the outer `describe` so both blocks share it). The existing "names N" test stays and now pins the m = 0 text. Extend `should close modal` to pass a `modifySequenceInRnaBuilder: { dispatch: jest.fn() }` event and assert it was not called after Cancel (spec: cancelling changes nothing).
  - In a new `src/helpers/countNucleoelents.test.ts`: `getCountOfMirroredNucleoelements(undefined, [...])` is `0`; with `{ mode: {} }` (not a `SequenceMode`) it is `0`; with an editor whose `mode` is `Object.assign(Object.create(SequenceMode.prototype), { countMirroredBaseChanges: jest.fn(() => 3) })` it is `3` and the mock received the selection.
  - For `RnaEditorExpanded.onUpdateSequence`, extract the trigger into a pure helper in `RnaEditorExpanded/helpers` and test it there rather than rendering the editor:
    ```ts
    // The confirmation is needed when more than one nucleotide is modified, or
    // when the update will also change unselected nucleotides on the other strand.
    export const isUpdateSequenceConfirmationNeeded = (
      countOfNucleoelements: number,
      countOfMirroredNucleoelements: number,
    ) => countOfNucleoelements > 1 || countOfMirroredNucleoelements > 0;
    ```
    Tests: `(2, 0)` true; `(1, 1)` true; `(1, 0)` false; `(0, 0)` false.
- [x] 24.2 Run `npx jest src/helpers src/components/modal/UpdateSequenceInRNABuilder src/components/monomerLibrary/RnaBuilder/RnaEditor/RnaEditorExpanded`; expect failures.
- [x] 24.3 Implement:
  - `countNucleoelents.ts`:
    ```ts
    export const getCountOfMirroredNucleoelements = (
      editor: CoreEditor | undefined,
      sequenceSelection: LabeledNodesWithPositionInSequence[],
    ): number =>
      editor?.mode instanceof SequenceMode
        ? editor.mode.countMirroredBaseChanges(sequenceSelection)
        : 0;
    ```
    importing `CoreEditor`, `LabeledNodesWithPositionInSequence`, `SequenceMode` from `ketcher-core`.
  - `UpdateSequenceInRNABuilder.tsx`: compute `const countOfMirroredNucleoelements = getCountOfMirroredNucleoelements(editor, sequenceSelection);` and render
    ```tsx
    <TextWrapper>
      {countOfMirroredNucleoelements > 0
        ? `You are going to modify ${countOfNucleoelements} nucleotides, and that will change ${countOfMirroredNucleoelements} additional nucleotides. Are you sure?`
        : `You are going to modify ${countOfNucleoelements} nucleotides. Are you sure?`}
    </TextWrapper>
    ```
  - `RnaEditorExpanded.tsx` `onUpdateSequence`:
    ```ts
    if (
      isUpdateSequenceConfirmationNeeded(
        getCountOfNucleoelements(sequenceSelection),
        getCountOfMirroredNucleoelements(editor, sequenceSelection),
      )
    ) {
      dispatch(openModal('updateSequenceInRNABuilder'));
    } else { /* unchanged */ }
    ```
- [x] 24.4 Run the tests from 24.2; green. Update the snapshot only if its diff is limited to the text node becoming a single string (`npx jest src/components/modal/UpdateSequenceInRNABuilder -u`, then read the `.snap` diff before keeping it).
- [x] 24.5 Run `npm test` in `packages/ketcher-macromolecules`; green.
- [x] 24.6 Commit: `#6595 - Name the additional nucleotides in the RNA Builder update confirmation`.

## 25. Verify and hand off

- [ ] 25.1 Run the full gates in order: `npm test` in `packages/ketcher-core`, `npm run build` in `packages/ketcher-core`, `npm test` in `packages/ketcher-macromolecules`. Paste failures verbatim if any.
- [ ] 25.2 `grep -rn "targetedStrand\|TargetedStrand\|bothStrandsTargeted\|filterSelectionsToTargetedStrand\|isSequenceAntisenseEditMode" packages/*/src packages/*/__tests__` returns nothing.
- [ ] 25.3 Manual smoke check in sequence mode, sync on — requires a browser; hand the matrix to the human reviewer: drag over sense symbols and change a base in the RNA Builder (confirmation names m; partner mirrors); same from the antisense row; one symbol only (confirmation appears with n = 1, m = 1); click a symbol, edit-mode drag, shift+arrows → bases `[disabled]`/refused, context menu names 2N; shift+drag unpaired symbols on both rows → each mirrors; click a column and replace with a sugar from the library → both strands replaced, backbone intact, one undo; repeat the last with a preset in non-sync mode.
- [ ] 25.4 Update the PR #11816 description's behavior list (selection rule, n/m confirmation, both-strands library replacement) — ask the user before editing the PR.
