# Multi-surface journeys

A user's work often crosses several features: a structure moves between the two editors, or a reaction goes from paste through auto-mapping to the Save dialog. These journeys prove the hand-offs between features. Behavior is owned by the specs of each feature involved: [macromolecules](../../../../openspec/specs/macromolecules/spec.md), [reactions](../../../../openspec/specs/reactions/spec.md), [import-export](../../../../openspec/specs/import-export/spec.md), and [undo-redo](../../../../openspec/specs/undo-redo/spec.md).

## Sub-features

- `j-cross-editor` keeps a monomer chain through a switch to the molecules editor and back.
- `j-reaction-save` carries auto-map numbers from the canvas into the Save dialog preview, and removes them with one undo.

## How to get to it (user POV)

- Switch editors with the mode switcher (`polymer-toggler`, then `molecules_mode` or `macromolecules_mode`) without reloading the page.
- The reaction steps are in [reactions.md](./reactions.md). The Save dialog steps are in [import-export.md](./import-export.md).

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md).

- **Cross-editor.** Run `node $D open --mode macromolecules`, `node $D load --text 'PEPTIDE1{A.C.D}$$$$V2.0' --type HELM`. Export `seq1`: `ACD`. Run `node $D click --testid polymer-toggler`, `node $D click --testid molecules_mode`. `node $D state --testid bonds` is visible. Export `ket`: `root.nodes` still lists three monomers. Switch back with `polymer-toggler` and `macromolecules_mode`. Export `seq1`: `ACD`.
- **Reaction to Save.** Run `node $D open --mode molecules`, `node $D load --text 'CCO>>CC=O'`, then auto-map as in [reactions.md](./reactions.md). Run `node $D click --testid save-file-button`, `node $D click --testid file-format-list`, `node $D click --testid 'MDL Rxnfile V2000-option'`, `node $D state --testid preview-area`. Its `value` starts with `$RXN`, and each atom line carries map numbers `1`, `2`, `3`. Close with `close-window-button`. Run `node $D click --testid undo`. Export `smiles`: `CCO>>CC=O`.

## Gotchas

- `open` reloads the page. Switch editors with the mode switcher when the journey must keep the canvas.
- In the molecules editor, a monomer chain exports as SMILES `***` (one pseudo-atom per monomer). Prove the chain with `ket`, not `smiles`.
