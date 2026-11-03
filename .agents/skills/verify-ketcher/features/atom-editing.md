# Atom editing

A user picks an atom tool and clicks the canvas to place an atom or change an existing one. The Atom Properties dialog edits one atom. Behavior is owned by [openspec/specs/atom-editing/spec.md](../../../../openspec/specs/atom-editing/spec.md).

## Sub-features

- `atom-place` places a single atom of the chosen element on an empty canvas spot.
- `atom-replace` replaces an existing atom with another element, by click or by picking an element while atoms are selected.
- `atom-properties` edits atom properties in the Atom Properties dialog.

## How to get to it (user POV)

- Choose an element in the right toolbar (`O-button`, `N-button`, and so on, from `ketcher-autotests/tests/pages/constants/atoms/atoms.ts`), then click the canvas.
- Choose `Periodic table` (`period-table`) for other elements.
- Open Atom Properties (`atomProps-dialog`) three ways: double-click an atom, press `/` while the pointer is over an atom, or right-click the atom and choose `Edit...` (`Edit...-option`). The page object is `ketcher-autotests/tests/pages/molecules/canvas/AtomPropertiesDialog.ts`.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open.

- **Place an atom.** Run `node $D export --format smiles --out before.smi` (empty). Run `node $D click --testid O-button`, then `node $D canvas-click`. Export `smiles`: `O`.
- **Replace by click.** Run `node $D click --testid N-button`, then `node $D canvas-click`. Export `smiles`: `N`.
- **Replace by selection.** Run `node $D press --key ControlOrMeta+a`, then `node $D click --testid O-button`. Export `smiles`: `O`.
- **Properties dialog.** Run `node $D open --mode molecules` and `node $D load --text 'O'`. Run `node $D canvas-click --clicks 2`, then `node $D state --testid atomProps-dialog` (`visible: true`). Run `node $D fill --testid label-input --text S`, then `node $D click --testid OK`. Export `smiles`: `S`.
- **Other entry points.** With an atom tool active, `node $D canvas-click` on the atom then `node $D press --key /` opens the dialog. `node $D canvas-click --button right` on the atom, then `node $D state --testid 'Edit...-option'`, shows the menu item. Close with `press --key Escape`.

## Gotchas

- The tool stays active after a click. A second `canvas-click` at another offset places a second atom. Use distinct offsets (for example `--dx 80`) when you want two atoms.
- Clicking the same spot with a different element replaces the atom. That is `atom-replace`, not a second atom.
- Press `/` as `--key /`. `--key Slash` does not open the dialog.
- `/` acts on the atom under the pointer. The last mouse action must be on that atom; clicking a toolbar button moves the pointer away.
- The dialog's Apply button has test ID `OK`.
- Opening the dialog logs two React warnings (`extraValue`, `onExtraChange`) in the console. They come from the dialog itself, not from the edit under test.
