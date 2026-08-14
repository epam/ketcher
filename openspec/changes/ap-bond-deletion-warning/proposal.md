## Why

When a monomer that participates in canvas bonds is loaded into the Monomer Creation Wizard for editing, users can silently delete or reposition attachment points (APs) that are currently in use by those bonds. This causes unexpected bond deletion or reconnection on the canvas after saving, with no prior warning. The fix ensures users are informed about the consequences of their edits before they commit them.

## What Changes

- When the wizard loads a monomer (or partial structure) whose attachment points are already in use by bonds on canvas, a **dismissible info notification** is shown immediately upon entering the wizard: _"Deleting attachment point [R1, R2, ...] will result in deleting of bonds that use those attachment points after saving."_
- If the user **deletes** an AP that was in use by a bond, that bond is removed from the canvas on save.
- If the user **moves** an AP (reassigns it to a different atom) that was in use by a bond, the bond remains but its endpoint atom is updated to the new AP atom on save.
- APs that are in use are identified at wizard-open time by inspecting the monomer's `attachmentPointsToBonds` map on `BaseMonomer`.

## Capabilities

### New Capabilities

- `ap-bond-deletion-warning`: Display a warning notification in the Monomer Creation Wizard when the loaded monomer's attachment points are in use by canvas bonds, and correctly handle bond deletion or reconnection on save based on whether the AP was deleted or moved.

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- **`MonomerCreationWizard.tsx`** — wizard initialization logic must detect used APs and dispatch the warning notification; save/submit logic must reconcile old vs. new AP assignments and delete or reconnect bonds accordingly.
- **`MonomerCreationWizard.constants.ts`** — new notification message ID and message text for the used-AP warning.
- **`MonomerCreationWizard.types.ts`** — new notification ID type entry.
- **`MonomerCreationWizard.utils.ts`** — helper to compute the set of in-use AP names from a `BaseMonomer`.
- **`Editor.ts`** (`openMonomerCreationWizard`, `finishNewMonomersCreation`) — pass used-AP context through wizard open/save flow; on save, diff old AP→atom assignments vs. new ones to drive bond mutations.
- **`DrawingEntitiesManager`** / polymer bond operations — may need `deletePolymerBond` or `addBond`/reconnect calls to reconcile bond endpoints after AP changes.
- No API surface changes; no breaking changes.
