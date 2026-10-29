# Selection & Manipulation

Before editing, moving, deleting, or transforming parts of a drawing, the user must be able to select exactly the atoms, bonds, structures, or other objects they intend to act on — and then move, rotate, flip, or erase them.

Spec: [openspec/specs/selection/spec.md](../../openspec/specs/selection/spec.md)

## Limitations

- Functional groups / abbreviated S-groups can only be selected as a whole entity — they are moved, rotated, or deleted as one unit and cannot be partially selected.
- Available across **both modes**, but the macromolecules editor exposes its own selection set (rectangle, lasso, structure) and disables the eraser in sequence layout mode.

## Related

- Engine: [editor-engine](../modules/editor-engine.md)
- See also: [clipboard](./clipboard.md), [undo-redo](./undo-redo.md)
