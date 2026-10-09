## Context

The library-card three-dot menu (`MonomerLibraryContextMenu.tsx`) already renders a `Delete` item for every non-ambiguous monomer card, wired to `Editor.removeMonomerFromLibrary`. Today that item is only ever *disabled* — never hidden — and the only guard is `Editor.isMonomerReferencedInLibrary`, which throws/blocks whenever the monomer is a component of **any** template that references it (an RNA preset `MONOMER_GROUP_TEMPLATE` or an `AMBIGUOUS_MONOMER_TEMPLATE`). There is no check for canvas presence, and no distinction between default and user-made monomers.

Two facts drive the design:
- The runtime `_monomersLibrary` / `_monomersLibraryParsedJson` on `Editor` already hold the **merged** result of the bundled default library plus any custom upserts and replayed `localStorage` updates (see `Editor.setMonomersLibrary`). Origin is tracked via `persistentUserCreatedMonomerRefs` — a positive-inclusion set populated by Monomer Creation Wizard creates and by any entry replayed from `localStorage` (including API adds with `shouldPersist:true`).
- Custom RNA presets are saved via `MonomerCreationWizard.library.ts` → `Editor.updateMonomersLibrary`, which merges a `MONOMER_GROUP_TEMPLATE` into the same KET JSON the monomer lives in. Separately, the RNA Builder's own "delete preset" UI action (`rnaBuilderSlice.deletePreset`) only removes the preset from Redux `presetsCustom` and the `localStorage` preset cache — it does **not** remove the `MONOMER_GROUP_TEMPLATE` entry from the KET JSON. These two preset representations need to be kept in sync by whichever code path deletes a preset.

## Goals / Non-Goals

**Goals:**
- Show `Delete` only on cards for user-made monomers (not default library monomers).
- Before deleting, detect (a) canvas presence and (b) preset participation, and show the matching one of three confirmation modals from issue #8927 §6.2, or delete immediately if neither applies.
- On confirmed delete, remove the monomer from the library and, if it participated in any presets, remove those presets too (KET JSON + Redux + `localStorage`), consistently.

