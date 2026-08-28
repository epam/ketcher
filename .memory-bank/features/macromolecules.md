# Macromolecules (Polymers)

## Problem

Beyond small molecules, users work with biopolymers — peptides and nucleic acids built from monomers. Ketcher's macromolecules mode lets users assemble, view, and edit these polymers at monomer granularity and as sequences, create antisense strands, compute polymer properties, and bridge to molecules mode.

## User interaction

- **Mode switch** — the _Molecules/Macromolecules switcher_ enters macromolecules mode.
- **Monomer library** — Favorites, Peptides, RNA, and CHEM tabs; search by name, symbol, or IDT alias; hover a card for a preview. The _RNA Builder_ creates sugar-base-phosphate presets, and a _Monomer Creation Wizard_ (`Ctrl+M`)(available through molecules mode) defines custom monomers/presets with attachment points.
- **Layout modes** — the _modes switcher_ toggles **Sequence** (single-letter, text-editor-like), **Snake** (auto-layouted shapes), and **Flex** (free shapes) views. A _Sequence typing type switcher_ selects RNA/DNA/Peptide interpretation for keyboard input (`Ctrl+Alt+R/D/P`).
- **Adding monomers** — type/paste in sequence mode, drag-and-drop from the library, use the card _arrow icon_ (autochain), or open/paste files.
- **Bonds** — the _Bond tool_ makes single covalent bonds (at attachment points or centers, with a _Select Attachment Points_ dialog when a default bond is ambiguous) and hydrogen bonds (center-to-center only).
- **Antisense** — _Create Antisense Strand_ (`Shift+Alt+R` / `Shift+Alt+D`) adds an RNA/DNA complement with hydrogen bonds. A sync/non-sync toggle governs double-stranded editing in sequence mode.
- **Properties** — _Calculate Properties_ (`Alt+C`) shows molecular formula/mass plus peptide- or nucleic-acid-specific metrics.

## Expected behavior

Monomers connect through defined attachment points, sequences render as single-letter codes, and layout modes present the same chemistry differently.

#### Scenario: Default backbone connection

- **WHEN** the user types or joins monomers within one sequence
- **THEN** R1-R2 backbone connections are established automatically (e.g. a peptide bond between amino acids)

#### Scenario: Ambiguous bond prompts for attachment points

- **WHEN** the user connects two monomers for which no default bond applies
- **THEN** the _Select Attachment Points_ dialog opens so the user picks the exact points

#### Scenario: Monomer replaced by dragged monomer (center proximity drop)

- **WHEN** the user drags a monomer from the library and the cursor comes within the replacement
  proximity threshold of a canvas monomer's center
- **THEN** the canvas monomer shows the replacement-target visual state; no AP indicators appear
- **AND** releasing the drag replaces the canvas monomer at the same position with bonds re-established

#### Scenario: Preset replaces compatible canvas preset (center proximity drop)

- **WHEN** the user drags a preset from the library and releases it near any component monomer of a
  canvas preset with the same geometry (same components + same phosphate position)
- **THEN** the canvas preset is replaced in place with all compatible external bonds re-established
- **AND** during drag-over the entire preset is rendered with a replacement-target visual state

#### Scenario: Preset replaces standalone monomer (center proximity drop)

- **WHEN** the user drags a preset from the library and releases it near a canvas monomer that is
  not part of a same-geometry preset
- **THEN** the canvas monomer is replaced by the preset with the sugar at the original monomer's position

#### Scenario: Bond-deletion warning during replacement

- **WHEN** any bond of the original monomer or preset cannot be re-established on the replacement
- **THEN** a "Deletion of bonds" modal is shown before proceeding; Cancel aborts, Yes proceeds

#### Scenario: Preset placed without bonding (open canvas drop) — unchanged

- **WHEN** the user drags a monomer from the library and releases it on an area of the canvas with no canvas monomer within the replacement proximity threshold and no monomer within 25 px of any free AP
- **THEN** the monomer is placed at the drop position without any bond being created

#### Scenario: Monomer placed with bonding (proximity drop)

- **WHEN** the user drags a monomer from the library and releases it within 25 px of a free AP of a canvas monomer
- **THEN** the monomer is placed and a polymer bond is established between the two monomers using default-bond rules
- **AND** if no default bond can be resolved and multiple APs are available, the _Select Attachment Points_ dialog opens

#### Scenario: Preset placed with bonding (proximity drop)

- **WHEN** the user drags an RNA preset from the library and releases it within 25 px of a free AP of a canvas monomer
- **THEN** the preset is placed and a polymer bond is established between the resolved preset component and the canvas monomer

#### Scenario: Sequence-mode modification indicators

- **WHEN** a nucleic-acid sequence contains modified components
- **THEN** a modified base shows a gray background, a modified sugar a black frame, and a modified phosphate a dot

#### Scenario: Creating an antisense strand

- **WHEN** the user selects a sense chain and chooses _Create Antisense RNA/DNA Strand_
- **THEN** a complementary strand is added below with hydrogen bonds already established

#### Scenario: Synced double-stranded editing

- **WHEN** the sync toggle is on and the user edits one strand of a double-stranded sequence
- **THEN** the complementary strand is updated to match; **WHEN** the toggle is off, the other strand is left unchanged

#### Scenario: Snake-mode auto-layout

- **WHEN** the user enters snake mode
- **THEN** monomers and small molecules on the canvas are automatically laid out; entering flex mode applies no layout

#### Scenario: Chain enumeration

- **WHEN** a peptide chain forms, or an RNA/DNA sugar-phosphate chain starts from a sugar/phosphate that has no R1 attachment point, a free R1 attachment point, or an R1 occupied by a bond to another attachment point than R2
- **THEN** Ketcher numbers each eligible monomer sequentially along the chain, including a lone sugar-base-phosphate unit
- **AND** if no monomer in the chain satisfies that starting condition, no enumeration is shown

#### Scenario: Enumeration removed when a monomer leaves its preset chain

- **WHEN** the sugar and/or phosphate that made a base part of a numbered preset chain are deleted, leaving the base without a valid enumerable chain
- **THEN** the base's enumeration number is cleared rather than left showing a stale value

## Guarantees

- Monomer shape and color encode type (hexagons = amino acids, rounded squares = sugars, rhombuses = bases, circles = phosphates, pentagons = nucleotides, etc.).
- Hydrogen bonds never require attachment points and connect monomer centers only.
- Presets and per-mode monomers-per-line counts are cached in the browser and restored on reopening.
- The macromolecules editor keeps its own 32-step undo history, separate from molecules mode (see [undo-redo](./undo-redo.md)).
- A drag-drop that places a monomer/preset **and** creates a bond is undoable as a single atomic step (both the placed entity and the bond are removed together on undo).

## Limitations

- The eraser is disabled in sequence layout mode.
- Bond preview and _Edit Attachment Points…_ are unavailable for hydrogen bonds.
- Across modes: molecules drawn in one mode are **visible but not editable** in the other; monomers appear as full abbreviations (not shapes/letters) in molecules mode until expanded.
- Some polymer properties are computed only for natural analogues and/or double-stranded sequences.

## Related

- Library: [monomer-library](../modules/monomer-library.md) · UI: [ketcher-macromolecules](../modules/ketcher-macromolecules.md) · Bridge: [editor-engine](../modules/editor-engine.md)
- See also: [import-export](./import-export.md), [clipboard](./clipboard.md), [monomer-replacement-drag-drop](./monomer-replacement-drag-drop.md)
