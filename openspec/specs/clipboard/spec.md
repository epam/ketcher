# Clipboard (Copy / Cut / Paste) Specification

## Purpose

Users need to duplicate parts of a structure, move content within a drawing, and exchange structures with other applications by copying to and pasting from the system clipboard in several chemical formats.

## Requirements

Copy/cut serializes the selection to the clipboard; paste deserializes clipboard content and drops it onto the canvas.

### Requirement: Copy and paste a selection

The system SHALL ensure that an independent duplicate of the fragment is added to the canvas.

#### Scenario: Copy and paste a selection

- **WHEN** the user copies a selected fragment and then pastes
- **THEN** an independent duplicate of the fragment is added to the canvas

### Requirement: Cut removes the source

The system SHALL ensure that the selection is placed on the clipboard and removed from the canvas as a single undoable step.

#### Scenario: Cut removes the source

- **WHEN** the user cuts a selection
- **THEN** the selection is placed on the clipboard and removed from the canvas as a single undoable step

### Requirement: Copy as a specific format

The system SHALL ensure that the clipboard receives the selection serialized in that format, suitable for pasting into external tools.

#### Scenario: Copy as a specific format

- **WHEN** the user chooses _Copy as MOL_ or _Copy as KET_
- **THEN** the clipboard receives the selection serialized in that format, suitable for pasting into external tools

### Requirement: Attach a paste to an atom

The system SHALL merge a pasted atom into the canvas atom it is dropped on, and SHALL attach the pasted structure with a new single bond when the user drags from that atom, as the Template tool does.

#### Scenario: Click on an atom merges

- **WHEN** a pasted atom is over a canvas atom and the user clicks
- **THEN** the two atoms merge into one

#### Scenario: Drag from an atom forms a bond

- **WHEN** a pasted atom is over a canvas atom and the user presses there and drags more than one bond length away
- **THEN** a new single bond leads from the canvas atom to that pasted atom, and the pasted structure points toward the pointer, snapped to the rotation step from the settings (15° by default) unless `Ctrl` is held

### Requirement: Paste external structure

The system SHALL ensure that the corresponding structure is parsed and added to the canvas.

#### Scenario: Paste external structure

- **WHEN** the user pastes recognizable chemical text from the system clipboard
- **THEN** the corresponding structure is parsed and added to the canvas

## User interaction

- **Copy** (`Mod+c`) — copies the current selection (or the whole canvas if nothing is selected).
- **Copy As** — copy in a specific representation: _Copy as MOL_ (`Mod+Shift+m`), _Copy as KET_ (`Mod+Shift+k`), or _Copy Image_ (`Mod+Shift+f`).
- **Cut** (`Mod+x`) — copies the selection and removes it from the canvas.
- **Paste** (`Mod+v`) — places clipboard contents onto the canvas.
- Controls live on the Top Toolbar; keyboard shortcuts mirror them.

## Guarantees

- Pasted structures are independent copies; editing them does not affect the original.
- Paste is a single atomic entry in the undo history (see [undo-redo](../undo-redo/spec.md)).
- Copy never mutates the canvas; cut mutates it exactly once.
