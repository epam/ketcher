# Reactions

## Problem

Chemists represent transformations, not just single molecules. Ketcher must let users assemble reaction schemes — reactants, products, reagents/catalysts, arrows, pluses, and atom-to-atom mappings — including multi-step and pathway reactions, and preserve that structure through export.

## User interaction

- **Reactants / products** — draw structures with the normal atom/bond tools (see [atom-editing](./atom-editing.md), [bond-editing](./bond-editing.md)).
- **Arrows** — the _Reaction Arrow Tool_ offers several arrow styles; place one on the canvas. The _Multi-Tailed Arrow_ option builds pathway reactions, with draggable head/tail ends.
- **Pluses** — the _Reaction Plus Tool_ adds `+` symbols between components.
- **Atom mapping** — the _Reaction Mapping Tools_ map identical atoms across reactants and products: _Auto-Mapping_, manual _Mapping_, and _Unmapping_.

## Expected behavior

Ketcher (through Indigo) infers reaction roles from geometry relative to the arrow and preserves them on export.

#### Scenario: Grouping reactants and products by arrow side

- **WHEN** structures are placed on the left and right of a left-to-right arrow
- **THEN** left-side structures are treated as reactants and right-side structures as products, regardless of the arrow's drawn direction

#### Scenario: Grouping components with and without pluses

- **WHEN** two structures on the same side are separated by a plus
- **THEN** they are grouped together regardless of the distance between them; **WHEN** there is no plus, structures within less than two bond lengths are grouped together

#### Scenario: Reagents above/below the arrow

- **WHEN** structures are placed above or below a horizontal arrow
- **THEN** they are treated as reagents/catalysts

#### Scenario: Auto-mapping atoms

- **WHEN** the user applies the _Reaction Auto-Mapping Tool_
- **THEN** corresponding atoms in reactants and products receive matching map numbers

#### Scenario: Multi-tailed and multi-step export

- **WHEN** a reaction with multi-tailed arrows or multiple steps is saved
- **THEN** it is preserved in KET (and RDF/CDX/CDXML where applicable); other formats linearize it into a single reactants → reagents → products form

## Guarantees

- Reaction role assignment is deterministic from component geometry and plus placement.
- KET, CDX, and CDXML retain multi-step reactions and text reagents; KET and RDF retain multi-tailed arrows.

## Limitations

- Reaction-specific formats other than KET/CDX/CDXML do not save pluses between reagents/catalysts and cannot store text reagents.
- Non-KET/RDF formats approximate multi-tailed arrows (CDX/CDXML store arrow + lines; others store a linear form).
- This is a **molecules-mode** feature.

## Related

- Formats: [serialization](../modules/serialization.md) · Engine: [editor-engine](../modules/editor-engine.md)
- See also: [import-export](./import-export.md)
