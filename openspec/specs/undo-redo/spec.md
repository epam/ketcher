# Undo / Redo Specification

## Purpose

Editing is iterative and error-prone. Users must be able to reliably reverse a mistaken action and re-apply it, restoring both the chemical model and its on-screen rendering.

## Requirements

Every user action that changes the canvas is recorded as one atomic history entry; undo reverses the most recent entry and redo re-applies it.

### Requirement: Undo reverses the last action

The system SHALL ensure that the model and rendering return exactly to the state before that edit.

#### Scenario: Undo reverses the last action

- **WHEN** the user performs an edit and then presses Undo
- **THEN** the model and rendering return exactly to the state before that edit

### Requirement: Redo re-applies an undone action

The system SHALL ensure that the undone action is re-applied, restoring the state after the original edit.

#### Scenario: Redo re-applies an undone action

- **WHEN** the user undoes an action and then presses Redo
- **THEN** the undone action is re-applied, restoring the state after the original edit

### Requirement: New edit clears the redo branch

The system SHALL ensure that the previously undone actions can no longer be redone.

#### Scenario: New edit clears the redo branch

- **WHEN** the user undoes one or more actions and then performs a new edit
- **THEN** the previously undone actions can no longer be redone

### Requirement: History depth limit

The system SHALL ensure that only the most recent 32 actions remain reversible and older actions are dropped from history.

#### Scenario: History depth limit

- **WHEN** the user performs more than 32 undoable actions
- **THEN** only the most recent 32 actions remain reversible and older actions are dropped from history

### Requirement: Undo and redo across editor modes

The system SHALL ensure that the switch is recorded as one history entry without discarding earlier edits; and undoing or redoing that entry restores the corresponding mode and its original structure; and further undo/redo continues through edits in either mode in chronological order.

#### Scenario: Undo and redo across editor modes

- **WHEN** the user switches between molecules and macromolecules
- **THEN** the switch is recorded as one history entry without discarding earlier edits
- **AND** undoing or redoing that entry restores the corresponding mode and its original structure
- **AND** further undo/redo continues through edits in either mode in chronological order
- Selecting the already active mode does not add an entry. A new edit or mode switch after undo discards the shared redo branch.

## User interaction

- **Undo** — Top Toolbar button or `Mod+z`.
- **Redo** — Top Toolbar button or `Mod+Shift+z` / `Mod+y`.
- The Undo button is disabled when there is nothing to undo; Redo is disabled when there is nothing to redo.

## Guarantees

- The editors share one undo/redo history bounded to **32 steps**, including mode switches.
- Each user action is exactly one atomic history entry, implemented via the command pattern.
- Undo/redo restores both the domain model and its rendered view together.
