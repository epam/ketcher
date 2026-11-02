# Tasks

## 1. Shared placement rule

- [x] 1.1 Add `getImplicitHydrogenSide` under `packages/ketcher-core/src/domain/helpers/` and export it from the helpers index; verify with `npm run test:unit` in `packages/ketcher-core` using a table test that covers every scenario of the "terminal atom" and "internal atom" requirements, including the 45°, 135°, 225°, and 315° boundaries and the vertical bond.

## 2. Molecules mode rendering

- [x] 2.1 In `reatom.ts`, replace `hydrogenOnTheLeft` and `shouldHydrogenBeOnLeft` with `hydrogenSide` computed through the helper from the visible bond angles and the radical, and update the two other readers; verify with a unit test that an atom with one right-going bond reports `left`, and with `npm run test:types`.
- [x] 2.2 Draw the hydrogens and their count above or below the symbol for `top` and `bottom` in `showHydrogen`, adding each part to the atom's `visel`; verify with a unit test that the `visel` boxes of an atom with `top` hydrogens extend above the symbol box, and that `getSelectionContour` covers them.
- [x] 2.3 Verify that bonds are trimmed only by the box they reach and that S-group brackets include the hydrogens, with a unit test on `getShiftedSegmentPosition` for an internal atom whose hydrogens are on top and on the right.

## 3. Macromolecules mode rendering

- [ ] 3.1 In `AtomRenderer.ts`, replace `shouldHydrogenBeOnLeft` with the helper's result, feeding it the angles of `viewModel.atomsToHalfEdges`, and lay out `top` and `bottom` hydrogens in `appendLabel`; verify with a unit test for the renderer's label for terminal and internal atoms.
- [ ] 3.2 Verify that the hover and selection contours of a macromolecules-mode atom include top and bottom hydrogens, with a unit test on `labelBoundingBox`.

## 4. Snapshots and in-app proof

- [ ] 4.1 Update the Jest snapshots that changed and list each changed file in the PR; verify with `npm test` from the repository root, compared against the baseline.
- [ ] 4.2 Run `verify-ketcher`: draw hexane, S(CH3)6, pyrrole, an isolated O, and an atom with a radical, and verify the hydrogens' sides, the bond lengths, and the hover and selection highlight, and that macromolecules mode shows the same sides.
