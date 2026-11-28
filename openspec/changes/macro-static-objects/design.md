## Context

Molecules mode (Struct, Action, Raphael) and Macromolecules mode (DrawingEntitiesManager, Command, D3) share no model, history or renderer. Static objects lived only in Molecules mode and stayed in `micromoleculesHiddenEntities` while Macromolecules mode was open.

## Goals / Non-Goals

**Goals:** one implementation of the static-object rules for both editors; static objects that can be seen, edited and created in Macromolecules mode; no change to Molecules-mode behaviour or to KET.

**Non-Goals:** unifying the two editors' models, history or renderers; rotating or flipping static objects in Macromolecules mode; changing chemistry-format exports.

## Decisions

- **Share the rules, not the plumbing.** Pure functions in `domain/staticObjects/` cover geometry, the draw session, image validation, text-edit resolution and text parsing. Each editor keeps thin adapters: entity, operation, renderer and tool.
- **Named handles.** A named handle (`topLeft`, `right`, `start`, …) drives resizing, instead of matching coordinates with `toFixed`.
- **Snapshot operations.** Molecules `SimpleObjectSetGeometry` and macro `StaticObjectContentOperation` store the previous and next state, so undo is a swap.
- **One macro entity.** `CoreStaticObject` holds discriminated content (`shape`, `text`, `image`), so the macro model gains one map, not three.
- **Conversion in one place.** `MacromoleculesConverter.convertStaticObjectsToStruct` and `convertStaticObjectsToDrawingEntities` serve both the mode switch and KET serialization in Macromolecules mode.
- **Text dialog reuse.** `TextEditorDialog` (ketcher-react) is presentational. Molecules mode wraps it in its Redux modal. Macromolecules mode opens it through a new `openTextEditor` editor event and a `textEditor` modal.
- **Layer rule A4.** The macro operations live in `domain/entities/` and import the renderer types only, so the domain layer gains no runtime import from `application/`.

## Risks / Trade-offs

- Text created in Macromolecules mode has a zero-size KET bounding box until Molecules mode renders it. Its position is kept.
- Macro text is drawn with SVG `tspan`s at a fixed 13 px base size, which approximates the Molecules rendering.
- Rotate and flip do not move static objects in either mode. This keeps today's Molecules behaviour.
