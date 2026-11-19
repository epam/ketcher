## Context

In molecules mode `reatom.ts` draws the query properties of an atom as a text near the atom (`rb2`, `s2;u`, a custom query). Atoms with query properties have no implicit hydrogens there (`Atom.isQuery()`), and implicit H count overrides the calculated number of hydrogens.

In macromolecules mode `MacromoleculesConverter` creates `CoreAtom` from the micromolecule atom and copies charge, isotope, radical, alias, cip, stereo label and atom list. Query properties are not copied and `AtomRenderer` does not draw them. The original struct is kept in the monomer, so nothing is lost when switching back to molecules mode, it is a display problem only.

## Goals / Non-Goals

**Goals:**

- Query properties are displayed in macromolecules mode for single atoms, atom lists and special atoms, with the same text as in molecules mode.
- Implicit hydrogens of such atoms follow the rule of molecules mode.

**Non-Goals:**

- Editing query properties in macromolecules mode.
- Changes in molecules mode rendering.

## Decisions

### Decision 1: Reuse the text functions of molecules mode

The functions that build the query text are moved from `reatom.ts` to `application/render/restruct/atomQueryText.ts` without changes in logic. A new function `getAtomQueryLabelText` returns the text for an atom, both `reatom.ts` and `AtomRenderer` call it.

**Alternative considered:** import the functions from `reatom.ts` in `AtomRenderer`. Rejected, `reatom.ts` depends on Raphael and the whole micromolecules renderer.

### Decision 2: Keep query fields in `CoreAtom.AtomProperties`

`ringBondCount`, `substitutionCount`, `unsaturatedAtom`, `hCount`, `implicitHCount` and `queryProperties` are added to `AtomProperties` and copied in `MacromoleculesConverter`, the same way as it was done for `atomList`.

### Decision 3: Hydrogens are handled in `CoreAtom.calculateValence`

If the atom has query properties the hydrogen amount is 0. Otherwise, if implicit H count is set, it is used as the hydrogen amount. Atom lists and special atoms already have no hydrogens because they are not elements.

### Decision 4: Query label is a separate element placed like the stereo label

`AtomRenderer` appends the query text to the canvas and puts it in the direction of the largest free sector of the atom, after the stereo and CIP labels if they exist. Text longer than 8 symbols is truncated with `...`, the full text is returned from `labelTooltipText`.

## Risks / Trade-offs

- **Implicit H count is used for all atoms in macromolecules mode now**, not only for query atoms. It is the same as in molecules mode, but screenshots of existing e2e tests with such atoms can change.
- **Tooltip** is shown on hover of the atom, in molecules mode it is shown on hover of the query text.
- Hover and selection contours are not changed, they are drawn around the atom label like in molecules mode.

## Open Questions

- Should the query text be included in hover and selection contours (requirement 4 of the issue)?
