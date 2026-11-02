# Templates

A user places a ready-made ring or structure on the canvas. Behavior is owned by [openspec/specs/templates-and-groups/spec.md](../../../../openspec/specs/templates-and-groups/spec.md).

## Sub-features

- `tpl-ring` places a ring from the bottom toolbar.
- `tpl-library` places a structure from the Structure Library dialog.
- `tpl-attach` attaches a ring to an existing atom or bond.

## How to get to it (user POV)

- Choose a ring in the bottom toolbar, then click the canvas. Benzene is `template-0`. The others are in `ketcher-autotests/tests/pages/constants/ringButton/Constants.ts`.
- Choose `Structure library` (`template-lib`) for the full list.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open, canvas empty.

- **Place benzene.** Run `node $D export --format smiles --out before.smi` (empty). Run `node $D click --testid template-0`, then `node $D canvas-click`. Run `node $D export --format smiles --out after.smi`. It reads a six-carbon ring, for example `C1C=CC=CC=1`. Export `mol`: 6 atoms, 6 bonds.
- **Library.** Not mapped yet. The recipe needs the structure library page object. Report `tpl-library` as `blocked: not mapped`.
- **Attach.** Not mapped yet. Needs atom coordinates from the KET export mapped to canvas pixels. Report `tpl-attach` as `blocked: not mapped`.

## Gotchas

- The ring tool stays active after the first click. A second click adds another ring or attaches to what is under the pointer.
- Benzene exports as a Kekule form. Do not compare to `c1ccccc1`.
