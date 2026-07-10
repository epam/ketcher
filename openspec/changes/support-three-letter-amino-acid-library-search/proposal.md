## Why

Scientists often use three-letter amino acid codes because they are more descriptive than single-letter codes. The monomer library search should recognize these standard natural amino acid codes so users can quickly find the expected natural monomers using familiar notation.

## What Changes

- Add library search support for standard three-letter natural amino acid codes.
- Searching by a supported three-letter code returns the matching natural amino acid monomer, including ambiguous natural amino acid codes from the provided table.
- Preserve existing search behavior for single-letter codes, names, aliases, and other monomer library queries.
- No breaking changes.

## Capabilities

### New Capabilities
- `amino-acid-library-search`: Defines monomer library search behavior for standard natural amino acid three-letter codes.

### Modified Capabilities

## Impact

- Affects monomer library search/filtering logic used by the macromolecule editor UI.
- May affect related search tests and monomer library fixtures for natural amino acids.
- No new runtime dependencies are expected.

