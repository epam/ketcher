# office-addin

## Responsibility

`office-addin/` is a proof-of-concept host app: a PowerPoint add-in (Office.js) that embeds the React `Editor` in an Office dialog and places the drawn structure on a slide as an SVG picture. The picture keeps its KET source in shape tags, so it can be opened in Ketcher again. The [README](../../office-addin/README.md) covers running and sideloading it.

## Public Interfaces

- `manifest.xml`: XML add-in manifest for the `Presentation` host. A ribbon button on the Insert tab opens the task pane. Requires `PowerPointApi 1.5` and `DialogApi 1.2`.
- Pages: `taskpane.html` (PowerPoint calls, opens the dialog), `editor.html` (the editor; `?office` marks an Office dialog), `commands.html` (function file the manifest requires).
- Dialog protocol (`src/shared/messages.ts`): the dialog sends `ready`, the task pane answers `load` with the KET or `null`, the dialog ends with `insert` (KET and SVG) or `cancel`.
- Shape tags: `KETCHER_KET` (source) and `KETCHER_BASE_WIDTH` (width at insertion, so an edit keeps the user's scale).

## Dependencies

- Built `dist` of `ketcher-core`, `ketcher-react`, `ketcher-macromolecules`, and `ketcher-standalone/dist/binaryWasm`. Unlike `example/`, it does not alias the packages to source: run `npm run build:packages` first.
- `office.js` from the Microsoft CDN, loaded by each page.

## Dependents

None. Nothing in the repo imports it, and `npm test` at the root does not run it. `npm run test:types` does.

## Assumptions & Constraints

- Office loads add-ins only over trusted HTTPS; the dev server reads the `office-addin-dev-certs` certificate and falls back to HTTP without it.
- The manifest URLs point to `https://localhost:3000`.
- Outside PowerPoint, `editor.html` works as a plain page and shows the picture that would go on the slide; the task pane only shows a hint.
