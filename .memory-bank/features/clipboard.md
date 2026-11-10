# Clipboard (Copy / Cut / Paste)

Users need to duplicate parts of a structure, move content within a drawing, and exchange structures with other applications by copying to and pasting from the system clipboard in several chemical formats.

Spec: [openspec/specs/clipboard/spec.md](../../openspec/specs/clipboard/spec.md)

## Limitations

- Some browsers (Chrome, Firefox) require `Ctrl+V` for pasting via the system clipboard.
- Cross-mode paste (molecules ↔ macromolecules) is routed through structure conversion and may be constrained by what the target mode can represent (see [macromolecules](./macromolecules.md)).
- Image copy produces a raster/vector image, not an editable structure.

## Related

- Engine: [editor-engine](../modules/editor-engine.md) · Formats: [serialization](../modules/serialization.md)
- See also: [selection](./selection.md), [import-export](./import-export.md)
