# Ketcher [![npm version](https://img.shields.io/npm/v/ketcher-react)](https://www.npmjs.com/package/ketcher-react) [![Downloads](https://img.shields.io/npm/dm/ketcher-react)](https://www.npmjs.com/package/ketcher-react) [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Ketcher is an open-source web-based chemical structure editor incorporating high performance, good portability, light weight, and ability to easily integrate into a custom web-application. Ketcher is designed for chemists, laboratory scientists and technicians who draw structures and reactions.

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

- as a [react component library](https://www.npmjs.com/package/ketcher-react)
- as ready-to-run application (to find desired version please look at Assets block of [releases](https://github.com/epam/ketcher/releases)). The application can be injected as IFrame or a separate page.

## FAQ

### How to use react component library

Look at the following [link](packages/ketcher-react/README.md) for details.

### Configure indigo service

You can find the instruction for service installation
[here](http://lifescience.opensource.epam.com/indigo/service/index.html).

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
The last checked version - [1.0.0](https://www.npmjs.com/package/miew-react).

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


## Ketcher API
Ketcher can return drawn structures using the following methods:

`getSmiles(isExtended = false): Promise<string>` – returns `string` representation of drawn structure in SMILES format.
Parameters: `isExtended: boolean`. By default, `false`. Indicates, whether extended SMILES format needs to be used.

`getMolfile(molfileFormat): Promise<string>` – returns `string` representation of drawn structure in MOL-format.
Parameters: `molfileFormat: 'v2000' | 'v3000'`. Optional, by default, 'auto'. Indicates, in which format result will be returned. If no desired format is provided, then it is chosen automatically, depending on drawn structure.

`getRxn(molfileFormat): Promise<string>` – returns `string` representation of drawn structure in RXN-format.
Parameters: `molfileFormat: 'v2000' | 'v3000'`. Optional, by default, 'v2000'. Indicates, in which format result will be returned.

`getKet(): Promise<string>` – returns `string` representation of drawn structure in internal Ket-format.

`getSmarts(): Promise<string>` – returns `string` representation of drawn structure in Smarts-format.

`getCml(): Promise<string>` – returns `string` representation of drawn structure in Cml-format.

`getSdf(molfileFormat): Promise<string>` – returns `string` representation of drawn structure in Sdf-format.
Parameters: `molfileFormat: 'v2000' | 'v3000'`. Optional, by default, 'v2000'. Indicates, in which format result will be returned.

`getCDXml(): Promise<string>` – returns `string` representation of drawn structure in CDXml-format.

`getCDX(): Promise<string>` – returns `string` representation of drawn structure in CDX-format.

`getInchi(withAuxInfo = false): Promise<string>` – returns `string` representation of drawn structure in Inchi-format.
Parameters: `withAuxInfo: boolean`. Optional, by default, `false`.

`getInchiKey(): Promise<string>` – returns `string` representation of drawn structure in InChiKey-format.

`containsReaction(): boolean` – returns `true`, in case drawn structure contains reaction; `false` otherwise.

`isQueryStructureSelected(): boolean` – returns `true`, in case selected structure has query.

`setMolecule(structure: string, options?: Object): Promise<void>` – draws passed structure on the canvas. Before drawing passed structure, current structure will be removed. The editor viewport will automatically adjust to fit all structures after insertion.

Parameters:

- `structure: string`. Structure is a string in any supported format.
- `options?: { position?: { x: number, y: number } }`. – (Optional) "position" - coordinates of top left corner of inserted structure in angstroms. Y coordinate value increases from bottom to top.

`addFragment(structure: string, options?: Object): Promise<void>` – adds the given structure to the canvas without altering the current structure. The editor viewport will automatically adjust to fit all structures after insertion.

Parameters: 
- `structure: string`. Structure is a string in any supported format. 
- `options?: { position?: { x: number, y: number } }`. – (Optional) "position" - coordinates of top left corner of inserted structure in angstroms. Y coordinate value increases from bottom to top.

`layout(): Promise<void>` – performs layout algorithm for drawn structure.

`recognize(image: Blob, version?: string): Promise<Struct>` – recognizes a structure from image.
Parameters: `image: Blob` – image to recognize. Returns `Struct` – object, which represents recognized structure.

```
generateImage(data: string, options: {
    outputFormat: 'png' | 'svg';
    backgroundColor: string;
    bondThickness: number;
}): Promise<Blob>
```
Generates image from passed structure.
Parameters:
    `data` – `string` representation of structure in any supported format.
    `options` – object with the following properties:
        * `outputFormat` – can be 'png' or 'svg'
        * `backgroundColor` – image background color
        * `bondThickness` – thickness of bonds in output structure

`updateMonomersLibrary(monomersData: string | JSON): void` – given the monomers data, perform upsert operation for the built-in monomers library in the macromolecules editor. Might be invoked only when macromolecules editor is turned on. Update (replace) operation is performed for the particular monomer if its alias and class are matching with the existing one. Otherwise, insert operation is performed.
Parameters: `monomersData: string | JSON` – monomers description in KET format being formatted as either JSON notation or this JSON being stringified to be more concise.

## Settings

You can add extra configuration in editor.setSettings

**Allowed parameters:**
- disableQueryElements: Disable the elements from the Extended Table
```js
ketcher.setSettings({ "disableQueryElements": ["Pol", "CYH", "CXH"] })
```

- general.dearomatize-on-load: Dearomatize the molecule when ketcher application starts
```js
ketcher.setSettings({ "general.dearomatize-on-load": true })
```

- ignoreChiralFlag: Ignore the chiral flag from .mol files
```js
ketcher.setSettings({ "ignoreChiralFlag": true })
```

## Contribution

See [Contributing Guide](./DEVNOTES.md).

## License

[Apache 2.0](LICENSE)

Please read [LICENSE](LICENSE) and [NOTICE](NOTICE) for details.

Copyright (c) 2021 [EPAM Systems, Inc.](https://www.epam.com/)
