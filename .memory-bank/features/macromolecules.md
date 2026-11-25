# Macromolecules (Polymers)

## Purpose

Beyond small molecules, users work with biopolymers — peptides and nucleic acids built from monomers. Ketcher's macromolecules mode lets users assemble, view, and edit these polymers at monomer granularity and as sequences, create antisense strands, compute polymer properties, and bridge to molecules mode.

## Requirements

### Requirement: Center small molecules within Snake layout rows

In Snake mode, the system SHALL vertically center all small molecules in each molecule row on the horizontal axis through the center of the tallest molecule's bounding box. This SHALL apply to connected and unconnected small molecules. When the ruler causes wrapping, each resulting row SHALL use its own tallest molecule while retaining the space reserved for that row.

#### Scenario: Align molecules of different heights

- **WHEN** small molecules with different bounding-box heights occupy the same Snake layout row
- **THEN** their bounding-box centers share a vertical coordinate
- **AND** the tallest molecule retains its vertical placement

#### Scenario: Wrap the tallest molecule onto another row

- **WHEN** the ruler moves the tallest molecule to the next molecule row
- **THEN** each row aligns its molecules using the tallest bounding box remaining in that row

Monomers connect through defined attachment points, sequences render as single-letter codes, and layout modes present the same chemistry differently.

### Requirement: Macromolecules editing disabled by integrator

The system SHALL ensure that, when an integrator disables macromolecules editing, the mode switcher is hidden and the macromolecules editor is not loaded; and the micromolecules editor initializes and reports readiness normally; and monomer-creation entry points are unavailable; and sequence API requests reject with a clear unavailable-editor error.

#### Scenario: Macromolecules editing disabled by integrator

- **WHEN** an integrator disables macromolecules editing
- **THEN** the mode switcher is hidden and the macromolecules editor is not loaded
- **AND** the micromolecules editor initializes and reports readiness normally
- **AND** monomer-creation entry points are unavailable
- **AND** sequence API requests reject with a clear unavailable-editor error

### Requirement: Editing an attachment point in the monomer creation wizard

The system SHALL ensure that the dialog prefers a position above the attachment atom, leaving atom, and R-label without covering them; when space above is insufficient, it uses space below or to either side; and it follows the attachment point when the canvas is scrolled or zoomed; and its position is constrained to the visible canvas; when no non-overlapping placement fits, keeping the controls reachable takes priority.

#### Scenario: Editing an attachment point in the monomer creation wizard

- **WHEN** the user chooses _Edit connection point_ from an R-label's context menu
- **THEN** the dialog prefers a position above the attachment atom, leaving atom, and R-label without covering them; when space above is insufficient, it uses space below or to either side
- **AND** it follows the attachment point when the canvas is scrolled or zoomed
- **AND** its position is constrained to the visible canvas; when no non-overlapping placement fits, keeping the controls reachable takes priority

### Requirement: Default backbone connection

The system SHALL ensure that R1-R2 backbone connections are established automatically (e.g. a peptide bond between amino acids).

#### Scenario: Default backbone connection

- **WHEN** the user types or joins monomers within one sequence
- **THEN** R1-R2 backbone connections are established automatically (e.g. a peptide bond between amino acids)

### Requirement: Ambiguous bond prompts for attachment points

The system SHALL ensure that the _Select Attachment Points_ dialog opens so the user picks the exact points.

#### Scenario: Ambiguous bond prompts for attachment points

- **WHEN** the user connects two monomers for which no default bond applies
- **THEN** the _Select Attachment Points_ dialog opens so the user picks the exact points

### Requirement: Monomer replaced by dragged monomer (center proximity drop)

The system SHALL ensure that the canvas monomer shows the replacement-target visual state; no AP indicators appear; and releasing the drag replaces the canvas monomer at the same position with bonds re-established.

#### Scenario: Monomer replaced by dragged monomer (center proximity drop)

- **WHEN** the user drags a monomer from the library and the cursor comes within the replacement
  proximity threshold of a canvas monomer's center
