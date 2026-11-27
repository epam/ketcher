# Proposal

## Why

Atom-to-atom mapping numbers are visible in molecules mode but missing from macromolecules mode, making mapped structures harder to read when users switch views. Showing the numbers in macromolecules mode with the same placement as molecules mode provides a consistent visual representation.

## What Changes

- Render existing atom mapping numbers beside atoms in macromolecules mode using the same relative placement as molecules mode.
- Keep this change visual only; atom mapping editing, hover, and selection behavior remain unchanged.

## Capabilities

### New Capabilities

### Modified Capabilities

- `macromolecules`: specify visibility and placement of atom mapping labels in macromolecules mode.

## Impact

- The macromolecule atom renderer and its tests in `packages/ketcher-core`.
- No model, serializer, public API, or atom interaction changes are intended.
