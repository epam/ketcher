# Templates, Functional Groups & Structural Groups

Drawing common rings, reusable fragments, functional groups, Markush (R-Group) structures, and structural (S-Group) annotations atom-by-atom is slow and error-prone. Ketcher provides libraries and grouping tools so users insert and annotate these constructs directly.

Spec: [openspec/specs/templates-and-groups/spec.md](../../openspec/specs/templates-and-groups/spec.md)

## Limitations

- The set of built-in functional groups is fixed and not user-editable.
- _Aromatize_ / _Dearomatize_ do not apply to rings that are part of a functional group.
- Individual atoms/bonds of an abbreviation are inaccessible until the abbreviation is removed.
- A neighbouring fragment that itself contains further abbreviations is repositioned by an approximate row-based heuristic rather than by exact bond geometry, so expanding or contracting a chain of abbreviations can still distort the bonds between them.
- This is a **molecules-mode** feature.

## Related

- Model: [domain.md](../domain.md) (SGroup, RGroup) · Engine: [editor-engine](../modules/editor-engine.md)
- See also: [atom-editing](./atom-editing.md), [import-export](./import-export.md)
