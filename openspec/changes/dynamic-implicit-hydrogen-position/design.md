# Design

## Context

Two renderers draw atom labels and each decides the hydrogen side on its own:

- Molecules mode: `ReAtom.show` in `reatom.ts` calls `shouldHydrogenBeOnLeft`, which returns a boolean (`hydrogenOnTheLeft`) from the sign of the single neighbor's `dir.x`. `showHydrogen` then lays out the `H` and its index to the left or right of the symbol. Every part of the label (symbol, `H`, index, isotope, charge, valence) is added to the atom's `visel` as a box, and `getShiftedSegmentPosition` trims a bond against each of those boxes (`visel.exts`), so a bond is shortened by whichever box it runs into.
- Macromolecules mode: `AtomRenderer` has its own `shouldHydrogenBeOnLeft` (same sign rule, same `leftH` rule for bondless atoms) and builds the label as one SVG `<text>` with `tspan`s.

The side is a boolean in both. The new rule needs four sides.

Angles in this design are measured as the user sees them: 0° points right and 90° points up. The model's y axis points down, so the implementation must flip the sign of `dir.y` once, in one place.

## Goals / Non-Goals

**Goals:**

- One placement rule used by both renderers, so they cannot drift apart.
- Hydrogens drawn in the right, left, top, or bottom position around the symbol.
- Hover, selection, bond trimming, and S-group brackets see the hydrogens as part of the label.

**Non-Goals:**

- Indigo's PNG/SVG rendering (epam/Indigo#4031). This PR makes Ketcher follow the rule Indigo is to follow.
- The rule for when hydrogens are shown at all (`ShowHydrogenLabels` setting, terminal/hetero checks). That stays as it is.
- Moving the charge, isotope, valence, or stereo labels.

## Decisions

### 1. A pure placement function in `ketcher-core`, outside both renderers

`getImplicitHydrogenSide(bondAnglesDeg: number[], hasRadical: boolean): 'right' | 'left' | 'top' | 'bottom'` lives in `packages/ketcher-core/src/domain/helpers/` and takes angles, not atoms or half-bonds. Each renderer collects its own visible bond angles (molecules: `getVisibleNeighborHalfBondIds`; macromolecules: `viewModel.atomsToHalfEdges`) and calls it.

Why: the rule is geometry only, so it is testable with plain numbers, and both renderers get identical results. Alternative: copy the rule into each renderer, as today's boolean is copied. Rejected: that is the drift the issue complains about (Ketcher differs from Indigo).

Usage:

```ts
const side = getImplicitHydrogenSide(visibleBondAngles, atom.radical !== 0);
```

The function's rules:

- At most one angle: terminal. Right when there is no bond or the bond is within a small tolerance (0.5°) of vertical; left when the bond's x component points right (cos > 0); right otherwise.
- Two or more angles: internal. Mark each quadrant that holds an angle (`[start, end)` intervals, with `start` inclusive) and the top quadrant when `hasRadical`. Return the first free in the order right, left, top, bottom; when none is free, return right.

### 2. `hydrogenOnTheLeft: boolean` becomes `hydrogenSide`

`ReAtom.hydrogenOnTheLeft` has two other readers in `reatom.ts` (the atom-id position and the label background shift); both read `hydrogenSide === 'left'`. The `leftH` element property in `elements.ts` stops being read for placement (it is still on the element data; removing it is out of scope).

### 3. Top and bottom hydrogens are stacked, left and right stay as they are

Left and right keep today's layout in `showHydrogen`. For top and bottom, `H` is centered on the symbol and offset vertically by the label height; the hydrogen count is a subscript to the right of `H`. Each part is still added to the `visel` with the same call as now, so `exts`, hover, selection (`getLabelVBoxObj` takes the first `labelBoxCount` boxes), and S-group brackets (`getVBoxObj`) include them with no further change.

Alternative: merge all label parts into one box before trimming bonds. Rejected: it would shorten bonds against the empty corners of the merged box, which is the symptom in the issue.

### 4. The radical is a placement input, not a moved element

Radicals are already drawn above the symbol (`showRadical`). The helper only needs to know that the top quadrant is taken.

### 5. Macromolecules mode reuses the helper and keeps its `tspan` layout

`appendLabel` in `AtomRenderer.ts` adds `top` and `bottom` by emitting `H` in a second `tspan` line (`dy`) centered over the symbol. The shared helper decides the side; the SVG text mechanics stay in the renderer.

## Risks / Trade-offs

- [Many snapshots change] → regenerate the Jest snapshots and the Playwright screenshots that show implicit hydrogens on internal atoms; the PR lists them. `SNAPSHOTS.md` in the flow covers the update.
- [Bond angles on float boundaries: a bond at 45° may fall in either quadrant after rounding] → round angles to 0.01° before comparing, and test the boundary values.
- [An isolated `O` changes from `HO` to `OH`, and users with saved screenshots see it] → this follows requirement 1.1 of the issue; called out in the proposal.
- [Top/bottom hydrogens can overlap a neighboring atom's label on short bonds] → they are placed in a free quadrant, so overlap needs a bond shorter than the label; no special handling.
- [The vertical-bond tie-break of the issue's S(CH3)6 example is asymmetric (`H3C` below, `CH3` above)] → the spec says vertical gives right for both; revisit at review if the user prefers the image.
