## Context

The Monomer Creation Wizard lets users draw and save custom monomers. When editing an existing monomer (via "Edit Monomer" or "Edit All Monomers" from the context menu), the wizard clones the monomer's structure onto its canvas and pre-populates attachment points (APs) from the monomer's `SGroupAttachmentPoint` data.

A `BaseMonomer` on the macromolecules canvas owns an `attachmentPointsToBonds` map (`Record<AttachmentPointName, PolymerBond | MonomerToAtomBond | null>`). When a bond uses AP "R1", the map entry for "R1" holds a reference to that bond.

Currently, the wizard has no awareness of which of those APs are actively in use by bonds. If a user removes or relocates an AP inside the wizard and saves, the save flow regenerates the monomer template but does not reconcile the dangling bond references, leaving the canvas in an inconsistent state.

**Flow entry points:**

- `Editor.ts :: openMonomerCreationWizard(selection, initialValues, attachmentPoints)` — clones structure, loads `SGroupAttachmentPoint`s into `monomerCreationState.assignedAttachmentPoints`.
- `Editor.ts :: finishNewMonomersCreation(monomersData, options)` — calls `fromSgroupAddition`, places the new sgroup, handles `externalBond` reconnection (currently only wires up bonds coming from partial-selection flow, not from monomer-edit flow).

**Key files:**

- `packages/ketcher-react/src/script/ui/views/components/MonomerCreationWizard/MonomerCreationWizard.tsx` — wizard React component (2144 lines).
- `packages/ketcher-react/src/script/ui/views/components/MonomerCreationWizard/MonomerCreationWizard.constants.ts` — `NotificationMessages` map.
- `packages/ketcher-react/src/script/ui/views/components/MonomerCreationWizard/MonomerCreationWizard.types.ts` — `WizardNotificationId`, `WizardNotification`, `WizardState`.
- `packages/ketcher-react/src/script/ui/views/components/MonomerCreationWizard/MonomerCreationWizard.utils.ts` — `getEditInstanceInitialValues`, `getEditAllInstancesInitialValues`.
- `packages/ketcher-react/src/script/editor/Editor.ts` — `openMonomerCreationWizard`, `finishNewMonomersCreation`.
- `packages/ketcher-core/src/domain/entities/BaseMonomer.ts` — `attachmentPointsToBonds`, `isAttachmentPointUsed(name)`.
- `packages/ketcher-core/src/application/editor/operations/polymerBond/index.ts` — `PolymerBondDeleteOperation`, `PolymerBondAddOperation`.
- `packages/ketcher-core/src/application/editor/operations/monomerToAtomBond/monomerToAtomBond.ts` — `MonomerToAtomBondDeleteOperation`.

## Goals / Non-Goals

**Goals:**

- Show a dismissible warning notification immediately when the wizard opens and the monomer has APs currently in use by canvas bonds.
- On save, delete bonds whose AP was removed from the new monomer template.
- On save, reconnect bonds whose AP was moved to a different atom (update the bond's endpoint atom).
- Cover both `PolymerBond` (monomer-to-monomer) and `MonomerToAtomBond` (monomer-to-small-molecule-atom).

**Non-Goals:**

- Changing behavior for monomers whose APs are _not_ in use (no bonds).
- Modifying the "partial structure selection" entry path for the wizard (issue #6552) — that path is handled separately.
- Visual highlighting of in-use APs on the wizard canvas (future enhancement).
- Blocking or disabling AP deletion (user remains free to delete; they are warned, not prevented).

## Decisions

### Decision 1: Where to compute in-use APs

**Options:**

- A) In the React wizard component at mount time via a selector over `monomerCreationState`.
- B) In `openMonomerCreationWizard` in `Editor.ts`, enriching `monomerCreationState` with a field tracking APs that have external bonds.

**Choice: B.** `Editor.ts` already owns the `BaseMonomer` reference at open time and populates `monomerCreationState`. Computing in-use APs there and storing the result in state keeps the React component stateless with respect to this concern. The component only needs to read the new field to trigger the notification.

**Implementation note:** The field is named `attachmentAtomIdsWithExternalBonds: Map<AttachmentPointName, [attachAtomId, leavingAtomId]>` (a tuple storing both atom IDs per AP, matching the shape already used by `assignedAttachmentPoints`). It is populated in two places inside `openMonomerCreationWizard`:

1. From `editInstanceAttachmentPoints` — for each SGroupAttachmentPoint whose AP label maps to an in-use bond on the existing monomer.
2. From the `terminalRGroupAtoms` path — for APs that cross the partial-selection boundary (external bonds not yet on the macro-canvas but represented as R-group atoms in the selected struct).

### Decision 2: Warning notification type

**Options:**

