## Why

In molecules mode, when a user attempts to edit a monomer using tool interactions (bond tool, eraser, charge, S-group tool, etc.) or selects it with the S-group tool, nothing useful happens — the editor silently no-ops or shows the generic "Edit Abbreviation" dialog that is designed for plain functional groups, not monomers. Users need a dedicated "Edit Monomer" dialog that clearly offers to open the Monomer Creation Wizard or to dissolve the monomer grouping.

## What Changes

- When a user triggers a grouping-change action on one or more monomers in molecules mode (tool interaction that would normally invoke `removeFG`, or clicking/double-clicking with the S-group tool on a monomer), show a new **"Edit Monomer"** dialog instead of the current "Edit Abbreviation" dialog.
- The dialog title is always **"Edit Monomer"**.
- Dialog content and button set depend on the context:
  - **Single monomer selected** — offers "Edit Monomer" (opens Monomer Creation Wizard), "Remove Grouping" (dissolves grouping via `fromSgroupDeletion`), and "Cancel".
  - **Multiple identical monomers selected** — offers "Edit All Monomers" (opens Wizard for all), "Remove Grouping", and "Cancel".
  - **Multiple non-identical monomers selected** — offers only "Remove Grouping" and "Cancel" (no Wizard option because editing all distinct monomers together is ambiguous).
- The `sgroupDialog` method in `SGroupTool` currently silently returns when `sg.isMonomer` is true; it must instead dispatch the new "Edit Monomer" dialog event.
- All existing tool entry points that dispatch `removeFG` must detect monomers and route to the new dialog instead, so the experience is consistent regardless of the triggering action (bond tool, eraser, charge, S-group tool, etc.).

## Capabilities

### New Capabilities

- `edit-monomer-dialog`: A dedicated "Edit Monomer" dialog in molecules mode that intercepts monomer-targeted grouping-change actions and offers contextually appropriate options (edit single, edit all, remove grouping, cancel).

### Modified Capabilities

- `templates-and-groups`: The behavior when an incompatible tool is applied to a monomer atom/group now routes to the "Edit Monomer" dialog rather than the "Edit Abbreviation" dialog.

## Impact

- **`packages/ketcher-react`** — new React modal component (`EditMonomer`), registered alongside the existing `removeFG` dialog; changes to `editor/index.js` to wire the new pipeline event; changes to `SGroupTool.sgroupDialog` and the `removeFG` dispatch sites in `sgroup.ts`, `atom.ts`, `bond.ts`, `eraser.ts`, `handleHotkeysOverItem.ts`.
- **`packages/ketcher-core`** — new pipeline event (`editMonomer`) added to `Editor` event declarations; helper logic to detect whether a set of functional-group ids are all monomers (and whether they are identical).
- No public API changes; no format/import-export impact.
- Existing E2E tests for "Edit Abbreviation" on plain functional groups are unaffected; new tests needed for monomer-specific paths.
