# Proposal

## Why

Users cannot mark a set of structures as a mixture. Ketcher already knows the Molfile S-group types `MIX` (unordered mixture) and `FOR` (ordered mixture, "formulation"), but it treats them as unsupported: on import it asks to drop them, it draws no brackets, and the S-Group dialog cannot create or edit them. Issue #12775 asks for a Mixture option in the dialog; Indigo issue epam/Indigo#3773 adds the matching conversions.

## What Changes

- The S-Group Properties dialog gets a `Mixture` type, placed directly after `Superatom`.
- When `Mixture` is selected the dialog shows a mandatory `Subtype` dropdown with `Ordered` and `Unordered` and no preselected value. Apply stays disabled until one is chosen.
- A mixture S-group is drawn with brackets. The abbreviation `f` (ordered) or `mix` (unordered) is drawn outside the closing bracket at its lower right.
- An existing mixture S-group opens in the dialog with its subtype selected and can be changed to the other subtype or to another type.
- `MIX` and `FOR` S-groups from MOL and KET files are loaded without the "Unsupported S-group type" question and are saved again with the same type and atoms.
- Depends on the separate fix for loading nested S-groups: without it, a KET file that lists an inner S-group before the outer one that contains it loads with duplicated atoms. That bug affects every S-group type and is not part of this change.
- Not in this change: the `Component` type (#10459) and the abbreviated selector labels `Ordered (f)` / `Unordered (mix)`, which depend on #10457 (PR #12781, not merged).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `templates-and-groups`: adds requirements for creating, editing, drawing and round-tripping mixture S-groups.

## Impact

- `ketcher-core`: S-group bracket rendering, KET schema, Molfile V2000 writer and post-load for `MIX` and `FOR`.
- `ketcher-react`: S-group dialog schema, the form converter (mapping between the dialog's `Mixture` type and the two S-group types), the list of supported S-group types, `en`, `es` and `zh-CN` strings.
- File formats: KET gains the S-group types `MIX` and `FOR`. Indigo does not support them until epam/Indigo#3773 is done, so Indigo-backed operations on a structure with a mixture may fail or drop the group.
- Macromolecules mode is not changed.
