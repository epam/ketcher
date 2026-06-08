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

### How to use react component library

Review [link](packages/ketcher-react/README.md) for details.

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

