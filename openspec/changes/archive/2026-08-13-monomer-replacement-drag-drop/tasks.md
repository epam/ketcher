## 1. Replacement detection infrastructure in `LibraryItemDragDropHandler`

- [x] 1.1 Define `DRAG_REPLACE_PROXIMITY_THRESHOLD_PX` constant (value TBD with UX) in `LibraryItemDragDropHandler.ts` alongside the existing proximity constants
- [x] 1.2 Add a `dragReplaceTarget` field to `LibraryItemDragDropHandler` to hold the current replacement candidate (monomer or preset reference)
- [x] 1.3 Implement `findReplacementTarget(cursorPosition)` method: iterate canvas monomers, compute center distance, return the nearest monomer within threshold (or null)
- [x] 1.4 Implement `classifyReplaceTarget(nearestMonomer, draggedItem)` method: determine whether the target is (a) a same-geometry preset, (b) an individual preset component to replace, or (c) a standalone monomer — using the dragged item type and a preset geometry equality check
- [x] 1.5 In `onLibraryItemDragOver`, run `findReplacementTarget` first; if a target is found, set `dragReplaceTarget`, activate the replacement visual state, and skip the existing AP proximity check; if no target, clear `dragReplaceTarget` and proceed with AP proximity
- [x] 1.6 Clear `dragReplaceTarget` and remove the replacement visual state when the cursor moves outside the threshold

## 2. Replacement visual state

- [x] 2.1 Add `isReplacementTarget` boolean flag to `BaseMonomerRenderer`
- [x] 2.2 Add CSS class (e.g. `monomer--replacement-target`) to the SVG body element when `isReplacementTarget` is true; define the visual treatment (highlighted border/fill) to match the design mockups
- [x] 2.3 For preset-level replacement: add `isPresetReplacementTarget` state that sets the flag on all component monomers of the target preset simultaneously
- [x] 2.4 Ensure the replacement visual state and the AP `+` indicator state are mutually exclusive (replacement check fires first)

## 3. Preset geometry equality

- [x] 3.1 Implement `presetsHaveSameGeometry(presetA, presetB)` pure function: returns true when both presets have the same component types (sugar/base/phosphate presence) and the same phosphate position (5′/3′)
- [x] 3.2 Add unit tests for `presetsHaveSameGeometry` covering: identical presets, same components different phosphate position, different component sets, presets with no phosphate

## 4. Bond re-establishment utilities

- [x] 4.1 Implement `collectMonomerBonds(monomer)` helper: returns all polymer bonds, monomer-to-atom bonds, and hydrogen bonds attached to a monomer, keyed by attachment-point name
- [x] 4.2 Implement `computeReestablishableBonds(originalBonds, newMonomer)` helper: returns two lists — bonds that can be re-established (matching Rn exists and is free on the new monomer) and bonds that would be lost
- [x] 4.3 For preset replacement: implement `mapPresetBonds(originalPreset, newPreset)` helper: maps each original preset component's bonds to the corresponding new preset component's APs, producing reestablishable and lost-bond lists
- [x] 4.4 Add unit tests for bond re-establishment logic covering: all bonds re-established, partial re-establishment, no bonds re-established, hydrogen bonds preserved, monomer-to-atom bonds preserved

## 5. Replacement operations in `DrawingEntitiesManager`

- [x] 5.1 Implement `replaceMonomer(oldMonomer, newTemplate, position)` method: delete old monomer, create new monomer at same position, re-establish compatible bonds, return a single `Command` wrapping all sub-operations
- [x] 5.2 Implement `replacePreset(oldPreset, newPresetTemplate, sugarPosition)` method: delete all old preset components and their internal bonds, create new preset components at appropriate positions, re-establish all compatible external bonds, return a single `Command`
- [x] 5.3 Verify that both replacement operations are reversible — undo restores the original monomer/preset with all original bonds intact
- [x] 5.4 Add unit tests for `replaceMonomer`: position preserved, all bonds re-established where possible, returned command undoes fully
- [x] 5.5 Add unit tests for `replacePreset`: sugar position preserved, all compatible inter-preset bonds re-established, returned command undoes fully

