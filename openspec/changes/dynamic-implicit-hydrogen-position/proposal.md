# Proposal

## Why

Implicit hydrogens are always drawn to the left or right of the atom symbol. On an atom with two or more bonds the hydrogen text lands in the path of a bond, so bonds are cut short against the whole label box, and Ketcher's canvas no longer matches the PNG/SVG that Indigo renders (epam/Indigo#4031). See epam/ketcher#12530.

## What Changes

- Ketcher picks the side of an atom for its implicit hydrogens from the directions of its bonds, so the hydrogens sit where no bond is drawn.
- A **terminal atom** (one bond, or none) shows its hydrogens on the side opposite its bond, and on the right when there is no bond.
- An **internal atom** (two or more bonds) shows its hydrogens in the quadrant (right, left, top, bottom) that holds no bond and no radical, chosen by priority right, left, top, bottom.
- The atom label's bounding box includes the hydrogens, so bonds, S-group brackets, hover, and selection are sized from it.
- The same placement applies in macromolecules mode.
- **BREAKING** (visual): an isolated atom of an element such as O, S, F, or Cl no longer draws its hydrogens on the left (`HO`); it draws them on the right (`OH`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `atom-editing`: adds requirements for where implicit hydrogens are drawn (terminal atoms, internal atoms, label bounds, macromolecules mode).

## Impact

- `packages/ketcher-core`: micromolecules atom rendering, macromolecules atom renderer, and a new shared placement helper under `domain/helpers`.
- Existing Playwright and Jest snapshots that show implicit hydrogens on internal atoms or isolated atoms change.
- Indigo's own rendering is a separate change (epam/Indigo#4031) and is not part of this PR.
