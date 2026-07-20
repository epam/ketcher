## Context

The drag-and-drop path in Ketcher's macromolecules editor already has partial proximity detection infrastructure:

- `DRAG_BOND_PROXIMITY_THRESHOLD_PX = 25` is defined in `Editor.ts`
- `findNearestFreeAttachmentPointForDrag` iterates canvas monomers and computes AP screen positions using canonical angles
- `onLibraryItemDragOver` calls `setMonomerDragTargetAP` to mark the nearest AP with a `+` indicator and show all free APs
- `dragDropBondTarget` is stored on the Editor during drag

On mouse release (`placeLibraryItemOnCanvas`), the Editor attempts to create a bond when `dragDropBondTarget` is set. It calls `getValidSourcePoint` on the dropped monomer to resolve default APs and either calls `createPolymerBond` directly or opens the `MonomerConnectionModal`.

**Current gaps identified against issue #7926:**

1. **Preset mirroring in Flex mode** (req. 3.3.1) — `findPresetMonomerForBonding` resolves which preset component to bond, but the preset is not mirrored when connecting leftmost-to-leftmost or rightmost-to-rightmost in Flex.
2. **Non-standard bond notification routing** — the `shouldInvokeModal` logic in `Bond.ts` has the non-standard bond check; the drag-drop path in `Editor.ts` duplicates some of this but may not surface the "same group AP" toast consistently.
3. **AP resolution fallback for presets (req. 3.3)** — `findPresetMonomerForBonding` already implements the sugar → phosphate → base fallback, but the case where all three have no free APs and a modal should open needs validation.
4. **Flex bond-length and AP-direction placement** (req. 2.4, 2.5) — after creating a bond via drag-drop in Flex mode, the dropped monomer's position is currently whatever the cursor was at. Standard bond length and AP-direction orientation are not enforced.

## Goals / Non-Goals

**Goals:**

- Fully implement all requirements from epam/ketcher issue #7926.
- Ensure bond-on-drop works for both single monomers and RNA presets.
- Enforce Flex-mode bond geometry (standard length + AP direction) for dropped monomers.
- Implement preset mirroring in Flex mode when connecting ends of chains.
- Route the non-standard bond notification through the drag-drop path.
- Validate and fill gaps in preset AP fallback (req. 3.3) and modal opening.

**Non-Goals:**

- Changing the 25 px threshold value (already configurable by updating `DRAG_BOND_PROXIMITY_THRESHOLD_PX`).
- New UI components — reuse existing AP indicators, modal, and toast.
- Changing behavior in Sequence layout mode (drag from library is already disabled there).
- Modifying the Bond tool (draw-from-AP) path — only the drag-drop placement path is in scope.
- Hydrogen bond creation via drag-drop.

## Decisions

### Decision 1: Flex-mode dropped monomer repositioning

**Problem**: After drag-drop bond creation in Flex mode, the dropped monomer sits at the cursor position, which may be far from the target monomer. The bond should have standard length and follow the AP direction.

**Decision**: After `createPolymerBond` succeeds in Flex mode, reposition the dropped monomer (and preset group) using the target AP's canonical angle to compute the new center position. The formula: `droppedCenter = targetMonomerCenter + apDirectionVector * (bodyRadius + bondLength + droppedBodyRadius)`. Use `macroModeScale` and monomer body dimensions already available on the renderer.

**Alternative considered**: Let the user manually drag to reposition after drop (current behavior). Rejected because issue #7926 explicitly requires standard bond length and AP-direction orientation (req. 2.4, 2.5).

**Alternative considered**: Use a separate layout pass for the dropped subgraph. Rejected — overkill for a single dropped item; the direct position calculation is simpler and deterministic.

### Decision 2: Preset mirroring in Flex mode (req. 3.3.1)

**Problem**: When the bond is established between the leftmost monomers of two sequences (or rightmost-to-rightmost), the preset should be mirrored to maintain natural chain direction.

**Decision**: After bond creation, check whether the bonded preset component is the first or last in its internal chain **and** the target canvas monomer is the first or last in its chain. If both are on the same side (both first or both last), mirror the preset by negating the x-offset of each preset monomer relative to the bond insertion point. Store a `mirrorPreset` flag on the placement result to drive this transformation.

