# Atom Editing

Chemists need to place, replace, and annotate atoms in a 2D structure — choosing any element, adjusting charge, and setting atom-level properties (isotope, valence, radical, query attributes) — without editing raw file formats.

Spec: [openspec/specs/atom-editing/spec.md](../../openspec/specs/atom-editing/spec.md)

## Limitations

- This is a **molecules-mode** feature. In macromolecules mode the equivalent is placing monomers (see [macromolecules](./macromolecules.md)); individual atoms of an abbreviated group / functional group cannot be edited until the abbreviation is removed.
- Query atom features (lists, not-lists, generics) are meaningful only for query-capable export formats.

## Related

- Engine: [editor-engine](../modules/editor-engine.md) · Model: [domain.md](../domain.md) (Atom)
- See also: [bond-editing](./bond-editing.md), [stereochemistry](./stereochemistry.md)
