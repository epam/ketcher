## 1. Indicator

- [x] 1.1 Make `highlightMonomers` show the _Modify amino acids_ transient view for the given monomers and return a function that hides it
- [x] 1.2 Pass the editor from the _Edit All_ hover handler in `useMonomerCreationMenu`; keep the guard for a disabled item

## 2. Tests

- [x] 2.1 Replace the hover-state unit tests of `highlightMonomers` with a test of the transient view calls
- [x] 2.2 Update the `useMonomerCreationMenu` test for the new argument
- [x] 2.3 Regenerate the screenshot baseline of the E2E test that hovers _Edit All_ in Flex mode

## 3. Verification

- [x] 3.1 Verify in the app: Flex, Snake and Sequence modes mark only the matching monomers, and the marks disappear on mouse-out, Escape and choosing the item
