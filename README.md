# Ketcher

[![npm version](https://img.shields.io/npm/v/ketcher-react)](https://www.npmjs.com/package/ketcher-react)
[![Downloads](https://img.shields.io/npm/dm/ketcher-react)](https://www.npmjs.com/package/ketcher-react)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Copyright (c) 2020 [EPAM Systems, Inc.](https://www.epam.com/)

Ketcher is an open-source web-based chemical structure editor incorporating high performance, good portability, light weight, and ability to easily integrate into a custom web-application. Ketcher is designed for chemists, laboratory scientists and technicians who draw structures and reactions.

## Key Features

- Fast 2D structure representation that satisfies common chemical drawing standards
- 3D structure visualization
- Draw and edit structures using major tools: Atom Tool, Bond Tool, and Template Tool
- Template library (including custom and user's templates)
- Add atom and bond basic properties and query features, add aliases and Generic groups
- Select, modify, and erase connected and unconnected atoms and bonds using Selection Tool, or using Shift key
- Simple Structure Clean up Tool (checks bonds length, angles and spatial arrangement of atoms) and Advanced Structure Clean up Tool (+ stereochemistry checking and structure layout)
- Aromatize/De-aromatize Tool
- Calculate CIP Descriptors Tool
- Structure Check Tool
- MW and Structure Parameters Calculate Tool
- Stereochemistry support during editing, loading, and saving chemical structures
- Storing history of actions, with the ability to rollback to previous state
- Ability to load and save structures and reactions in MDL Molfile or RXN file format, InChI String, ChemAxon Extended SMILES, ChemAxon Extended CML file formats
- Easy to use R-Group and S-Group tools (Generic, Multiple group, SRU polymer, peratom, Data S-Group)
- Reaction Tool (reaction generating, manual and automatic atom-to-atom mapping)
- Flip/Rotate Tool
- Zoom in/out, hotkeys, cut/copy/paste
- OCR - ability to recognize structures at pictures (image files) and reproduce them
- Copy and paste between different chemical editors
- Settings support (Rendering, Displaying, Debugging)
- Use of SVG to achieve best quality in-browser chemical structure rendering
- Languages: JavaScript with third-party libraries

## Installation and usage

At this moment Ketcher library is available as an [react component library](https://www.npmjs.com/package/ketcher-react) and [zip archive](https://lifescience.opensource.epam.com/download/ketcher.html):

### How to use react component library

Look at the following [link](packages/ketcher-react/README.md) for details.

### Configure indigo service

You can find the instruction for service installation
[here](http://lifescience.opensource.epam.com/indigo/service/index.html).

### 3D Viewer

Ketcher uses Miew for viewing and editing data in 3D.
You can find the latest version of viewer [here](https://github.com/epam/miew).
The last checked version - [0.9.0](https://github.com/epam/miew/releases/tag/v0.9.0).

## Contributing

For more details please read [DEVNOTES](DEVNOTES.md).

## License

Please read [LICENSE](LICENSE) and [NOTICE](NOTICE) for details.