- **THEN** the canvas monomer shows the replacement-target visual state; no AP indicators appear
- **AND** releasing the drag replaces the canvas monomer at the same position with bonds re-established

### Requirement: Preset replaces compatible canvas preset (center proximity drop)

The system SHALL ensure that the canvas preset is replaced in place with all compatible external bonds re-established; and during drag-over the entire preset is rendered with a replacement-target visual state.

#### Scenario: Preset replaces compatible canvas preset (center proximity drop)

- **WHEN** the user drags a preset from the library and releases it near any component monomer of a
  canvas preset with the same geometry (same components + same phosphate position)
- **THEN** the canvas preset is replaced in place with all compatible external bonds re-established
- **AND** during drag-over the entire preset is rendered with a replacement-target visual state

### Requirement: Preset replaces standalone monomer (center proximity drop)

The system SHALL ensure that the canvas monomer is replaced by the preset with the sugar at the original monomer's position.

#### Scenario: Preset replaces standalone monomer (center proximity drop)

- **WHEN** the user drags a preset from the library and releases it near a canvas monomer that is
  not part of a same-geometry preset
- **THEN** the canvas monomer is replaced by the preset with the sugar at the original monomer's position

### Requirement: Bond-deletion warning during replacement

The system SHALL ensure that a "Deletion of bonds" modal is shown before proceeding; Cancel aborts, Yes proceeds.

#### Scenario: Bond-deletion warning during replacement

- **WHEN** any bond of the original monomer or preset cannot be re-established on the replacement
- **THEN** a "Deletion of bonds" modal is shown before proceeding; Cancel aborts, Yes proceeds

### Requirement: Preset placed without bonding (open canvas drop) — unchanged

The system SHALL ensure that the monomer is placed at the drop position without any bond being created.

#### Scenario: Preset placed without bonding (open canvas drop) — unchanged

- **WHEN** the user drags a monomer from the library and releases it on an area of the canvas with no canvas monomer within the replacement proximity threshold and no monomer within 25 px of any free AP
- **THEN** the monomer is placed at the drop position without any bond being created

### Requirement: Monomer placed with bonding (proximity drop)

The system SHALL ensure that the monomer is placed and a polymer bond is established between the two monomers using default-bond rules; and if no default bond can be resolved and multiple APs are available, the _Select Attachment Points_ dialog opens.

#### Scenario: Monomer placed with bonding (proximity drop)

- **WHEN** the user drags a monomer from the library and releases it within 25 px of a free AP of a canvas monomer
- **THEN** the monomer is placed and a polymer bond is established between the two monomers using default-bond rules
- **AND** if no default bond can be resolved and multiple APs are available, the _Select Attachment Points_ dialog opens

### Requirement: Preset placed with bonding (proximity drop)

The system SHALL ensure that the preset is placed and a polymer bond is established between the resolved preset component and the canvas monomer.

#### Scenario: Preset placed with bonding (proximity drop)

- **WHEN** the user drags an RNA preset from the library and releases it within 25 px of a free AP of a canvas monomer
- **THEN** the preset is placed and a polymer bond is established between the resolved preset component and the canvas monomer

### Requirement: Sequence-mode modification indicators

The system SHALL ensure that a modified base shows a gray background, a modified sugar a black frame, and a modified phosphate a dot.

#### Scenario: Sequence-mode modification indicators

- **WHEN** a nucleic-acid sequence contains modified components
- **THEN** a modified base shows a gray background, a modified sugar a black frame, and a modified phosphate a dot

### Requirement: Creating an antisense strand

The system SHALL ensure that a complementary strand is added below with hydrogen bonds already established.

#### Scenario: Creating an antisense strand

- **WHEN** the user selects a sense chain and chooses _Create Antisense RNA/DNA Strand_
- **THEN** a complementary strand is added below with hydrogen bonds already established

### Requirement: Synced double-stranded editing

The system SHALL ensure that the complementary strand is updated to match; when the toggle is off, the other strand is left unchanged.

#### Scenario: Synced double-stranded editing

