# Import and export

A user opens a structure by pasting text or choosing a file. They save or copy it in another format. Behavior is owned by [openspec/specs/import-export/spec.md](../../../../openspec/specs/import-export/spec.md).

## Sub-features

- `ie-paste-smiles` opens a SMILES string through the paste dialog.
- `ie-paste-molfile` opens a molfile through the paste dialog.
- `ie-paste-ket` opens a KET document through the paste dialog.
- `ie-export-formats` reads the same structure back as KET, molfile, and SMILES.
- `ie-bad-input` shows an error dialog for text that is not a structure.

## How to get to it (user POV)

- Choose `Open` in the top-left toolbar, then `Paste from clipboard` (`open-file-button`, `paste-from-clipboard-button`).
- Press `Ctrl+O` for the Open dialog.
- Choose `Save` in the top-left toolbar for the export preview (`save-file-button`).

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open.

- **Paste SMILES.** Run `node $D load --text 'c1ccccc1O'`. Then `node $D export --format smiles --out before.smi`. It reads `c1c(O)cccc1`.
- **Cross-format read-back.** Run `node $D export --format mol --out after.mol` and `node $D export --format ket --out after.ket`. The molfile atom count line shows 7 atoms and 7 bonds. The KET document has one molecule with 7 atoms.
- **Paste a molfile.** Run `node $D open --mode molecules`, then `node $D load --file FILE.mol` with `ketcher-autotests/tests/test-data/Molfiles-V2000/Chiral.mol`. Export `smiles` and `mol`. The atom and bond counts match the file header (25 atoms, 28 bonds).
- **Paste KET.** Same with a small file from `ketcher-autotests/tests/test-data/KET/`. Export `ket` and compare the atom count. Some files in that folder hold thousands of monomers: check the size first (`ls -S`).
- **Bad input.** Run `node $D load --text 'not a structure'`. The command exits 1 with `Ketcher showed an error dialog`. Mark it `pass` for this sub-feature only when the dialog appears.

## Gotchas

- Raw coordinates change between Indigo builds. Compare counts and SMILES.
- `load` pastes into an Open dialog and opens as new, so it replaces the canvas. It does not use `Add to Canvas`.
- A SMILES with aromatic atoms may export as a Kekule form such as `C1C=CC=CC=1`. That is not a failure.
- Pick molfiles that need no Indigo service in standalone mode. Formats that call the service (for example some image imports) are remote-only and unverified.
- If `load` fails with a timeout and no error dialog (an empty file leaves `Open as New Project` disabled), the Open dialog stays open. Run `node $D click --testid close-window-button` before the next step.
