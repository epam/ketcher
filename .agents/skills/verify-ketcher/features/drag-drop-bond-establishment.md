# Drag-drop bond establishment

In the macromolecules editor, in flex or snake layout, a user drags a monomer card from the library onto a free attachment point of a monomer on the canvas. Free attachment points show while dragging. On release, a default bond (for example R1 to R2) forms without a dialog. Behavior is owned by [openspec/specs/drag-drop-bond-establishment/spec.md](../../../../openspec/specs/drag-drop-bond-establishment/spec.md).

## Sub-features

- `dd-ap-highlight` shows the target's free attachment points while dragging.
- `dd-default-bond` creates an R1–R2 bond on release, with no dialog.
- `dd-undo` removes the placed monomer and its bond with one undo.

## How to get to it (user POV)

- Switch to flex layout (`layout-mode`, then `flex-layout-mode`). Sequence layout, the default on a blank canvas, blocks the drag.
- Open a library tab (`PEPTIDES-TAB`) and drag a card such as `A___Alanine` onto the canvas.
- When no default bond resolves, `monomer-connection-modal` opens for choosing attachment points.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md), but `node $D open --mode macromolecules`.

- **Set up.** Run `node $D load --text 'PEPTIDE1{A}$$$$V2.0' --type HELM`, `node $D click --testid layout-mode`, `node $D click --testid flex-layout-mode`, `node $D click --testid PEPTIDES-TAB`. Export `ket`: one node, no `connections`.
- **Find the target.** Run `node $D state --testid monomer`. Its `offset` is the monomer centre (about `-591, -426` in the run that mapped this). R2 is about 28 px to the right of the centre at 100% zoom.
- **Drop.** Run `node $D drag --from-testid A___Alanine --to-dx <dx+30> --to-dy <dy> --hold-ms 500 --shot during-drag.png`. The screenshot shows the attachment-point circles on the target. Export `ket`: two nodes and one connection from `monomer1` R1 to `monomer0` R2. `node $D state --testid monomer-connection-modal` shows `exists: false`. Export `seq1`: `AA`.
- **Undo.** Run `node $D press --key ControlOrMeta+z`. Export `ket`: one node, no `connections`.

## Gotchas

- Drop within 20 px of the attachment point and more than 20 px from the target's centre. A drop near the centre replaces the monomer instead of bonding.
- A loaded monomer in flex layout sits near the canvas's top-left corner, not at the centre. Always read its `offset` with `state`.
