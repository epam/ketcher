# Selection & Manipulation

## Problem

Before editing, moving, deleting, or transforming parts of a drawing, the user must be able to select exactly the atoms, bonds, structures, or other objects they intend to act on — and then move, rotate, flip, or erase them.

## User interaction

- **Selection tools** — _Rectangle Selection_, _Lasso_, _Structure (whole-object) Selection_, and _Fragment Selection_. Cycle between them with `Escape`.
  - Single atom/bond: click it with the _Rectangle_ or _Lasso_ tool.
  - Whole structure: use the _Structure Selection_ tool, drag a marquee, or `Ctrl-click` with _Lasso_/_Rectangle_.
  - Part of a molecule: use the _Fragment Selection_ tool and click one side of a bond.
  - Multiple objects: `Shift-click` to add to the selection, or drag a marquee; `Ctrl+Shift-click` selects several whole structures.
- **Deselect** — click empty canvas, or `Mod+Shift+a`. Select everything with `Mod+a`.
- **Move** — drag a selection to move all its members together.
- **Rotate** — the _Rotate tool_ (`Alt+r`) rotates the selection (or the whole canvas if nothing/everything is selected) in a default 15° step; hold `Ctrl` for 1° steps. `Alt+H` / `Alt+V` orient a selected bond horizontally / vertically.
- **Flip** — Horizontal Flip (`Alt+H`) and Vertical Flip (`Alt+V`) mirror the selection, or each structure individually when nothing/everything is selected.
- **Erase** — the _Erase tool_ (`Delete` / `Backspace`) removes hovered or selected elements.
- **Highlight** — right-click atoms/bonds to apply one of eight highlight colours.

## Expected behavior

Selection is reversible and non-destructive; manipulation acts only on the current selection and is undoable.

#### Scenario: Selecting a single atom

- **WHEN** the user clicks an atom with the _Rectangle_ or _Lasso_ tool
- **THEN** only that atom becomes selected

#### Scenario: Adding to a selection

- **WHEN** the user `Shift-click`s additional atoms or bonds
- **THEN** those items are added to the current selection without clearing it

#### Scenario: Moving a selection

- **WHEN** the user drags a multi-atom selection
- **THEN** all selected atoms, bonds, and objects move together preserving their relative geometry

#### Scenario: Rotating with and without a selection

- **WHEN** the user rotates while a subset is selected
- **THEN** only the selected objects rotate; if nothing or everything is selected the whole canvas rotates

#### Scenario: Erasing a selection

- **WHEN** the user presses `Delete` with a selection active
- **THEN** all selected elements are removed as a single undoable step

## Guarantees

- Deleting a bond does not delete its atoms unless they become disconnected fragments per the tool's rules; each manipulation is one atomic undo entry.
- Selection state is purely a view concern and never alters the chemical model.

## Limitations

- Functional groups / abbreviated S-groups can only be selected as a whole entity — they are moved, rotated, or deleted as one unit and cannot be partially selected.
- Available across **both modes**, but the macromolecules editor exposes its own selection set (rectangle, lasso, structure) and disables the eraser in sequence layout mode.

## Related

- Engine: [editor-engine](../modules/editor-engine.md)
- See also: [clipboard](./clipboard.md), [undo-redo](./undo-redo.md)
