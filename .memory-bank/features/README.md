# Feature Specifications

Each file in this directory describes the **current observable behavior** of a product feature. They are the canonical description of product behavior and intentionally avoid implementation details.

## Convention

Every Feature Specification answers:

- **Problem** — What problem does this feature solve?
- **User interaction** — How does the user interact with it?
- **Expected behavior** — What behavior is expected? (captured as OpenSpec-style `#### Scenario:` blocks with **WHEN** / **THEN** clauses)
- **Guarantees** — What invariants/guarantees does it provide?
- **Limitations** — What limitations or edge cases exist?

Feature Specifications are updated whenever the product behavior changes.

## Documented Features

The ten most important features, distilled from [documentation/help.md](../../documentation/help.md):

### Molecules mode (small molecules & reactions)

1. [Atom Editing](./atom-editing.md) — placing/replacing atoms, charge, periodic & extended tables, atom properties
2. [Bond Editing](./bond-editing.md) — bond types, chains, cycling, geometry, bond properties
3. [Reactions](./reactions.md) — arrows, pluses, atom mapping, pathway & multi-step reactions
4. [Stereochemistry](./stereochemistry.md) — stereo bonds, CIP labels, enhanced stereochemistry
5. [Templates, Functional Groups & Structural Groups](./templates-and-groups.md) — templates, functional groups, R-Groups, S-Groups

### Macromolecules mode (polymers)

6. [Macromolecules (Polymers)](./macromolecules.md) — monomer library, sequence/snake/flex layouts, antisense strands, polymer properties
7. [Drag-Drop Bond Establishment](./drag-drop-bond-establishment.md) — proximity-triggered AP highlighting and automatic bond creation when dropping a library monomer/preset near a canvas monomer

### Both modes

8. [Selection & Manipulation](./selection.md) — selection tools, move, rotate, flip, erase, highlight
9. [Clipboard (Copy / Cut / Paste)](./clipboard.md) — copy/cut/paste across chemical formats
10. [Undo / Redo](./undo-redo.md) — bounded 32-step command history
11. [Import, Export & Structure Checking](./import-export.md) — file formats, open/save, structure check, calculated values
