# Ketcher [![npm version](https://img.shields.io/npm/v/ketcher-react)](https://www.npmjs.com/package/ketcher-react) [![Downloads](https://img.shields.io/npm/dm/ketcher-react)](https://www.npmjs.com/package/ketcher-react) [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Ketcher is an open-source web-based chemical structure editor incorporating high performance, good portability, light weight, and ability to easily integrate into a custom web-application. Ketcher is designed for chemists, laboratory scientists and technicians who draw structures and reactions.

## Table of Contents

- [Key Features](#key-features)
- [Installation and usage](#installation-and-usage)
- [FAQ](#faq)
- [Packages](#packages)
- [3D Viewer](#3d-viewer)
- [Macromolecules mode](#macromolecules-mode)
- [API Reference](#api-reference)
- [Browser Compatibility](#browser-compatibility)
- [Localization (i18n)](#localization-i18n)
- [Contribution](#contribution)
- [Community Projects & Integrations](#community-projects--integrations)
- [License](#license)

## Key Features

- ⚡️ Fast 2D structure representation that satisfies common chemical drawing standards
- :diamond_shape_with_a_dot_inside: 3D structure visualization
- :memo: Template library (including custom and user's templates)
- 🔩 Add atom and bond basic properties and query features, add aliases and Generic groups
- :cyclone: Stereochemistry support during editing, loading, and saving chemical structures
- :loop: Storing history of actions, with the ability to rollback to previous state
- :floppy_disk: Ability to load and save structures and reactions in MDL Molfile or RXN file format, InChI String, ChemAxon Extended SMILES, ChemAxon Extended CML file formats
- :microscope: Zoom in/out, hotkeys, cut/copy/paste
- :crystal_ball: OCR - ability to recognize structures at pictures (image files) and reproduce them
- :clipboard: Copy and paste between different chemical editors
- 🛠️ Settings support (Rendering, Displaying, Debugging)
- :camera: Use of SVG to achieve best quality in-browser chemical structure rendering
- 🌐 Localized UI (English, Simplified Chinese, Spanish) with a live language switcher in Settings

### Editor builtin tools:

- Atom Tool, Bond Tool, and Template Tool to draw and edit structures
- Aromatize/De-aromatize Tool
- Calculate CIP Descriptors Tool
- Structure Check Tool
- MW and Structure Parameters Calculate Tool
- Select, modify, and erase connected and unconnected atoms and bonds using Selection Tool, or using Shift key
- Advanced Structure Clean up Tool (+ stereochemistry checking and structure layout)
- Simple Structure Clean up Tool (checks bonds length, angles and spatial arrangement of atoms)
- Easy to use R-Group and S-Group tools (Generic, Multiple group, SRU polymer, peratom, Data S-Group)
- Reaction Tool (reaction generating, manual and automatic atom-to-atom mapping)
- Flip/Rotate Tool

## Installation and usage

At this moment Ketcher can be embedded into your application in two ways:

- as ready-to-run application (to find desired version please look at Assets block of [releases](https://github.com/epam/ketcher/releases)). The application can be injected as IFrame or a separate page.
- as a [react component library](https://www.npmjs.com/package/ketcher-react)

> **Note:** Ketcher no longer publishes a single UMD `ketcher.min.js`/`.css` bundle, so loading it
> via a CDN `<script>`/`<link>` tag (as shown in some older, third-party guides) is not supported.
> Use one of the two methods above instead.

### Installation

```bash
npm install ketcher-core ketcher-react
```

### Basic Setup

```javascript
import { Editor } from 'ketcher-react';
import { StandaloneStructServiceProvider } from 'ketcher-standalone';

import 'ketcher-react/dist/index.css';

const structServiceProvider = new StandaloneStructServiceProvider();

function App() {
  return (
    <Editor
      staticResourcesUrl="/public"
      structServiceProvider={structServiceProvider}
      onInit={(ketcher) => {
        window.ketcher = ketcher;
      }}
    />
  );
}
```

### Accessing Ketcher embedded via IFrame

When you embed the ready-to-run standalone application as an `IFrame` (rather than using
`ketcher-react` as a component library), Ketcher initializes **asynchronously** inside the
frame (loading the Indigo service/WASM, etc.). Because of this, `window.ketcher` inside the
frame is only assigned once initialization finishes — reading
`iframeEl.contentWindow.ketcher` right after the frame's `load` event (or immediately after
inserting the `<iframe>`) will typically still be `undefined`.

To reliably know when the embedded Ketcher is ready, listen for the `init` message that the
standalone application posts to its parent window once `onInit` has fired, instead of polling
`contentWindow.ketcher`:

```javascript
const iframeEl = document.getElementById('ifKetcher');

window.addEventListener('message', (event) => {
  if (event.source !== iframeEl.contentWindow) return;
  if (event.data?.eventType === 'init') {
    const ketcher = iframeEl.contentWindow.ketcher;
    // ketcher is now guaranteed to be initialized
  }
});
```

## FAQ

### How to use react component library

Look at the following [link](packages/ketcher-react/README.md) for details.

### Configure indigo service

You can find the instruction for service installation
[here](https://lifescience.opensource.epam.com/indigo/service/index.html).

## Packages

| Project                                                                                               | Status                                                                                                                      | Description                                                                       |
|-------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| [ketcher-core](https://github.com/epam/ketcher/tree/master/packages/ketcher-core)                     | [![npm version](https://badge.fury.io/js/ketcher-core.svg)](https://www.npmjs.com/package/ketcher-core)                     | Core functionality: domain, shared services, functions and interface declarations |
| [ketcher-standalone](https://github.com/epam/ketcher/tree/master/packages/ketcher-standalone)         | [![npm version](https://badge.fury.io/js/ketcher-standalone.svg)](https://www.npmjs.com/package/ketcher-standalone)         | Contains only the functionality necessary to start Ketcher in standalone mode     |
| [ketcher-react](https://github.com/epam/ketcher/tree/master/packages/ketcher-react)                   | [![npm version](https://badge.fury.io/js/ketcher-react.svg)](https://www.npmjs.com/package/ketcher-react)                   | Package contains only the functionality necessary to define components.           |
| [ketcher-macromolecules](https://github.com/epam/ketcher/tree/master/packages/ketcher-macromolecules) | [![npm version](https://badge.fury.io/js/ketcher-macromolecules.svg)](https://www.npmjs.com/package/ketcher-macromolecules) | Package contains the macromolecules editor functionality and UI components        |

## 3D Viewer

Ketcher uses Miew-React for viewing and editing data in 3D.

You can find the latest version of Miew-React [here](https://github.com/epam/miew/tree/master/packages/miew-react).
The last checked version - [0.12.0](https://www.npmjs.com/package/miew-react).

## Macromolecules mode
Starting with version 3.0, Ketcher supports a new control in the top toolbar that allows switching to macromolecules editing mode. If you prefer having only small molecules editing mode available, you can remove the mode switcher from the toolbar by passing `disableMacromoleculesEditor` property to the `Editor` component.

```js
import { Editor } from 'ketcher-react';

const App = () => {
  return (
    <Editor
      {/* ...rest of the properties */}
      disableMacromoleculesEditor
    />
  );
};
```

Please refer to the `example/src/App.tsx` file for a complete example of how to integrate Ketcher editor into your application.

## API Reference

The full API reference — export/import methods, editor operations, view control, settings, events, the React component API, and service providers — is in **[documentation/api.md](documentation/api.md)**.

## Browser Compatibility

Ketcher supports modern browsers:

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

**Requirements:**
- ES6+ JavaScript support
- WebAssembly support (for standalone mode)
- SVG rendering

---

## Localization (i18n)

Details on multi-language support and how to opt in to the `KETCHER_MULTI_LANGUAGE_BUILD` are in **[documentation/localization.md](documentation/localization.md)**.

## Contribution

See [Contributing Guide](./DEVNOTES.md).

## Community Projects & Integrations
- https://github.com/Marco-Matlock/Excel-Addin - Excel plugin to run Ketcher on a task pane as an Office Addin
- https://github.com/katalystnord/ketcher-desktop - Desktop application for Ketcher made on electron
- https://github.com/yulei-chen/obsidian-ketcher - An Obsidian plugin to view or draw chemical structures and reactions using Ketcher

## License

[Apache 2.0](LICENSE)

Please read [LICENSE](LICENSE) and [NOTICE](NOTICE) for details.

Copyright (c) 2021 [EPAM Systems, Inc.](https://www.epam.com/)
