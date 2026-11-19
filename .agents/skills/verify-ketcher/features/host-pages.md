# Host pages

A user embeds Ketcher in a host page: two editors on one page, an editor shown and hidden, an editor in a popup. The pages, which change needs which page, and how to build them are in [modules/example-app.md](../../../../.memory-bank/modules/example-app.md). No OpenSpec spec owns host behavior; the rule is [invariant A8](../../../../.memory-bank/invariants.md).

## Sub-features

- `host-duo`: two editors on one page answer Indigo without a timeout.
- `host-closable`: Hide releases what Show created.
- `host-closable-fast`: Hide right after Show leaves no late error.
- `host-popup`: a feature recipe works inside the popup.

## How to get to it (user POV)

- `http://127.0.0.1:4002/duo`, `/closable`, `/popup` on the production build. The dev server shows the one-editor app on these URLs.
- On `/closable`, the buttons `Show empty` and `Show molecule` mount the editor, and `Hide` unmounts it.

## Driving it with drive.mjs

Preconditions:

- The production build served on port 4002, per _Dependencies_ in [example-app.md](../../../../.memory-bank/modules/example-app.md). Stop the dev server first: both use port 4002. Run `serve` in the background, record its PID, and stop it by that PID during cleanup.
- The browser on the page: `node $D start --url http://127.0.0.1:4002/duo` (or `/closable`, `/popup`).

- **Duo.** Run `node $D open --mode molecules`. `node $D state --testid top-toolbar` shows `count: 4` (two editors). `node $D workers` shows one worker per struct service. Run `node $D wait --ms 40000`, then `node $D state --testid info-modal-window` shows `exists: false` and `node $D errors` is empty.
- **Closable.** Run `node $D open --no-ketcher`, then three cycles of `node $D click --role button --name "Show empty"` and `node $D click --role button --name Hide`. `node $D workers` shows `created` equal to `terminated`.
- **Closable, fast Hide.** Click `Show empty`, then `Hide` at once. Run `node $D wait --ms 40000`: `info-modal-window` does not exist and `node $D errors` is empty.
- **Popup.** Run `node $D open --mode molecules`, then the feature recipe for the change.

## Gotchas

- `open` waits for `window.ketcher`. On `/closable` no editor exists before Show, so plain `open` times out after 90 s; use `open --no-ketcher`.
- On `/duo`, `export` reads the editor that initialized last. `click` and `state` act on the first visible match.
- `workers` counts from the last `open`, because `open` reloads the page.
- An error that fires after 30 s is the struct service timeout. Run `wait --ms 40000` before a pass.
