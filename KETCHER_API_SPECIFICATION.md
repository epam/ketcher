# Ketcher JavaScript API Specification

**Version:** Based on Ketcher 3.14.0
**Purpose:** Complete reference for the public JavaScript API of Ketcher chemical structure editor

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Initialization](#initialization)
4. [Structure Export Methods](#structure-export-methods)
5. [Structure Import Methods](#structure-import-methods)
6. [Editor Operations](#editor-operations)
7. [View Control](#view-control)
8. [Settings Management](#settings-management)
9. [Event System](#event-system)
10. [React Component API](#react-component-api)
11. [Macromolecules Mode](#macromolecules-mode)
12. [Type Definitions](#type-definitions)
13. [Service Providers](#service-providers)
14. [Supported Formats](#supported-formats)
15. [Usage Examples](#usage-examples)

---

## Overview

Ketcher exposes a comprehensive JavaScript API through the global `window.ketcher` object. The API provides methods for:

- Loading and exporting chemical structures in multiple formats
- Programmatic editor operations (layout, calculation, recognition)
- Event subscriptions for tracking changes
- Configuration and customization
- Macromolecules and small molecules editing

**Key Classes:**
- **Ketcher** - Main API entry point (`ketcher-core`)
- **KetcherBuilder** - Builder pattern for initialization
- **Editor** - React component wrapper (`ketcher-react`)

---

## Getting Started

### Installation

```bash
npm install ketcher-core ketcher-react
```

### Basic Setup

```javascript
import { Editor } from 'ketcher-react';
import { RemoteStructServiceProvider } from 'ketcher-core';
import 'ketcher-react/dist/index.css';

const structServiceProvider = new RemoteStructServiceProvider(
  'http://localhost:8002'
);

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

---

## Initialization

### KetcherBuilder

The `KetcherBuilder` class provides a fluent API for constructing Ketcher instances.

```typescript
class KetcherBuilder {
  withStructServiceProvider(provider: StructServiceProvider): this
  withEventBus(eventBus: EventEmitter): this
  build(): Ketcher
}
```

**Example:**

```javascript
import { KetcherBuilder, RemoteStructServiceProvider } from 'ketcher-core';

const provider = new RemoteStructServiceProvider('http://localhost:8002');
const ketcher = new KetcherBuilder()
  .withStructServiceProvider(provider)
  .build();
```

### Ketcher Instance Properties

- **`ketcher.id`** `string` - Unique instance identifier
- **`ketcher.editor`** `Editor` - Editor instance (internal)
- **`ketcher.structService`** `StructService` - Structure service for chemical operations
- **`ketcher.indigo`** `Indigo` - Indigo service wrapper
- **`ketcher.formatterFactory`** `FormatterFactory` - Format conversion factory
- **`ketcher.eventBus`** `EventEmitter` - Event bus for custom events

---

## Structure Export Methods

All export methods return `Promise<string>` with the structure in the requested format.

### getSmiles

```typescript
getSmiles(isExtended?: boolean): Promise<string>
```

Returns SMILES (Simplified Molecular Input Line Entry System) representation.

**Parameters:**
- `isExtended` (optional) - Use extended SMILES format (default: `false`)

**Throws:** Error in macromolecules mode

**Example:**
```javascript
const smiles = await ketcher.getSmiles();
// Returns: "C1=CC=CC=C1"

const extended = await ketcher.getSmiles(true);
// Returns extended SMILES with stereochemistry
```

---

### getExtendedSmiles

```typescript
getExtendedSmiles(): Promise<string>
```

Alias for `getSmiles(true)`.

---

### getMolfile

```typescript
getMolfile(molfileFormat?: 'v2000' | 'v3000'): Promise<string>
```

Returns MDL MOL file format.

**Parameters:**
- `molfileFormat` (optional) - MOL file version: `'v2000'`, `'v3000'`, or auto-detect

**Throws:** Error if structure contains reaction arrows (use `getRxn` instead)

**Example:**
```javascript
const mol = await ketcher.getMolfile('v3000');
```

---

### getRxn

```typescript
getRxn(molfileFormat?: 'v2000' | 'v3000'): Promise<string>
```

Returns RXN (Reaction) file format.

**Parameters:**
- `molfileFormat` (optional) - RXN file version (default: `'v2000'`)

**Throws:**
- Error if no reaction arrows present
- Error in macromolecules mode

**Example:**
```javascript
const rxn = await ketcher.getRxn('v3000');
```

---

### getKet

```typescript
getKet(): Promise<string>
```

Returns KET (Ketcher JSON) format - the native internal format.

**Works in both micro and macromolecules modes.**

**Example:**
```javascript
const ket = await ketcher.getKet();
const ketObj = JSON.parse(ket);
```

---

### getSmarts

```typescript
getSmarts(): Promise<string>
```

Returns SMARTS (SMILES Arbitrary Target Specification) representation.

**Throws:** Error in macromolecules mode

---

### getCml

```typescript
getCml(): Promise<string>
```

Returns CML (Chemical Markup Language) format.

**Throws:** Error in macromolecules mode

---

### getSdf

```typescript
getSdf(molfileFormat?: 'v2000' | 'v3000'): Promise<string>
```

Returns SDF (Structure-Data File) format.

**Parameters:**
- `molfileFormat` (optional) - Version (default: `'v2000'`)

**Throws:** Error in macromolecules mode

---

### getRdf

```typescript
getRdf(molfileFormat?: 'v2000' | 'v3000'): Promise<string>
```

Returns RDF (Reaction Data File) format.

**Parameters:**
- `molfileFormat` (optional) - Version (default: `'v2000'`)

**Throws:** Error in macromolecules mode

---

### getCDXml

```typescript
getCDXml(): Promise<string>
```

Returns CDXML (ChemDraw XML) format.

**Throws:** Error in macromolecules mode

---

### getCDX

```typescript
getCDX(): Promise<string>
```

Returns CDX (ChemDraw binary) format as base64-encoded string.

**Throws:** Error in macromolecules mode

---

### getInchi

```typescript
getInchi(withAuxInfo?: boolean): Promise<string>
```

Returns InChI (IUPAC International Chemical Identifier) representation.

**Parameters:**
- `withAuxInfo` (optional) - Include auxiliary information (default: `false`)

**Example:**
```javascript
const inchi = await ketcher.getInchi();
// Returns: "InChI=1S/C6H6/c1-2-4-6-5-3-1/h1-6H"
```

---

### getInChIKey

```typescript
getInChIKey(): Promise<string>
```

Returns InChI Key (hashed InChI).

**Example:**
```javascript
const key = await ketcher.getInChIKey();
// Returns: "UHOVQNZJYSORNB-UHFFFAOYSA-N"
```

---

### getFasta

```typescript
getFasta(): Promise<string>
```

Returns FASTA format for biological sequences.

**Available in macromolecules mode.**

---

### getSequence

```typescript
getSequence(format: '1-letter' | '3-letter'): Promise<string>
```

Returns sequence in 1-letter or 3-letter amino acid/nucleotide format.

**Parameters:**
- `format` - Sequence format: `'1-letter'` or `'3-letter'`

**Example:**
```javascript
const seq = await ketcher.getSequence('1-letter');
// Returns: "ACDEFG"
```

---

### getIdt

```typescript
getIdt(): Promise<string>
```

Returns IDT (Integrated DNA Technologies) format.

---

### getAxoLabs

```typescript
getAxoLabs(): Promise<string>
```

Returns AxoLabs format.

---

## Structure Import Methods

### setMolecule

```typescript
setMolecule(structure: string, options?: SetMoleculeOptions): Promise<void>
```

Loads structure onto canvas, **replacing existing structure**.

**Parameters:**
- `structure` - Structure string (format auto-detected)
- `options` (optional) - Import options

**SetMoleculeOptions:**
```typescript
interface SetMoleculeOptions {
  position?: { x: number; y: number };  // Top-left corner in Angstroms (Y increases upward)
  needZoom?: boolean;                   // Zoom to fit (default: true)
}
```

**Automatically centers and zooms to fit structure.**

**Example:**
```javascript
// Load SMILES
await ketcher.setMolecule('C1=CC=CC=C1');

// Load at specific position
await ketcher.setMolecule('CCO', {
  position: { x: 5, y: 5 },
  needZoom: false
});

// Load MOL file
const molfile = `...`;
await ketcher.setMolecule(molfile);

// Load KET
const ket = JSON.stringify({ root: { nodes: [...] } });
await ketcher.setMolecule(ket);
```

---

### addFragment

```typescript
addFragment(structure: string, options?: SetMoleculeOptions): Promise<void>
```

Adds structure to canvas **without removing existing content**.

**Parameters:** Same as `setMolecule`

**Example:**
```javascript
await ketcher.setMolecule('C1=CC=CC=C1');
await ketcher.addFragment('CCO', { position: { x: 10, y: 0 } });
```

---

### setHelm

```typescript
setHelm(helmStr: string): Promise<void>
```

Loads HELM (Hierarchical Editing Language for Macromolecules) notation structure.

**Example:**
```javascript
await ketcher.setHelm('PEPTIDE1{A.G.F}$$$$V2.0');
```

---

## Editor Operations

### layout

```typescript
layout(): Promise<void>
```

Performs automatic layout algorithm using Indigo service for smart positioning.

**Throws:** Error in macromolecules mode

**Example:**
```javascript
await ketcher.layout();
```

---

### circularLayoutMonomers

```typescript
circularLayoutMonomers(): Promise<void>
```

Arranges monomers in circular layout.

**Only available in macromolecules mode.**

---

### calculate

```typescript
calculate(options?: CalculateData): Promise<CalculateResult>
```

Calculates molecular properties.

**Returns:**
```typescript
interface CalculateResult {
  'molecular-weight': string;
  'most-abundant-mass': string;
  'monoisotopic-mass': string;
  'gross': string;                    // Molecular formula
  'mass-composition': string;
}
```

**Throws:** Error in macromolecules mode

**Example:**
```javascript
const props = await ketcher.calculate();
console.log('Molecular weight:', props['molecular-weight']);
console.log('Formula:', props['gross']);
```

---

### recognize

```typescript
recognize(image: Blob, version?: string): Promise<Struct>
```

OCR: Recognizes chemical structure from image.

**Parameters:**
- `image` - Image blob (PNG, JPG, etc.)
- `version` (optional) - OCR version

**Returns:** `Struct` object (internal structure representation)

**Throws:** Error in macromolecules mode

**Example:**
```javascript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const struct = await ketcher.recognize(file);
```

---

### generateImage

```typescript
generateImage(data: string, options: GenerateImageOptions): Promise<Blob>
```

Generates image from structure string.

**Parameters:**
- `data` - Structure string (any supported format)
- `options` - Image generation options

**GenerateImageOptions:**
```typescript
interface GenerateImageOptions {
  outputFormat: 'png' | 'svg';
  backgroundColor?: string;           // Hex color (default: transparent)
  bondThickness?: number;             // Line thickness in pixels
}
```

**Example:**
```javascript
const blob = await ketcher.generateImage('C1=CC=CC=C1', {
  outputFormat: 'png',
  backgroundColor: '#FFFFFF',
  bondThickness: 2
});

// Create download link
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'molecule.png';
a.click();
```

---

### exportImage

```typescript
exportImage(format: 'svg', params?: ExportImageParams): void
```

Exports current canvas as image file (downloads automatically).

**Parameters:**
- `format` - Currently only `'svg'` supported
- `params` (optional) - Export parameters

**ExportImageParams:**
```typescript
interface ExportImageParams {
  margin?: number;  // Margin around structure in pixels
}
```

**Example:**
```javascript
ketcher.exportImage('svg', { margin: 10 });
```

---

## View Control

### setZoom

```typescript
setZoom(value: number): void
```

Sets zoom level.

**Parameters:**
- `value` - Zoom level (range: 0.2 to 4.0)

**Example:**
```javascript
ketcher.setZoom(1.5);  // 150% zoom
```

---

### setMode

```typescript
setMode(mode: 'flex' | 'snake' | 'sequence'): void
```

Sets macromolecules layout mode.

**Parameters:**
- `mode` - Layout mode:
  - `'flex'` - Flexible layout (default)
  - `'snake'` - Snake (linear) layout
  - `'sequence'` - Sequence editor mode

**Only available in macromolecules mode.**

**Example:**
```javascript
ketcher.setMode('sequence');
```

---

## Settings Management

### setSettings

```typescript
setSettings(settings: Record<string, string | boolean>): void
```

Updates editor settings.

**Supported Settings:**

| Setting | Type | Description |
|---------|------|-------------|
| `general.dearomatize-on-load` | `boolean` | Dearomatize structures on load |
| `ignoreChiralFlag` | `boolean` | Ignore chiral flag from MOL files |
| `disableQueryElements` | `string[]` | Array of query elements to disable (e.g., `['Pol', 'CYH']`) |
| `bondThickness` | `number` | Bond line thickness in pixels |
| `disableCustomQuery` | `boolean` | Disable custom query features |
| `persistMonomerLibraryUpdates` | `boolean` | Persist monomer library changes to localStorage |

**Example:**
```javascript
ketcher.setSettings({
  'general.dearomatize-on-load': false,
  'ignoreChiralFlag': true,
  'bondThickness': 2,
  'disableQueryElements': ['Pol', 'CYH']
});
```

---

### settings (getter)

```typescript
get settings(): Record<string, any>
```

Returns current allowed settings.

**Example:**
```javascript
const currentSettings = ketcher.settings;
console.log(currentSettings);
```

---

## Event System

Ketcher provides an event subscription mechanism for tracking editor changes and library updates.

### Change Event

**Subscribe:**

```typescript
ketcher.editor.subscribe(
  eventName: 'change',
  handler: (eventData: ChangeEvent) => void
): Subscription
```

**Unsubscribe:**

```typescript
ketcher.editor.unsubscribe(
  eventName: 'change',
  subscription: Subscription
): void
```

**Event Data Structure:**

The event data contains operation details:

```typescript
interface ChangeEvent {
  operation: string;      // Operation type (see below)
  [key: string]: any;     // Additional operation-specific data
}
```

**Operation Types (40+ types):**

- **Atom Operations:**
  - `'Add atom'` - `{ id, label, position: {x, y} }`
  - `'Delete atom'` - `{ id, label, position: {x, y} }`
  - `'Move atom'` - `{ id, position: {x, y} }`
  - `'Set atom attribute'` - `{ id, attribute, from, to }`

- **Bond Operations:**
  - `'Add bond'` - `{ id, type, atoms: [id1, id2] }`
  - `'Delete bond'` - `{ id }`
  - `'Set bond attribute'` - `{ id, attribute, from, to }`

- **Fragment Operations:**
  - `'Add fragment'`
  - `'Delete fragment'`

- **S-Group Operations:**
  - `'Add S-group'`
  - `'Delete S-group'`

- **Reaction Operations:**
  - `'Add arrow'`
  - `'Add plus'`

- **Other Operations:**
  - `'Undo'`, `'Redo'`
  - `'Rotate'`, `'Flip'`
  - `'Layout'`
  - `'Clean'`

**Example:**

```javascript
const subscription = ketcher.editor.subscribe('change', (event) => {
  console.log('Operation:', event.operation);

  if (event.operation === 'Add atom') {
    console.log('Added atom:', event.label, 'at', event.position);
  }

  if (event.operation === 'Set atom attribute') {
    console.log('Changed', event.attribute, 'from', event.from, 'to', event.to);
  }
});

// Later: unsubscribe
ketcher.editor.unsubscribe('change', subscription);
```

---

### Library Update Event

**Subscribe:**

```typescript
ketcher.editor.subscribe(
  eventName: 'libraryUpdate',
  handler: (eventData: string) => void
): Subscription
```

**Event Data:** Returns monomer data in SDF format (string)

**Example:**

```javascript
ketcher.editor.subscribe('libraryUpdate', (sdfData) => {
  console.log('Monomer library updated');
  console.log('SDF data:', sdfData);

  // Save to database or trigger other actions
  saveMonomerLibrary(sdfData);
});
```

---

### Custom Button Events

Custom buttons emit events via the event bus:

```typescript
ketcher.eventBus.on(
  eventName: 'CUSTOM_BUTTON_PRESSED',
  handler: (buttonId: string) => void
): void
```

**Example:**

```javascript
ketcher.eventBus.on('CUSTOM_BUTTON_PRESSED', (buttonId) => {
  console.log('Custom button clicked:', buttonId);

  if (buttonId === 'export-to-database') {
    exportToDatabase();
  }
});
```

---

### Legacy Event Properties

For backwards compatibility, Ketcher also exposes:

- **`ketcher.changeEvent`** - Legacy subscription object for change events
- **`ketcher.libraryUpdateEvent`** - Legacy subscription object for library updates

---

## React Component API

### Editor Component

The `Editor` component is the main React wrapper for Ketcher.

**Import:**

```typescript
import { Editor } from 'ketcher-react';
import 'ketcher-react/dist/index.css';
```

**Props:**

```typescript
interface EditorProps {
  staticResourcesUrl: string;                       // Required
  structServiceProvider: StructServiceProvider;     // Required
  onInit?: (ketcher: Ketcher) => void;
  errorHandler?: (message: string) => void;
  buttons?: ButtonsConfig;
  customButtons?: CustomButton[];
  disableMacromoleculesEditor?: boolean;
  monomersLibraryUpdate?: string | JSON;
  monomersLibraryReplace?: string | JSON;
}
```

**Required Props:**

- **`staticResourcesUrl`** `string` - Path to static resources (SVG icons, templates)
- **`structServiceProvider`** `StructServiceProvider` - Service provider instance

**Optional Props:**

- **`onInit`** `(ketcher: Ketcher) => void` - Callback when Ketcher initializes
- **`errorHandler`** `(message: string) => void` - Error handler callback
- **`buttons`** `ButtonsConfig` - Configure toolbar button visibility
- **`customButtons`** `CustomButton[]` - Add custom toolbar buttons
- **`disableMacromoleculesEditor`** `boolean` - Hide macromolecules mode toggle (default: `false`)
- **`monomersLibraryUpdate`** `string | JSON` - Update monomer library on init
- **`monomersLibraryReplace`** `string | JSON` - Replace monomer library on init

---

### ButtonsConfig

Configure visibility of built-in toolbar buttons:

```typescript
type ButtonsConfig = {
  [buttonName in ButtonName]?: { hidden?: boolean };
};
```

**Button Names:** `'clear'`, `'open'`, `'save'`, `'undo'`, `'redo'`, `'cut'`, `'copy'`, `'paste'`, `'zoom-in'`, `'zoom-out'`, `'layout'`, `'clean'`, `'arom'`, `'dearom'`, `'cip'`, `'check'`, `'analyse'`, `'recognize'`, `'miew'`, `'settings'`, `'help'`, `'about'`, etc.

**Example:**

```javascript
<Editor
  staticResourcesUrl="/public"
  structServiceProvider={provider}
  buttons={{
    clear: { hidden: true },
    miew: { hidden: true }
  }}
/>
```

---

### CustomButton

Add custom toolbar buttons:

```typescript
interface CustomButton {
  id: string;         // Unique button identifier
  imageLink: string;  // Path to button icon (SVG recommended)
  title: string;      // Tooltip text
}
```

**Example:**

```javascript
<Editor
  staticResourcesUrl="/public"
  structServiceProvider={provider}
  customButtons={[
    {
      id: 'export-to-db',
      imageLink: '/icons/database.svg',
      title: 'Export to Database'
    },
    {
      id: 'custom-tool',
      imageLink: '/icons/tool.svg',
      title: 'Custom Tool'
    }
  ]}
  onInit={(ketcher) => {
    ketcher.eventBus.on('CUSTOM_BUTTON_PRESSED', (id) => {
      if (id === 'export-to-db') {
        exportToDatabase();
      }
    });
  }}
/>
```

---

### Complete Example

```typescript
import React from 'react';
import { Editor } from 'ketcher-react';
import { RemoteStructServiceProvider } from 'ketcher-core';
import 'ketcher-react/dist/index.css';

function App() {
  const provider = new RemoteStructServiceProvider(
    'http://localhost:8002'
  );

  const handleInit = (ketcher: Ketcher) => {
    // Make globally accessible
    window.ketcher = ketcher;

    // Subscribe to changes
    ketcher.editor.subscribe('change', (event) => {
      console.log('Structure changed:', event);
    });

    // Load initial structure
    ketcher.setMolecule('C1=CC=CC=C1');
  };

  const handleError = (message: string) => {
    console.error('Ketcher error:', message);
  };

  return (
    <Editor
      staticResourcesUrl={process.env.PUBLIC_URL}
      structServiceProvider={provider}
      onInit={handleInit}
      errorHandler={handleError}
      buttons={{
        miew: { hidden: true }
      }}
      customButtons={[
        {
          id: 'export',
          imageLink: '/icons/export.svg',
          title: 'Export to Database'
        }
      ]}
    />
  );
}

export default App;
```

---

## Macromolecules Mode

Ketcher supports editing biological macromolecules (peptides, nucleic acids, etc.).

### Mode Switching

```typescript
switchToMacromoleculesMode(): void
switchToMoleculesMode(): void
```

**Example:**

```javascript
ketcher.switchToMacromoleculesMode();
```

---

### Monomer Library Management

#### updateMonomersLibrary

```typescript
updateMonomersLibrary(
  monomersData: string | JSON,
  params?: UpdateMonomersLibraryParams
): Promise<void>
```

**Upserts** monomers to built-in library (adds new, updates existing).

**Parameters:**

- `monomersData` - Monomer data (KET or SDF format)
- `params` (optional) - Update parameters

**UpdateMonomersLibraryParams:**

```typescript
interface UpdateMonomersLibraryParams {
  format?: 'ket' | 'sdf';                         // Input format (default: auto-detect)
  shouldPersist?: boolean;                        // Save to localStorage (default: false)
  needDispatchLibraryUpdateEvent?: boolean;       // Trigger library update event (default: true)
}
```

**Example:**

```javascript
const monomersKet = JSON.stringify({
  root: { nodes: [...] },
  // ... monomer definitions
});

await ketcher.updateMonomersLibrary(monomersKet, {
  format: 'ket',
  shouldPersist: true
});
```

---

#### replaceMonomersLibrary

```typescript
replaceMonomersLibrary(
  monomersData: string | JSON,
  params?: UpdateMonomersLibraryParams
): Promise<void>
```

**Replaces** entire monomer library (removes all existing monomers).

**Parameters:** Same as `updateMonomersLibrary`

**Example:**

```javascript
await ketcher.replaceMonomersLibrary(monomersKet, {
  format: 'ket',
  shouldPersist: true
});
```

---

### Macromolecules-Specific Methods

- **`getFasta()`** - Export FASTA format
- **`getSequence(format)`** - Export sequence (1-letter or 3-letter)
- **`getIdt()`** - Export IDT format
- **`getAxoLabs()`** - Export AxoLabs format
- **`setHelm(helmStr)`** - Import HELM notation
- **`circularLayoutMonomers()`** - Circular layout
- **`setMode(mode)`** - Set layout mode ('flex', 'snake', 'sequence')

---

## Type Definitions

### Core Types

```typescript
// Structure import options
interface SetMoleculeOptions {
  position?: { x: number; y: number };    // Angstrom units, Y increases upward
  needZoom?: boolean;                     // Default: true
}

// Image generation options
interface GenerateImageOptions {
  outputFormat: 'png' | 'svg';
  backgroundColor?: string;               // Hex color
  bondThickness?: number;                 // Pixels
}

// Image export options
interface ExportImageParams {
  margin?: number;                        // Pixels
}

// Monomer library update options
interface UpdateMonomersLibraryParams {
  format?: 'ket' | 'sdf';
  shouldPersist?: boolean;
  needDispatchLibraryUpdateEvent?: boolean;
}

// Molecular property calculation results
interface CalculateResult {
  'molecular-weight': string;
  'most-abundant-mass': string;
  'monoisotopic-mass': string;
  'gross': string;                        // Molecular formula
  'mass-composition': string;
}

// Custom toolbar button
interface CustomButton {
  id: string;
  imageLink: string;
  title: string;
}

// Button visibility configuration
type ButtonsConfig = {
  [buttonName in ButtonName]?: { hidden?: boolean };
};

// Event subscription
interface Subscription {
  handler: Function;
  eventName: string;
}
```

---

## Service Providers

Ketcher uses a service provider pattern for chemical operations. Two implementations are available:

### RemoteStructServiceProvider

Uses **Indigo Service** (REST API) for server-side chemical operations.

**Location:** `ketcher-core`

**Constructor:**

```typescript
constructor(
  apiPath: string,
  defaultOptions?: Record<string, any>,
  customHeaders?: Record<string, string>
)
```

**Example:**

```javascript
import { RemoteStructServiceProvider } from 'ketcher-core';

const provider = new RemoteStructServiceProvider(
  'http://localhost:8002',
  {
    'smart-layout': true,
    'ignore-stereochemistry-errors': true
  },
  {
    'Authorization': 'Bearer token123',
    'Custom-Header': 'value'
  }
);
```

**Default Options:**

```javascript
{
  'smart-layout': true,
  'ignore-stereochemistry-errors': true,
  'mass-skip-error-on-pseudoatoms': false,
  'gross-formula-add-rsites': true,
  'aromatize-skip-superatoms': true,
  'dearomatize-on-load': false,
  'ignore-no-chiral-flag': false
}
```

---

### StandaloneStructServiceProvider

Uses **Indigo WASM** (client-side) for chemical operations without server dependency.

**Location:** `ketcher-standalone`

**Constructor:**

```typescript
constructor()
```

**Example:**

```javascript
import { StandaloneStructServiceProvider } from 'ketcher-standalone';

const provider = new StandaloneStructServiceProvider();
```

**Note:** WASM bundle is larger but provides offline capabilities.

---

## Supported Formats

### Input Formats (Auto-detected)

Ketcher automatically detects the input format:

- **MOL** (V2000/V3000) - MDL Molfile
- **RXN** (V2000/V3000) - MDL Reaction file
- **KET** - Ketcher JSON format
- **SMILES** - Simplified Molecular Input Line Entry System
- **Extended SMILES** - SMILES with stereochemistry
- **SMARTS** - SMILES Arbitrary Target Specification
- **InChI** - IUPAC International Chemical Identifier
- **CML** - Chemical Markup Language
- **CDXML** - ChemDraw XML
- **CDX** - ChemDraw binary
- **SDF** - Structure-Data File
- **RDF** - Reaction Data File
- **FASTA** - Biological sequence format
- **HELM** - Hierarchical Editing Language for Macromolecules
- **IDT** - Integrated DNA Technologies
- **AxoLabs** - AxoLabs format
- **Sequence** - RNA/DNA/Peptide (1-letter and 3-letter)

### Output Formats

All input formats plus:

- **InChI Key** - Hashed InChI identifier
- **PNG** - Portable Network Graphics image
- **SVG** - Scalable Vector Graphics image

---

## Usage Examples

### Example 1: Basic Structure Loading and Export

```javascript
// Load structure
await ketcher.setMolecule('C1=CC=CC=C1');

// Export to different formats
const smiles = await ketcher.getSmiles();
console.log('SMILES:', smiles);  // "c1ccccc1"

const mol = await ketcher.getMolfile('v3000');
console.log('MOL:', mol);

const ket = await ketcher.getKet();
const ketObj = JSON.parse(ket);
console.log('KET:', ketObj);
```

---

### Example 2: Multi-Structure Canvas

```javascript
// Load first molecule
await ketcher.setMolecule('C1=CC=CC=C1', {
  position: { x: 0, y: 0 },
  needZoom: false
});

// Add second molecule
await ketcher.addFragment('CCO', {
  position: { x: 10, y: 0 },
  needZoom: false
});

// Add reaction arrow at x=15
// (Must be done through editor API or manually)
```

---

### Example 3: Property Calculation

```javascript
await ketcher.setMolecule('C6H12O6');  // Glucose

const props = await ketcher.calculate();

console.log('Molecular Weight:', props['molecular-weight']);
console.log('Formula:', props['gross']);
console.log('Monoisotopic Mass:', props['monoisotopic-mass']);
```

---

### Example 4: Event Tracking

```javascript
let atomCount = 0;
let bondCount = 0;

const subscription = ketcher.editor.subscribe('change', (event) => {
  if (event.operation === 'Add atom') {
    atomCount++;
    console.log(`Atoms: ${atomCount}`);
  }

  if (event.operation === 'Add bond') {
    bondCount++;
    console.log(`Bonds: ${bondCount}`);
  }

  if (event.operation === 'Undo' || event.operation === 'Redo') {
    console.log('History changed');
  }
});

// Later: cleanup
ketcher.editor.unsubscribe('change', subscription);
```

---

### Example 5: Image Generation

```javascript
const smiles = 'CC(C)C1=CC=C(C=C1)C(C)C(=O)O';  // Ibuprofen

const imageBlob = await ketcher.generateImage(smiles, {
  outputFormat: 'png',
  backgroundColor: '#FFFFFF',
  bondThickness: 2
});

// Display in browser
const img = document.createElement('img');
img.src = URL.createObjectURL(imageBlob);
document.body.appendChild(img);

// Or download
const a = document.createElement('a');
a.href = URL.createObjectURL(imageBlob);
a.download = 'ibuprofen.png';
a.click();
```

---

### Example 6: OCR Structure Recognition

```javascript
const fileInput = document.getElementById('image-upload');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];

  try {
    const struct = await ketcher.recognize(file);
    console.log('Structure recognized!');

    // Structure is already loaded on canvas
    const smiles = await ketcher.getSmiles();
    console.log('Recognized SMILES:', smiles);
  } catch (error) {
    console.error('Recognition failed:', error);
  }
});
```

---

### Example 7: Macromolecules Mode

```javascript
// Switch to macromolecules mode
ketcher.switchToMacromoleculesMode();

// Load peptide sequence
await ketcher.setMolecule('ACDEFGHIKLMNPQRSTVWY', {
  needZoom: true
});

// Change layout
ketcher.setMode('sequence');

// Export as FASTA
const fasta = await ketcher.getFasta();
console.log(fasta);

// Export as HELM
const helm = await ketcher.getHelm();
console.log(helm);

// Get 1-letter sequence
const seq = await ketcher.getSequence('1-letter');
console.log('Sequence:', seq);
```

---

### Example 8: Custom Monomer Library

```javascript
// Define custom monomers in KET format
const customMonomers = {
  root: { nodes: [] },
  monomerTemplate_Custom1: {
    type: 'monomerTemplate',
    id: 'Custom1___CustomMonomer',
    class: 'AminoAcid',
    classHELM: 'PEPTIDE',
    alias: 'Cst',
    name: 'Custom Monomer',
    fullName: 'My Custom Amino Acid',
    naturalAnalogShort: 'A',
    atoms: [/* ... */],
    bonds: [/* ... */],
    attachmentPoints: [/* ... */]
  }
};

// Update library (upsert)
await ketcher.updateMonomersLibrary(
  JSON.stringify(customMonomers),
  {
    format: 'ket',
    shouldPersist: true  // Save to localStorage
  }
);

// Or replace entire library
await ketcher.replaceMonomersLibrary(
  JSON.stringify(customMonomers),
  {
    format: 'ket',
    shouldPersist: true
  }
);
```

---

### Example 9: Settings Configuration

```javascript
// Configure editor settings
ketcher.setSettings({
  'general.dearomatize-on-load': false,
  'ignoreChiralFlag': true,
  'bondThickness': 2,
  'disableQueryElements': ['Pol', 'CYH'],
  'disableCustomQuery': false
});

// Get current settings
const settings = ketcher.settings;
console.log('Current settings:', settings);
```

---

### Example 10: Custom Toolbar Button

```javascript
// In React component
<Editor
  staticResourcesUrl="/public"
  structServiceProvider={provider}
  customButtons={[
    {
      id: 'save-to-db',
      imageLink: '/icons/database.svg',
      title: 'Save to Database'
    },
    {
      id: 'validate',
      imageLink: '/icons/check.svg',
      title: 'Validate Structure'
    }
  ]}
  onInit={(ketcher) => {
    ketcher.eventBus.on('CUSTOM_BUTTON_PRESSED', async (buttonId) => {
      if (buttonId === 'save-to-db') {
        const mol = await ketcher.getMolfile();
        await saveToDatabase(mol);
        alert('Saved to database!');
      }

      if (buttonId === 'validate') {
        const struct = await ketcher.getKet();
        const isValid = validateStructure(struct);
        alert(isValid ? 'Valid!' : 'Invalid structure');
      }
    });
  }}
/>
```

---

### Example 11: Utility Methods

```javascript
// Check if structure contains reaction
const hasReaction = ketcher.containsReaction();
if (hasReaction) {
  const rxn = await ketcher.getRxn();
} else {
  const mol = await ketcher.getMolfile();
}

// Check if structure has query features
const hasQuery = ketcher.isQueryStructureSelected();
if (hasQuery) {
  console.log('Structure contains query features');
  const smarts = await ketcher.getSmarts();
}
```

---

### Example 12: Zoom and View Control

```javascript
// Set zoom level
ketcher.setZoom(1.5);  // 150%

// Minimum and maximum zoom
// ZoomTool.MINZOOMSCALE = 0.2
// ZoomTool.MAXZOOMSCALE = 4.0

// Custom zoom controls
document.getElementById('zoom-in').addEventListener('click', () => {
  const currentZoom = ketcher.editor.zoom();
  ketcher.setZoom(Math.min(currentZoom * 1.2, 4.0));
});

document.getElementById('zoom-out').addEventListener('click', () => {
  const currentZoom = ketcher.editor.zoom();
  ketcher.setZoom(Math.max(currentZoom / 1.2, 0.2));
});
```

---

## Internal Services (Advanced)

The `ketcher.structService` provides low-level access to chemical operations:

```typescript
interface StructService {
  convert(data: ConvertData, options: any): Promise<ConvertResult>
  layout(data: LayoutData, options: any): Promise<LayoutResult>
  clean(data: CleanData, options: any): Promise<CleanResult>
  aromatize(data: AromatizeData, options: any): Promise<AromatizeResult>
  dearomatize(data: DearomatizeData, options: any): Promise<DearomatizeResult>
  calculateCip(data: CalculateCipData, options: any): Promise<CalculateCipResult>
  automap(data: AutomapData, options: any): Promise<AutomapResult>
  check(data: CheckData, options: any): Promise<CheckResult>
  calculate(data: CalculateData, options: any): Promise<CalculateResult>
  recognize(image: Blob, options: any): Promise<RecognizeResult>
  generateImageAsBase64(data: string, options: GenerateImageOptions): Promise<string>
  getInChIKey(struct: Struct): Promise<string>
  toggleExplicitHydrogens(data: any, options: any): Promise<any>
}
```

**Note:** These methods are low-level and typically used internally. Use the high-level Ketcher API methods when possible.

---

## Error Handling

Most Ketcher methods return Promises and may throw errors:

```javascript
try {
  await ketcher.setMolecule(invalidStructure);
} catch (error) {
  console.error('Failed to load structure:', error.message);
}

// In React component
<Editor
  structServiceProvider={provider}
  staticResourcesUrl="/public"
  errorHandler={(message) => {
    // Custom error handling
    console.error('Ketcher error:', message);
    showErrorNotification(message);
  }}
/>
```

**Common Errors:**

- Format conversion errors (invalid SMILES, MOL file syntax)
- Service unavailable (Indigo service down)
- Unsupported operations (reaction methods in macromolecules mode)
- Invalid structure data

---

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

## References

- **Ketcher GitHub:** https://github.com/epam/ketcher
- **KET Format Specification:** See KET_FORMAT_SPECIFICATION.md
- **Indigo Service:** https://github.com/epam/Indigo
- **HELM Notation:** https://pistoiaalliance.org/helm/
- **API Implementation:** `packages/ketcher-core/src/application/ketcher.ts`

---

## License

**Apache License 2.0**
Copyright (c) 2021 EPAM Systems, Inc.
