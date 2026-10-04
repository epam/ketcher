# Monomer Drag-and-Drop

> How library items (monomers, ambiguous monomers, RNA presets) are dragged from the library panel and placed on the macromolecules canvas.

Complements [monomer-library](./monomer-library.md) (the library data and UI) and [editor-engine](./editor-engine.md) (modes, tools, events).

## Responsibility

Translate a user drag gesture that begins on a library card into a model mutation (monomer added at the correct canvas position) with a corresponding visual ghost during the drag, while respecting the active editor mode.

## Two placement mechanisms

There are **two distinct paths** for placing a library item on the canvas, chosen by the active editor mode:

| Path                | Modes       | Trigger                                         |
| ------------------- | ----------- | ----------------------------------------------- |
| **Drag-and-drop**   | Flex, Snake | User drags a card and releases over the canvas  |
| **Click-to-insert** | Sequence    | User clicks a card; DnD is explicitly cancelled |

The rest of this document covers the drag-and-drop path.

## Drag initiation (library side)

Each library card component attaches a **D3 drag behavior** to its DOM element via a dedicated hook. The hook has access to the current editor instance and the Redux store.

**On drag start** the hook checks the active mode name. If the editor is in sequence mode it sets a cancellation flag on the editor and does nothing further. Otherwise it sets a grabbing cursor on the document body.

**On drag move** (while not cancelled) the hook fires two side-effects:

- Sets an `isDragging` flag in the Redux store — cards read this to adjust their visual appearance.
- Fires a drag-state editor event carrying the dragged item and the current cursor position made relative to the Ketcher root element's bounding rect.

**On drag end** the hook:

1. Checks whether the cursor is inside the canvas area bounding rect (obtained from the zoom tool). If not, the drop is a no-op.
2. Converts screen coordinates to canvas coordinates using the zoom transform's inverse, applying a small offset to center the drop point on the monomer body.
3. Fires a place-on-canvas editor event with the item and the computed canvas position.
4. Clears drag state, restores the cursor, and clears the `isDragging` flag.

RNA presets use the same hook and the same mechanics — they are treated as a single draggable item.

## Ghost preview

A ghost component lives in the macromolecules editor tree and is always mounted. It subscribes to the drag-state editor event and keeps the current drag data in local state.

**Positioning:** on each state change the ghost container's CSS transform is updated to follow the cursor. When the cursor is over the canvas the ghost also applies the current zoom scale so it visually matches the size monomers will appear at when dropped.

**Content:** the ghost renders a preset ghost or a monomer ghost depending on the item type. Both reuse the real monomer symbol definitions (the same shared SVG symbol mechanism used by live renderers) so the ghost looks identical to the placed monomer, styled with a gray fill and a drop-shadow.

When the drag ends the drag state is cleared and the ghost disappears.

## Editor event wiring

Two events are defined on the editor's event bus:

- **Drag-state event** — carries the current item and cursor position, or null to clear. The editor stores the value internally; the ghost component reads it to position and render itself.
- **Place-on-canvas event** — carries the item and the canvas-space position. The editor's handler for this event performs the actual model mutation.

A right-click during a drag (context menu) also cancels the drag: the context-menu handler clears the drag state on the editor.

## Placement handler (editor side)

When the place-on-canvas event fires, the editor:

1. **Converts coordinates** — canvas pixels are divided by the macro mode scale to produce model-space angstrom coordinates.
2. **Branches on item type** — a type-guard decides the placement path:
   - RNA preset: creates sugar, optional phosphate, optional base, and their inter-monomer bonds; determines 5′/3′ phosphate orientation from attachment points.
   - Ambiguous monomer: creates an ambiguous monomer entity.
   - Single monomer: creates the concrete monomer entity.
3. **Constructs and executes the Command** — the drawing-entities manager returns a Command containing one or more monomer-add operations (and bond operations for presets). The editor pushes it to history and executes it on the renderers container, which draws the monomers on canvas.
4. **Post-placement bookkeeping** — newly added entities are selected and the next autochain position is calculated and stored.

## Model mutation and rendering

The monomer-add operation (priority 1) does the actual work:

- At construction time it immediately runs the model-add step: it picks the concrete entity class via a factory, creates the entity, moves it to the target position, and stores it in the drawing-entities manager.
- When the renderers manager executes the operation it picks the matching renderer class (again via the factory), creates a renderer instance, and calls its show method — this is the moment the monomer visually appears on the SVG canvas.
- Inverting the operation removes both the model entry and the renderer, providing undo.

## Assumptions & constraints

- The D3 drag behavior is re-created whenever the card component re-mounts or the dragged item changes.
- There is a legacy monomer tool / preset tool in the tools registry (referenced by unit tests and the tool map) but they are obsolete it is **not** the mechanism used for library DnD in the current implementation.