- **WHEN** the sync toggle is on and the user edits one strand of a double-stranded sequence
- **THEN** the complementary strand is updated to match; **WHEN** the toggle is off, the other strand is left unchanged

### Requirement: Snake-mode auto-layout

The system SHALL ensure that monomers and small molecules on the canvas are automatically laid out; entering flex mode applies no layout.

#### Scenario: Snake-mode auto-layout

- **WHEN** the user enters snake mode
- **THEN** monomers and small molecules on the canvas are automatically laid out; entering flex mode applies no layout

### Requirement: Chain enumeration

The system SHALL ensure that Ketcher numbers each eligible monomer sequentially along the chain, including a lone sugar-base-phosphate unit; and if no monomer in the chain satisfies that starting condition, no enumeration is shown.

#### Scenario: Chain enumeration

- **WHEN** a peptide chain forms, or an RNA/DNA sugar-phosphate chain starts from a sugar/phosphate that has no R1 attachment point, a free R1 attachment point, or an R1 occupied by a bond to another attachment point than R2
- **THEN** Ketcher numbers each eligible monomer sequentially along the chain, including a lone sugar-base-phosphate unit
- **AND** if no monomer in the chain satisfies that starting condition, no enumeration is shown

### Requirement: Creating a monomer from the macromolecule canvas

The system SHALL ensure that _Create monomer_ appears above _Delete_ in Flex, Snake, and Sequence modes; and choosing it temporarily opens the structure in the molecules-mode wizard without retaining the selected monomers' library attributes.

#### Scenario: Creating a monomer from the macromolecule canvas

- **WHEN** a selection contains one small molecule, or a connected combination of monomers and chemical structure
- **THEN** _Create monomer_ appears above _Delete_ in Flex, Snake, and Sequence modes
- **AND** choosing it temporarily opens the structure in the molecules-mode wizard without retaining the selected monomers' library attributes

### Requirement: Editing canvas monomers

The system SHALL ensure that _Edit Monomer_ and _Edit All [code] (count)_ appear above _Delete_; and hovering _Edit All_ highlights the affected instances; saving replaces those instances with the new library monomer; and both editing options remain visible but disabled for sequence symbols representing multiple monomers.

#### Scenario: Editing canvas monomers

- **WHEN** the user right-clicks a single monomer or a sequence symbol representing one monomer
- **THEN** _Edit Monomer_ and _Edit All [code] (count)_ appear above _Delete_
- **AND** hovering _Edit All_ highlights the affected instances; saving replaces those instances with the new library monomer
- **AND** both editing options remain visible but disabled for sequence symbols representing multiple monomers

### Requirement: Editing library monomers

The system SHALL ensure that _Edit_ loads the original attributes, while _Duplicate and Edit_ loads copied attributes with the existing copy suffix rules; and saving a duplicate adds a new library monomer without replacing the original canvas instances.

#### Scenario: Editing library monomers

- **WHEN** the user opens a non-ambiguous monomer card's three-dot menu
- **THEN** _Edit_ loads the original attributes, while _Duplicate and Edit_ loads copied attributes with the existing copy suffix rules
- **AND** saving a duplicate adds a new library monomer without replacing the original canvas instances

### Requirement: Returning from the monomer wizard

The system SHALL ensure that the previous Flex, Snake, or Sequence mode is restored; and discarding preserves the original canvas; saving canvas changes preserves Flex placement and lays out structured modes.

#### Scenario: Returning from the monomer wizard

- **WHEN** a wizard opened from macromolecules mode is saved or discarded
- **THEN** the previous Flex, Snake, or Sequence mode is restored
- **AND** discarding preserves the original canvas; saving canvas changes preserves Flex placement and lays out structured modes

### Requirement: Enumeration removed when a monomer leaves its preset chain

The system SHALL ensure that the base's enumeration number is cleared rather than left showing a stale value.

#### Scenario: Enumeration removed when a monomer leaves its preset chain

- **WHEN** the sugar and/or phosphate that made a base part of a numbered preset chain are deleted, leaving the base without a valid enumerable chain
- **THEN** the base's enumeration number is cleared rather than left showing a stale value

