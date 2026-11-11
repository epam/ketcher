# Design

## Context

See proposal.md for the motivation and specs/macromolecules/spec.md for the user-visible contract. Macromolecules export is handled by the Save dialog, which serializes the drawing and asks Indigo to convert it. The drawing entities manager exposes the monomer collection and backbone relationships.

## Goals / Non-Goals

**Goals:**

- Detect terminal phosphate monomers from the structure's backbone topology.
- Keep the warning non-blocking and specific to FASTA export.

**Non-Goals:**

- Change FASTA conversion, its output, or export behavior for other formats.
- Add warning handling for lossy conversions unrelated to terminal phosphates.

## Decisions

- Put terminal-phosphate detection in the core domain helpers and pass the current monomer collection from the Save dialog. This keeps chemistry/topology detection out of UI code and avoids trying to infer phosphate loss from converted FASTA text.
- Dispatch the existing localized error notification from the FASTA conversion path when the helper finds an endpoint phosphate. Continue the existing Indigo conversion so users still receive the FASTA file.
- Reuse the monomer collection already read for export checks. Unit tests cover terminal and internal phosphates, multiple chains, cyclic chains, peptide chains, and empty structures.

## Risks / Trade-offs

- [Unusual backbone topology could be classified as terminal] → Determine terminal status from each phosphate's previous and next chain neighbors, and cover linear, cyclic, and disconnected structures in unit tests.
- [A notification could accidentally block conversion] → Keep it as a notification event rather than throwing an error; verify conversion continues.

## Migration Plan

No data migration or dependency change is required. Roll back by reverting the helper, its export warning call and locale entries together.
