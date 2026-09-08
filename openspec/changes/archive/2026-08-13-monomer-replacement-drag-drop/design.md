## Context

The macromolecules drag-and-drop infrastructure already supports:

- Proximity detection: `LibraryItemDragDropHandler` in `ketcher-core` owns all drag-over and drop logic, with `DRAG_BOND_PROXIMITY_THRESHOLD_PX = 25` for AP proximity.
- `findNearestFreeAttachmentPointForDrag` iterates canvas monomers and finds free APs within 25 px of the cursor.
- On drop, if `dragCircleHoverTarget` is set, a polymer bond is established using `createPolymerBond` (or the `MonomerConnectionModal` dialog).
- `DrawingEntitiesManager` owns monomer creation (`addMonomer`, `createPolymerBond`) and all inter-monomer bond operations.
- A "Deletion of bonds" modal already exists in `ketcher-macromolecules` and is reused by the sequence-mode replacement flow.
- Snake layout is triggered post-mutation via the existing `runSnakeLayout` path; Flex mode uses direct position updates.
- Undo is handled via `CommandsHistory`; all mutations go through `Command` objects.

This change adds a **replacement interaction layer** on top of the existing drag-drop flow. A replacement is triggered when the cursor is within a new `DRAG_REPLACE_PROXIMITY_THRESHOLD_PX` of a canvas monomer's center — distinct from and taking priority over the existing 25 px AP proximity check.

## Goals / Non-Goals

**Goals:**

- Add center-proximity replacement detection to `LibraryItemDragDropHandler` for both single monomers and presets.
- Implement three replacement cases: monomer→monomer, preset→preset (same geometry), preset→monomer.
- Re-establish bonds on the replacement monomer/preset after removal of the original.
- Show the existing "Deletion of bonds" modal when bonds would be lost.
- Apply layout rules: no re-layout for monomer→monomer; conditional re-layout for preset cases.
- Make replacement atomic in undo history.
- Preserve bonds to small molecules and hydrogen bonds through replacement.

**Non-Goals:**

- Changing the 25 px AP proximity threshold.
- Changing the drag-drop placement (non-replacement) path.
- Monomer replacement in Sequence layout mode (drag from library is disabled there).
- Hydrogen bond creation via drag-drop.
- Replacing presets with a single monomer (only individual preset component replacement is supported).

## Decisions

### Decision 1: Replacement detection in `LibraryItemDragDropHandler`

**Problem**: Where should center-proximity replacement detection live?

**Decision**: Add a `dragReplaceTarget` field to `LibraryItemDragDropHandler` alongside the existing `dragDropBondTarget`. In `onLibraryItemDragOver`, first check whether the cursor is within `DRAG_REPLACE_PROXIMITY_THRESHOLD_PX` of any canvas monomer center. If yes, set `dragReplaceTarget` and skip the AP-proximity check. If no, clear `dragReplaceTarget` and proceed with the existing AP proximity logic. This keeps all drag-state in one place.

**Alternative considered**: Add a separate `ReplacementHandler` class. Rejected — the replacement and bond-establishment paths share drag state (cursor position, dragged item type); splitting them into separate handlers creates coordination overhead.

### Decision 2: Target classification (monomer vs. same-geometry preset vs. incompatible monomer)

**Problem**: When a preset is dragged and `dragReplaceTarget` is set, we need to know whether the target is a same-geometry preset component, a standalone monomer, or part of a different-geometry preset.

**Decision**: In `onLibraryItemDragOver`, after identifying the nearest canvas monomer by center distance, inspect whether that monomer belongs to a preset (by checking `BaseMonomer.parentPreset` or the equivalent preset-membership flag). If it does, compare preset geometry (component list + phosphate position) with the dragged preset. Three outcomes: (a) same-geometry preset — mark entire preset as target, (b) different-geometry preset or standalone monomer — mark only the hit monomer as target. For single-monomer drags, the target is always the hit monomer (even if it is a preset component).

**Alternative considered**: Detect same-geometry by matching monomer type lists. Decision: use the same geometry-equality predicate used by the RNA builder for preset comparison.

### Decision 3: Replacement execution in `DrawingEntitiesManager`

**Problem**: How to atomically swap a monomer (or preset) and reconnect bonds?

**Decision**: Add `replaceMonomer(oldMonomer, newTemplate, position)` and `replacePreset(oldPreset, newPresetTemplate, sugarPosition)` methods to `DrawingEntitiesManager`. Each method:

