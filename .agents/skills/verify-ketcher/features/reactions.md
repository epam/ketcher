# Reactions

A user builds a reaction from reactants, a reaction arrow, plus signs, and products, or pastes one as reaction SMILES. Auto-Mapping numbers matching atoms on both sides. Behavior is owned by [openspec/specs/reactions/spec.md](../../../../openspec/specs/reactions/spec.md).

## Sub-features

- `rxn-paste-export` pastes a reaction SMILES and reads it back as SMILES, RXN, and KET.
- `rxn-reagents` keeps reagents in `A>R>B` through a round trip.
- `rxn-draw` draws a reaction with atom, plus, and arrow tools.
- `rxn-automap` fills in atom-map numbers with the Auto-Mapping dialog.
- `rxn-automap-disabled` disables Auto-Mapping when the canvas has no arrow.

## How to get to it (user POV)

- Left toolbar: `reaction-plus`, the arrow tool (`reaction-arrow-open-angle` by default, list in `arrows-drop-down-button`), and the mapping tool (`reaction-map`; click it again for `reaction-unmap` and `reaction-automap`). IDs come from `ketcher-autotests/tests/pages/molecules/LeftToolbar.ts` and `ketcher-autotests/tests/pages/constants/reactionMappingTool/Constants.ts`.
- Auto-Mapping opens `automap-dialog`. Its Apply button is `OK`; the default mode is Discard.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open.

- **Paste and export.** Run `node $D load --text 'CC>>CO'`. Export `smiles`: `CC>>CO`. Export `rxn`: starts with `$RXN`, counts line `  1  1`. `node $D export --format mol` exits 1 with "cannot be saved as *.MOL due to reaction arrows".
- **Reagents.** Run `node $D open --mode molecules`, `node $D load --text 'C.O>N>CO'`. Export `smiles`: `C.O>N>CO`. The `ket` export's `root.nodes` holds one `arrow` and one `plus`.
- **Draw.** On an empty canvas run `node $D click --testid C-button`, `node $D canvas-click --dx -250`, `node $D canvas-click --dx -150`, `node $D click --testid reaction-plus`, `node $D canvas-click --dx -200`, `node $D click --testid reaction-arrow-open-angle`, `node $D canvas-click --dx -50`, `node $D click --testid C-button`, `node $D canvas-click --dx 150`. Export `smiles`: `C.C>>C`.
- **Auto-map.** Run `node $D open --mode molecules`, `node $D load --text 'CCO>>CC=O'`, `node $D click --testid reaction-map` twice, `node $D click --testid reaction-automap`, `node $D click --testid OK`. Export `smiles`: `[CH3:1][CH2:2][OH:3]>>[CH3:1][CH:2]=[O:3]`.
- **Disabled.** On an empty canvas, click `reaction-map` twice, then `node $D state --testid reaction-automap`: `enabled: false`. Close the list with `press --key Escape`.

## Gotchas

- Auto-Mapping runs in standalone WASM. No Indigo service is needed.
- Keep atoms placed with an atom tool at least 50 px apart. A click near an existing atom replaces it.
- Manual Map and Unmap are not mapped yet. They need a drag between two specific atoms. Report `rxn-map-manual` as `blocked: not mapped`.
