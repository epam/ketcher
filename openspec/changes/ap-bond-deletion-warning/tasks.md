## 1. Types and Constants

- [x] 1.1 Add a new `WizardNotificationId` for the used-AP warning (e.g., `usedAttachmentPointsWarning`) in `MonomerCreationWizard.types.ts`
- [x] 1.2 Add the corresponding notification message to `NotificationMessages` in `MonomerCreationWizard.constants.ts` — template: `"Deleting attachment point {APs} will result in deleting of bonds that use those attachment points after saving."`

## 2. State: Tracking In-Use APs at Wizard Open

- [x] 2.1 Add `attachmentAtomIdsWithExternalBonds?: Map<AttachmentPointName, [number, number]>` field to `MonomerCreationState` in `raphaelRender.ts`
- [x] 2.2 In `Editor.ts :: openMonomerCreationWizard`, populate `attachmentAtomIdsWithExternalBonds` by collecting APs from both `editInstanceAttachmentPoints` (SGroup APs in use by bonds) and the `terminalRGroupAtoms` external-bond-crossing path; store the resulting AP → [attachAtomId, leavingAtomId] map on `monomerCreationState` when non-empty

## 3. Warning Notification in the Wizard

- [x] 3.1 In `MonomerCreationWizard.tsx`, on wizard mount (effect with empty deps), check if `monomerCreationState.attachmentAtomIdsWithExternalBonds` is non-empty; dispatch a `SetNotifications` action with id `usedAttachmentPointsWarning` and the formatted AP list message
- [x] 3.2 Ensure the notification uses `type: 'info'` so the existing OK-dismiss button is rendered by the `Notification` component

## 4. Bond Reconciliation Utilities

- [x] 4.1 Create a utility function `computeApDiff(oldApToAtomMap, newApToAtomMap): { deleted: AttachmentPointName[], moved: Map<AttachmentPointName, newAtomId> }` in `MonomerCreationWizard.utils.ts` (or a new `bondReconciliation.ts` utility file)
- [x] 4.2 Write unit tests for `computeApDiff` covering: AP removed, AP moved, AP unchanged, all APs removed, all APs moved, no in-use APs

## 5. Bond Reconciliation on Save (Single Instance)

- [x] 5.1 In `Editor.ts :: finishNewMonomersCreation`, capture `attachmentAtomIdsWithExternalBonds` and `editingMonomer` from `monomerCreationState` before closing the wizard; build `finalAssignedAttachmentPoints: Map<AttachmentPointName, number>` from the final `assignedAttachmentPoints` state
- [x] 5.2 For each AP in `deleted` (computed by `computeApDiff`): retrieve the bond from `editingMonomer.attachmentPointsToBonds` and call `drawingEntitiesManager.deletePolymerBond` or `deleteMonomerToAtomBond`; apply via `EditorHistory` + `renderersContainer.update`
- [x] 5.3 Moved APs (same AP name, different atom) are handled at the Struct level by the existing `updateBondEndpointByAttachmentPoint` call; no additional macro-canvas bond operation is needed

## 6. Bond Reconciliation on Save (Edit-All Instances)

- [x] 6.1 In `Editor.ts :: replaceMatchingMonomerStructures`, accept an optional `finalAssignedAttachmentPoints` parameter; for each matching monomer instance, before `deleteMonomerStructure`, call `reconcileEditAllInstanceMacroBonds` to delete bonds for removed APs
- [x] 6.2 `reconcileEditAllInstanceMacroBonds` iterates `instanceMonomer.attachmentPointsToBonds`, skips APs still present in `finalAssignedAttachmentPoints`, and deletes bonds via `drawingEntitiesManager` + `EditorHistory` for each removed AP; the call site passes `finalAssignedAttachmentPoints` from `finishNewMonomersCreation`

## 7. Integration Tests (Playwright / E2E)

- [ ] 7.1 Test: open wizard for a monomer with one in-use bond → warning notification is displayed with correct AP name
- [ ] 7.2 Test: open wizard for a monomer with two in-use bonds → warning lists both AP names
- [ ] 7.3 Test: open wizard for a monomer with no in-use bonds → no warning notification
- [ ] 7.4 Test: dismiss warning by clicking OK → notification disappears
- [ ] 7.5 Test: delete an AP that had a bond → save → bond is gone from canvas
- [ ] 7.6 Test: move an AP to a different atom → save → bond remains, endpoint atom updated
- [ ] 7.7 Test: swap two in-use APs → save → both bonds remain with updated endpoints
- [ ] 7.8 Test: edit-all with AP deletion → save → all instances lose the bond
- [ ] 7.9 Test: edit-all with AP move → save → all instances have bonds reconnected
