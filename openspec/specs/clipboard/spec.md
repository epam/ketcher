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

### Requirement: Paste external structure

The system SHALL ensure that the corresponding structure is parsed and added to the canvas.

#### Scenario: Paste external structure

- **WHEN** the user pastes recognizable chemical text from the system clipboard
- **THEN** the corresponding structure is parsed and added to the canvas

### Requirement: Attach a pasted structure by dragging

The system SHALL attach a pasted structure to an existing atom by a new single bond when the user presses on the atom the paste would merge with and drags away, as the Template tool does.

#### Scenario: Drag away from the merge target

- **WHEN** the user moves a pasted structure so that one of its atoms is highlighted for merging with an existing atom, presses the left mouse button, and drags away from that atom
- **THEN** the pasted structure is attached to the existing atom through the highlighted pasted atom by a new single bond, at the angle of the drag, as a single undoable step

#### Scenario: Release on the merge target

- **WHEN** the user presses on the merge target and releases without dragging off the atom
- **THEN** the pasted atom merges with the existing atom and no bond is added

#### Scenario: Paste that cannot be attached

- **WHEN** the pasted content has more than one fragment, or contains reaction arrows, pluses, texts, simple objects, images, R-group attachment points, or monomers
- **THEN** dragging moves the paste as before and no bond is added

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
