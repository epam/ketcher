## Macromolecules Mode

### Overview

Starting with version 3.0, Ketcher supports editing biological macromolecules (peptides, nucleic acids, etc). 

### Mode Switching

There is a new control in the top toolbar that allows switching to macromolecules editing mode. If you prefer having only small molecules editing mode available, you can remove the mode switcher from the toolbar by passing `disableMacromoleculesEditor` property to the `Editor` component.

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

Please refer to the `/example/src/App.tsx` file for a complete example of how to integrate Ketcher editor into your application.

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
