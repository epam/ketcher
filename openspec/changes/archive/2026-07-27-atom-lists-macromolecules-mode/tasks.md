## 1. Extend CoreAtom Domain Entity

- [x] 1.1 Add optional `atomList?: AtomList | null` field to the `AtomProperties` interface in `CoreAtom.ts`
- [x] 1.2 Import `AtomList` from `domain/entities/atomList` in `CoreAtom.ts`
- [x] 1.3 Ensure `CoreAtom` constructor/initializer stores and exposes the `atomList` property

## 2. Propagate atomList Through DrawingEntitiesManager

- [x] 2.1 Add `atomList?: AtomList | null` to the `atomProperties` parameter accepted by `DrawingEntitiesManager.addAtom`
- [x] 2.2 Update `addAtomChangeModel` to accept and forward `atomList` when constructing the `CoreAtom`
- [x] 2.3 Verify no other callers of `addAtom` / `addAtomChangeModel` are broken by the new optional parameter

## 3. Copy atomList in MacromoleculesConverter

- [x] 3.1 In `MacromoleculesConverter.ts`, locate the `drawingEntitiesManager.addAtom(...)` call inside the atom conversion loop
- [x] 3.2 Add `atomList: atom.atomList ?? null` to the atom properties object passed to `addAtom`

## 4. Update AtomRenderer to Display Atom List Labels

- [x] 4.1 In `AtomRenderer.ts`, update the `labelText` getter to check `this.atom.atomList` before falling back to `alias ?? label`
- [x] 4.2 When `atomList` is non-null, return `this.atom.atomList.label()` (produces `[C,N,O]` or `![C,N,O]`)
- [x] 4.3 Confirm the existing `alias ?? label` path is unaffected for atoms without `atomList`

## 5. Truncate long labels to match micromolecules mode

- [x] 5.1 Add `MAX_LABEL_LENGTH = 8` constant to `AtomRenderer.ts`
- [x] 5.2 Add `displayLabelText` getter that returns the first 8 characters + `...` when label exceeds the limit
- [x] 5.3 Add `labelTooltipText` getter that returns the full text when truncated, or `null` otherwise
- [x] 5.4 Use `displayLabelText` in `appendLabel` tspan text calls and in `labelLength`
- [x] 5.5 Append an SVG `<title>` element to the text element when `labelTooltipText` is non-null

## 6. Verification

- [ ] 6.1 Manually verify: load a KET or mol file containing an atom list atom, switch to macromolecules mode, confirm label renders as `[C,N,O]` or `![C,N,O]`
- [ ] 6.2 Manually verify: a long atom list (> 8 chars) renders truncated on canvas with full label in tooltip
- [ ] 6.3 Manually verify: a regular (non-list) atom still renders its element symbol / alias correctly in macromolecules mode
- [x] 6.4 Run existing unit tests for `ketcher-core` and confirm no regressions
