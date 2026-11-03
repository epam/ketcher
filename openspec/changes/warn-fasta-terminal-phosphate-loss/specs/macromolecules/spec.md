# Spec Delta

## ADDED Requirements

### Requirement: Warn when FASTA export loses terminal phosphates

The system SHALL warn users when FASTA export will omit a phosphate at the end of a nucleotide chain, and SHALL continue the export.

#### Scenario: FASTA export with a terminal phosphate

- **WHEN** the user exports a nucleotide structure containing a terminal phosphate in FASTA format
- **THEN** the system displays a warning that FASTA does not support terminal phosphates and they will be lost
- **AND** the system continues the export

#### Scenario: FASTA export without terminal phosphates

- **WHEN** the user exports a nucleotide structure without terminal phosphates in FASTA format
- **THEN** the system does not display the terminal-phosphate-loss warning
