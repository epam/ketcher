## Why

Shapes (ellipse, rectangle, line), text boxes and images are not chemistry, yet they only work in Molecules mode. In Macromolecules mode they are kept out of sight and cannot be seen, selected or edited, and users cannot add them there (#12645). Each editor also held its own copy of the rules for these objects, so porting them naively would have duplicated that logic again.

## What Changes

- Add a shared, editor-agnostic core for static objects: geometry (bounding box, handles, hit test, move, resize), the draw-by-drag rules, image validation, text-edit resolution and text content parsing. Molecules mode now uses it with no visible change.
- Show static objects created in Molecules mode in Macromolecules mode, and keep objects created in Macromolecules mode when switching back.
- Let users select, move, resize by handle, delete and undo static objects in Macromolecules mode.
- Add a static-object section to the Macromolecules left toolbar: a shapes submenu (ellipse, rectangle, line), a text button and an image button.
- Snake, flex and sequence layouts neither move nor hide static objects. The static-object tools are disabled in sequence layout, like the erase and bond tools.
- Fix: an image's centre is now scaled together with its size when a structure is rescaled, for example on a mode switch between different bond-length scales.

## Capabilities

### New Capabilities

- `macro-static-objects`: visibility, editing and creation of shapes, text and images in Macromolecules mode, and their round trip between modes.

### Modified Capabilities

- none

## Impact

- `packages/ketcher-core/src/domain/staticObjects/`: new shared core.
- `packages/ketcher-core/src/domain/entities/CoreStaticObject.ts`, `CoreStaticObjectOperations.ts`, `DrawingEntitiesManager.ts`: macro model.
- `packages/ketcher-core/src/application/render/renderers/StaticObjectRenderer.ts`: D3 rendering.
- `packages/ketcher-core/src/application/editor/MacromoleculesConverter.ts`, `domain/serializers/ket/ketSerializer.ts`: conversion between modes and KET from Macromolecules mode.
- `packages/ketcher-core/src/application/editor/tools/StaticShape.ts`, `StaticTextAndImage.ts`, `tools/select/SelectBase.ts`: macro tools.
- `packages/ketcher-react`: the Molecules tools use the shared core, and `TextEditorDialog` is exported for reuse.
- `packages/ketcher-macromolecules`: toolbar section and text editor modal.
