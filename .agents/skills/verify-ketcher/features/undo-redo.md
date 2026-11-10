# Undo and redo

A user reverts and reapplies edits with the toolbar buttons or the keyboard. Behavior is owned by [openspec/specs/undo-redo/spec.md](../../../../openspec/specs/undo-redo/spec.md).

## Sub-features

- `ur-undo-button` reverts the last edit from the toolbar.
- `ur-redo-button` reapplies a reverted edit from the toolbar.
- `ur-keyboard` does the same with `Mod+Z`, `Mod+Shift+Z`, and `Mod+Y`.
- `ur-disabled` leaves undo and redo disabled when there is nothing to undo or redo.
- `ur-redo-cleared` disables redo after a new edit follows an undo.

## How to get to it (user POV)

- Choose `Undo` and `Redo` in the top-left toolbar (`undo`, `redo`).
- Press `Mod+Z` to undo, and `Mod+Shift+Z` or `Mod+Y` to redo. `Mod` is Cmd on macOS and Ctrl elsewhere.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open, canvas empty.

- **Disabled at start.** Run `node $D state --testid undo` and `node $D state --testid redo`. Both show `enabled: false`.
- **Set up an edit.** Run `node $D load --text 'CCO'`, then `node $D export --format smiles --out before.smi`. It reads `CCO`.
- **Make the edit.** Run `node $D click --testid clear-canvas`, then `node $D export --format smiles --out cleared.smi`. The file is empty.
- **Undo.** Run `node $D click --testid undo`, then export. It reads `CCO`.
- **Redo.** Run `node $D click --testid redo`, then export. The file is empty.
- **Keyboard.** Run `node $D canvas-click --dx 300 --dy 200` to focus the editor. Run `node $D press --key ControlOrMeta+z`, then export: `CCO`. Run `node $D press --key ControlOrMeta+Shift+z`, then export: empty. Run `ControlOrMeta+z` again, then `node $D press --key ControlOrMeta+y`, then export: empty.
- **Redo cleared.** Run `node $D press --key ControlOrMeta+z`, then `node $D load --text 'C'`, then `node $D state --testid redo`. It shows `enabled: false`.

## Gotchas

- `load` itself is an undoable edit. After `open` plus `load`, one undo returns to the empty canvas.
- Keys go to the editor while no dialog is open and no input has focus. Close dialogs first.
- Use `ControlOrMeta`, not `Control`. On macOS the app handles `Meta+z` and ignores `Control+z`.
