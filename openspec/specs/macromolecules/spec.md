# Macromolecules (Polymers) Specification

## Purpose

Beyond small molecules, users work with biopolymers — peptides and nucleic acids built from monomers. Ketcher's macromolecules mode lets users assemble, view, and edit these polymers at monomer granularity and as sequences, create antisense strands, compute polymer properties, and bridge to molecules mode.

## Requirements

Monomers connect through defined attachment points, sequences render as single-letter codes, and layout modes present the same chemistry differently.

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

The system SHALL ensure that _Edit Monomer_ and _Edit All [code] (count)_ appear above _Delete_; and hovering _Edit All_ marks every affected instance with the same indicator as the _Modify amino acids_ hover (a teal circle around the monomer in Flex and Snake modes, a green tile behind the symbol in Sequence mode); the marks disappear when the pointer leaves the item or the menu closes; saving replaces those instances with the new library monomer; and both editing options remain visible but disabled for sequence symbols representing multiple monomers.

#### Scenario: Editing canvas monomers

- **WHEN** the user right-clicks a single monomer or a sequence symbol representing one monomer
- **THEN** _Edit Monomer_ and _Edit All [code] (count)_ appear above _Delete_
- **AND** hovering _Edit All_ marks every affected instance with the same indicator as the _Modify amino acids_ hover (a teal circle around the monomer in Flex and Snake modes, a green tile behind the symbol in Sequence mode); the marks disappear when the pointer leaves the item or the menu closes; saving replaces those instances with the new library monomer
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

## User interaction

- **Mode switch** — the _Molecules/Macromolecules switcher_ enters macromolecules mode.
- **Monomer library** — Favorites, Peptides, RNA, and CHEM tabs; search by name, symbol, or IDT alias; hover a card for a preview. The _RNA Builder_ creates sugar-base-phosphate presets, and a _Monomer Creation Wizard_ (`Ctrl+M`)(available through molecules mode) defines custom monomers/presets with attachment points.Macromolecule canvas context menus and non-ambiguous library cards also provide wizard entry points.
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