1. Collects all existing bonds on the original entity (polymer bonds, monomer-to-atom bonds, hydrogen bonds).
2. Removes the original entity via existing delete operations.
3. Creates the new entity at the same position via existing add operations.
4. For each original bond, attempts to re-establish it on the matching Rn of the new entity; if the Rn is absent, records it as a "deleted bond".
5. Returns a `Command` that wraps all sub-operations so undo reverses everything in one step.

**Alternative considered**: Execute replacement as a sequence of individual undo steps (delete + add + reconnect). Rejected — the spec requires single-step undo; the user should not have to undo each sub-operation separately.

### Decision 4: Bond deletion warning dialog integration

**Problem**: The "Deletion of bonds" modal must block replacement until the user confirms.

**Decision**: In `LibraryItemDragDropHandler.placeLibraryItemOnCanvas`, after computing the set of bonds that would be lost, if the set is non-empty, show the existing "Deletion of bonds" modal (reusing the component already wired in `ketcher-macromolecules`). The modal's "Yes" callback executes the replacement command; "Cancel" clears `dragReplaceTarget` and discards the drop.

**Alternative considered**: Show the warning as a toast instead of a blocking modal. Rejected — the spec explicitly requires the same blocking modal used in sequence mode.

### Decision 5: Layout after preset→monomer replacement

**Problem**: Replacing a monomer with a multi-component preset requires chain geometry adjustments.

**Decision**:

- **Snake mode**: after replacement, call `runSnakeLayout` on the affected chain — same path triggered by bond creation in snake mode today.
- **Flex mode**: compute the position delta between the original monomer center and the new preset's sugar center; shift all downstream monomers in the connected chain by that delta. Use the existing chain-traversal from `ChainsCollection` to identify which monomers to shift. Apply smooth auto-scroll if any shifted monomer ends up outside the viewport (reusing the autochain scroll utility).

**Alternative considered**: Run full snake layout in flex mode too. Rejected — the spec explicitly prohibits triggering snake re-layout in flex; the user's free-form positions must be respected except for the direct chain shift.

### Decision 6: Replacement visual state

**Problem**: The replacement-target appearance (different from AP `+` highlighting) needs CSS/SVG representation.

**Decision**: Use dedicated TransientView

## Risks / Trade-offs

- **[Risk] Proximity threshold for replacement vs. AP may overlap** — if `DRAG_REPLACE_PROXIMITY_THRESHOLD_PX` is close to or larger than 25 px, users may accidentally trigger replacement when they intended AP bond-establishment. Mitigation: the replacement check runs first and takes full priority; the threshold value will be determined by UX ([TBD] in spec) and can be tuned without code changes.

- **[Risk] Bond re-establishment logic is complex for presets** — a preset has up to 3 components, each with multiple APs; mapping old bonds to new components requires careful matching. Mitigation: write exhaustive unit tests for `replacePreset` covering all AP overlap scenarios before wiring the UI interaction.

- **[Risk] Chain shift in Flex may produce visually awkward layouts** — shifting a long chain horizontally after a single monomer is replaced with a larger preset can move many monomers. Mitigation: the shift is minimal (difference in monomer sizes) and reversible with undo. Autochain smooth scroll ensures off-screen items become visible.

- **[Risk] Same-geometry preset comparison may be too strict or too loose** — if the equality check is too strict (e.g., it compares monomer names instead of just types), common presets may fail to match. Mitigation: define geometry equality as: same set of component types (sugar, base, phosphate presence) and same phosphate position (5′/3′), matching the spec's definition.

## Migration Plan

Purely additive behavior. No data format changes, no public API changes. Existing drag-drop placement behavior (bond-establishment and open-canvas drop) is only affected by the priority-ordering change (replacement check first, AP check second). The open-canvas drop path is unaffected.

## Open Questions

1. **Exact value of `DRAG_REPLACE_PROXIMITY_THRESHOLD_PX`** — marked [TBD] in the spec. This must be agreed with UX before implementation. A reasonable starting point is ~30–40 px (slightly larger than monomer body radius).
2. **Visual appearance of replacement-target state** — the spec references mockups that are "not final". The CSS/SVG treatment should be confirmed with design before implementation.
3. **Should the preset sugar position be used as anchor in all Flex cases, or only when non-standard angles are detected?** — The spec says sugar position of the new preset should match the original sugar position specifically when angles are non-standard. When angles are standard, the spec says no re-layout, implying the new preset is placed in standard orientation relative to the chain. This needs design sign-off.
