# KET Format Specification

**Version:** Based on Ketcher 3.14.0
**Schema:** JSON Schema Draft-07
**Purpose:** Internal native format for Ketcher chemical structure editor

## Table of Contents

1. [Overview](#overview)
2. [Document Structure](#document-structure)
3. [Data Types](#data-types)
4. [Coordinate System](#coordinate-system)
5. [Structure Elements](#structure-elements)
6. [Reactions](#reactions)
7. [Graphical Objects](#graphical-objects)
8. [Macromolecules](#macromolecules)
9. [Examples](#examples)
10. [Validation](#validation)

---

## Overview

**KET (Ketcher Format)** is a JSON-based chemical structure format designed as the native internal format for the Ketcher chemical structure editor. It supports:

- Small organic molecules with full stereochemistry
- Reactions with mapping and multi-tailed arrows
- R-groups (Markush structures)
- S-groups (superatoms, polymers, data groups)
- Query features for substructure searching
- Macromolecules (peptides, nucleic acids)
- Graphical objects (shapes, text, images)
- 3D coordinates (optional z-coordinate)

### Key Features

- **Human-readable JSON** format
- **Comprehensive chemical information** preservation
- **Lossless round-trip** conversion within Ketcher
- **Extensible** for future features
- **Validation** via JSON Schema

---

## Document Structure

### Root Object

Every KET file must have a `root` object containing a `nodes` array that references molecules, reactions, and graphical objects.

```json
{
  "root": {
    "nodes": [
      { "$ref": "mol0" },
      { "$ref": "rg1" },
      { "type": "arrow", "data": {...} }
    ]
  },
  "mol0": { ... },
  "rg1": { ... }
}
```

### Required Properties

- **`root`** (object, required): Container for all document elements
  - **`nodes`** (array, required): Array of node references or inline objects

### Optional Top-Level Properties

- **`header`** (object): Document metadata
  - **`moleculeName`** (string): Name of the molecule
- **`mol{N}`** (object): Molecule definitions (pattern: `^mol\\d+`)
- **`rg{N}`** (object): R-group definitions (pattern: `^rg[1-9]\\d*`)

---

## Data Types

### Point (2D/3D Coordinates)

Coordinates are in **Angstrom-like units**. Y-axis increases from bottom to top.

```typescript
{
  "x": number,      // required
  "y": number,      // required
  "z": number       // optional, for 3D structures
}
```

**Alternative format** for compact representation:
```json
"location": [x, y]           // 2D
"location": [x, y, z]        // 3D
```

---

## Coordinate System

- **Units**: Angstrom-like (not pixels)
- **Origin**: Arbitrary; relative positioning matters
- **Y-axis**: Increases from bottom to top (mathematical convention)
- **Z-axis**: Optional; used for 3D viewer and stereochemistry

---

## Structure Elements

### Molecule

A molecule is a collection of atoms and bonds with optional properties.

```json
{
  "type": "molecule",
  "atoms": [ ... ],
  "bonds": [ ... ],
  "sgroups": [ ... ],
  "stereoFlagPosition": { "x": number, "y": number },
  "highlight": [ ... ],
  "selection": [ ... ],
  "properties": [ {"key": string, "value": string}, ... ]
}
```

### Atom

Atoms are the fundamental building blocks with extensive property support.

#### Basic Atom

```json
{
  "label": "C",                    // Element symbol (required)
  "location": [x, y, z],           // Position (2D or 3D)
  "charge": 0,                     // Formal charge (-1000 to 1000)
  "isotope": 0,                    // Isotope mass (0 = natural)
  "radical": 0,                    // Radical state (0,1,2,3)
  "alias": "Ph",                   // Display alias
  "selected": false                // Selection state
}
```

#### Stereochemistry Properties

```json
{
  "stereoParity": 0,               // 0=none, 1=odd, 2=even, 3=either
  "stereoLabel": "abs",            // "abs", "&1", "or1", etc.
  "cip": "R",                      // CIP descriptor: "R", "S", "r", "s"
  "invRet": 0                      // Inversion/retention (0,1,2)
}
```

#### Valence and Hydrogen

```json
{
  "explicitValence": -1,           // -1=auto, 0-12=explicit
  "hCount": 0,                     // Explicit H count (0-10, -1=auto)
  "implicitHCount": 0              // Implicit H count (0-9)
}
```

#### Query Properties

For substructure searching:

```json
{
  "queryProperties": {
    "aromaticity": "aromatic",     // "aromatic" or "aliphatic"
    "ringMembership": 6,           // Ring count (0-9)
    "ringSize": 6,                 // Size of smallest ring (0-9)
    "connectivity": 3,             // Number of connections (0-9)
    "chirality": "clockwise",      // "clockwise" or "anticlockwise"
    "customQuery": "string"        // Custom query expression
  }
}
```

#### Reaction Mapping

```json
{
  "mapping": 1,                    // Atom-to-atom mapping number (≥0)
  "exactChangeFlag": true          // Exact change flag for reactions
}
```

#### R-Group Attachment

```json
{
  "attachmentPoints": 1            // Attachment point flag (0,1,2,3)
}
```

### Atom List

Alternative representation for query structures:

```json
{
  "type": "atom-list",
  "location": [x, y, z],
  "elements": ["C", "N", "O"],     // List of allowed elements
  "notList": false,                // If true, NOT these elements
  "attachmentPoints": 0
}
```

### R-Site

R-group labels in Markush structures:

```json
{
  "type": "rg-label",
  "location": [x, y, z],
  "$refs": ["rg-1", "rg-2"],       // References to R-groups
  "attachmentPoints": 0
}
```

### Bond

Bonds connect two atoms with specified properties.

#### Basic Bond Types

```json
{
  "type": 1,                       // Bond type (required)
  "atoms": [0, 1],                 // Atom indices (required)
  "stereo": 0,                     // Stereochemistry
  "topology": 0,                   // 0=either, 1=ring, 2=chain
  "center": 0                      // Stereo center marking
}
```

#### Bond Types (type property)

| Value | Meaning |
|-------|---------|
| 1 | Single |
| 2 | Double |
| 3 | Triple |
| 4 | Aromatic |
| 5 | Single or Double |
| 6 | Single or Aromatic |
| 7 | Double or Aromatic |
| 8 | Any |
| 9 | Dative (coordinate) |
| 10 | Hydrogen |
| 11 | Dative (from generic) |
| 12 | Dative (to generic) |

#### Stereochemistry (stereo property)

| Value | Meaning |
|-------|---------|
| 0 | None |
| 1 | Up (wedge) |
| 3 | Down (hash) |
| 4 | Either |
| 6 | Cis/Trans |

#### CIP Descriptors for Bonds

```json
{
  "cip": "E"                       // "E" or "Z" for double bonds
}
```

#### Query Bond

Alternative format for custom queries:

```json
{
  "atoms": [0, 1],
  "customQuery": "string"          // Custom query expression
}
```

---

## S-Groups

S-groups (Structural groups) provide advanced annotations.

### S-Group Types

- **GEN** - Generic group
- **MUL** - Multiple group (repeating unit count)
- **SRU** - Structural Repeating Unit (polymer)
- **SUP** - Superatom (abbreviation)
- **DAT** - Data group (attached data)
- **queryComponent** - Query component
- **COP** - Copolymer

### Generic S-Group

```json
{
  "type": "GEN",
  "atoms": [0, 1, 2]               // Atom indices in group
}
```

### Multiple Group

```json
{
  "type": "MUL",
  "atoms": [0, 1, 2],
  "mul": 3                         // Repetition count (1-1000)
}
```

### SRU Polymer

```json
{
  "type": "SRU",
  "atoms": [0, 1, 2],
  "subscript": "n",                // Single letter [a-zA-Z]
  "connectivity": "HT"             // "HT"=head-to-tail, "HH", "EU"
}
```

### Superatom

```json
{
  "type": "SUP",
  "atoms": [0, 1, 2],
  "name": "Ph",                    // Display name
  "expanded": false,               // Expansion state
  "id": 1,                         // Unique ID
  "attachmentPoints": [
    {
      "attachmentAtom": 0,         // Atom index inside group
      "leavingAtom": 1,            // Leaving group atom
      "attachmentId": "R1"         // Attachment point label
    }
  ]
}
```

### Data S-Group

Attach arbitrary data to structure elements:

```json
{
  "type": "DAT",
  "atoms": [0, 1],
  "bonds": [0],
  "context": "Fragment",           // Context type
  "fieldName": "Molecular Formula",
  "fieldValue": "C6H12O6",
  "display": true,                 // Show on canvas
  "placement": true                // Auto-placement
}
```

---

## R-Groups (Markush Structures)

R-groups define variable positions in molecules.

### R-Group Definition

```json
{
  "type": "rgroup",
  "rlogic": {
    "number": 1,                   // R-group number (≥1)
    "range": ">3",                 // Occurrence range (string)
    "resth": false,                // H at unoccupied sites
    "ifthen": 0                    // Conditional dependency (≥0)
  },
  "fragments": [                   // Alternative fragments
    {
      "atoms": [ ... ],
      "bonds": [ ... ]
    }
  ]
}
```

### R-Group Logic

- **number**: R-group identifier (R1, R2, etc.)
- **range**: Occurrence specification (e.g., ">3", "1-5")
- **resth**: Whether to add H to unoccupied R-sites
- **ifthen**: If-then logic (if R(ifthen) present, then this R must be present)

---

## Reactions

### Reaction Arrow

```json
{
  "type": "arrow",
  "data": {
    "mode": "open-angle",          // Arrow style
    "pos": [                       // Arrow endpoints
      { "x": 5, "y": 5, "z": 0 },
      { "x": 10, "y": 5, "z": 0 }
    ],
    "height": 1.0                  // Arrow head height
  },
  "selected": false
}
```

### Reaction Plus

```json
{
  "type": "plus",
  "location": [x, y, z],
  "selected": false
}
```

### Multi-Tailed Arrow

For pathway reactions:

```json
{
  "type": "multi-tailed-arrow",
  "data": {
    "head": {
      "position": { "x": 10, "y": 5, "z": 0 }
    },
    "spine": {
      "pos": [
        { "x": 5, "y": 3, "z": 0 },
        { "x": 5, "y": 7, "z": 0 }
      ]
    },
    "tails": {
      "pos": [
        { "x": 4, "y": 3, "z": 0 },
        { "x": 4, "y": 5, "z": 0 },
        { "x": 4, "y": 7, "z": 0 }
      ]
    }
  }
}
```

---

## Graphical Objects

### Simple Objects

Geometric shapes for annotations:

```json
{
  "type": "simpleObject",
  "data": {
    "mode": "rectangle",           // "line", "rectangle", "circle", "ellipse", "polyline"
    "pos": [
      { "x": 0, "y": 0, "z": 0 },
      { "x": 5, "y": 5, "z": 0 }
    ]
  },
  "selected": false
}
```

**Polyline** (multiple points):

```json
{
  "type": "simpleObject",
  "data": {
    "mode": "polyline",
    "pos": [
      { "x": 0, "y": 0 },
      { "x": 2, "y": 3 },
      { "x": 5, "y": 1 }
    ]
  }
}
```

### Text Object

```json
{
  "type": "text",
  "data": {
    "content": "Hello World",
    "pos": [{ "x": 5, "y": 5, "z": 0 }]
  },
  "selected": false
}
```

### Image Object

Embed PNG or SVG images:

```json
{
  "type": "image",
  "format": "image/png",           // "image/png" or "image/svg+xml"
  "boundingBox": {
    "x": 0,
    "y": 0,
    "z": 0,
    "width": 100,
    "height": 100
  },
  "data": "base64-encoded-image-data"
}
```

---

## Macromolecules

### Monomer Node

Monomers represent amino acids, nucleotides, sugars, bases, phosphates, and other building blocks:

```json
{
  "type": "monomer",
  "id": "monomer-1",
  "seqid": 0,
  "position": { "x": 5, "y": 5 },
  "alias": "A",
  "templateId": "A___Alanine"
}
```

### Connections

Bonds between monomers and atoms:

```json
{
  "connectionType": "single",      // "single" or "hydrogen"
  "endpoint1": {
    "monomerId": "monomer-1",
    "attachmentPointId": "R1"
  },
  "endpoint2": {
    "monomerId": "monomer-2",
    "attachmentPointId": "R2"
  }
}
```

### Templates

Monomer templates define the chemical structure:

```json
{
  "type": "monomerTemplate",
  "id": "A___Alanine",
  "class": "AminoAcid",
  "classHELM": "PEPTIDE",
  "alias": "A",
  "name": "Alanine",
  "fullName": "(2S)-2-aminopropanoic acid",
  "naturalAnalogShort": "A",
  "attachmentPoints": [
    {
      "attachmentAtom": 3,
      "leavingGroup": {
        "atoms": [1]
      },
      "type": "left"
    }
  ],
  "atoms": [ ... ],
  "bonds": [ ... ]
}
```

---

## Examples

### Example 1: Simple Molecule (Ethane)

```json
{
  "root": {
    "nodes": [
      { "$ref": "mol0" }
    ]
  },
  "mol0": {
    "type": "molecule",
    "atoms": [
      {
        "label": "C",
        "location": [0, 0, 0]
      },
      {
        "label": "C",
        "location": [1.5, 0, 0]
      }
    ],
    "bonds": [
      {
        "type": 1,
        "atoms": [0, 1]
      }
    ]
  }
}
```

### Example 2: Molecule with Stereochemistry

```json
{
  "root": {
    "nodes": [{ "$ref": "mol0" }]
  },
  "mol0": {
    "type": "molecule",
    "atoms": [
      {
        "label": "C",
        "location": [0, 0, 0],
        "stereoParity": 1,
        "cip": "R"
      },
      {
        "label": "H",
        "location": [0, 1, 0]
      },
      {
        "label": "Br",
        "location": [1, 0, 0]
      },
      {
        "label": "Cl",
        "location": [0, -1, 0]
      },
      {
        "label": "F",
        "location": [-1, 0, 0]
      }
    ],
    "bonds": [
      { "type": 1, "atoms": [0, 1], "stereo": 1 },
      { "type": 1, "atoms": [0, 2] },
      { "type": 1, "atoms": [0, 3] },
      { "type": 1, "atoms": [0, 4] }
    ]
  }
}
```

### Example 3: Simple Reaction

```json
{
  "root": {
    "nodes": [
      { "$ref": "mol0" },
      { "type": "arrow", "data": { "mode": "open-angle", "pos": [{"x": 5, "y": 0}, {"x": 7, "y": 0}] }},
      { "type": "plus", "location": [8, 0, 0] },
      { "$ref": "mol1" }
    ]
  },
  "mol0": {
    "type": "molecule",
    "atoms": [{ "label": "H", "location": [0, 0, 0], "mapping": 1 }]
  },
  "mol1": {
    "type": "molecule",
    "atoms": [{ "label": "H", "location": [10, 0, 0], "mapping": 1 }]
  }
}
```

### Example 4: Query Structure with Atom List

```json
{
  "root": {
    "nodes": [{ "$ref": "mol0" }]
  },
  "mol0": {
    "type": "molecule",
    "atoms": [
      {
        "type": "atom-list",
        "location": [0, 0, 0],
        "elements": ["C", "N", "O"],
        "notList": false
      },
      {
        "label": "C",
        "location": [1.5, 0, 0],
        "queryProperties": {
          "aromaticity": "aromatic",
          "ringSize": 6
        }
      }
    ],
    "bonds": [
      {
        "atoms": [0, 1],
        "customQuery": "single or double"
      }
    ]
  }
}
```

---

## Validation

KET files should be validated against the JSON Schema located at:
```
packages/ketcher-core/src/domain/serializers/ket/schema.json
```

### Common Validation Rules

1. **Root object is required** with `nodes` array
2. **Atom indices** in bonds must reference valid atoms
3. **Bond types** must be integers 1-12 or use `customQuery`
4. **Coordinates** must be numbers (x, y required; z optional)
5. **References** (`$ref`) must point to existing molecule/R-group IDs
6. **S-group atoms** must reference valid atom indices
7. **Attachment points** values must be 0, 1, 2, or 3

### Validation Tools

In Ketcher codebase:
```typescript
import { validate } from 'domain/serializers/ket/validate';

const isValid = validate(ketObject);
```

---

## Best Practices

1. **Always include z-coordinate** (set to 0 if 2D) for consistency
2. **Use meaningful molecule IDs** (mol0, mol1, ...) in order
3. **Preserve all properties** during conversions to avoid data loss
4. **Set stereoParity and cip** together for chiral centers
5. **Use attachmentPoints** for template definitions
6. **Validate before saving** to catch structural errors
7. **Pretty-print JSON** for human readability (2-space indentation)

---

## Version History

- **3.14.0** - Current version with macromolecules support
- **3.0.0** - Added macromolecules mode
- **2.x** - Enhanced S-groups and query features
- **1.x** - Initial KET format release

---

## References

- **Ketcher GitHub**: https://github.com/epam/ketcher
- **JSON Schema**: http://json-schema.org/draft-07/schema
- **Schema Location**: `packages/ketcher-core/src/domain/serializers/ket/schema.json`
- **Serializer Implementation**: `packages/ketcher-core/src/domain/serializers/ket/`

---

## License

KET format specification follows the Ketcher license:
**Apache License 2.0**
Copyright (c) 2021 EPAM Systems, Inc.
