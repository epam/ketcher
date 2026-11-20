# Templates

A user places a ready-made ring or structure on the canvas, or fuses one onto an existing structure. Behavior is owned by [openspec/specs/templates-and-groups/spec.md](../../../../openspec/specs/templates-and-groups/spec.md).

## Sub-features

- `tpl-ring` places a ring from the bottom toolbar.
- `tpl-library` places a structure from the Structure Library dialog.
- `tpl-fg` places a functional group from the library's Functional Groups tab.
- `tpl-attach` fuses a ring onto an existing atom or bond.

## How to get to it (user POV)

- Choose a ring in the bottom toolbar, then click the canvas. Benzene is `template-0`. The others are in `ketcher-autotests/tests/pages/constants/ringButton/Constants.ts`.
- Choose `Structure library` (`template-lib`) for the dialog (`templates-dialog`). Tabs are `template-library-tab`, `functional-groups-tab`, and `salts-and-solvents-tab`. Sections are `<group>-accordion-item`. Items are named by structure, for example `Naphtalene` or `Boc`. Names come from `ketcher-autotests/tests/pages/constants/structureLibraryDialog/Constants.ts`.
- Clicking a library item closes the dialog and makes it the active tool. The next canvas click places it.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open, canvas empty.

- **Place benzene.** Run `node $D export --format smiles --out before.smi` (empty). Run `node $D click --testid template-0`, then `node $D canvas-click`. Export `smiles`: `C1C=CC=CC=1`. Export `mol`: counts `6  6`.
- **Library.** Run `node $D click --testid template-lib`, `node $D click --testid Aromatics-accordion-item`, `node $D click --testid Naphtalene`. `node $D state --testid templates-dialog` shows `exists: false`. Run `node $D canvas-click`. Export `mol`: counts `10 11`.
- **Functional group.** Run `node $D click --testid template-lib`, `node $D click --testid functional-groups-tab`, `node $D click --testid Boc`, `node $D canvas-click`. The `ket` export contains a `Boc` group.
- **Attach to an atom.** Run `node $D open --mode molecules`, `node $D load --text C`, `node $D click --testid template-0`, `node $D canvas-click`. Export `mol`: counts `6  6`, and the SMILES has no `.`.
- **Attach to a bond.** Same with `load --text CC`. Export `mol`: counts `6  6`, one component.

## Gotchas

- The ring tool stays active after the first click. A second click adds another ring or attaches to what is under the pointer.
- Benzene exports as a Kekule form. Do not compare to `c1ccccc1`.
- Items inside a collapsed library section are not rendered. Click the section's `-accordion-item` first.
- The library page object waits on `attach-dialog`. That is the Edit Template dialog. The library dialog is `templates-dialog`.
- A missed attach adds a separate ring: 7 atoms and a `.` in the SMILES.
