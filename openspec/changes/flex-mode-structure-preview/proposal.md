## Why

Pasting or importing a structure in macromolecules flex mode currently places it immediately, without letting the user choose its position. A transient preview lets users position the structure before it is added while keeping the canvas and undo history unchanged until placement.

## What Changes

- Clipboard paste in flex mode displays a cursor-following preview and places the structure on click as one undoable action.
- The import dialog's **Add to Canvas** action uses the same preview and places the structure on click without selecting it.
- Escape, tool changes, layout changes, and document replacement cancel pending preview work.
- Snake and sequence modes retain direct placement; **Open as New** continues to replace the canvas directly.

## Capabilities

### Modified Capabilities

- `clipboard`: Positioning and cancelling a pasted structure in flex mode.
- `import-export`: Positioning an imported structure added to the canvas in flex mode.

## Impact

- `ketcher-core`: clipboard handling, paste placement, transient rendering, and import placement.
- `ketcher-core` tests: paste cancellation and preview behavior.
- `ketcher-autotests`: screenshots and interaction coverage for paste and import previews.
- No new dependencies or format changes.