### Requirement: Hover previews near editor boundaries

The system SHALL ensure that its position is constrained to keep it visible within the editor (provided the preview fits the available area), even if it must overlap the target; and positioning works both at the page origin and in an offset popup; and canvas previews without interactive content allow pointer events to reach the canvas underneath.

#### Scenario: Hover previews near editor boundaries

- **WHEN** a monomer or bond preview does not fit on either preferred side of its target
- **THEN** its position is constrained to keep it visible within the editor (provided the preview fits the available area), even if it must overlap the target
- **AND** positioning works both at the page origin and in an offset popup
- **AND** canvas previews without interactive content allow pointer events to reach the canvas underneath

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

## User interaction

- **Mode switch** — the _Molecules/Macromolecules switcher_ enters macromolecules mode.
- **Integrator opt-out** — integrators can disable macromolecules editing. This hides the mode
  switcher and prevents the macromolecules editor from being loaded; the micromolecules editor
  remains usable.
- **Monomer library** — Favorites, Peptides, RNA, and CHEM tabs; search by name, symbol, or IDT alias; hover a card for a preview. The _RNA Builder_ creates sugar-base-phosphate presets, and a _Monomer Creation Wizard_ (`Ctrl+M`) (available through molecules mode when macromolecules editing is enabled) defines custom monomers/presets with attachment points and optional HELM, BILN, and AxoLabs aliases. Macromolecule canvas context menus and non-ambiguous library cards also provide wizard entry points.
  - Exact `-` and `_` searches match only the short name displayed on monomer and RNA preset cards, avoiding matches from internal alias or metadata fields.
- **Layout modes** — the _modes switcher_ toggles **Sequence** (single-letter, text-editor-like), **Snake** (auto-layouted shapes), and **Flex** (free shapes) views. A _Sequence typing type switcher_ selects RNA/DNA/Peptide interpretation for keyboard input (`Ctrl+Alt+R/D/P`).
- **Adding monomers** — type/paste in sequence mode, drag-and-drop from the library, use the card _arrow icon_ (autochain), or open/paste files.
- **Bonds** — the _Bond tool_ makes single covalent bonds (at attachment points or centers, with a _Select Attachment Points_ dialog when a default bond is ambiguous) and hydrogen bonds (center-to-center only).
- **Antisense** — _Create Antisense Strand_ (`Shift+Alt+R` / `Shift+Alt+D`) adds an RNA/DNA complement with hydrogen bonds. A sync/non-sync toggle governs double-stranded editing in sequence mode.
- **Properties** — _Calculate Properties_ (`Alt+C`) shows molecular formula/mass plus peptide- or nucleic-acid-specific metrics.

## Guarantees

- Monomer shape and color encode type (hexagons = amino acids, rounded squares = sugars, rhombuses = bases, circles = phosphates, pentagons = nucleotides, etc.).
- Hydrogen bonds never require attachment points and connect monomer centers only.
- Presets and per-mode monomers-per-line counts are cached in the browser and restored on reopening.
- The macromolecules editor keeps its own 32-step undo history, separate from molecules mode (see [undo-redo](../undo-redo/spec.md)).
- A drag-drop that places a monomer/preset **and** creates a bond is undoable as a single atomic step (both the placed entity and the bond are removed together on undo).

## Limitations

- The eraser is disabled in sequence layout mode.
- Bond preview and _Edit Attachment Points…_ are unavailable for hydrogen bonds.
- Across modes: molecules drawn in one mode are **visible but not editable** in the other; monomers appear as full abbreviations (not shapes/letters) in molecules mode until expanded.
- Some polymer properties are computed only for natural analogues and/or double-stranded sequences.

## Related

- Library: [monomer-library](../modules/monomer-library.md) · UI: [ketcher-macromolecules](../modules/ketcher-macromolecules.md) · Bridge: [editor-engine](../modules/editor-engine.md)
- See also: [import-export](./import-export.md), [clipboard](./clipboard.md), [monomer-replacement-drag-drop](../../openspec/changes/archive/2026-08-13-monomer-replacement-drag-drop/)
