## Why

Some users store their monomers as S-groups, most often data S-groups, or draw them with functional-group and salt/solvent abbreviations. The monomer creation wizard rejects any selection that touches an S-group, so these structures cannot become monomers without first removing every grouping by hand (#7637).

## What Changes

- _Create monomer_ is enabled when the selection contains S-groups, as long as each one is selected whole. A partly selected S-group, or a monomer, still disables it.
- Only the chemistry of the selected S-groups is loaded into the wizard: the S-groups are dropped, so abbreviations open expanded.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `macromolecules`: monomer creation accepts selections that contain whole S-groups.

## Impact

- **`packages/ketcher-react`**: the eligibility check and the wizard opening in the molecules editor.
- No change to file formats, the public API, or the saved monomer.
