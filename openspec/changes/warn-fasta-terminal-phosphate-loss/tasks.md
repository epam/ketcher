# Tasks

## 1. Detect terminal phosphates

- [x] 1.1 Detect terminal phosphates from nucleotide-chain topology and cover terminal, internal, cyclic, multiple-chain, peptide, and empty structures; verify with `npm run test:unit -w ketcher-core -- --runInBand src/domain/helpers/__tests__/hasTerminalPhosphate.test.ts`.

## 2. Warn during FASTA export

- [x] 2.1 Show a localized, non-blocking warning only for FASTA export when a terminal phosphate is present, and continue conversion; verify the Save dialog conversion path and macromolecules typecheck.
- [x] 2.2 Add English and Simplified Chinese warning text; verify both locale JSON files parse and contain the warning key.

## 3. Validate integration

- [x] 3.1 Verify the resolved Save dialog with `npm run test:unit -w ketcher-macromolecules -- --runInBand src/components/modal/save/Save.test.tsx`, `npm run test:types -w ketcher-macromolecules`, and targeted formatting and lint checks.