## 6. Drop handler: replacement execution and bond-deletion warning

- [x] 6.1 In `LibraryItemDragDropHandler.placeLibraryItemOnCanvas`, add a replacement branch: if `dragReplaceTarget` is set, compute the bond re-establishment plan via `computeReestablishableBonds` / `mapPresetBonds`
- [x] 6.2 If any bonds would be lost, show the "Deletion of bonds" modal (reusing the existing component wired in `ketcher-macromolecules`) with title "Deletion of bonds", body "Some bonds will get deleted during replacement. Do you wish to proceed.", and Cancel/Yes buttons
- [x] 6.3 On Cancel: clear `dragReplaceTarget`, discard the drop, restore the canvas to pre-drag state
- [x] 6.4 On Yes (or if no bonds are lost): execute the appropriate `replaceMonomer` or `replacePreset` command via the editor's command history, ensuring it is a single atomic undo step
- [x] 6.5 After replacement, clear `dragReplaceTarget` and the replacement visual state

## 7. Layout adjustments after replacement

- [x] 7.1 Monomer→monomer (Snake mode): confirm no re-layout is triggered
- [x] 7.2 Monomer→monomer (Flex mode): no shift (`cellDelta = 1 - 1 = 0`)
- [x] 7.3 Preset→preset (standard angles): confirm no re-layout is triggered; positions of new preset components mirror the old positions
- [x] 7.4 Preset→preset (non-standard angles, Snake mode): confirm no re-layout is triggered in Snake mode
- [x] 7.5 Preset→preset (non-standard angles, Flex mode): place the new preset with its sugar at the original sugar's position; other components at their standard relative offsets from the sugar
- [x] 7.6 Preset→monomer (Snake mode): after replacement, call `runSnakeLayout` on the affected chain
- [x] 7.7 Preset→monomer (Flex mode): shift downstream chain by `(droppedComponentCount - 1) × SnakeLayoutCellWidth` only when the dropped preset contains both a sugar and a phosphate; anchor is the new preset's sugar
- [ ] 7.8 Implement smooth auto-scroll for Flex mode: after chain shift, check if any moved monomer is outside the viewport; if so, apply the autochain smooth-scroll utility to bring it into view

## 8. Undo/redo atomicity

- [x] 8.1 Ensure the replacement command (placement + bond deletion + bond re-establishment) is wrapped in a single `CommandsHistory` batch so undo/redo operates as one atomic step
- [x] 8.2 Verify that undo after a replacement restores the original monomer/preset with all original bonds
- [x] 8.3 Verify that redo reapplies the replacement with all bond changes

## 9. Acceptance tests (Playwright E2E)

- [ ] 9.1 Test: Drag monomer near canvas monomer center (within threshold) → replacement highlight appears; drag away → highlight clears; no AP indicators shown while replacement highlight is active
- [ ] 9.2 Test: Drop monomer onto canvas monomer in Flex mode → monomer replaced in place, all compatible bonds re-established, no re-layout
- [ ] 9.3 Test: Drop monomer onto canvas monomer where new monomer lacks an AP with an active bond → "Deletion of bonds" modal shown; Cancel → no replacement; Yes → replacement proceeds, bond deleted
- [ ] 9.4 Test: Single monomer dropped onto a preset component → only that component is replaced, rest of preset unchanged
- [ ] 9.5 Test: Drop same-geometry preset onto canvas preset → entire preset replaced in place, bonds re-established
- [ ] 9.6 Test: Drop preset onto standalone monomer in Snake mode → monomer replaced by preset, snake re-layout triggered
- [ ] 9.7 Test: Drop preset onto standalone monomer in Flex mode → monomer replaced by preset, chain shifted to accommodate new geometry
- [ ] 9.8 Test: Replacement undo in one step → original monomer/preset restored with all bonds; redo reapplies replacement
- [ ] 9.9 Test: Bonds to small molecules and hydrogen bonds preserved after monomer replacement
