# Ketcher [![npm version](https://img.shields.io/npm/v/ketcher-react)](https://www.npmjs.com/package/ketcher-react) [![Downloads](https://img.shields.io/npm/dm/ketcher-react)](https://www.npmjs.com/package/ketcher-react) [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Ketcher is an open source, web-based chemical structure editor that offers high performance, good portability and the ability to easily integrate into a custom web application. Ketcher is designed for chemists, laboratory scientists, and researchers who draw molecules, biomolecules and reactions.

## Key Features

- :arrow_right: Support for Reactions: Reaction centres, flags, mapping, ability to add catalysts, reaction conditions and other information.
- :cyclone: Stereochemistry Support: Support for stereo-labels R/S, r/s, or E/Z, as well as enhanced stereochemistry markings of AND and OR
- 🔩 Support for S-groups and R-groups.
 S-Groups: generic, SRU polymers, multiple groups, 
superatoms, and data S-Groups. R-groups: R-Sites and R-Fragments, attachment point 
specification and R-Logic.
- :floppy_disk: Support for all Common File Formats - KET, MDL Molfiles/SCSR (v2000 and v3000), SDF, RDF, SMARTS, SMILES, Extended SMILES, InChi, CDXML, Sequence, FASTA, IDT, HELM, BILN, etc.
- :memo: Template and Monomer Libraries: Template library with more than 450 structures 
(templates, functional groups, salts, and solvents). Monomer library with more than 850 monomers (peptide, RNA (sugars, bases, phosphates etc.), and CHEM).
- 🛠️ JavaScript API - Allows programmatic access to Ketcher functions including loading and saving structures in supported formats, structure modifications, properties calculation, processing Ketcher events etc.
- ⚡️ Fast 2D structure representation that satisfies common chemical drawing standards
- :diamond_shape_with_a_dot_inside: 3D structure visualization
- :anchor: Ability to add atom and bond basic properties and query features; to add aliases and Generic groups
- :loop: Storing history of actions, with the ability to rollback to previous state
- :microscope: Zoom in/out, hotkeys, cut/copy/paste
- :crystal_ball: OCR - ability to recognize structures at pictures (image files) and reproduce them
- :clipboard: Copy and paste between different chemical editors
- :camera: Use of SVG to achieve best quality in-browser chemical structure rendering
- :telescope: Built-in 3D viewer [miew-react](https://github.com/epam/miew/tree/master/packages/miew-react)

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


## Packages

| Project                                                                                               | Status                                                                                                                      | Description                                                                       |
|-------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| [ketcher-core](https://github.com/epam/ketcher/tree/master/packages/ketcher-core)                     | [![npm version](https://badge.fury.io/js/ketcher-core.svg)](https://www.npmjs.com/package/ketcher-core)                     | Core functionality: domain, shared services, functions and interface declarations |
| [ketcher-standalone](https://github.com/epam/ketcher/tree/master/packages/ketcher-standalone)         | [![npm version](https://badge.fury.io/js/ketcher-standalone.svg)](https://www.npmjs.com/package/ketcher-standalone)         | Contains only the functionality necessary to start Ketcher in standalone mode     |
| [ketcher-react](https://github.com/epam/ketcher/tree/master/packages/ketcher-react)                   | [![npm version](https://badge.fury.io/js/ketcher-react.svg)](https://www.npmjs.com/package/ketcher-react)                   | Package contains only the functionality necessary to define components.           |
| [ketcher-macromolecules](https://github.com/epam/ketcher/tree/master/packages/ketcher-macromolecules) | [![npm version](https://badge.fury.io/js/ketcher-macromolecules.svg)](https://www.npmjs.com/package/ketcher-macromolecules) | Package contains the macromolecules editor functionality and UI components        |

## Documentation

- [API Reference](./documentation/api-reference.md)
- [Configuration](./documentation/configuration.md)
- [Error Handling](./documentation/error-handling.md)
- [Help](./documentation/help.md)
- [Integration Guide](./documentation/integration-guide.md)
- [Macromolecules](./documentation/macromolecules.md)
- [Supported formats](./documentation/supported-formats.md)
- [Usage examples](./documentation/usage-examples.md)

## Contribution

See [Contributing Guide](./DEVNOTES.md).

## License

[Apache 2.0](LICENSE)

Please read [LICENSE](LICENSE) and [NOTICE](NOTICE) for details.

Copyright (c) 2021 [EPAM Systems, Inc.](https://www.epam.com/)