**Non-Goals:**
- "Revert to Default…" (#8926) — not implemented in this change.
- Context menu on the micromolecules canvas, the "Edit Monomer" dialog, single/all-instance editing, AP-deletion-on-canvas, and wizard entry from a canvas selection (#7864, #8921–#8925) — all out of scope, covered by other changes.
- Deleting a monomer that is a component of an **ambiguous** monomer template — current hard-block behavior (menu item disabled) is preserved unchanged; the issue only describes preset participation, not ambiguous-template membership.
- Bulk/multi-select deletion from the library — single-card `Delete` only.

## Decisions

### 1. Track user-made monomer refs with a positive-inclusion set

Add a module-scope `persistentUserCreatedMonomerRefs: Set<string>` in `Editor.ts`. A monomer ref is added to this set only when `updateMonomersLibrary` is called with `isUserCreated: true`. During `setMonomersLibrary` replay, every `localStorage` entry is replayed with `isUserCreated: true` — the presence of an entry in `localStorage` is the signal that it was intentionally added (by the wizard or by a host app via `ketcher.updateMonomersLibrary` with `shouldPersist:true`). At runtime, the Monomer Creation Wizard passes `isUserCreated: true`; `ketcher.updateMonomersLibrary` / `ketcher.replaceMonomersLibrary` without `shouldPersist` do not, so runtime-only additions are not deletable. Expose `Editor.isUserMadeMonomer(monomer)` as `persistentUserCreatedMonomerRefs.has(ref)`.

**Alternative considered:** use `!persistentDefaultMonomerRefs.has(ref)` (original implementation). Rejected: this approach misclassifies monomers added by `ketcher.updateMonomersLibrary` / `ketcher.replaceMonomersLibrary` at runtime as user-made, since those refs are not in the default set. Positive-inclusion tracking matches intent: only monomers the user (or a host app intentionally persisting) added are deletable.

### 2. Reuse the generic confirmation-dialog event, not a bespoke modal component

Use the existing `editor.events.openConfirmationDialog.dispatch({ title, confirmationText, onConfirm })` → `ConfirmationDialog` pattern (already used for the "Deletion of bonds" modal in drag-drop replacement) for all three variants. Each variant differs only in `title`/`confirmationText`; `onConfirm` runs the same delete-plus-cascade logic with the precomputed list of referencing presets closed over.

**Alternative considered:** a dedicated modal component per variant (the pattern `Delete.tsx` uses for RNA Builder's own preset deletion, which needs bespoke Redux wiring). Rejected: none of the three variants need extra UI beyond title/message/Yes/Cancel, so the generic event is simpler and matches the closest existing precedent (bond-deletion warning) exactly.

### 3. Separate "preset participation" from "ambiguous-template participation"

Split the existing `isMonomerReferencedInLibrary` into two explicit checks:
- `getReferencingPresets(monomer): IKetMonomerGroupTemplate[]` — walks `MONOMER_GROUP_TEMPLATE` entries only, returns the matches (not just a boolean) so the cascade-delete step knows exactly what to remove.
- The existing ambiguous-template check stays as today's hard block (menu item disabled when true), independent of the new flow.

`removeMonomerFromLibrary`'s current guard (throw when `isMonomerReferencedInLibrary`) is replaced by: still throw/guard against ambiguous-template references (unchanged), but preset references no longer block deletion — they drive the cascade instead.

### 4. Add a symmetrical `removePresetFromLibrary` and route all preset deletion through it

Add `Editor.removePresetFromLibrary(presetRef)` that removes the `MONOMER_GROUP_TEMPLATE` entry from `_monomersLibrary`/`_monomersLibraryParsedJson` (mirroring `removeMonomerFromLibrary`'s splice/filter/delete/dispatch shape) and persists the removal the same way (`SettingsManager.addMonomerLibraryUpdate`). The macromolecules-side cascade, after confirming, calls this for each referencing preset **and** dispatches the existing `rnaBuilderSlice.deletePreset` (or the lower-level `deleteCachedCustomRnaPreset` + state splice it performs) so Redux state, the `localStorage` cache, and the KET JSON all stay in sync. RNA Builder's own "delete preset" UI action is updated to call the new `removePresetFromLibrary` too, closing the pre-existing sync gap rather than leaving two divergent deletion paths.

### 5. New canvas-presence check mirrors the existing reference-check idiom

Add `Editor.isMonomerPlacedOnCanvas(monomer)`: `drawingEntitiesManager.monomersArray.some(m => getMonomerTemplateRefFromMonomerItem(m.monomerItem) === ref)`, following the same idiom already used at `Editor.ts:1894`/`2583`.

### 6. Decision table consumed by the menu handler

| On canvas | In preset(s) | Action |
|---|---|---|
| no | no | delete immediately, no modal |
| yes | no | modal "Monomer present on canvas" → Yes deletes monomer only |
| no | yes | modal "Monomer participates in a preset" → Yes deletes monomer + all referencing presets |
| yes | yes | modal "Monomer present on canvas and participates in a preset" → Yes deletes monomer + all referencing presets; canvas instances untouched |

## Risks / Trade-offs

- **[Risk]** A host app using `ketcher.updateMonomersLibrary` with `shouldPersist:true` will have those monomers treated as user-made (deletable). → **Accepted:** persisting an entry is an explicit opt-in signal from the host app to make it part of the user's library; the user should be able to manage it.
- **[Risk]** Cascading preset deletion removes presets the user didn't realize referenced the monomer. → **Mitigation:** the modal text (per issue copy) explicitly names the consequence before the user confirms; default is "Cancel".
- **[Risk]** Two preset-deletion entry points (RNA Builder's own delete action and this cascade) drifting again in the future. → **Mitigation:** both route through the same new `removePresetFromLibrary`, eliminating the current divergence rather than adding a third path.
- **[Trade-off]** Ambiguous-template participation remains a hard block (no modal, matching today's behavior) rather than getting its own confirmation flow, since the issue doesn't specify copy for that case and it's an unrelated, rarer scenario.

## Migration Plan

No stored-data migration is required. The `persistentUserCreatedMonomerRefs` set is populated at runtime from `localStorage` replay (all non-removal, non-replacement entries) and from live wizard creates. No storage schema changes are required. The preset-removal persistence reuses the same `SettingsManager.addMonomerLibraryUpdate` mechanism.

## Open Questions

- Playwright e2e coverage: per project rules, confirm scope and get explicit go-ahead before writing e2e tests, after reading `.memory-bank/testing.md`.
