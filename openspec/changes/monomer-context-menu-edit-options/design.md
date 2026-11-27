## Context

Monomers placed on the micromolecules canvas are represented as `MonomerMicromolecule` S-groups (a specialised `SGroup` subtype). Right-clicking them already triggers the `CONTEXT_MENU_ID.FOR_MACROMOLECULE` menu, rendered by `MacromoleculeMenuItems.tsx`. That menu currently shows **"Edit Instance"**, **"Edit All Instances"**, **"Expand monomer"**, and **"Collapse monomer"**. A separate `FunctionalGroupMenuItems.tsx` menu (for plain S-groups) carries **"Remove Abbreviation"**.

The monomer creation wizard (`MonomerCreationWizard.tsx`) is already wired to both single-instance and all-instances editing via `editor.openMonomerCreationWizard()`. A generic `ConfirmationDialog` (`ketcher-macromolecules`) is already available and dispatched through the editor event bus (`editor.events.openConfirmationDialog`).

The routing logic in `ContextMenuTrigger.utils.ts` already directs right-clicks on any `MonomerMicromolecule` to `FOR_MACROMOLECULE`, and it also handles selections that contain at least one monomer.

## Goals / Non-Goals

**Goals:**

- Restructure the `FOR_MACROMOLECULE` context menu to match the specified item order and separators.
- Rename "Edit Instance" → "Edit Monomer" and "Edit All Instances" → "Edit All **[code]** (n)".
- Add **"Remove Grouping"** to the monomer context menu (currently only on the functional-groups menu).
- Add **"Create Monomer"** to the monomer context menu, visible only for qualifying multi-item selections.
- Add **"Delete"** to the monomer context menu (always visible/enabled).
- Gate "Edit All…" behind the existing `ConfirmationDialog` (title: "Editing monomers"; body: "You are going to edit (n) monomers. Are you sure?").
- Highlight all instances on hover of "Edit All…".
- Ensure "Edit Monomer" is disabled (with tooltip) when more than one monomer is in the selection.

**Non-Goals:**

- Implementing the actual wizard editing logic for single-instance or all-instances edits (covered in separate tickets #8921–#8923).
- Any changes to the macromolecules-mode canvas context menu.
- Changes to how monomers are serialised or exported.

## Decisions

### Decision 1 — Keep the existing `FOR_MACROMOLECULE` menu ID; only reshape `MacromoleculeMenuItems.tsx`

**Rationale:** The routing infra (`ContextMenuTrigger.utils.ts`) already correctly routes monomer right-clicks to `FOR_MACROMOLECULE`. Adding new items to this single file is simpler and lower-risk than adding a second menu ID or splitting responsibilities.

**Alternatives considered:**

- Merging the monomer items into `FunctionalGroupMenuItems.tsx` — rejected because the two menus handle distinct SGroup subtypes and mixing them would complicate visibility/enabled logic.

### Decision 2 — Reuse `ConfirmationDialog` from `ketcher-macromolecules` via the editor event bus

**Rationale:** The dialog already exists, is already wired to the editor event bus (`editor.events.openConfirmationDialog.dispatch(...)`), and has E2E page-object support. Reusing it avoids duplicating dialog infrastructure in `ketcher-react`.

**Alternatives considered:**

- Adding a new standalone dialog in `ketcher-react` — rejected to avoid duplication and to stay consistent with the existing pattern shown in `SequenceItemContextMenu.tsx`.

### Decision 3 — Compute the "Edit All" monomer count from the canvas (all instances, not just selected)

**Rationale:** The spec says the count in "Edit All **[code]** (n)" reflects the total number of that monomer on the canvas, regardless of how many are currently selected. The count must be derived from the full struct at menu-open time by matching the monomer's library code across all SGroups.

### Decision 4 — Hover highlighting via CSS class toggle, not selection state

**Rationale:** Hover highlighting of "Edit All…" targets all matching monomer instances on canvas. Using a temporary CSS highlight class (similar to how hover is handled on the macromolecules canvas) avoids polluting the undo/redo history with transient visual state.

**Alternatives considered:**

- Dispatching a Redux action — rejected because hover highlight is purely transient and should not affect persisted state.

### Decision 5 — "Remove Grouping" reuses `fromSgroupDeletion()` (same as "Remove Abbreviation")

**Rationale:** The implementation is identical to the existing "Remove Abbreviation" action in `useFunctionalGroupRemove.ts`. A new hook (e.g., `useRemoveGrouping.ts`) that calls the same underlying function is the cleanest approach, keeping the `FOR_MACROMOLECULE` menu self-contained.

### Decision 6 — "Create Monomer" visibility condition reads from selection at menu-open time

**Rationale:** The spec requires "Create Monomer" to be visible only when the selection contains multiple monomers, or one monomer plus a chemical structure. This state can be derived from the `MacromoleculeContextMenuProps` (already contains `functionalGroups`) combined with checking the general selection for non-monomer structure elements.

## Risks / Trade-offs

- **[Risk] Hover highlighting re-renders entire canvas on mouse-enter/leave** → Mitigation: Limit the highlight to SVG class toggling without triggering React re-renders; confirm performance with a benchmark on a canvas with 50+ monomer instances.
- **[Risk] "Edit All…" confirmation dialog is in `ketcher-macromolecules`; `ketcher-react` uses it via the event bus** → Mitigation: Verify that the event listener is registered before any monomer context menu action is dispatched. If not, the dialog must be independently reproduced in `ketcher-react`.
- **[Risk] Count in "Edit All…" becomes stale if the struct changes while the menu is open** → Mitigation: Count is computed at menu-open time; this matches how other context menu props are gathered (snapshot on right-click).

## Migration Plan

1. Update `MacromoleculeMenuItems.tsx` — rename items, add new items, restructure order and separators.
2. Add `useRemoveGrouping.ts` hook in the `hooks/` directory.
3. Update `MacromoleculeContextMenuProps` in `contextMenu.types.ts` if additional props are needed (e.g., total monomer count).
4. Wire the "Edit All…" confirmation dialog through `editor.events.openConfirmationDialog`.
5. Implement hover-highlight logic for "Edit All…" item.
6. Update `ContextMenuTrigger.utils.ts` if selection routing needs adjustment for the "Create Monomer" condition.
7. Update E2E constants in `Constants.ts` with new `data-testid` values.
8. No rollback needed — the change is additive to an existing menu component.

## Open Questions

- Is the `editor.events.openConfirmationDialog` event bus available from within `ketcher-react` context menu hooks, or does a separate dialog need to be created in `ketcher-react`? Verify during implementation.
- Should "Remove Grouping" expand a collapsed monomer automatically (as stated in 1.1.4), or rely on the existing S-group deletion path which may already handle this?
