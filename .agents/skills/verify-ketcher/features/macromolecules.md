# Macromolecules

A user switches to the macromolecules editor and works with peptides, RNA, DNA, and CHEM monomers. Behavior is owned by [openspec/specs/macromolecules/spec.md](../../../../openspec/specs/macromolecules/spec.md).

## Sub-features

- `mm-switch` switches the editor between molecules and macromolecules.
- `mm-load-helm` opens a HELM string.
- `mm-export` reads the chain back as sequence, FASTA, and KET.
- `mm-sequence-mode` edits the chain in sequence mode.
- `mm-bad-input` shows an error dialog for text that does not parse.

## How to get to it (user POV)

- Open the mode switcher in the top-right toolbar (`polymer-toggler`) and choose `Macromolecules` (`macromolecules_mode`).
- Choose `Open`, then `Paste from clipboard`. Pick the content type in the dropdown (`dropdown-select`).
- Sequence mode is under the layout mode control (`layout-mode`). Its page object is `ketcher-autotests/tests/pages/macromolecules/MacromoleculesTopToolbar.ts`.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md), but `node $D open --mode macromolecules`.

- **Switch.** Run `node $D open --mode macromolecules`. It exits 0 once the layout mode control shows. `mm-switch` passes on that.
- **Load HELM.** Run `node $D export --format seq1 --out before.txt` (empty). Run `node $D load --text 'PEPTIDE1{A.C.D}$$$$V2.0' --type HELM`.
- **Read back.** Run `node $D export --format seq1 --out after.txt`. It reads `ACD`. Run `node $D export --format fasta --out after.fasta` and `node $D export --format ket --out after.ket`. The KET lists three monomer nodes.
- **Sequence mode.** Not mapped yet. Report `mm-sequence-mode` as `blocked: not mapped`.
- **Bad input.** Run `node $D load --text 'garbage' --type HELM`. It exits 1 with `Ketcher showed an error dialog`.

## Gotchas

- Without `--type`, the paste dialog keeps its default type (`Ket Format`) and a HELM string fails with a parse error. Always pass `--type` here. The option labels are the `MacroFileType` enum in `ketcher-autotests/tests/utils/canvas/types.ts`.
- The JS API has no HELM export. See [SKILL.md](../SKILL.md#drive).
- `getSmiles` and molfile exports are molecules-editor views. Use `seq1`, `fasta`, `idt`, or `ket` for monomer chains.
