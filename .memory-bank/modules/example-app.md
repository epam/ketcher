# example app

## Responsibility

`example/` is the host app the repo runs Ketcher in: for development, for the Playwright suite, and for `verify-ketcher`. It embeds the React `Editor` the way a real host does. Each **host page** embeds it differently, so each one exercises a different editor lifecycle.

## Public Interfaces

Host pages. Each loads its own entry (`example/vite.config.js`, `htmlPages`). All four wrap the app in React `StrictMode`, so in dev every editor mounts twice.

| Page            | Entry             | What it hosts                                                                                | Add it to `index` when the change touches                                                                                        |
| --------------- | ----------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`    | `App.tsx`         | one editor                                                                                   | (the default for every change)                                                                                                   |
| `duo.html`      | `DuoApp.tsx`      | two editors on one page                                                                      | state shared across editors: module-level variables, caches, singletons, the struct service, the Indigo worker, global listeners |
| `closable.html` | `ClosableApp.tsx` | an editor that `Show empty` and `Show molecule` mount and `Hide` unmounts; none at page load | mount, unmount, `destroy()`, effect cleanup, a resource the editor owns (worker, timer, listener)                                |
| `popup.html`    | `PopupApp.tsx`    | one editor inside a Material UI `Dialog`, 680 x 680 px minimum                               | layout, sizing, or overlays that depend on the editor's container                                                                |

Modes: `standalone` (Indigo as WASM in the browser) and `remote` (an Indigo service), set by `MODE`. Scripts: `dev:standalone`, `build:standalone`, `serve:standalone` (port 4002), and the `remote` twins (port 4001).

## Dependencies

- The dev server aliases `ketcher-core`, `ketcher-react`, `ketcher-macromolecules`, and `ketcher-standalone` to their source.
- The production build also takes the four packages from source, except `ketcher-standalone/dist/binaryWasm`, which it reads from the built `dist`. Build the package first:
  ```sh
  (cd packages/ketcher-standalone && npm run build)
  (cd example && npm run build:standalone)   # writes example/dist/standalone
  (cd example && npm run serve:standalone)
  ```

## Dependents

- `verify-ketcher` drives the host pages; its recipes are in `.agents/skills/verify-ketcher/features/host-pages.md`.
- `ketcher-autotests`: the `chromium-popup` project runs on `popup.html`, the `chromium` project on `index.html`.

## Assumptions & Constraints

- The dev server serves `/src/index.tsx` for every `*.html` page, so `duo.html`, `closable.html`, and `popup.html` in dev show the one-editor app. A check on the wrong page looks like a pass. Use the production build for them.
- `serve` redirects `/closable.html` to `/closable`, and `example/serve.json` routes each short URL (`/duo`, `/closable`, `/popup`) to its page. Any other path serves `index.html`, so a new host page needs its own rewrite.
- Every page sets `window.ketcher` in the editor's `onInit`. On `duo` both editors set it, so it holds the editor that initialized last.
- A host page tests the rule in [invariant A8](../invariants.md): each editor owns its resources.
