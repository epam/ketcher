# Undo / Redo

## Problem

Editing is iterative and error-prone. Users must be able to reliably reverse a mistaken action and re-apply it, restoring both the chemical model and its on-screen rendering.

## User interaction

- **Undo** — Top Toolbar button or `Mod+z`.
- **Redo** — Top Toolbar button or `Mod+Shift+z` / `Mod+y`.
- The Undo button is disabled when there is nothing to undo; Redo is disabled when there is nothing to redo.

## Expected behavior

Every user action that changes the canvas is recorded as one atomic history entry; undo reverses the most recent entry and redo re-applies it.

#### Scenario: Undo reverses the last action

- **WHEN** the user performs an edit and then presses Undo
- **THEN** the model and rendering return exactly to the state before that edit

#### Scenario: Redo re-applies an undone action

- **WHEN** the user undoes an action and then presses Redo
- **THEN** the undone action is re-applied, restoring the state after the original edit

#### Scenario: New edit clears the redo branch

- **WHEN** the user undoes one or more actions and then performs a new edit
- **THEN** the previously undone actions can no longer be redone

#### Scenario: History depth limit

- **WHEN** the user performs more than 32 undoable actions
- **THEN** only the most recent 32 actions remain reversible and older actions are dropped from history

## Guarantees

- The undo/redo history is bounded to **32 steps** in both the molecules and macromolecules editors.
- Each user action is exactly one atomic history entry, implemented via the command pattern.
- Undo/redo restores both the domain model and its rendered view together.

## Limitations

- History is capped at 32 steps; actions older than the cap cannot be undone.
- The two editors keep **separate** histories; switching modes does not merge them.

## Related

- Engine: [operations-history](../modules/operations-history.md), [editor-engine](../modules/editor-engine.md)
- Implementation: `HISTORY_SIZE = 32` in the molecules editor and the macromolecules `EditorHistory`.
