# Import and export

A user opens a structure by pasting text or choosing a file. They save or copy it in another format. Behavior is owned by [openspec/specs/import-export/spec.md](../../../../openspec/specs/import-export/spec.md).

## Sub-features

- `ie-paste-smiles` opens a SMILES string through the paste dialog.
- `ie-paste-molfile` opens a molfile through the paste dialog.
- `ie-paste-ket` opens a KET document through the paste dialog.
- `ie-export-formats` reads the same structure back as KET, molfile, and SMILES.
- `ie-bad-input` shows an error dialog for text that is not a structure.
- `ie-open-shortcut` opens the Open dialog with `Mod+O`.
- `ie-save-preview` shows the structure in the chosen format in the Save dialog preview.

## How to get to it (user POV)

- Choose `Open` in the top-left toolbar, then `Paste from clipboard` (`open-file-button`, `paste-from-clipboard-button`).
- Press `Mod+O` (Cmd on macOS, Ctrl elsewhere) for the Open dialog.
- Choose `Save` in the top-left toolbar (`save-file-button`). Pick a format in `file-format-list`; each option is `<label>-option`, for example `Daylight SMILES-option`. The text is in `preview-area`.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open.

- **Paste SMILES.** Run `node $D load --text 'c1ccccc1O'`, then `node $D export --format smiles --out before.smi`. It reads an aromatic phenol with 7 heavy atoms (`c1c(O)cccc1` in the build that mapped this).
- **Cross-format read-back.** Run `node $D export --format mol --out after.mol` and `node $D export --format ket --out after.ket`. The molfile counts line reads `7  7`. The KET document has one molecule with 7 atoms.
- **Paste a molfile.** Run `node $D open --mode molecules`, then `node $D load --file ketcher-autotests/tests/test-data/Molfiles-V2000/Chiral.mol`. Export `mol`. The counts line reads `25 28`.
- **Paste KET.** Run `node $D open --mode molecules`, then `node $D load --file ketcher-autotests/tests/test-data/KET/three-bonded-atoms.ket`. Export `smiles`. It reads `BrNO`.
- **Bad input.** Run `node $D load --text 'not a structure'`. The command exits 1 with `Ketcher showed an error dialog: Convert error!`.
- **Shortcut.** Run `node $D canvas-click --dx 300 --dy 200`, `node $D press --key ControlOrMeta+o`, then `node $D state --testid openStructureModal`. It shows `visible: true`. Close it with `node $D click --testid close-window-button`.
- **Save preview.** With phenol loaded, run `node $D click --testid save-file-button`, `node $D click --testid file-format-list`, `node $D click --testid 'Daylight SMILES-option'`, then `node $D state --testid preview-area`. Its `value` equals the `export --format smiles` text. Close with `close-window-button`.

## Gotchas

- Exact SMILES strings depend on the Indigo build. Compare counts, or compare the Save preview with `export` from the same run.
- `load` pastes into an Open dialog and opens as new, so it replaces the canvas. It does not use `Add to Canvas`.
- A SMILES with aromatic atoms may export as a Kekule form such as `C1C=CC=CC=1`. That is not a failure.
- Pick molfiles that need no Indigo service in standalone mode. Formats that call the service (for example some image imports) are remote-only and unverified.
- If `load` fails with a timeout and no error dialog (an empty file leaves `Open as New Project` disabled), the Open dialog stays open. Run `node $D click --testid close-window-button` before the next step.
- In the molecules editor the Save dialog is a generic modal. `save-structure-dialog` exists only in the macromolecules Save dialog.
