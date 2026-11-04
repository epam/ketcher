# Reactions

Chemists represent transformations, not just single molecules. Ketcher must let users assemble reaction schemes — reactants, products, reagents/catalysts, arrows, pluses, and atom-to-atom mappings — including multi-step and pathway reactions, and preserve that structure through export.

Spec: [openspec/specs/reactions/spec.md](../../openspec/specs/reactions/spec.md)

## Limitations

- Reaction-specific formats other than KET/CDX/CDXML do not save pluses between reagents/catalysts and cannot store text reagents.
- Non-KET/RDF formats approximate multi-tailed arrows (CDX/CDXML store arrow + lines; others store a linear form).
- This is a **molecules-mode** feature.

## Related

- Formats: [serialization](../modules/serialization.md) · Engine: [editor-engine](../modules/editor-engine.md)
- See also: [import-export](./import-export.md)
