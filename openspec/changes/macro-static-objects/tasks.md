## 1. Shared core

- [x] 1.1 Add `domain/staticObjects/` with geometry, draw session, image validation, text-edit resolution and unit tests
- [x] 1.2 Share Lexical text content parsing and use it in the Molecules text renderer

## 2. Molecules mode adopts the core

- [x] 2.1 Shapes: hit test, handles and resize through the core; `SimpleObjectSetGeometry` replaces `SimpleObjectResize`
- [x] 2.2 Images: handles and resize through the core; upload validation through `readImageFile`
- [x] 2.3 Text: extract `TextEditorDialog`; resolve edits through `fromTextEdit`
- [x] 2.4 Scale the image centre when a struct is rescaled

## 3. Macromolecules mode

- [x] 3.1 `CoreStaticObject`, its operations and the `DrawingEntitiesManager` map
- [x] 3.2 `StaticObjectRenderer` (D3) with hover, selection and resize handles
- [x] 3.3 Conversion between modes and KET serialization; stop hiding static objects
- [x] 3.4 Select, move, resize, delete and undo
- [x] 3.5 Toolbar section and shape tools
- [x] 3.6 Text and image tools, text editor modal
