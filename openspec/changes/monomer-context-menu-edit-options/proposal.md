## Why

Currently, monomers placed on the micromolecules (small molecules) canvas have a limited right-click context menu that does not expose editing or management actions. Users have no direct way to open the monomer creation wizard to modify existing monomers from within the molecules mode context menu, forcing workarounds that break workflow continuity.

## What Changes

- Add five new context menu items for monomers on the micromolecules canvas: **"Edit Monomer"**, **"Edit All [monomer_code] (count)"**, **"Create Monomer"**, **"Remove Grouping"**, and **"Delete"**.
- Restructure the monomer context menu to follow a defined ordering with visual separators (lines).
- **"Edit Monomer"** opens the monomer creation wizard pre-loaded with the selected monomer's properties for single-instance editing.
- **"Edit All [monomer_code] (count)"** opens the monomer creation wizard for editing all instances of the same monomer, preceded by a confirmation modal reused from the RNA builder.
- **"Remove Grouping"** replaces the previous "Remove Abbreviation" action and expands the monomer if it was collapsed.
- **"Create Monomer"** is shown only when a continuous selection contains multiple monomers, or one monomer combined with a chemical structure.
- **"Delete"** deletes the monomer and any other selected elements; always visible and enabled.
- Hovering over "Edit All…" highlights all affected monomer instances on canvas.
- Menu items are enabled/disabled and shown/hidden based on the nature of the current selection (e.g., "Edit Monomer" is disabled unless exactly one monomer is selected).

## Capabilities

### New Capabilities

- `monomer-context-menu`: Right-click context menu for monomers on the micromolecules canvas — new structure, new items, visibility/enabled rules per selection context.
- `monomer-edit-wizard-entry`: Entry points into the monomer creation wizard from the context menu — "Edit Monomer" (single instance) and "Edit All [code] (n)" (all instances) actions, including confirmation modal for the "Edit All" path.

### Modified Capabilities

<!-- No existing spec-level capabilities are changing in this ticket. -->

## Impact

- `ketcher-react`: monomer context menu component — add new menu items with display and enabled-state logic.
- `ketcher-react`: Selection logic — read the current selection to determine which menu items are visible/enabled.
- `ketcher-react`: "Edit All" hover state — highlight all monomer instances on hover of the "Edit All" menu item.
- `ketcher-react`: Confirmation modal — reuse the RNA builder modal with new title/body copy for the "Edit All" flow.
- `ketcher-core`: Context menu action handlers for "Remove Grouping" and "Delete" (may already exist, ensure correct wiring).
- No new external dependencies; no breaking API changes.
