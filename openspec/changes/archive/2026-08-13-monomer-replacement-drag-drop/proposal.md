## Why

Users who want to swap one monomer or preset for another currently have to delete the original, place the new one, and manually re-establish all bonds — a slow, error-prone multi-step process. This change extends the drag-and-drop mechanism so that dropping a library monomer or preset onto an existing canvas monomer (or matching preset) replaces it in place, preserving as many bonds as possible.

## What Changes

- When dragging a single monomer from the library and the cursor comes within [TBD] px of a canvas monomer's center, the target monomer changes its visual appearance to indicate it will be replaced.
- On drop, the canvas monomer is replaced by the dragged library monomer; all polymer bonds are re-established on matching attachment points of the new monomer.
- If the new monomer lacks an attachment point that the original had an active bond on, a "Deletion of bonds" warning dialog is shown before the replacement proceeds. The user can Cancel or confirm with Yes.
- When dragging a preset from the library and the cursor comes within [TBD] px of any monomer center that belongs to a preset of the same geometry (same component set and phosphate position), the entire canvas preset changes its visual appearance.
- On drop, the canvas preset is replaced by the library preset; bonds are re-established on each component.
- When dragging a preset from the library and the cursor comes within [TBD] px of a monomer center that does NOT belong to a compatible preset, the monomer changes its visual appearance.
- On drop, the preset replaces the single monomer; existing bonds are re-routed to the preset component that has a free matching Rn, with priority sugar > phosphate > base.
- A single monomer can never replace a whole preset; dropping a single monomer onto a preset component only replaces that component within the preset.
- The "Deletion of bonds" warning reuses the same modal component already used in sequence mode.
- Layout behavior after replacement:
  - Monomer → monomer: no re-layout in any mode.
  - Preset → preset (standard bond lengths/angles): no re-layout in any mode.
  - Preset → preset (non-standard angles): no re-layout in snake; sugar position preserved in flex.
  - Preset → monomer: re-layout triggered in snake; chain shifted left/right in flex to accommodate new geometry.
  - If the chain shift in flex causes monomers to go off-screen, the smooth auto-scroll from the autochain feature is used.
- Bonds between monomers and small molecules and hydrogen bonds are preserved across all replacement variants.
- The replacement is undoable as a single atomic undo step.

## Capabilities

### New Capabilities

- `monomer-replacement-drag-drop`: Replacing a canvas monomer or preset by dragging a library monomer or preset onto it, with bond re-establishment and optional deletion-warning dialog.

### Modified Capabilities

- `drag-drop-bond-establishment`: The drag-drop proximity detection is extended with a second interaction mode — replacement targeting (center-to-center distance, different visual feedback) that fires before the existing AP-proximity bond-establishment mode.
- `macromolecules`: Drag-and-drop user interaction gains a replacement sub-flow with mode-specific layout consequences.

## Impact

- **`ketcher-core`** — `LibraryItemDragDropHandler`: new replacement-detection logic (center-distance check, target classification — monomer vs. compatible-preset vs. incompatible-monomer), replacement execution, and bond re-establishment algorithm.
- **`ketcher-core`** — `DrawingEntitiesManager`: new `replaceMonomer` / `replacePreset` mutation methods that delete the old entity, insert the new one at the same position, and reconnect bonds.
- **`ketcher-core`** — layout modules (`SnakeLayout`, `FlexLayout`): conditional re-layout and chain-shift logic after preset→monomer replacement.
- **`ketcher-macromolecules`** — replacement hover visual: CSS/SVG state for the "about to be replaced" appearance on canvas monomers and presets.
- **`ketcher-macromolecules`** — "Deletion of bonds" modal: reuse the existing sequence-mode modal component; wire it into the replacement flow.
- No new external dependencies or public API surface changes.
- No import/export format changes.
