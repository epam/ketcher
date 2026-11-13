## 1. Query text functions

- [x] 1.1 Move the query text functions from `reatom.ts` to `atomQueryText.ts`
- [x] 1.2 Add `getAtomQueryLabelText` and use it in `reatom.ts`

## 2. CoreAtom

- [x] 2.1 Add query fields to `AtomProperties`
- [x] 2.2 Add `hasQueryProperties`
- [x] 2.3 No implicit hydrogens for atoms with query properties, use implicit H count if only it is set

## 3. MacromoleculesConverter

- [x] 3.1 Copy query fields to `CoreAtom`

## 4. AtomRenderer

- [x] 4.1 Draw the query label and position it after stereo and CIP labels
- [x] 4.2 Truncate long text, return full text from `labelTooltipText`
- [x] 4.3 Fill `data-atom*` query attributes

## 5. Tests

- [x] 5.1 Unit tests for `getAtomQueryLabelText`
- [x] 5.2 Unit tests for hydrogens of atoms with query properties
- [ ] 5.3 E2E tests
