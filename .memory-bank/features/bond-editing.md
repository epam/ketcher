# Bond Editing

## Problem

Structures are defined by the bonds between atoms. Chemists need to draw bonds of many types (single, double, triple, aromatic, stereo, dative, query, hydrogen), build carbon chains quickly, and change bond type or geometry after the fact.

## User interaction

- **Bond tool** — open the _Bond tool_ drop-down to pick a bond type, then click empty canvas to draw a standalone bond, or click an atom to attach a bond at a 120° angle.
- **Drag to set angle** — click an atom and drag to place the bond at a manually chosen angle.
- **Chain tool** — the _Chain tool_ draws consecutive single bonds (a zig-zag chain) by dragging.
- **Change type** — click an existing bond to change it to the currently selected type; clicking with the _Single Bond_ or _Chain_ tool cycles Single → Double → Triple → Single.
- **Direction** — clicking a drawn stereo or dative bond flips its direction.
- **Bond Properties dialog** — double-click a bond (or press `/`) to edit type, topology, and reacting-center properties.

## Expected behavior

Drawing a bond creates any missing endpoint atoms and keeps hydrogen counts consistent; changing a bond type updates the model and rendering atomically.

#### Scenario: Drawing a bond on empty canvas

- **WHEN** the user selects a bond type and clicks empty canvas
- **THEN** a bond of that type is created together with its two endpoint atoms (carbon by default) and appropriate implicit hydrogens

#### Scenario: Adding a bond to an existing atom

- **WHEN** the user clicks an existing atom with a bond type selected
- **THEN** a bond of that type is added to the atom at a 120° angle, creating a new endpoint atom

#### Scenario: Cycling bond type

- **WHEN** the user clicks an existing single bond with the _Single Bond_ or _Chain_ tool repeatedly
- **THEN** the bond type cycles Single → Double → Triple → Single on each click

#### Scenario: Flipping stereo/dative direction

- **WHEN** the user clicks an existing stereo or dative bond
- **THEN** the bond's direction is reversed

## Guarantees

- Endpoint atoms and implicit hydrogen counts stay consistent with bond additions, removals, and type changes.
- Each bond edit is one atomic entry in the undo history (see [undo-redo](./undo-redo.md)).

## Limitations

- This is a **molecules-mode** feature. In macromolecules mode only single (covalent) and hydrogen bonds connect monomers, via a dedicated bond flow (see [macromolecules](./macromolecules.md)).
- Bonds inside an abbreviated group / functional group cannot be edited until the abbreviation is removed.

## Related

- Engine: [editor-engine](../modules/editor-engine.md) · Model: [domain.md](../domain.md) (Bond)
- See also: [atom-editing](./atom-editing.md), [stereochemistry](./stereochemistry.md)