**Alternative considered**: Always lay out the preset using snake layout after drop. Rejected — in Flex mode the user expects free positioning; snake layout would move unrelated monomers.

### Decision 3: Reuse `shouldInvokeModal` for drag-drop non-standard bond detection

**Problem**: The non-standard bond (Rn–Rn same-group) notification and the modal-invocation logic are partially duplicated between `Bond.ts` and `Editor.ts`.

**Decision**: Extract `shouldInvokeModal` from `Bond.ts` into a pure function in `DrawingEntitiesManager` or a shared utility, and call it from both the Bond tool path and the drag-drop path. This eliminates the duplication and ensures the "same group AP" toast fires on the drag-drop path.

**Alternative considered**: Keep the duplication and add the toast call inline in `Editor.ts`. Rejected — maintenance burden; any future change to modal logic would need to be made in two places.

### Decision 4: AP resolution failure handling for presets

**Problem**: When `findPresetMonomerForBonding` exhausts all fallback options (no free APs anywhere in the preset), the current code may silently drop the bond intent.

**Decision**: If `findPresetMonomerForBonding` returns `null` and there are no free APs in the preset, suppress bond creation and clear `dragDropBondTarget` silently (the monomer/preset is placed without a bond). If a monomer is found but AP resolution fails, open the modal.

### Decision 5: No changes to `AttachmentPoint.ts` or `BaseMonomerRenderer.ts`

The `+` indicator, AP visibility toggling, and `setDragTargetAttachmentPoint` are already fully implemented. The only rendering gap is Flex-mode repositioning (Decision 1), which is handled post-bond in the placement handler, not in the renderer.

## Risks / Trade-offs

- **[Risk] Flex repositioning may conflict with user's intended drop position** — the dropped monomer will be snapped to bond-length distance from the target, overriding the cursor position. This is the intended behavior per the spec but may surprise users who expected the monomer to land exactly where they dropped it. Mitigation: The snap is only applied when `dragDropBondTarget` is set (proximity hit); open-canvas drops are unaffected.

- **[Risk] Preset mirroring is complex to determine** — detecting "leftmost of both sequences" requires walking the chain from each bonded component. Mitigation: Use the existing `ChainsCollection` and `Chain` traversal APIs already used by snake layout. If the chain walk is too expensive in Flex mode, fall back to no mirroring (conservative default).

- **[Risk] Refactoring `shouldInvokeModal` breaks Bond tool behavior** — extracting the function changes call sites and could introduce regressions. Mitigation: Cover existing Bond tool modal-invocation paths with unit tests before refactoring; keep the extracted function's signature identical to the current closure behavior.

- **[Risk] AP screen-position approximation in `getAttachmentPointApproxCanvasPosition` is inaccurate for non-canonical monomers** — the canonical angle mapping uses fixed R1–R8 angles; unusual monomers may have APs at different rendered positions. Mitigation: This is pre-existing behavior; no change needed in this PR.

## Migration Plan

This is purely additive behavior. No data format changes, no API changes. Existing drag-drop placements without proximity hits are unaffected. No rollback strategy needed beyond reverting the PR.

## Open Questions

1. **Should the 25 px threshold be user-configurable via settings?** The issue says the value can be changed and the ticket updated — for now it remains a constant. If UX feedback requires tuning, it can be moved to `SettingsManager` in a follow-up. Developer answer: keep as a constant for now; no user-facing setting needed.
2. **Exact definition of "leftmost/rightmost" for preset mirroring** — needs clarification on whether it refers to the visual left/right in snake layout or the first/last in the chain topology. Assumption: first/last in chain topology, consistent with req. 3.3.1 examples. Developer answer: use chain topology (first/last) for determining mirroring.
3. **Should bond-on-drop be undoable as a single undo step?** The drop (place monomer) + bond creation should ideally undo together. Verify that the existing `CommandsHistory` batches these correctly. Developer answer: yes, ensure that the bond creation and monomer placement are wrapped in a single command for undo purposes.
