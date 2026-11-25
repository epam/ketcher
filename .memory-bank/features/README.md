# Feature Specifications

Each file in this directory describes the **current observable behavior** of a product feature. They are the canonical description of product behavior and intentionally avoid implementation details.

## Convention

Every feature file, `.memory-bank/features/<feature>.md`, has:

- **Purpose** — What problem the feature solves.
- **Requirements** — `### Requirement:` blocks with SHALL text, each with `#### Scenario:` **WHEN** / **THEN** blocks.
- **User interaction** and **Guarantees** — what the user does and what the feature guarantees.
- **Limitations** and **Related** — edge cases and links to modules and neighbouring features. Limitations are not requirements.

Update the feature file whenever the product behavior changes. An OpenSpec change under `openspec/changes/` holds its deltas against these files until it is archived.

## Documented Features

The main features, distilled from [documentation/help.md](../../documentation/help.md):

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
12. [Localization (i18n)](./localization.md) — language switcher, persistence, what translates vs. what stays as chemistry data
