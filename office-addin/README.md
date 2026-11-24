# Ketcher for PowerPoint (proof of concept)

An Office add-in that opens Ketcher from PowerPoint and puts the drawn structure on a slide.

- **Insert structure** opens Ketcher in a dialog. **Insert into slide** places the structure on the current slide as an SVG picture.
- **Edit selected structure** opens the selected picture in Ketcher again. The picture keeps its source in KET format, so you edit the molecule, not the image. The new picture keeps the old one's position and scale.

Ketcher runs in standalone mode (Indigo compiled to WASM), so the add-in needs no server besides the one that hosts its pages.

## Run it

From the repo root:

```sh
npm install
npm run build:packages            # the add-in uses the built packages
cd office-addin
npm run certs                     # once: trusted HTTPS certificate for localhost
npm start                         # build, then serve on https://localhost:3000
```

`npm run dev` does not work yet: the Vite dev server serves the built `ketcher-core` as is, and one of its modules calls `require`, which the browser does not have. PowerPoint needs the production build that `npm start` serves.

Then load `manifest.xml` into PowerPoint:

- **Mac**: `npm run sideload:mac`, restart PowerPoint, then **Home > Add-ins > Developer Add-ins > Ketcher**. After that, the **Chemical structure** button appears on the **Insert** tab for the rest of the session.
- **Windows**: `npx office-addin-debugging start manifest.xml desktop --app powerpoint`.
- **PowerPoint on the web**: **Insert > Add-ins > Upload My Add-in**, then pick `manifest.xml`.

To try the editor without PowerPoint, open <https://localhost:3000/editor.html>. **Insert into slide** then shows the picture that would go on the slide.

## How it works

| Page            | Role                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `taskpane.html` | Buttons in the PowerPoint task pane. Talks to PowerPoint and opens the dialog.                   |
| `editor.html`   | Ketcher in an Office dialog (the task pane is too narrow). Exports the structure as KET and SVG. |
| `commands.html` | Function file the manifest requires. The ribbon button only opens the task pane.                 |

1. The task pane opens `editor.html?office` with `displayDialogAsync`.
2. The dialog sends `ready`. The task pane answers with `load` and the KET to edit, or `null` for a new structure.
3. **Insert into slide** sends `insert` with the KET and SVG (`ketcher.getKet()`, `ketcher.generateImage(..., { outputFormat: 'svg' })`).
4. The task pane inserts the SVG with `setSelectedDataAsync` (`CoercionType.XmlSvg`) and writes two tags on the new picture: `KETCHER_KET` (the source) and `KETCHER_BASE_WIDTH` (its width at insertion, used to keep the user's scale on the next edit).

Requirements: `PowerPointApi 1.5` and `DialogApi 1.2`.

## Limits of the POC

- The manifest points to `https://localhost:3000`. Hosting the add-in means changing those URLs.
- Only the small-molecule editor. The macromolecules editor is turned off.
- A picture is edited from the task pane, not by double-clicking it. Office.js cannot hook double-click on a picture.
- Pasting the picture into other apps gives a plain picture. Whether a copy inside PowerPoint keeps its tags (and so stays editable) is not checked yet.
- Not tested yet in PowerPoint itself: the size limit of a dialog message and of a tag value for large structures, and WASM in the Office web views (WebView2 on Windows, WKWebView on Mac).
