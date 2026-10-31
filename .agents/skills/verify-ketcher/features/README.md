# Ketcher verification map

This directory is the maintained source for verifying the user-facing behavior of Ketcher in the app. Read the index before driving, then use the matching feature file as the recipe. The WHEN/THEN behavior lives in the OpenSpec specs. These files link to them and do not copy them.

## Baseline preconditions

- A server started by this run: `node .agents/skills/verify-ketcher/scripts/server.mjs start`. Standalone mode, `http://127.0.0.1:4002/index.html`.
- `server.mjs doctor` printed `READY`.
- A browser session: `node $D start`, where `D=.agents/skills/verify-ketcher/scripts/drive.mjs`.
- Start every recipe from `node $D open --mode molecules` (or `macromolecules` when the file says so). That reloads the page, so the canvas is empty.
- Never drive a server this run did not start.

## Driving conventions

- Run everything through `drive.mjs`. Test IDs come from `ketcher-autotests/tests/pages/`.
- Load structures with `load`, which uses the Open dialog paste box. Use `--type` only in the macromolecules editor.
- Click on the canvas with `canvas-click`. Offsets are pixels from the canvas center. The browser viewport is 1600x1000, so keep offsets within about 300 px.
- Read state with `export`. Compare `before` and `after`.
- Atom coordinates in exports can change between runs and Indigo versions. Compare SMILES or atom and bond counts, not raw coordinates, unless the recipe says otherwise.

## Proof and skip reporting

- Evidence layout and the result format are in [SKILL.md](../SKILL.md#evidence).
- Record the feature file and the entry point you used with every artifact.
- Report an unreachable path with the command you tried and the unmet precondition.
- Do not report a skipped entry point as verified through another path.
- Remote mode is unverified. Report it as `blocked` unless an Indigo service answered the doctor check.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It links the OpenSpec spec that owns the behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with drive.mjs` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and the observable result.
4. `Gotchas` lists traps that can waste or invalidate a run.

Keep implementation details out. Name only user paths, stable handles, required state, commands, and observable proof.

## Features

- [Import and export](./import-export.md) covers pasting structures in and reading them back in other formats.
- [Undo and redo](./undo-redo.md) covers the toolbar buttons and the keyboard.
- [Atom editing](./atom-editing.md) covers placing atoms with an atom tool.
- [Templates](./templates.md) covers placing a ring template from the bottom toolbar.
- [Macromolecules](./macromolecules.md) covers loading and exporting monomer structures in the macromolecules editor.
