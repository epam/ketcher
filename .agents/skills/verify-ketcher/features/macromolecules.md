# Macromolecules

A user switches to the macromolecules editor and works with peptides, RNA, DNA, and CHEM monomers: loads them, types sequences, inserts monomers from the library, and changes the layout. Behavior is owned by [openspec/specs/macromolecules/spec.md](../../../../openspec/specs/macromolecules/spec.md).

## Sub-features

- `mm-switch` switches the editor between molecules and macromolecules.
- `mm-load-helm` opens a HELM string.
- `mm-export` reads the chain back as sequence, FASTA, and KET.
- `mm-sequence-mode` types a chain in sequence mode.
- `mm-library-insert` inserts a monomer from the library in sequence mode.
- `mm-layout-switch` switches between sequence, snake, and flex layouts.
- `mm-bad-input` shows an error dialog for text that does not parse.

## How to get to it (user POV)

- Open the mode switcher in the top-right toolbar (`polymer-toggler`) and choose `Macromolecules` (`macromolecules_mode`).
- Choose `Open`, then `Paste from clipboard`. Pick the content type in the dropdown (`dropdown-select`).
- A blank canvas opens in sequence layout. Pick the typing type (`RNABtn`, `DNABtn`, `PEPTIDEBtn`), click the canvas, and type letters.
- The library tabs are `PEPTIDES-TAB`, `RNA-TAB`, `CHEM-TAB`. Cards are `<Symbol>___<Name>`, for example `A___Alanine` (`ketcher-autotests/tests/pages/constants/monomers/`).
- The layout control is `layout-mode`. Its options are `sequence-layout-mode`, `snake-layout-mode`, `flex-layout-mode` (`ketcher-autotests/tests/pages/macromolecules/MacromoleculesTopToolbar.ts`).

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md), but `node $D open --mode macromolecules`.

- **Switch.** Run `node $D open --mode macromolecules`. It exits 0 once the layout control shows. `mm-switch` passes on that.
- **Load HELM.** Run `node $D export --format seq1 --out before.txt` (empty). Run `node $D load --text 'PEPTIDE1{A.C.D}$$$$V2.0' --type HELM`.
- **Read back.** Export `seq1`: `ACD`. Export `fasta`: `>Sequence1` then `ACD`. Export `ket`: `root.nodes` lists `monomer0`, `monomer1`, `monomer2`.
- **Sequence mode.** Run `node $D open --mode macromolecules`, `node $D click --testid PEPTIDEBtn`, `node $D canvas-click --dx 100 --dy 100`, then `node $D press --key a`, `--key c`, `--key d`. Export `seq1`: `ACD`.
- **Library insert.** On a fresh canvas, run `node $D click --testid PEPTIDEBtn`, `node $D click --testid PEPTIDES-TAB`, `node $D click --testid A___Alanine --y-from-bottom 10`. Export `seq1`: `A`. In edit mode after typing `ac`, the same click gives `ACA`.
- **Layout.** Run `node $D click --testid layout-mode`, then `node $D click --testid flex-layout-mode`. `node $D state --testid sequence-layout-mode` shows `exists: false` and `flex-layout-mode` is visible.
- **Bad input.** Run `node $D load --text 'garbage' --type HELM`. It exits 1 with `Ketcher showed an error dialog`.

## Gotchas

- Without `--type`, the paste dialog keeps its default type (`Ket Format`) and a HELM string fails with a parse error. Always pass `--type` here. The option labels are the `MacroFileType` enum in `ketcher-autotests/tests/utils/canvas/types.ts`.
- The JS API has no HELM export. See [SKILL.md](../SKILL.md#drive).
- `getSmiles` and molfile exports are molecules-editor views. Use `seq1`, `fasta`, `idt`, or `ket` for monomer chains.
- The typing type is saved in local storage. Click `PEPTIDEBtn` or `RNABtn` before typing.
- Click monomer cards with `--y-from-bottom 10`. A centre click lands on the card's own controls and inserts nothing.
- In sequence layout a library card cannot be dragged onto the canvas. Placing by drag needs flex or snake layout; see [drag-drop-bond-establishment.md](./drag-drop-bond-establishment.md).
