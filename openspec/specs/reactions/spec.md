# Reactions Specification

## Purpose

Chemists represent transformations, not just single molecules. Ketcher must let users assemble reaction schemes — reactants, products, reagents/catalysts, arrows, pluses, and atom-to-atom mappings — including multi-step and pathway reactions, and preserve that structure through export.

## Requirements

Ketcher (through Indigo) infers reaction roles from geometry relative to the arrow and preserves them on export.

### Requirement: Grouping reactants and products by arrow side

The system SHALL ensure that left-side structures are treated as reactants and right-side structures as products, regardless of the arrow's drawn direction.

#### Scenario: Grouping reactants and products by arrow side

- **WHEN** structures are placed on the left and right of a left-to-right arrow
- **THEN** left-side structures are treated as reactants and right-side structures as products, regardless of the arrow's drawn direction

### Requirement: Grouping components with and without pluses

The system SHALL ensure that they are grouped together regardless of the distance between them; when there is no plus, structures within less than two bond lengths are grouped together.

#### Scenario: Grouping components with and without pluses

- **WHEN** two structures on the same side are separated by a plus
- **THEN** they are grouped together regardless of the distance between them; **WHEN** there is no plus, structures within less than two bond lengths are grouped together

### Requirement: Reagents above/below the arrow

The system SHALL ensure that they are treated as reagents/catalysts.

#### Scenario: Reagents above/below the arrow

- **WHEN** structures are placed above or below a horizontal arrow
- **THEN** they are treated as reagents/catalysts

### Requirement: Auto-mapping atoms

The system SHALL ensure that corresponding atoms in reactants and products receive matching map numbers.

#### Scenario: Auto-mapping atoms

- **WHEN** the user applies the _Reaction Auto-Mapping Tool_
- **THEN** corresponding atoms in reactants and products receive matching map numbers

### Requirement: Multi-tailed and multi-step export

The system SHALL ensure that it is preserved in KET (and RDF/CDX/CDXML where applicable); other formats linearize it into a single reactants → reagents → products form.

#### Scenario: Multi-tailed and multi-step export

- **WHEN** a reaction with multi-tailed arrows or multiple steps is saved
- **THEN** it is preserved in KET (and RDF/CDX/CDXML where applicable); other formats linearize it into a single reactants → reagents → products form

## User interaction

- **Reactants / products** — draw structures with the normal atom/bond tools (see [atom-editing](../atom-editing/spec.md), [bond-editing](../bond-editing/spec.md)).
- **Arrows** — the _Reaction Arrow Tool_ offers several arrow styles; place one on the canvas. The _Multi-Tailed Arrow_ option builds pathway reactions, with draggable head/tail ends.
- **Pluses** — the _Reaction Plus Tool_ adds `+` symbols between components.
- **Atom mapping** — the _Reaction Mapping Tools_ map identical atoms across reactants and products: _Auto-Mapping_, manual _Mapping_, and _Unmapping_.

## Guarantees

- Reaction role assignment is deterministic from component geometry and plus placement.
- KET, CDX, and CDXML retain multi-step reactions and text reagents; KET and RDF retain multi-tailed arrows.