- A) `'warning'` (yellow banner, non-dismissible).
- B) `'info'` (blue banner, dismissible via OK button).

**Choice: B — `'info'` type with an OK dismiss button.** The issue spec says "The warning message can be dismissed by clicking on `OK`." The existing `Notification` component already renders an OK button for `info`-type notifications. The severity is informational (no action is blocked); the user is free to proceed.

### Decision 3: Bond reconciliation location

**Options:**

- A) Inside `finishNewMonomersCreation` in `Editor.ts`, after `fromSgroupAddition` has placed the new sgroup, by comparing old AP→bond map to new AP→atom map.
- B) Inside `saveNewMonomer` before serialization.

**Choice: A.** Bond objects (`PolymerBond`, `MonomerToAtomBond`) live on the macro-canvas editor's `DrawingEntitiesManager`, not inside the small-molecule `Struct` being serialized. The reconciliation is a canvas-level mutation that belongs after the new sgroup is placed and the monomer entity is ready.

### Decision 4: Matching old vs. new AP assignments

To determine whether an AP was "deleted" or "moved":

1. At wizard-open time, record `attachmentAtomIdsWithExternalBonds: Map<AttachmentPointName, [attachAtomId, leavingAtomId]>` — the AP label → [attachment atom ID, leaving atom ID] in the _original_ structure (before editing). Populated from both `editInstanceAttachmentPoints` and the partial-selection external bond path.
2. At save time (`finishNewMonomersCreation`), the new monomer template carries the new AP → atom mapping in `finalAssignedAttachmentPoints: Map<AttachmentPointName, number>`. `computeApDiff` compares the old map's key set against the new map's key set:
   - AP present in old map but absent in new → bond deleted.
   - AP present in both, atom ID changed → bond endpoint updated (handled at the Struct level by `updateBondEndpointByAttachmentPoint`; no macro-canvas change needed for `PolymerBond`).
   - AP present in both, atom ID unchanged → bond untouched.

**Note:** `computeApDiff` accepts `Map<AttachmentPointName, number>` for the old map. At the call site in `reconcileMacroCanvasBondsForDeletedAps`, the actual value passed is `Map<AttachmentPointName, [number, number]>`. This is type-safe for the `deleted` path (only `.has()` key lookups are used) but the type signature should be widened to `Map<AttachmentPointName, unknown>` or the call site should extract just the attach atom IDs before passing.

### Decision 5: `editMode: 'all'` behavior

For "Edit All Monomers", the existing flow replaces _all_ instances of the monomer. Bond reconciliation should apply to _every_ instance: for each monomer on canvas that matches the original symbol, apply the same AP diff. The loop in `replaceMatchingMonomerStructures` must be extended to invoke the bond reconciliation step per instance.

## Risks / Trade-offs

- **Atom ID mapping fragility**: The `originalToSelectedAtomsIdMap` is built during `openMonomerCreationWizard`. If the user's edit adds or removes atoms, the mapping for unchanged atoms remains valid; only the changed atoms are affected. The AP → atom reconciliation only touches APs known to have bonds, reducing the risk of mismatches.
  → _Mitigation_: Reconciliation is applied only when the new AP name exactly matches an old in-use AP name; no heuristic matching is used.

- **`editMode: 'all'` across many instances**: If 50 monomers share the same template and the user removes an AP, up to 50 bonds are deleted in one save. This is correct per spec but could be surprising.
  → _Mitigation_: The existing "Edit All" confirmation dialog already warns the user about the number of instances being modified. No additional guard needed.

- **MonomerToAtomBond**: This bond type connects a monomer AP to a small-molecule atom. Its delete/reconnect operations exist (`MonomerToAtomBondDeleteOperation`, `MonomerToAtomBondAddOperation`) but are less exercised. Bond reconciliation must cover this type alongside `PolymerBond`.
  → _Mitigation_: Both bond types store the AP name and can be deleted or reconnected using their respective operation classes.

## Migration Plan

No data migration needed. All changes are behavioral and confined to the wizard flow. The feature is additive (new notification, new save-time reconciliation). Existing saved monomers are unaffected until they are next edited through the wizard.

No rollback concern: disabling the notification or reconciliation is a single-line change to the `attachmentAtomIdsWithExternalBonds` computation.

## Open Questions

- For RNA Preset type (multi-tab wizard), should the warning also fire when a _connection_ AP between RNA preset components (sugar-base, sugar-phosphate) is in use? Likely yes, but should be confirmed before implementation.
- `computeApDiff` first parameter type (`Map<AttachmentPointName, number>`) does not match the actual call site argument type (`Map<AttachmentPointName, [number, number]>`). This is a type-safety gap to address — either widen `computeApDiff`'s first parameter to `Map<AttachmentPointName, unknown>` or extract scalar atom IDs before the call.
