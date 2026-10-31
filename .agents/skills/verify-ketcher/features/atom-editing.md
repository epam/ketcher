# Atom editing

A user picks an atom tool and clicks the canvas to place an atom. Behavior is owned by [openspec/specs/atom-editing/spec.md](../../../../openspec/specs/atom-editing/spec.md).

## Sub-features

- `atom-place` places a single atom of the chosen element on an empty canvas spot.
- `atom-replace` replaces an existing atom with another element.
- `atom-properties` edits atom properties in the atom dialog.

## How to get to it (user POV)

- Choose an element in the right toolbar (`O-button`, `N-button`, and so on, from `ketcher-autotests/tests/pages/constants/atoms/atoms.ts`), then click the canvas.
- Double-click an atom to open its properties dialog.
- Choose `Periodic table` (`period-table`) for other elements.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open.

- **Place an atom.** Run `node $D export --format smiles --out before.smi` (empty). Run `node $D click --testid O-button`, then `node $D canvas-click`. Run `node $D export --format smiles --out after.smi`. It reads `O`. Export `mol` too: it has one atom line with element `O`.
- **Replace an atom.** With the `O` on the canvas, run `node $D click --testid N-button`, then `node $D canvas-click`. Export `smiles`. It reads `N`.
- **Properties dialog.** Not mapped yet. The recipe needs the atom properties page object, `ketcher-autotests/tests/pages/molecules/canvas/`. Report `atom-properties` as `blocked: not mapped`.

## Gotchas

- The tool stays active after a click. A second `canvas-click` at another offset places a second atom. Use distinct offsets (for example `--dx 80`) when you want two atoms.
- Clicking the same spot with a different element replaces the atom. That is `atom-replace`, not a second atom.
- Element buttons need the right toolbar visible. A narrow viewport collapses it. `drive.mjs start` uses 1600x1000.
