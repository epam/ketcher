# Undo and redo

A user reverts and reapplies edits with the toolbar buttons or the keyboard. Behavior is owned by [openspec/specs/undo-redo/spec.md](../../../../openspec/specs/undo-redo/spec.md).

## Sub-features

- `ur-undo-button` reverts the last edit from the toolbar.
- `ur-redo-button` reapplies a reverted edit from the toolbar.
- `ur-keyboard` does the same with the keyboard shortcuts.
- `ur-disabled` leaves undo disabled when there is nothing to undo.

## How to get to it (user POV)

- Choose `Undo` and `Redo` in the top-left toolbar (`undo`, `redo`).
- Press `Cmd+Z` and `Cmd+Shift+Z` on macOS, `Ctrl+Z` and `Ctrl+Shift+Z` elsewhere, with the canvas focused.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open, canvas empty.

- **Set up an edit.** Run `node $D load --text 'CCO'`, then `node $D export --format smiles --out before.smi`. It reads `CCO`.
- **Make the edit.** Run `node $D click --testid clear-canvas`, then `node $D export --format smiles --out cleared.smi`. The file is empty.
- **Undo.** Run `node $D click --testid undo`, then `node $D export --format smiles --out after-undo.smi`. It reads `CCO` again.
- **Redo.** Run `node $D click --testid redo`, then `node $D export --format smiles --out after-redo.smi`. The file is empty again.
- **Keyboard.** Run `node $D canvas-click --dx 300 --dy 200` to focus the canvas (the select tool is active, so it changes nothing). Run `node $D press --key ControlOrMeta+z`, then export `smiles`. It reads `CCO`. Run `node $D press --key ControlOrMeta+Shift+z`, then export. The file is empty.
- **Disabled state.** From a fresh `open`, `node $D click --testid undo` times out after 10 s because the button is disabled. That timeout is the observation: record it as `pass` for `ur-disabled`.

## Gotchas

- `load` itself is an undoable edit. After `open` plus `load`, one undo returns to the empty canvas.
- `press` sends keys to the page. Focus the canvas first (see Keyboard above). If focus is in a dialog, the keys go there. Close dialogs first.
- Use `ControlOrMeta`, not `Control`. On macOS the app handles `Meta+z` and ignores `Control+z`. `Control+y` did not redo in the run that mapped this.
