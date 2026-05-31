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

- as ready-to-run application (to find desired version please look at Assets block of [releases](https://github.com/epam/ketcher/releases)). The application can be injected as IFrame or a separate page.
- as a [react component library](https://www.npmjs.com/package/ketcher-react)

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

1. [Structure Export Methods](#structure-export-methods)
2. [Structure Import Methods](#structure-import-methods)
3. [Editor Operations](#editor-operations)
4. [View Control](#view-control)
5. [Settings Management](#settings-management)
6. [Event System](#event-system)
7. [React Component API](#react-component-api)
8. [Macromolecules Mode](#macromolecules-mode)
9. [Service Providers](#service-providers)
10. [Supported Formats](#supported-formats)
11. [Usage Examples](#usage-examples)
12. [Internal Services (Advanced)](#internal-services-advanced)
13. [Error Handling](#error-handling)

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


## Events
Ketcher allows to subscribe on events to react to changes in the editor.

---

`Subscribe()` - method that allows you to attach an event handler function for event.

#### Syntax:
`ketcher.editor.subscribe(eventName, handler)`

#### Parameters:

`eventName: string` - event type, such as 'change'.

`handler: function` - a function to execute when the event is triggered.


#### Return value:

A new object that has one field 'handler'.

--- 

`Unsubscribe()` - method that removes event handler.

#### Syntax:
`ketcher.editor.unsubscribe(eventName, subscriber)`

#### Parameters:

`eventName: string` - one event type, such as 'change'.

`subscriber: object` - an object that is returned from the subscriber function.

#### Return value:


undefined

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


| Operation                | Example                                                                     |
|:---------------------------------|:----------------------------------------------------------------------------|
| Add atom                         | {operation: 'Add atom',id: 1,label: 'C',position: { x:  3.37, y: 6.03 }}    |
| Move atom                        | {operation: 'Move atom',id: 1,position: { x:  0.02, y: 2.4 }}               |
| Set atom attribute               | {operation: 'Set atom attribute',id: 22,from: 0,to: 1,attribute: 'charge'}  |
| Delete atom                      | {operation: 'Delete atom',id: 1,label: 'C',position: { x:  3.37, y: 6.03 }} |
| Add bond                         | {operation: 'Add bond',id: 31}                                              |
| Move bond                        | {operation: 'Move bond'}                                                    |
| Set bond attribute               | {operation: 'Set bond attribute'}                                           |
| Delete bond                      | {operation: 'Delete bond',id: 31}                                           |
| Move loop                        | {operation: 'Move loop'}                                                    |
| Add atom to s-group              | {operation: 'Add atom to s-group',sGroupId: 0,atomId: 16}                   |
| Remove atom from s-group         | {operation: 'Remove atom from s-group'}                                     |
| Create s-group                   | {operation: 'Create s-group',sGroupId: 0,type: 'GEN'}                       |
| Set s-group attribute            | {operation: 'Set s-group attribute'}                                        |
| Delete s-group                   | {operation: 'Delete s-group',sGroupId: 0,type: 'GEN'}                       |
| Add s-group to hierarchy         | {operation: 'Add s-group to hierarchy'}                                     |
| Delete s-group from hierarchy    | {operation: 'Delete s-group to hierarchy'}                                  |
| Set r-group attribute            | {operation: 'Set r-group attribute'}                                        |
| R-group fragment                 | {operation: 'R-group fragment',id: 1}                                       |
| Update                           | {operation: 'Update'}                                                       |
| Restore                          | {operation: 'Restore'}                                                      |
| Add rxn arrow                    | {operation: 'Add rxn arrow',id: 1,position: { x:  4.02, y: 4.83 }}          |
| Delete rxn arrow                 | {operation: 'Delete rxn arrow',id: 1,position: { x:  4.02, y: 4.83 }}       |
| Move rxn arrow                   | {operation: 'Move rxn arrow',id: 1,position: { x:  0.07, y: 1.18 }}         |
| Add rxn plus                     | {operation: 'Add rxn plus'}                                                 |
| Delete rxn plus                  | {operation: 'Delete rxn plus'}                                              |
| Move rxn plus                    | {operation: 'Move rxn plus'}                                                |
| Move s-group data                | {operation: 'Move s-group data'}                                            |
| Load canvas                      | {operation: 'Load canvas'}                                                  |
| Align descriptors                | {operation: 'Align descriptors'}                                            |
| Add simple object                | {operation: 'Add simple object',id: 1,type: 'circle'}                       |
| Move simple object               | {operation: 'Move simple object',id: 1,position: { x:  0.07, y: 1.18 }}     |
| Resize simple object             | {operation: 'Resize simple object',id: 1}                                   |
| Delete simple object             | {operation: 'Delete simple object',id: 1,type: 'circle'}                    |
| Restore descriptors position     | {operation: 'Restore descriptors position'}                                 |
| Add fragment                     | {operation: 'Add fragment',id: 1}                                           |
| Delete fragment                  | {operation: 'Delete fragment',id: 1}                                        |
| Add fragment stereo flag         | {operation: 'Add fragment stereo flag'}                                     |
| Add stereo atom to fragment      | {operation: 'Add stereo atom to fragment',atomId: 1,fragId: 2}              |
| Delete stereo atom from fragment | {operation: 'Delete stereo atom from fragment',atomId: 1,fragId: 2}         |
| Move enhanced flag               | {operation: 'Move enhanced flag'}                                           |

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

### Monomers library update event
The 'libraryUpdate' event is triggered when some change in monomers library happens. For example when user creates new monomer using "Create monomer" tool, or library changes after the specific [API call](https://github.com/epam/ketcher/issues/7674).

#### Example:
```js
ketcher.editor.subscribe('libraryUpdate', (eventData) => {
    console.log('Library updated:', eventData);
});
```

eventData is a string in SDF format according to [specification](https://github.com/epam/Indigo/issues/3161)

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
(See ketcher-react/src/script/ui/buttonsConfig.ts in the repo for an up-to-date list.)


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


## Contribution

See [Contributing Guide](./DEVNOTES.md).

## License

[Apache 2.0](LICENSE)

Please read [LICENSE](LICENSE) and [NOTICE](NOTICE) for details.

Copyright (c) 2021 [EPAM Systems, Inc.](https://www.epam.com/)
