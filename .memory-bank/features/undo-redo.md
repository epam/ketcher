# Undo / Redo

Editing is iterative and error-prone. Users must be able to reliably reverse a mistaken action and re-apply it, restoring both the chemical model and its on-screen rendering.

Spec: [openspec/specs/undo-redo/spec.md](../../openspec/specs/undo-redo/spec.md)

## Limitations

- History is capped at 32 steps; actions older than the cap cannot be undone.

## Related

- Engine: [operations-history](../modules/operations-history.md), [editor-engine](../modules/editor-engine.md)
- Implementation: `HISTORY_SIZE = 32` in the molecules editor and the macromolecules `EditorHistory`.
