# Proposal

## Why

Users can create and edit library monomers in the Monomer Creation Wizard, but they cannot give a nucleotide, CHEM, or phosphate an AxoLabs alias (issue #7929). Without it, a custom monomer cannot be read from or written to AxoLabs sequences, even though the library format and the AxoLabs import and export already support the alias.

## What Changes

- The wizard's attributes panel shows an optional **AxoLabs** alias field for Nucleotide, CHEM, and Phosphate monomers, in the collapsible _Aliases_ section next to the HELM and BILN aliases.
- On _Submit_, the wizard validates the alias: allowed characters, bracket placement, length without brackets, and uniqueness across the whole library, including RNA presets. Each failed check shows its own error message from the issue, and the field stays highlighted until the next _Submit_.
- The alias is saved wrapped in brackets, even when the user typed it without them, except an alias left unchanged from the one loaded for _Edit_, which is saved as stored.
- Changing the monomer type to one without an AxoLabs alias clears the field and hides it.
- _Edit_ of a library monomer loads its stored AxoLabs alias. Flows that load copied attributes with the `_Copy` suffix start with an empty AxoLabs alias, because the suffix is not a valid AxoLabs alias and the copy would collide with the original.
- **Not included:** the 5' / internal / 3' position checkboxes from the issue. The alias stays one value that applies to every position, as the library format and AxoLabs import and export store it today. Positions need a storage format change in Ketcher and Indigo and are left for a follow-up, as the analysis comment on the issue describes. The issue's own attribute section defines `"aliasAxoLabs": "[String]"`, and the AxoLabs format in Indigo (epam/Indigo#3152) states that AxoLabs symbols have no position indicators.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `macromolecules`: adds requirements for setting, validating, saving, and loading the AxoLabs alias in the Monomer Creation Wizard.

## Impact

- **`packages/ketcher-react`**: the Monomer Creation Wizard's attributes panel, its validation on _Submit_, its initial values for edit and duplicate flows, and the save path to the library. The AxoLabs label and the uniqueness error message in the `en`, `es`, and `zh-CN` locales.
- **`packages/ketcher-core`**: AxoLabs alias format checks and bracket normalization next to the existing HELM and BILN alias utilities. The wizard's initial-values type gains the AxoLabs alias.
- No change to the KET format, the monomer library file, the public `Ketcher` API, or Indigo. AxoLabs import and export already read `aliasAxoLabs` from the monomer library Ketcher passes to Indigo.
- Overlaps the files of the open IDT alias PR #10510 (#7863). Whichever merges second resolves the conflicts.
