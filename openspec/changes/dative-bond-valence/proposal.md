# Proposal

## Why

Dative bonds affect an atom's available valence, but Ketcher treated them as having no effect on valence or implicit hydrogens. This change makes the editor's atom annotations and hydrogen counts reflect dative-bond direction and capacity.

## What Changes

- Calculate dative donor and acceptor capacity from an atom's element, charge, covalent bonds, and radicals.
- Cancel opposing donor and acceptor dative bonds on the same atom before checking capacity and calculating implicit hydrogens.
- Underline atoms whose remaining dative bonds exceed their donor or acceptor capacity, and recalculate affected atoms when a dative bond is added, removed, flipped, or changes type.
- Calculate aromatic-atom valence from a Kekulé form when the aromatic system can be supported; otherwise retain the legacy hydrogen calculation and apply a conservative capacity check.
- Preserve existing behavior for atoms that do not participate in dative bonding.

## Capabilities

### New Capabilities

- `dative-bond-valence`: Dative-bond direction and atom properties determine valence errors and implicit hydrogen counts.

### Modified Capabilities

None.

## Impact

- `ketcher-core` atom valence, implicit-hydrogen recalculation, aromatic handling, and bond-edit operations.
- Canvas valence annotations and core unit tests for dative bonds.
- No new dependencies, public APIs, or file-format changes.
