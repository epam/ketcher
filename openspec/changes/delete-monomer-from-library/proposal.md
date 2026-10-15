## Why

Custom (user-made) monomers can be created via the Monomer Creation Wizard, but there is no way to remove one from the library afterward. The library-card three-dot menu already has a `Delete` action wired to `Editor.removeMonomerFromLibrary`, but it is shown for every monomer (default and user-made alike) and is simply disabled — with no explanation — whenever the monomer participates in an RNA preset, and it never checks whether the monomer has instances placed on the canvas. Users need a working, safe delete path for monomers they created themselves.

## What Changes

- Restrict the `Delete` library-card menu action to user-made monomers only (a monomer that does not share a type+class and symbol with any default library monomer, and was not part of the originally bundled default library). Default monomers no longer show `Delete`.
- Before deleting a user-made monomer, check two conditions and branch into the matching confirmation modal (title, message, and consequence per issue #8927 §6.2):
  - **On canvas only** — "Monomer present on canvas": deleting removes it from the library but leaves placed instances untouched.
  - **Participates in a preset only** — "Monomer participates in a preset": deleting removes the monomer and all library presets that reference it.
  - **Both** — "Monomer present on canvas and participates in a preset": combined message; canvas instances stay, referencing presets are deleted.
  - **Neither** — delete immediately, no modal (current behavior, preserved).
  - All modals default to "Cancel"; "Yes" proceeds with the deletion (and, where applicable, the cascaded preset removal).
- Replace the current hard block (`Delete` disabled, no feedback) for preset-referenced monomers with the new cascade-delete-with-confirmation flow described above.
- Add the supporting capability to find which preset(s) reference a given monomer, and to remove a preset from the library (KET template JSON + Redux `presetsCustom` + localStorage cache) as part of the cascade.

## Capabilities

### New Capabilities

- `monomer-library-deletion`: user-made-monomer detection, the three canvas/preset confirmation-modal variants (and the no-modal immediate-delete case), and the cascade removal of referencing presets when a monomer is deleted.

### Modified Capabilities

- none (no existing capability in `openspec/specs/` covers library-card deletion yet; the related in-progress changes `edit-monomer-wizard-dialog`, `edit-monomers-from-macromolecules-mode`, and `monomer-context-menu-edit-options` cover the context menu, edit dialog, and edit-instance flows but not deletion).

## Impact

- `packages/ketcher-core/src/application/editor/Editor.ts` — `isMonomerReferencedInLibrary`, `removeMonomerFromLibrary`; new helpers for canvas-presence and user-made detection; new preset removal.
- `packages/ketcher-macromolecules/src/components/monomerLibrary/MonomerLibraryContextMenu.tsx` — `Delete` visibility and click handling (open the right modal variant instead of calling delete directly).
- `packages/ketcher-macromolecules/src/components/modal/` — new confirmation modal content (or reuse of the generic `ConfirmationDialog` / `openConfirmationDialog` event) for the three message variants.
- `packages/ketcher-macromolecules/src/state/rna-builder/rnaBuilderSlice.ts` and `packages/ketcher-macromolecules/src/helpers/manipulateCachedRnaPresets.ts` — preset removal needs to also be reachable from the deletion cascade, not only from the RNA Builder's own "delete preset" UI action.
- Out of scope (tracked by other issues/changes): context-menu options on the micromolecules canvas (#7864), the "Edit Monomer" dialog (#8921), editing a single/all instances (#8922/#8923), AP deletion on canvas (#8924), entering the wizard from an expanded monomer selection (#8925), and "Revert to Default…" (#8926).
