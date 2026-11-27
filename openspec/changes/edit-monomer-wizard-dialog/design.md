## Context

In molecules mode, Ketcher renders monomers as `MonomerMicromolecule` S-groups (a subclass of `SGroup` with `isMonomer = true`). These monomers appear as contracted abbreviations — visually identical to functional groups. When a user applies editing tools (bond, eraser, charge, atom, S-group tool, paste, hotkeys) to a monomer's atoms or directly to the monomer group, the editor dispatches a `removeFG` event, which opens the **"Edit Abbreviation"** dialog. That dialog is designed for plain functional-group abbreviations: its text and its sole destructive action ("Remove Abbreviation") are generic and do not mention monomers or the Monomer Creation Wizard.

In addition, when the S-group tool is clicked directly on a `MonomerMicromolecule` sgroup, `SGroupTool.sgroupDialog()` detects `sg.isMonomer` and silently returns — providing no feedback at all.

The required behavior (GitHub issue #8921, section 1.2) is that these interactions should open a dedicated **"Edit Monomer"** dialog with context-aware text and buttons tied to the actual monomer-editing workflows.

## Goals / Non-Goals

**Goals:**

- Introduce a new "Edit Monomer" modal component (`EditMonomer`) with a dedicated `editMonomer` pipeline event.
- Detect monomer vs. non-monomer S-groups at every `removeFG` dispatch site and route monomers to the new dialog instead.
- Handle `SGroupTool.sgroupDialog()` no-op case by dispatching the new event when the clicked sgroup `isMonomer`.
- Support three contextual variants of the dialog:
  1. Single monomer → "Edit Monomer" + "Remove Grouping" + "Cancel"
  2. Multiple identical monomers → "Edit All Monomers" + "Remove Grouping" + "Cancel"
  3. Multiple non-identical monomers → "Remove Grouping" + "Cancel"
- Wire "Edit Monomer" / "Edit All Monomers" buttons to `editor.openMonomerCreationWizard()` (existing API).
- Wire "Remove Grouping" button to the existing `fromSgroupDeletion` action for each affected monomer.

**Non-Goals:**

- No changes to the Monomer Creation Wizard itself.
- No changes to plain functional-group / abbreviation flows (the `removeFG` → "Edit Abbreviation" path remains unchanged for non-monomer groups).
- No macromolecules-mode changes.
- No changes to the right-click context menu ("Edit Monomer", "Edit All", "Remove Grouping" already work there).

## Decisions

### Decision 1: New pipeline event (`editMonomer`) rather than extending `removeFG`

**Chosen:** Add a new `editMonomer` pipeline event to `Editor` alongside the existing `removeFG` event.

**Rationale:** `removeFG` carries a list of functional-group ids and is wired to the "Edit Abbreviation" dialog throughout the codebase. Multiplexing it for monomers would require the dialog component (or the Redux handler) to inspect the ids, leading to state-dependent rendering inside a component that is supposed to be stateless. A separate event keeps the two dialog concerns fully decoupled and avoids modifying the `removeFG` handler contract.

**Alternative considered:** A single `removeFG`-like event carrying a discriminator flag (`isMonomer: boolean`). Rejected because it entangles the two flows and complicates future independent changes to either dialog.

### Decision 2: Detection of monomer vs. plain S-group at dispatch sites

**Chosen:** Each tool (`sgroup.ts`, `atom.ts`, `bond.ts`, `eraser.ts`, `handleHotkeysOverItem.ts`, `paste.ts`, `rgroupfragment.ts`) already resolves the `fgIds` before dispatching `removeFG`. At each site, after resolving `fgIds`, check whether **all** resolved S-groups are `MonomerMicromolecule` instances. If yes, dispatch `editMonomer`; otherwise dispatch `removeFG` as before. If the set is mixed (some monomers, some regular groups), dispatch `editMonomer` for the monomer subset and `removeFG` for the rest.

**Rationale:** Tools already have a reference to `editor.render.ctab.molecule` (the `Struct`), so `struct.sgroups.get(id) instanceof MonomerMicromolecule` is a cheap, zero-latency check. No new services or async work needed.

**Alternative considered:** Moving detection into the Redux `onRemoveFG` handler (single place). Rejected because the handler only sees `fgIds` and would need to re-resolve S-groups from the molecule — introducing molecule-access coupling into Redux state handlers that are currently pure dispatch mappers.

### Decision 3: Dialog context classification (single / identical / non-identical)

**Chosen:** The `editMonomer` event payload carries:

```ts
interface EditMonomerPayload {
  fgIds: number[]; // ids of the monomer S-groups to act on
  variant: 'single' | 'identical' | 'non-identical';
}
```

`variant` is computed at dispatch time: if `fgIds.length === 1` → `'single'`; if all monomers share the same `monomer.monomerItem.alias` (or template name) → `'identical'`; otherwise → `'non-identical'`.

**Rationale:** The dialog component becomes a pure presentational component — it receives `variant` and renders the correct text/buttons without needing to re-inspect the molecule.

### Decision 4: "Edit Monomer" / "Edit All" button wires to `editor.openMonomerCreationWizard()`

**Chosen:** The Redux `onEditMonomer` handler, when the user clicks "Edit Monomer" or "Edit All Monomers", calls `editor.openMonomerCreationWizard()` with the same arguments that the right-click context menu handler (`MacromoleculeMenuItems.tsx`) already uses: the selection of atoms/bonds for the monomer(s) plus `getEditInstanceInitialValues` / `getEditAllInstancesInitialValues`.

**Rationale:** Re-uses existing, tested wizard-opening logic. No new API surface in `Editor`.

### Decision 5: `SGroupTool.sgroupDialog` — dispatch `editMonomer` instead of silent return

**Chosen:** Replace the `if (sg.isMonomer) return Promise.resolve()` early-return with a dispatch of `editMonomer` carrying `fgIds: [id]` and `variant: 'single'`.

**Rationale:** The sgroup tool is the primary tool the issue targets. The silent no-op was the main source of user confusion.

## Risks / Trade-offs

- **Risk: Mixed monomer + regular-group selections** → The split-dispatch approach (editMonomer for monomers, removeFG for rest) fires two dialogs sequentially, which may feel disjointed. Mitigation: for mixed selections, treat all items as monomers and show the Edit Monomer dialog (the most conservative option; regular-group atoms are included in the "Remove Grouping" action). This edge case is rare in practice.
- **Risk: Dispatch sites are numerous** (8+ files) → Mitigation: Extract a shared helper `dispatchMonomerOrGroupDialog(editor, fgIds)` in `ketcher-react` that centralises the check and routing; each call site replaces its direct `removeFG.dispatch` with the helper call.
- **Risk: "Edit All" opens the wizard with a large selection** → No mitigation needed — this is the same code path as the existing right-click "Edit All" menu item, which already handles this.

## Migration Plan

- No schema or data migration.
- Existing `removeFG` / "Edit Abbreviation" path is unchanged for non-monomer groups.
- The new `editMonomer` event is additive; no existing event subscribers are removed.
- Rollout is a single PR; no phased deployment needed.

## Open Questions

- None at this time. All behavior is fully specified by issue #8921 section 1.2.
