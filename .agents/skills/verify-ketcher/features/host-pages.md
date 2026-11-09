# Host pages

A host page is one way an app embeds Ketcher. The example app ships four, and each one creates and removes the `Editor` differently. All four wrap the app in React `StrictMode`, so in dev every editor mounts twice. No OpenSpec spec owns host behavior; the lifecycle rules live in [invariant A8](../../../../.memory-bank/invariants.md) and in the modules [ketcher-react](../../../../.memory-bank/modules/ketcher-react.md) and [ketcher-standalone](../../../../.memory-bank/modules/ketcher-standalone.md).

## Sub-features

Pick pages by what the change touches. `index` is the default for every change.

- `host-index`: one editor. Covers every feature recipe.
- `host-duo`: two editors on one page. Add it when the change touches state shared across editors: module-level variables, caches, singletons, the struct service, the Indigo worker, global listeners.
- `host-closable`: the editor mounts on Show and unmounts on Hide. Add it when the change touches mount, unmount, `destroy()`, cleanup in effects, or a resource the editor owns (a worker, a timer, a listener).
- `host-popup`: the editor inside a Material UI `Dialog` with a 680 x 680 px minimum. Add it when the change touches layout, sizing, or overlays that depend on the editor's container.

## How to get to it (user POV)

- `index.html`, `duo.html`, `closable.html`, `popup.html` in `example/`. Each loads its own entry: `App.tsx`, `DuoApp.tsx`, `ClosableApp.tsx`, `PopupApp.tsx` (`example/vite.config.js`, `htmlPages`).
- On `closable`, the buttons `Show empty` and `Show molecule` mount the editor, and `Hide` unmounts it.

## Driving it with drive.mjs

Preconditions:

- `index` runs on the dev server from [SKILL.md](../SKILL.md#launch). `duo`, `closable`, and `popup` run only on a production build:
  ```sh
  (cd packages/ketcher-standalone && npm run build)   # the production build reads its dist; other packages come from source
  (cd example && npm run build:standalone)             # writes example/dist/standalone
  (cd example && npm run serve:standalone)             # port 4002; run in the background and record its PID
  ```
  Stop the dev server first: both use port 4002. Stop `serve` by its PID during cleanup.
- Start the browser on the page: `node $D start --url http://127.0.0.1:4002/duo` (or `/closable`, `/popup`).

- **Duo, no lost replies.** Run `node $D open --mode molecules`. `node $D state --testid top-toolbar` shows `count: 4` (two editors). `node $D workers` shows one worker per struct service. Run `node $D wait --ms 40000`, then `node $D state --testid info-modal-window` shows `exists: false` and `node $D errors` is empty.
- **Closable, release on Hide.** Run `node $D open --no-ketcher`, then three cycles of `node $D click --role button --name "Show empty"` and `node $D click --role button --name Hide`. After the cycles, `node $D workers` shows `created` equal to `terminated`.
- **Closable, Hide right after Show.** Click `Show empty`, then `Hide` at once, before Indigo answers. Run `node $D wait --ms 40000`: no error dialog, `node $D errors` is empty.
- **Popup.** Run `node $D open --mode molecules`, then the feature recipe for the change.

## Gotchas

- The dev server serves `/src/index.tsx` for every `*.html` page, so `duo.html` and `closable.html` in dev show the plain one-editor app. A wrong page looks like a pass.
- `serve` redirects `/closable.html` to `/closable`. Use the short URLs.
- `open` waits for `window.ketcher`. On `closable` no editor exists before Show, so plain `open` times out after 90 s; use `open --no-ketcher`.
- On `duo`, both editors set `window.ketcher` in `onInit`, so `export` reads the editor that initialized last. `click` and `state` act on the first visible match.
- `workers` counts from the last `open`, because `open` reloads the page.
- An error that fires after 30 s is the struct service timeout. Run `wait --ms 40000` before a pass.
