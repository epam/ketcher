# Clipboard (Copy / Cut / Paste)

## Problem

Users need to duplicate parts of a structure, move content within a drawing, and exchange structures with other applications by copying to and pasting from the system clipboard in several chemical formats.

## User interaction

- **Copy** (`Mod+c`) — copies the current selection (or the whole canvas if nothing is selected).
- **Copy As** — copy in a specific representation: _Copy as MOL_ (`Mod+Shift+m`), _Copy as KET_ (`Mod+Shift+k`), or _Copy Image_ (`Mod+Shift+f`).
- **Cut** (`Mod+x`) — copies the selection and removes it from the canvas.
- **Paste** (`Mod+v`) — places clipboard contents onto the canvas.
- Controls live on the Top Toolbar; keyboard shortcuts mirror them.

## Expected behavior

Copy/cut serializes the selection to the clipboard; paste deserializes clipboard content and drops it onto the canvas.

#### Scenario: Copy and paste a selection

- **WHEN** the user copies a selected fragment and then pastes
- **THEN** an independent duplicate of the fragment is added to the canvas

#### Scenario: Cut removes the source

- **WHEN** the user cuts a selection
- **THEN** the selection is placed on the clipboard and removed from the canvas as a single undoable step

#### Scenario: Copy as a specific format

- **WHEN** the user chooses _Copy as MOL_ or _Copy as KET_
- **THEN** the clipboard receives the selection serialized in that format, suitable for pasting into external tools

#### Scenario: Paste external structure

- **WHEN** the user pastes recognizable chemical text from the system clipboard
- **THEN** the corresponding structure is parsed and added to the canvas

## Guarantees

- Pasted structures are independent copies; editing them does not affect the original.
- Paste is a single atomic entry in the undo history (see [undo-redo](./undo-redo.md)).
- Copy never mutates the canvas; cut mutates it exactly once.

## Limitations

- Some browsers (Chrome, Firefox) require `Ctrl+V` for pasting via the system clipboard.
- Cross-mode paste (molecules ↔ macromolecules) is routed through structure conversion and may be constrained by what the target mode can represent (see [macromolecules](./macromolecules.md)).
- Image copy produces a raster/vector image, not an editable structure.

## Related

- Engine: [editor-engine](../modules/editor-engine.md) · Formats: [serialization](../modules/serialization.md)
- See also: [selection](./selection.md), [import-export](./import-export.md)
