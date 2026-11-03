## 1. Core Infrastructure (ketcher-core)

- [x] 1.1 Add `editMonomer` pipeline event to `Editor.event` declarations in `packages/ketcher-core/src/application/editor/Editor.ts` alongside the existing `removeFG` event
- [x] 1.2 Define the `EditMonomerPayload` interface (`fgIds: number[]`, `variant: 'single' | 'identical' | 'non-identical'`) in a shared types file in `ketcher-core`

## 2. Shared Detection Helper (ketcher-react)

- [x] 2.1 Create a shared helper `dispatchMonomerOrGroupDialog(editor, fgIds)` in `packages/ketcher-react/src/script/editor/tool/` that: resolves each `fgId` to an S-group, separates monomers from plain groups, computes the `variant`, and dispatches `editMonomer` for monomers and `removeFG` for the rest
- [x] 2.2 Add a utility `getMonomerVariant(struct, fgIds): 'single' | 'identical' | 'non-identical'` that implements the variant logic (single → length 1; identical → all share the same monomer template alias; non-identical → otherwise)

## 3. Tool Dispatch-Site Updates (ketcher-react)

- [x] 3.1 Update `packages/ketcher-react/src/script/editor/tool/sgroup.ts` — `checkSelection()`: replace direct `removeFG.dispatch` with `dispatchMonomerOrGroupDialog` where the full-group selection triggers the dialog
- [x] 3.2 Update `sgroup.ts` — `mousedown()`: replace direct `removeFG.dispatch` calls with `dispatchMonomerOrGroupDialog`
- [x] 3.3 Update `sgroup.ts` — `mouseup()`: replace direct `removeFG.dispatch` call with `dispatchMonomerOrGroupDialog`
- [x] 3.4 Update `sgroup.ts` — `sgroupDialog()`: replace the `if (sg.isMonomer) return Promise.resolve()` silent no-op with a dispatch of `editMonomer` with `fgIds: [id]` and `variant: 'single'`
- [x] 3.5 Update `packages/ketcher-react/src/script/editor/tool/atom.ts`: replace `removeFG.dispatch` calls with `dispatchMonomerOrGroupDialog`
- [x] 3.6 Update `packages/ketcher-react/src/script/editor/tool/bond.ts`: replace `removeFG.dispatch` calls with `dispatchMonomerOrGroupDialog`
- [x] 3.7 Update `packages/ketcher-react/src/script/editor/tool/eraser.ts`: replace `removeFG.dispatch` calls with `dispatchMonomerOrGroupDialog`
- [x] 3.8 Update `packages/ketcher-react/src/script/ui/state/handleHotkeysOverItem.ts`: replace `removeFG.dispatch` call with `dispatchMonomerOrGroupDialog`
- [x] 3.9 Update `packages/ketcher-react/src/script/editor/tool/paste.ts`: replace `removeFG.dispatch` call with `dispatchMonomerOrGroupDialog`
- [x] 3.10 Update `packages/ketcher-react/src/script/editor/tool/rgroupfragment.ts`: replace `removeFG.dispatch` calls with `dispatchMonomerOrGroupDialog`

## 4. Redux Wiring (ketcher-react)

- [x] 4.1 Add `onEditMonomer` handler to `packages/ketcher-react/src/script/ui/state/editor/index.js`: subscribe to `editor.event.editMonomer`, open the new `editMonomer` dialog via `openDialog(dispatch, 'editMonomer', payload)`
- [x] 4.2 Wire `editor.event.editMonomer` → `props.onEditMonomer` in `StructEditor.tsx` (following the same pattern as `onRemoveFG` wiring at lines 93–105)

## 5. Edit Monomer Dialog Component (ketcher-react)

- [x] 5.1 Create `packages/ketcher-react/src/script/ui/views/modal/components/toolbox/EditMonomer/EditMonomer.tsx` — a new React modal component with `data-testid="edit-monomer-window"`, rendering the correct title, body text, and buttons based on the `variant` prop received from the dialog payload
- [x] 5.2 Implement the three variant text strings and button sets in `EditMonomer.tsx`:
  - `single`: body includes "Edit Monomer" + "Remove Grouping" description; buttons: "Edit Monomer", "Remove Grouping", "Cancel"
  - `identical`: body includes "Edit All Monomers" + "Remove Grouping" description; buttons: "Edit All Monomers", "Remove Grouping", "Cancel"
  - `non-identical`: body includes "Remove Grouping" description only; buttons: "Remove Grouping", "Cancel"
- [x] 5.3 Wire "Edit Monomer" button click: call `editor.openMonomerCreationWizard()` with the monomer's selection and initial values (same pattern as `MacromoleculeMenuItems.tsx` `handleEdit()`)
- [x] 5.4 Wire "Edit All Monomers" button click: call `editor.openMonomerCreationWizard()` with the combined selection and `getEditAllInstancesInitialValues` (same pattern as `MacromoleculeMenuItems.tsx` `handleEditAll()`)
- [x] 5.5 Wire "Remove Grouping" button click: call `fromSgroupDeletion` for each `fgId` in the payload, merge into a single `Action`, and dispatch (same logic as `useRemoveGrouping.ts`)
- [x] 5.6 Register `editMonomer: EditMonomer` in `packages/ketcher-react/src/script/ui/dialog/index.ts` alongside the existing `removeFG` registration

## 6. Test IDs & Page Object (ketcher-autotests)

- [x] 6.1 Add test-id attributes to `EditMonomer.tsx`: `data-testid="edit-monomer-window"` on the dialog root, `data-testid="Edit Monomer-button"`, `data-testid="Edit All Monomers-button"`, `data-testid="Remove Grouping-button"`, `data-testid="Cancel"` on each button
- [x] 6.2 Create `ketcher-autotests/tests/pages/molecules/canvas/EditMonomer.ts` — a Playwright page-object class exposing locators for the dialog and its buttons

## 7. E2E Tests (ketcher-autotests)

- [ ] 7.1 Write E2E test: bond tool click on atom inside a single monomer → "Edit Monomer" dialog appears (not "Edit Abbreviation")
- [ ] 7.2 Write E2E test: "Cancel" in "Edit Monomer" dialog → no changes to canvas
- [ ] 7.3 Write E2E test: "Edit Monomer" button → Monomer Creation Wizard opens pre-filled
- [ ] 7.4 Write E2E test: "Remove Grouping" button for single monomer → grouping dissolved, plain structure remains
- [ ] 7.5 Write E2E test: S-group tool with multiple non-identical monomers selected → dialog shows only "Remove Grouping" and "Cancel"
- [ ] 7.6 Write E2E test: S-group tool with multiple identical monomers selected → dialog shows "Edit All Monomers", "Remove Grouping", "Cancel"
- [ ] 7.7 Write E2E test: eraser tool click on atom inside a monomer → "Edit Monomer" dialog appears
- [ ] 7.8 Write E2E test: S-group tool double-click directly on a monomer → "Edit Monomer" dialog appears
- [ ] 7.9 Verify existing "Edit Abbreviation" E2E tests still pass (plain functional groups unaffected)
