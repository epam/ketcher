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