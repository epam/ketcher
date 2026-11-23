## Why

Query properties of atoms (ring bond count, H count, substitution count, unsaturated, aromaticity, implicit H count, ring membership, ring size, connectivity, chirality, custom query) are not displayed in macromolecules mode. The atom is drawn as a regular atom with implicit hydrogens, so the structure looks different from molecules mode. Issue #12692.

## What Changes

- Pass query properties from the micromolecule `Atom` to the macromolecule `CoreAtom` in the micro→macro conversion.
- Draw the query text near the atom in `AtomRenderer`, the same text as in molecules mode, truncated the same way.
- Do not show implicit hydrogens on atoms with query properties. If implicit H count is the only query property, show that number of hydrogens.
- Move the functions that build the query text from `reatom.ts` to `atomQueryText.ts` so both renderers use them.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `macromolecules`: query properties of atoms are displayed on the macromolecules canvas.

## Impact

- **`ketcher-core`**:
  - `domain/entities/CoreAtom.ts` — `AtomProperties` gets the query fields, `calculateValence` takes them into account
  - `application/editor/MacromoleculesConverter.ts` — copies the query fields to `CoreAtom`
  - `application/render/renderers/AtomRenderer.ts` — query label, `data-atom*` attributes
  - `application/render/restruct/atomQueryText.ts` — new file, code moved from `reatom.ts`
- No public API changes, `checkIsSmartPropertiesExist` and `getAtomCustomQuery` are exported as before. No changes in file formats.
