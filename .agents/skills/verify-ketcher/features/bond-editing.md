# Bond editing

A user picks a bond tool and clicks the canvas to draw a bond, attach a bond to an atom, or change an existing bond. The Bond Properties dialog edits one bond. Behavior is owned by [openspec/specs/bond-editing/spec.md](../../../../openspec/specs/bond-editing/spec.md).

## Sub-features

- `bond-draw` draws a two-carbon bond on an empty canvas spot.
- `bond-attach` adds a bond and a carbon to an existing atom.
- `bond-cycle` cycles a bond Single → Double → Triple → Single with the single bond tool.
- `bond-change-type` sets a bond to the chosen tool's type.
- `bond-properties` opens the Bond Properties dialog.

## How to get to it (user POV)

- Choose the bond tool in the left toolbar. At the driver's 1600x1000 window the bond tools fold into one button, `bonds`, which starts as Single. Click it again to open the list (`bond-single`, `bond-double`, `bond-triple`, and others from `ketcher-autotests/tests/pages/constants/bondSelectionTool/Constants.ts`).
- Press `1`, `2`, `3`, `0` (Any), or `4` (Aromatic) to pick a bond type.
- Double-click a bond for Bond Properties (`bondProps-dialog`).

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open.

- **Draw.** Run `node $D click --testid bonds`, then `node $D canvas-click`. Export `smiles`: `CC`. Run `node $D canvas-click --dx 20 --dy -5` (the new bond's midpoint). Export: `C=C`.
- **Cycle.** Run `node $D open --mode molecules`, `node $D load --text CC`, `node $D click --testid bonds`. Run `node $D canvas-click` three times, exporting `smiles` after each: `C=C`, `C#C`, `CC`.
- **Attach.** Run `node $D open --mode molecules`, `node $D load --text CC`, `node $D click --testid bonds`, `node $D canvas-click --dx 20 --dy 0`. Export: `CCC`.
- **Change type.** Run `node $D open --mode molecules`, `node $D load --text CC`, `node $D click --testid bonds` twice, `node $D click --testid bond-triple`, `node $D canvas-click`. Export: `C#C`. The hotkey path is `node $D canvas-click --dx 300 --dy 200`, `node $D press --key 3`, `node $D canvas-click`.
- **Properties.** Run `node $D load --text CC`, `node $D canvas-click --clicks 2`, then `node $D state --testid bondProps-dialog` (`visible: true`). Close with `node $D click --testid Cancel`.

## Gotchas

- A single bond drawn on an empty spot is tilted, centred about 20 px right and 5 px up from the click. Clicking the same offset again hits its first carbon and adds a bond (`CCC`) instead of cycling.
- Choosing a bond tool while bonds are selected converts them at once.
- `bond-single` and the other type IDs exist only while the list is open.
- Opening Bond Properties logs the same two React warnings as Atom Properties.
