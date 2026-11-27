## Why

When users drag a monomer or preset from the library and drop it near an existing monomer on the canvas, there is currently no way to establish a bond at drop time — the user must manually draw a bond afterward. This change extends the existing drag-and-drop proximity detection (25 px threshold, already in place) to also create a polymer bond between the dropped entity and the nearest free attachment point upon mouse release, significantly reducing the number of steps needed to build a polymer chain.

## What Changes

- When dragging a monomer/preset from the library and the cursor comes within 25 px of a free attachment point on a canvas monomer, all free APs of that monomer become visible and the nearest AP shows a `+` indicator.
- On mouse release over a highlighted AP, a polymer bond is established automatically using the same default-bond rules applied by the Bond tool (R1-R2 for peptides, R1-R2 for sugar-phosphate backbone, R3-R1 for sugar-base, etc.).
- If a default bond cannot be resolved and the dropped entity has two or more free APs, the existing _Select Attachment Points_ dialog opens to let the user pick.
- If a non-standard (Rn–Rn same-group) bond is formed, the existing notification toast is shown.
- In Flex mode the new bond respects standard bond length and follows the AP direction.
- In Snake mode the layout is re-executed after every bond addition (existing behavior already triggered by `finishPolymerBondCreation`).
- For presets: the bonding target component within the preset is resolved by the same `findPresetMonomerForBonding` rules already used for other drag-drop scenarios (R1 target → component with free R2, R2 target → component with free R1, otherwise sugar → phosphate → base fallback).
- If both monomers of a preset–monomer bond are on the left-most or right-most ends of their sequences in Flex mode, the preset is mirrored.

## Capabilities

### New Capabilities

- `drag-drop-bond-establishment`: Bond creation between a dragged library monomer/preset and a canvas monomer by releasing the drag over a highlighted free attachment point.

### Modified Capabilities

- `macromolecules`: The drag-and-drop user interaction gains a new sub-flow: proximity-triggered AP highlighting and bond establishment on drop. The existing scenario list in the `macromolecules` feature spec needs a new scenario for this flow and a guarantee update.

## Impact

- **`ketcher-core`** — `LibraryItemDragDropHandler` (`application/editor/libraryItemDragDrop/`): all drag-drop attachment-point logic has been extracted from `Editor.ts` into this dedicated class. It owns proximity detection, hover state, the drop-and-bond flow, modal continuation, Flex-mode repositioning, and preset mirroring. The companion `repositioning.ts` module holds the pure repositioning and mirroring helpers.
- **`ketcher-core`** — `Editor.ts`: holds a single `dragDropHandler: LibraryItemDragDropHandler` field; delegates via `cancelLibraryItemDrag()`, `onCreateBond()`, and `onCancelBondCreation()`. The `placeItemOnCanvasForHandler` bridge method routes item placement back to the existing private placement methods (`onPlaceMonomerOnCanvas`, `onPlaceRnaPresetOnCanvas`, `onPlaceAmbiguousMonomerOnCanvas`).
- **`ketcher-core`** — `AttachmentPoint.ts`: the `+` indicator and AP visibility changes are already implemented. No changes expected here.
- **`ketcher-core`** — `DrawingEntitiesManager.ts`: `createPolymerBond` is already called for the drag-drop path; Flex bond-length and AP-direction orientation are enforced post-creation inside `LibraryItemDragDropHandler`.
- **`ketcher-core`** — `Bond.ts` (`shouldInvokeModal`): the modal-trigger logic must be reused/shared for the drag-drop path (currently partially duplicated in `LibraryItemDragDropHandler`).
- **`ketcher-macromolecules`** — `MonomerConnections.tsx` / modal wiring: no new UI components required; the existing modal is reused.
- No public API or import/export format changes.
- No new dependencies.
