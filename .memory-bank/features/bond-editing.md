# Bond Editing

Structures are defined by the bonds between atoms. Chemists need to draw bonds of many types (single, double, triple, aromatic, stereo, dative, query, hydrogen), build carbon chains quickly, and change bond type or geometry after the fact.

Spec: [openspec/specs/bond-editing/spec.md](../../openspec/specs/bond-editing/spec.md)

## Limitations

- This is a **molecules-mode** feature. In macromolecules mode only single (covalent) and hydrogen bonds connect monomers, via a dedicated bond flow (see [macromolecules](./macromolecules.md)).
- Bonds inside an abbreviated group / functional group cannot be edited until the abbreviation is removed.

## Related

- Engine: [editor-engine](../modules/editor-engine.md) · Model: [domain.md](../domain.md) (Bond)
- See also: [atom-editing](./atom-editing.md), [stereochemistry](./stereochemistry.md)
