# Proposal

## Why

FASTA cannot represent phosphates at the ends of nucleotide chains, so exporting such a structure silently loses those phosphates. Warn users before conversion so they can account for the lossy export.

## What Changes

- When FASTA is selected for export in macromolecules mode and a nucleotide chain has a terminal phosphate, show a warning that the phosphate will be lost.
- Continue the export after displaying the warning.
- Do not show the warning for other export formats or when no terminal phosphate is present.

## Capabilities

### New Capabilities

### Modified Capabilities

- `macromolecules`: Specify the warning behavior for FASTA export when nucleotide chains contain terminal phosphates.

## Impact

- `packages/ketcher-core`: Detect terminal phosphate monomers in nucleotide chains.
- `packages/ketcher-macromolecules`: Display the localized warning during FASTA export.
- No public API or dependency changes.

GitHub issue: epam/ketcher#4290.
