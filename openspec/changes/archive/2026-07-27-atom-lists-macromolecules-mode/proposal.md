## Why

Atoms that represent atom lists (both inclusion lists and "not-lists") are silently degraded when structures are loaded into macromolecules mode: the list notation is stripped and the atom renders as a plain `"L"` label, losing chemical meaning. Users who work with query structures need accurate visualization of atom lists across both editor modes.

## What Changes

- Add `atomList` data transfer from micromolecule `Atom` to macromolecule `CoreAtom` during the micro→macro conversion step.
- Extend `CoreAtom` (`AtomProperties`) with an optional `atomList` field to carry `AtomList` data.
- Update `AtomRenderer.labelText` to produce the correct atom-list notation (`[C,N,O]` / `![C,N,O]`) when `atomList` is present, matching the existing micromolecule renderer behavior.
- Ensure `DrawingEntitiesManager.addAtom` / `addAtomChangeModel` propagate the new field when constructing `CoreAtom`.

## Capabilities

### New Capabilities

- `atom-list-visualization-macro`: Visualization of atom-list atoms (list and not-list) in macromolecules mode — showing `[C,N,O]` / `![C,N,O]` labels on the macro canvas instead of a meaningless `"L"` placeholder.

### Modified Capabilities

<!-- No existing spec-level requirements are changing; this is a net-new visualization capability. -->

## Impact

- **`ketcher-core`**:
  - `domain/entities/CoreAtom.ts` — `AtomProperties` interface gains optional `atomList?: AtomList | null`
  - `application/editor/MacromoleculesConverter.ts` — conversion loop copies `atom.atomList` to `CoreAtom`
  - `application/render/renderers/AtomRenderer.ts` — `labelText` getter handles atom list label generation
  - `domain/entities/DrawingEntitiesManager.ts` — `addAtom` / `addAtomChangeModel` propagate `atomList`
- No public API changes. No new dependencies. No serialization format changes (KET already encodes atom lists in the micro model; the macro-side change is display-only).
