# Macromolecules (Polymers)

Beyond small molecules, users work with biopolymers — peptides and nucleic acids built from monomers. Ketcher's macromolecules mode lets users assemble, view, and edit these polymers at monomer granularity and as sequences, create antisense strands, compute polymer properties, and bridge to molecules mode.

Spec: [openspec/specs/macromolecules/spec.md](../../openspec/specs/macromolecules/spec.md)

## Limitations

- The eraser is disabled in sequence layout mode.
- Bond preview and _Edit Attachment Points…_ are unavailable for hydrogen bonds.
- Across modes: molecules drawn in one mode are **visible but not editable** in the other; monomers appear as full abbreviations (not shapes/letters) in molecules mode until expanded.
- Some polymer properties are computed only for natural analogues and/or double-stranded sequences.

## Related

- Library: [monomer-library](../modules/monomer-library.md) · UI: [ketcher-macromolecules](../modules/ketcher-macromolecules.md) · Bridge: [editor-engine](../modules/editor-engine.md)
- See also: [import-export](./import-export.md), [clipboard](./clipboard.md), [monomer-replacement-drag-drop](../../openspec/changes/archive/2026-08-13-monomer-replacement-drag-drop/)
