# Spec Delta

## ADDED Requirements

### Requirement: AxoLabs alias field in the monomer creation wizard

The system SHALL show an optional AxoLabs alias field in the collapsible _Aliases_ section of the wizard's attributes panel only while the selected monomer type is Nucleotide, CHEM, or Phosphate. Changing the type to any other type SHALL clear the field and hide it, so that no AxoLabs alias is saved. The field SHALL NOT be shown on the component tabs of the RNA preset mode.

#### Scenario: Field shown for monomer types that have an AxoLabs alias

- **WHEN** the user selects the Nucleotide, CHEM, or Phosphate type in the wizard
- **THEN** the _Aliases_ section contains an AxoLabs alias field
- **AND** the section can be collapsed and expanded

#### Scenario: Field hidden for other monomer types

- **WHEN** the user selects the Amino Acid, Sugar, Base, or RNA preset type
- **THEN** no AxoLabs alias field is shown

#### Scenario: Field hidden on RNA preset component tabs

- **WHEN** the user defines an RNA preset in the wizard and opens its Phosphate tab
- **THEN** no AxoLabs alias field is shown
- **AND** the saved phosphate has no AxoLabs alias

#### Scenario: Type change clears the alias

- **WHEN** the user has entered an AxoLabs alias and changes the type to Amino Acid, Sugar, or Base
- **THEN** the AxoLabs alias field disappears
- **AND** the saved monomer has no AxoLabs alias

#### Scenario: Alias left empty or removed

- **WHEN** the user leaves the AxoLabs alias field empty, or clears an alias that was loaded, and submits a valid monomer
- **THEN** the monomer is saved without an AxoLabs alias and no AxoLabs error is shown

### Requirement: AxoLabs alias format validation

On _Submit_, the system SHALL reject an AxoLabs alias that contains anything other than letters, digits, `(`, and `)`; that has `(` anywhere but first or `)` anywhere but last; or that is longer than 6 characters without its brackets. Each failure SHALL show its own error message in the wizard's error area, and the monomer SHALL NOT be saved.

#### Scenario: Characters outside the allowed set

- **WHEN** the user submits the AxoLabs alias `a-b` or `a b`
- **THEN** the error "The AxoLabs alias must consist of uppercase and lowercase letters, numbers, and brackets (`(` and `)`) (spaces prohibited)." is shown

#### Scenario: Bracket in the middle

- **WHEN** the user submits the AxoLabs alias `a(b` or `ab)c`
- **THEN** the error "The open bracket (`(`) can only be the first and the closed bracket (`)`) last character of an AxoLabs alias." is shown

#### Scenario: Alias too long

- **WHEN** the user submits the AxoLabs alias `ABCDEFG` or `(ABCDEFG)`
- **THEN** the error "The maximum number of characters of an AxoLabs alias without brackets is 6." is shown

#### Scenario: Valid aliases

- **WHEN** the user submits the AxoLabs alias `p`, `dA`, `ABCDEF`, or `(invdA)` and it is unique
- **THEN** no AxoLabs error is shown

### Requirement: AxoLabs alias uniqueness

On _Submit_, the system SHALL reject an AxoLabs alias that another library monomer or RNA preset already uses, comparing the aliases without their brackets and with case taken into account. The error "The AxoLabs alias for every position must be unique." SHALL be shown, and the monomer SHALL NOT be saved. Editing a library monomer without changing its alias SHALL NOT report a collision with itself.

#### Scenario: Alias used by a library monomer

- **WHEN** the user submits a phosphate with the AxoLabs alias `p`
- **THEN** the uniqueness error is shown

#### Scenario: Alias used by an RNA preset

- **WHEN** the user submits a nucleotide with the AxoLabs alias `dA`, which a default RNA preset uses
- **THEN** the uniqueness error is shown

#### Scenario: Brackets do not make an alias unique

- **WHEN** the user submits the AxoLabs alias `(dA)` while `dA` is in use, or `invdA` while `(invdA)` is in use
- **THEN** the uniqueness error is shown

#### Scenario: Case makes an alias unique

- **WHEN** the user submits the AxoLabs alias `Xq` while only `xq` is in use
- **THEN** no uniqueness error is shown

#### Scenario: Editing a monomer keeps its own alias

- **WHEN** the user edits a library monomer and submits it with its AxoLabs alias unchanged
- **THEN** no uniqueness error is shown

### Requirement: AxoLabs alias error highlight

The system SHALL highlight the AxoLabs alias field in red while any AxoLabs alias check from the last _Submit_ failed, and SHALL keep the highlight and the error while the user edits the field, until the user clicks _Submit_ again.

#### Scenario: Highlight stays until the next Submit

- **WHEN** an AxoLabs alias check fails on _Submit_ and the user then corrects the alias
- **THEN** the field stays highlighted and the error stays shown
- **AND** both disappear when the user clicks _Submit_ with a valid alias

### Requirement: AxoLabs alias saved with brackets

The system SHALL save the AxoLabs alias wrapped in `(` and `)`, adding the brackets when the user did not type them and not doubling them when the user did.

#### Scenario: Brackets added

- **WHEN** the user saves a monomer with the AxoLabs alias `Xq`
- **THEN** the library monomer's AxoLabs alias is `(Xq)`
- **AND** the monomer preview shows `(Xq)` as its AxoLabs alias

#### Scenario: Brackets kept

- **WHEN** the user saves a monomer with the AxoLabs alias `(Xq)`
- **THEN** the library monomer's AxoLabs alias is `(Xq)`

#### Scenario: Alias works in AxoLabs import and export

- **WHEN** a nucleotide saved with an AxoLabs alias is placed on the canvas and the canvas is exported to AxoLabs
- **THEN** the export uses the saved alias
- **AND** importing that AxoLabs sequence places the same nucleotide

### Requirement: AxoLabs alias in edit and duplicate flows

The system SHALL load a library monomer's stored AxoLabs alias when the user opens it with _Edit_ from the library. Every flow that loads copied attributes with the `_Copy` suffix SHALL start with an empty AxoLabs alias. Saving a monomer whose type has no AxoLabs alias field SHALL keep the alias the library entry already had.

#### Scenario: Edit from the library loads the alias

- **WHEN** the user chooses _Edit_ on the card of a nucleotide whose AxoLabs alias is `(invdA)`
- **THEN** the AxoLabs alias field shows `(invdA)`

#### Scenario: Copies start empty

- **WHEN** the user opens a monomer with an AxoLabs alias through _Duplicate and Edit_, _Edit Monomer_, or _Edit All_ on the canvas
- **THEN** the AxoLabs alias field is empty

#### Scenario: Alias kept for a type without the field

- **WHEN** the user edits a library monomer whose type has no AxoLabs alias field and saves it without changing its code or type
- **THEN** the library entry keeps the AxoLabs alias it had
