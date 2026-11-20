## Why

The monomer creation wizard does not identify the 5' and 3' attachment points on RNA presets, and users can submit presets with non-typical sugar or phosphate leaving groups without confirmation. This change completes sections 2.4.1–2.4.4 of issue #8853.

## What Changes

- Show a 5' tooltip on the sugar R1 attachment point and a 3' tooltip on the phosphate R2 attachment point in RNA preset mode.
- Before saving an RNA preset, warn when the sugar R1 leaving group is not H or the phosphate R2 leaving group is not O (hydroxyl).
- Show one combined warning when both leaving groups differ, and let the user cancel or confirm saving the current attachment points.

## Capabilities

### Modified Capabilities

- `macromolecules`: RNA preset attachment-point tooltips and non-typical leaving-group confirmation in the monomer creation wizard.

## Impact

- `ketcher-core`: resolve attachment-point tooltip text for RNA preset components.
- `ketcher-react`: display the component-specific tooltips and validate RNA preset leaving groups before saving.
- No new dependencies or format changes.
