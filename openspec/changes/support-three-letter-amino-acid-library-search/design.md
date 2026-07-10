## Context

The monomer library search filter is stored in Redux state and applied by `selectFilteredMonomers` in `packages/ketcher-macromolecules/src/state/library/librarySlice.ts`. Current matching checks monomer names, full names, IDT aliases, HELM/BILN/AxoLabs aliases, and modification types, but it does not explicitly map standard amino acid three-letter codes to natural amino acid monomers.

Natural amino acid monomers are grouped by `MonomerNaturalAnalogCode` in the same slice. This existing single-letter natural analog code should be used as the stable source for matching three-letter amino acid queries, rather than relying on display names or library ordering.

## Goals / Non-Goals

**Goals:**
- Support case-insensitive library search by the standard three-letter amino acid codes listed in the ticket.
- Return the natural amino acid monomer whose `MonomerNaturalAnalogCode` corresponds to the searched code.
- Include ambiguous natural amino acid codes: `Asx`, `Xle`, `Xaa`, and `Glx`.
- Preserve all existing monomer library search behavior for names, aliases, modification types, and IDT syntax.
- Cover the matching behavior with focused unit tests for the library filtering path.

**Non-Goals:**
- Changing monomer library data structures or serialized monomer formats.
- Changing how monomers are displayed, grouped, or sorted in the library.
- Adding support for non-standard amino acid aliases beyond the provided table.
- Modifying peptide sequence parsing or HELM import/export behavior.

## Decisions

- Add a small typed mapping from lowercase three-letter amino acid codes to single-letter natural analog codes in the library filtering module or a nearby helper.
  - Rationale: `MonomerNaturalAnalogCode` already represents the natural amino acid identity used for grouping and base monomer selection.
  - Alternative considered: matching against `MonomerName` only. This is insufficient because display names may differ from standard three-letter codes and ambiguous codes may not appear in names.

- Apply three-letter matching only for exact normalized search terms.
  - Rationale: Searching `trp` should return tryptophan, but partial text such as `tr` should continue to behave like existing substring search and should not trigger unrelated natural amino acid results.
  - Alternative considered: substring matching against three-letter codes. This could make short queries noisy and conflict with existing name/alias search expectations.

- Integrate the check into the existing `checkMonomerMatch` path by passing the monomer natural analog code for concrete monomers, and checking ambiguous monomer labels for ambiguous items.
  - Rationale: Keeping the logic in the selector preserves the current state shape and avoids introducing new Redux state or UI behavior.
  - Alternative considered: transforming the user search input in the UI before dispatch. This would lose the original query and couple domain search behavior to `MonomerLibrary.tsx`.

- Keep the mapping local and dependency-free.
  - Rationale: The code list is finite, stable, and small; adding runtime dependencies would be unnecessary.

## Risks / Trade-offs

- Ambiguous code handling may depend on how ambiguous amino acids are represented in loaded monomer data. → Cover both concrete natural analog matching and ambiguous label matching in tests where possible.
- Existing substring search can return additional non-natural monomers whose names or aliases contain the three-letter query. → Treat the requirement as ensuring the natural amino acid is included, not as requiring exclusive results unless existing behavior already narrows it.
- The mapping duplicates a domain standard table in code. → Keep it clearly named, typed, and covered by tests so future changes are easy to review.

## Migration Plan

No data migration is required. The change can be implemented as a selector/helper update plus tests. Rollback is limited to removing the mapping and selector branch if needed.

## Open Questions

- Should exact three-letter code searches return only the matching natural amino acid, or is it acceptable for existing name/alias substring matches to remain in the result set alongside it?

