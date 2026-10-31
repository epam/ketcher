---
name: verify-ketcher
description: 'Launch the Ketcher example app, drive it in a real browser the way a user does, and prove behavior with exported structures, screenshots, and console errors. Use to confirm a change works in the app, for "verify in the app", or to fill the "Verified in the app" section of a PR.'
---

# Verify Ketcher in the app

Ketcher is a web editor. A user draws on a canvas and uses toolbars and dialogs. This skill starts the example app, drives it with Playwright, and reads the structure back through the Ketcher JS API. The structure text is the proof. A screenshot alone is not.

Read [features/README.md](features/README.md) first. Then open the feature file for what you changed. Its recipe tells you which commands to run.

## Modes

- **standalone** (default). Indigo runs as WASM in the browser. Needs nothing else. URL `http://127.0.0.1:4002/index.html`.
- **remote**. Indigo runs as a separate service. URL `http://127.0.0.1:4001/index.html`. Needs a reachable Indigo service passed as `--api`. **Unverified**: no run has proven this path, because it needs Docker or another Indigo host. Report it as blocked when you cannot reach one. Do not report remote proof from a standalone run.

Use remote only when the change touches the remote struct service, the `/v2` client, or Indigo-service-only behavior.

## Launch

The app starts with the Vite dev server (`example/vite.config.js`). It serves the package sources live, so no build is needed and the `dist` folders in the packages can be stale without harm. A fresh start takes a few seconds. Do not use `npm run serve:*`: it serves `example/dist`, which is not built by default.

```sh
node .agents/skills/verify-ketcher/scripts/server.mjs start                      # standalone, port 4002
node .agents/skills/verify-ketcher/scripts/server.mjs start --mode remote --api http://INDIGO_HOST:PORT/v2   # remote, port 4001
```

`start` refuses when the port is taken. It records the PID it started in `.verify-ketcher/server.json`. Ready means `index.html` answers 200. The app itself is ready only when `drive.mjs open` sees `window.ketcher`. The first open after a cold start can take 30 s while Vite optimizes dependencies. Do not request `/`: Vite answers 404 there. Use `/index.html`.

Do not drive an instance you did not start. If a server already listens on the port, pick `--port` or stop and ask. Do not kill it.

## Doctor

Run this first, and again whenever anything looks off. It only reads.

```sh
node .agents/skills/verify-ketcher/scripts/server.mjs doctor
```

It checks: the PID is alive, the port is listened on by that PID, `index.html` answers, the checkout is still on the commit the server started on, the server started after the newest product commit, and (remote only) the Indigo service answers `<api>/indigo/info`. Exit 1 means do not drive. Stop and start again.

## Drive

`drive.mjs` keeps one headless Chromium page in a background daemon, so commands share state and the console log. Each command prints one JSON line and exits 0 or 1.

```sh
D=.agents/skills/verify-ketcher/scripts/drive.mjs
node $D start                                  # headless; add --headed to watch; --url for another URL
node $D open --mode molecules                  # or macromolecules
node $D load --text 'CCO'                      # paste dialog, as a user would; autodetects the format
node $D load --file path/to/x.ket              # same, from a file's text
node $D load --text 'PEPTIDE1{A.C.D}$$$$V2.0' --type HELM   # macromolecules: pick the content type
node $D click --testid undo                    # or --role button --name "Undo"; --nth N for repeats
node $D canvas-click --dx 0 --dy 0             # the active tool acts at that canvas point
node $D press --key ControlOrMeta+z       # not Control: macOS needs Meta; focus the canvas first
node $D export --format ket --out FILE         # ket mol mol3000 smiles extsmiles smarts cml rxn sdf inchi inchikey cdxml fasta idt axolabs seq1 seq3
node $D screenshot --out FILE
node $D errors --out FILE                      # console errors, page errors, failed requests, HTTP >= 400
node $D stop                                   # closes the browser and the daemon
```

Rules:

- Take test IDs from `ketcher-autotests/tests/pages/`. The map in `scripts/drive.mjs` copies the stable ones and names the source file of each. Do not invent IDs. Look the control up in the page objects first.
- Load structures through the paste dialog. Use `--via api` only to set up a state that is not under test, and say so in the evidence.
- `load` fails when Ketcher shows an error dialog, and it closes the dialog. An app error dialog is not a console error, so do not wait for `errors` to show it.
- Reading the structure back with `export` calls the Ketcher API. That is allowed for proof. Making the change with the API is not.
- There is no HELM export in the JS API. To prove HELM output, open the Save dialog through the UI (`save-file-button`) and read its preview area.
- The page is not a Playwright test. Wait with the commands above, not with sleeps.

## Evidence

Evidence goes in `.verify-ketcher/evidence/<run-id>/<feature-id>/`. `.verify-ketcher/` is in `.gitignore`. Cleanup never touches it. Use a run id such as `$(date +%Y%m%d-%H%M%S)`.

For each feature you drive, record:

1. **Steps.** The `drive.mjs` commands in order (save them as `steps.sh` or in `result.md`).
2. **Structure before.** `export --out before.<ext>`, taken before the action.
3. **Structure after.** `export --out after.<ext>`, taken after it. Add a second, read-only format when one exists (for example `ket` and `smiles`).
4. **Screenshot.** `screenshot --out after.png`.
5. **Console errors.** `errors --out errors.json`. Any entry is a finding unless you can say why it is unrelated.
6. **Result.** `pass`, `fail`, or `blocked`, plus the reason. Put it in `result.md`.

Proof standards:

- Drive the real user path. Click the toolbar, open the dialog, press the keys.
- Capture the action and the state it produced. A final screen alone is not proof.
- Compare before and after. A structure that was already right before the action proves nothing.
- Report what you could not reach as `blocked`, with the command you tried and the missing precondition. Never turn a failed journey into a pass by changing it.

In the PR description, add a section titled **Verified in the app**. Name each feature, the mode, the result, and what the exported structure showed. Say what was not verified (remote mode, other features).

## Cleanup

Stop only what this run started. Never kill by process name.

```sh
node $D stop
node .agents/skills/verify-ketcher/scripts/server.mjs stop
```

`server.mjs stop` ends only the PID in `.verify-ketcher/server.json`, then deletes that file. Run both after every attempt, passed or failed. `.verify-ketcher/evidence/` stays. If `drive.mjs stop` reports no session but a Chromium is still running, read the daemon PID from `.verify-ketcher/session/daemon.json` and kill that PID only.

## Isolation

One Vite server per port, one browser daemon per `--dir`. Two runs side by side need different `--port` for the server and a different `--dir` for `drive.mjs`. The app keeps its settings in the browser's local storage, and each run starts a fresh browser context, so runs do not share state.
