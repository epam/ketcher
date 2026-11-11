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