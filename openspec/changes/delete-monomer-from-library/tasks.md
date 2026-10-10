## 1. User-made monomer tracking

- [x] 1.1 Add a module-scope `persistentUserCreatedMonomerRefs: Set<string>` in `packages/ketcher-core/src/application/editor/Editor.ts`, alongside the existing `persistentMonomersLibrary`/`persistentMonomersLibraryParsedJson` caches.
- [x] 1.2 Populate it in `updateMonomersLibrary` when `isUserCreated: true` is passed (only for new monomers, `existingMonomerIndex === -1`). In `setMonomersLibrary` replay, all localStorage entries are replayed with `isUserCreated: true` — presence in localStorage is the signal for user-made.
- [x] 1.3 Add `Editor.isUserMadeMonomer(monomer: MonomerItemType): boolean` returning `persistentUserCreatedMonomerRefs.has(ref)`.
- [x] 1.4 Unit test: seed a `localStorage` "add custom monomer" update, reload the editor, and assert `isUserMadeMonomer` is `true` for the restored custom monomer and `false` for a default one.

## 2. Canvas-presence and preset-participation detection

- [x] 2.1 Add `Editor.isMonomerPlacedOnCanvas(monomer: MonomerItemType): boolean` using `drawingEntitiesManager.monomersArray.some(...)` compared via `getMonomerTemplateRefFromMonomerItem`.
- [x] 2.2 Add `Editor.getReferencingPresets(monomer: MonomerItemType): IKetMonomerGroupTemplate[]`, factored out of the `MONOMER_GROUP_TEMPLATE` branch of the current `isMonomerReferencedInLibrary`, returning the matching preset templates instead of a boolean.
- [x] 2.3 Keep the ambiguous-template branch of `isMonomerReferencedInLibrary` as a separate, still-boolean check used only to keep disabling `Delete` for monomers that are components of an ambiguous monomer template (unchanged behavior, out of scope for the new cascade).
- [x] 2.4 Unit tests for both new methods: canvas presence true/false, preset participation with zero/one/multiple matching presets.

## 3. Preset removal and cascade delete

- [x] 3.1 Add `Editor.removePresetFromLibrary(presetRef: string)` in `Editor.ts`, mirroring `removeMonomerFromLibrary`'s splice/filter/delete/persist/dispatch shape for a `MONOMER_GROUP_TEMPLATE` entry.
- [x] 3.2 Update `packages/ketcher-macromolecules/src/state/rna-builder/rnaBuilderSlice.ts` `deletePreset` (and/or the `Delete.tsx` modal's confirm handler) to also call `removePresetFromLibrary`, closing the existing gap where RNA Builder's own "delete preset" action never touched the KET template data.
- [x] 3.3 Remove the throw-on-reference guard for preset participation from `removeMonomerFromLibrary`; keep the ambiguous-template guard.
- [x] 3.4 Add a cascade helper (e.g. in `MonomerLibraryContextMenu.tsx` or a shared helper module) that, given a monomer, computes canvas presence and referencing presets, and on confirmed delete calls `removeMonomerFromLibrary` plus `removePresetFromLibrary`/`deletePreset` for each referencing preset.
- [x] 3.5 Unit tests: deleting a monomer that participates in two presets removes both; deleting a monomer removes it from `localStorage`-persisted state such that it does not reappear on reload.

## 4. Library-card menu and confirmation modals

- [x] 4.1 In `MonomerLibraryContextMenu.tsx`, hide the `Delete` menu item entirely (not just disable) when `!editor.isUserMadeMonomer(item)`.
- [x] 4.2 Keep `Delete` disabled when the monomer is referenced by an ambiguous monomer template (per task 2.3).
- [x] 4.3 On `Delete` click, compute `isOnCanvas` (task 2.1) and `referencingPresets` (task 2.2); if both are empty/false, call the existing delete path immediately with no modal.
- [x] 4.4 If only `isOnCanvas` is true, dispatch `editor.events.openConfirmationDialog` with title "Monomer present on canvas" and the exact message from issue #8927 §6.2.2.1; on confirm, delete the monomer only.
- [x] 4.5 If only `referencingPresets` is non-empty, dispatch the dialog with title "Monomer participates in a preset" and the message from §6.2.2.2; on confirm, delete the monomer and every referencing preset.
- [x] 4.6 If both apply, dispatch the dialog with title "Monomer present on canvas and participates in a preset" and the combined message from §6.2.2.3; on confirm, delete the monomer and every referencing preset, leaving canvas instances untouched.
- [x] 4.7 Verify/update `MonomerLibraryContextMenu.test.tsx` for: Delete hidden for default monomers, visible for user-made monomers, and the three modal-dispatch branches plus the no-modal immediate-delete branch.

## Bug fix: runtime-only API-added monomers must not be deletable

- [x] B1. Tasks 1.1–1.3 above implement the positive-inclusion tracking (replaces the original negative-exclusion approach).
- [x] B2. In `MonomerCreationWizard.library.ts`: pass `isUserCreated: true` to `editor.updateMonomersLibrary`. Storage format is unchanged (raw KET for new monomers, `{ data, editedMonomerRef }` for edits).
- [x] B3. Add unit tests: `updateMonomersLibrary` without `isUserCreated` → `isUserMadeMonomer` returns `false`; with `isUserCreated: true` → returns `true`; localStorage replay → returns `true`.

## 5. Manual verification

- [ ] 5.1 Manually verify in the running app: create a custom monomer, place an instance on canvas, delete it from the library, confirm the canvas instance remains and the library no longer offers it for placement.
- [ ] 5.2 Manually verify: create a custom monomer used in a custom RNA preset, delete the monomer, confirm the preset disappears from the library and does not reappear after a page reload.
- [ ] 5.3 Manually verify: default library monomers never show a `Delete` option.

## 6. End-to-end tests (ask before starting)

- [ ] 6.1 Before writing any Playwright test, read `.memory-bank/testing.md` and ask the user to confirm scope, per project rules.
- [ ] 6.2 Add Playwright coverage for the four delete flows (no-modal, canvas-only, preset-only, combined) once scope is confirmed.
