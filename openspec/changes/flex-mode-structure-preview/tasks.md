## 1. Flex-mode placement preview

- [x] 1.1 Add a paste placement tool that displays detached entities as a cursor-following transient preview.
- [x] 1.2 Place the entities on click as one undoable action, preserving caller-specific selection behavior.
- [x] 1.3 Keep direct placement in snake and sequence modes and preserve direct replacement for **Open as New**.

## 2. Cancellation and import integration

- [x] 2.1 Cancel clipboard reads and conversions when the user changes tools, layouts, or documents.
- [x] 2.2 Route **Add to Canvas** through the placement preview without automatically selecting imported entities.
- [x] 2.3 Ensure Escape discards the preview without changing the canvas or undo history.

## 3. Validation

- [x] 3.1 Add unit coverage for paste preview lifecycle and cancellation.
- [x] 3.2 Add end-to-end coverage for flex-mode paste and import placement.
- [x] 3.3 Validate the OpenSpec change and update affected screenshot baselines.
