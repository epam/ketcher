## 1. Search Mapping

- [x] 1.1 Add a typed mapping from lowercase amino acid three-letter codes to single-letter natural analog codes for all required natural and ambiguous amino acid codes.
- [x] 1.2 Add a helper predicate that checks whether an exact normalized search term maps to a monomer's `MonomerNaturalAnalogCode` or ambiguous amino acid label.

## 2. Library Filter Integration

- [x] 2.1 Update `selectFilteredMonomers` in `packages/ketcher-macromolecules/src/state/library/librarySlice.ts` to pass `MonomerNaturalAnalogCode` into the monomer match check for concrete monomers.
- [x] 2.2 Integrate exact three-letter code matching without changing existing name, full name, alias, modification type, or slash-based IDT search behavior.
- [x] 2.3 Ensure hidden monomers remain excluded from library search results.

## 3. Tests

- [x] 3.1 Add unit coverage for exact three-letter amino acid search, including `Trp` → `W`.
- [x] 3.2 Add unit coverage for case-insensitive three-letter amino acid search, including `trp` → `W`.
- [x] 3.3 Add unit coverage for at least one ambiguous code, such as `Xaa` → `X`.
- [x] 3.4 Add regression coverage showing existing monomer name or alias search behavior still works.

## 4. Validation

- [x] 4.1 Run the relevant ketcher-macromolecules unit tests for monomer library filtering.
- [x] 4.2 Run OpenSpec validation for `support-three-letter-amino-acid-library-search` and fix any reported artifact issues.

