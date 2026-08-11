# Transient Views

> Short-lived, purely-visual overlays drawn over the macromolecules canvas — never part of the model, operations, serialization, or undo/redo.

Cross-cutting deep-dive within the macromolecules render layer. Complements [rendering](./rendering.md) (the D3 renderers that draw the persistent model) and [monomer-drag-and-drop](./monomer-drag-and-drop.md) (one of its consumers).

## Responsibility

Render ephemeral interaction feedback on top of (or beneath) the live drawing without touching the model. Every transient view is **read-only**: it recomputes its geometry from parameters and current renderer positions, draws SVG, and disappears when dismissed. Nothing it draws is ever persisted, undoable, or exported.

Current feedback drawn this way includes: the selection rectangle/lasso, bond / angle / distance / group-center snapping guides, the rotation handle, the autochain insertion preview (a ghost of the item that would be added), the amino-acid modification highlight, the line-length highlight, and the **replacement highlight** used by monomer drag-drop replacement.

## Structure

- A single **manager** owns two sibling SVG `<g>` layers appended to the zoom canvas group: a **default layer** and a **top layer** (kept raised above everything else). Both live _inside_ the zoom transform, so overlays share the same canvas coordinate space as monomers (angstrom → canvas conversion) and track pan/zoom automatically.
- Each concrete view is a small class extending an abstract **`TransientView`** base, exposing:
  - a static **`viewName`** — a unique key, and
  - a static **`show(layer, params)`** — draws the view into the given layer.

## Lifecycle: show → update → hide

Rendering is **pull-based**:

1. The manager keeps a map of active views keyed by `viewName`. Registering a view stores its `show` function, its params, an optional `topLayer` flag, and optional `onShow` / `onHide` callbacks.
2. **`update()`** clears both layers, then re-runs every active view's `show` into its chosen layer (top or default), invokes each `onShow`, and re-raises the top layer.
3. Paired **`showX` / `hideX`** methods register or remove a view; **both require a following `update()`** to take visual effect. `clear()` removes all views.

Because `update()` fully redraws, views hold no state between frames — they recompute from their params each time. Registering a view under an existing `viewName` replaces the previous one (and runs its `onHide`).

## Public interface (conceptual)

- **`TransientView`** — abstract base (`viewName` + static `show`).
- **`TransientDrawingView`** — the manager, held on the macro editor as `transientDrawingView`. It exposes paired `showX` / `hideX` methods (selection, rotation, the snap guides, autochain preview, modify-amino-acids, line-length highlight, replacement highlight) plus `update()` and `clear()`.
- Concrete views are added by (a) creating a `TransientView` subclass, (b) exporting it from the transient-view barrel, and (c) adding a `showX` / `hideX` pair on the manager.

## Replacement highlight (worked example)

Drawn on the **top layer** while a library item is dragged over a canvas monomer/preset that would be replaced on drop (see [monomer-drag-and-drop](./monomer-drag-and-drop.md)):

- Each **monomer renderer owns the shape that outlines its body** (a rounded square for sugars/peptides/CHEM, a diamond for RNA bases, a circle for phosphates) and exposes it as a signed-distance shape. The view collects every replaced monomer's shape and adds a **neck shape along each bond internal to the highlighted set** (bonds to unaffected neighbours are left open, so the outline reflects exactly what will be replaced).
- The shapes are unioned (`min` of their signed distances) and the zero-level contour is extracted with **marching squares**, producing **one continuous `<path>`** that hugs each shape and flows smoothly across the necks — **no SVG filters**.
- The drag-drop handler shows/hides it — and dims the affected monomer bodies — as the hover target changes, and clears it on drop, on drag end, and before the "deletion of bonds" confirmation modal.

## Dependencies

- **Zoom tool** — provides the canvas `<g>` the layers attach to and the coordinate transform.
- **Renderers / monomer renderers** — views read their canvas-space centre/position and reuse the shared `<symbol>` body defs.
- **Editor instance + events** — interactions (tools, drag-drop) decide when to show/hide and call `update()`.

## Dependents

- The macro editor and its **select / rotate tools** (selection, rotation, and snapping feedback).
- **Autochain insertion** (the preview ghost).
- **Monomer replacement drag-drop** (the replacement highlight).

## Assumptions & constraints

- Overlays are **purely visual**: no model mutation, no operations, no undo/redo, not serialized.
- **Nothing renders until `update()` runs** — every `showX` / `hideX` must be followed by `update()`.
- Coordinates must be in **canvas space** (angstrom → canvas), matching monomers, because the layers sit inside the zoom transform.
- The **top layer is always raised last**, so views flagged `topLayer` sit above monomers.


