# Selection

A user selects parts of a structure and acts on the selection, for example deletes it. Behavior is owned by [openspec/specs/selection/spec.md](../../../../openspec/specs/selection/spec.md).

## Sub-features

- `sel-all` selects everything with `Mod+A`.
- `sel-delete` removes the selection with `Delete` or `Backspace` as one undoable step.
- `sel-marquee` selects by dragging a box with the rectangle tool.
- `sel-tools` picks Rectangle, Lasso, Structure, or Fragment selection.

## How to get to it (user POV)

- Press `Mod+A` to select all and `Mod+Shift+A` to clear the selection.
- Drag on the canvas with a select tool for a box selection.
- The select tools are `select-rectangle`, `select-lasso`, `select-structure`, `select-fragment` (`ketcher-autotests/tests/pages/constants/areaSelectionTool/Constants.ts`). `Shift+Tab` cycles them. `Escape` returns to the saved select tool.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open.

- **Select all and delete.** Run `node $D load --text CCO`, `node $D canvas-click --dx 300 --dy 200`, `node $D press --key ControlOrMeta+a`, `node $D press --key Delete`. Export `smiles`: empty.
- **One undo step.** Run `node $D press --key ControlOrMeta+z`. Export: `CCO`.
- **Backspace.** Run `node $D press --key ControlOrMeta+a`, `node $D press --key Backspace`. Export: empty.
- **Box selection.** Run `node $D open --mode molecules`, `node $D load --text CCO`, `node $D drag --from-dx -150 --from-dy -150 --to-dx 150 --to-dy 150`, `node $D press --key Delete`. Export: empty.
- **Tool.** Run `node $D click --testid select-rectangle`. `node $D state --testid select-rectangle` shows it visible and enabled.

## Gotchas

- Focus the editor before pressing keys; see [README.md](./README.md).
- Start a box drag on empty canvas. A drag that starts on an atom moves the atom.
- `select-rectangle` matches three elements; `state` reads the visible one.
