# Editor Engine

> The two editor controllers that own tools, selection, events, and the edit loop.

This is a cross-cutting deep-dive. For package boundaries see [ketcher-react](./ketcher-react.md) and [ketcher-macromolecules](./ketcher-macromolecules.md). For the mutation/undo machinery see [operations-history](./operations-history.md).

## Responsibility

Ketcher runs **two independent editor controllers**. Each owns the input pipeline (DOM events → active tool), the active tool, the selection, and the render target. They never share an instance; they are bridged by `MacromoleculesConverter` and coordinated by the `Ketcher` facade.

|           | Micromolecules editor                                | Macromolecules editor (`CoreEditor`)                     |
| --------- | ---------------------------------------------------- | -------------------------------------------------------- |
| File      | `packages/ketcher-react/src/script/editor/Editor.ts` | `packages/ketcher-core/src/application/editor/Editor.ts` |
| Model     | `Struct` via `ReStruct` (`render.ctab`)              | `DrawingEntitiesManager`                                 |
| Render    | `Render` (Raphael) — see [rendering](./rendering.md) | `RenderersManager` (D3/SVG)                              |
| Mutations | `Action` + `BaseOperation`                           | `Command` + `Operation`                                  |
| History   | in-editor `historyStack`                             | `EditorHistory` singleton                                |
| Modes     | single                                               | `BaseMode`: Flex / Snake / Sequence                      |

## Micromolecules `Editor`

Class `Editor` (implements `KetcherEditor`). Key responsibilities:

- Owns `render: Render`; `render.ctab` is the `ReStruct` view-model.
- Holds `_selection: Selection | null` and `_tool: Tool | null`.
- Owns undo/redo directly: `historyStack: Action[]`, `historyPtr`, `HISTORY_SIZE = 32`.
- Exposes a large `event` object of `Subscription`/`PipelineSubscription` streams (`change`, `selectionChange`, `elementEdit`, `bondEdit`, `sgroupEdit`, `rgroupEdit`, `zoomChanged`, `aromatizeStruct`, `enhancedStereoEdit`, `cursor`, `updateFloatingTools`, …).
- Hosts auxiliary controllers: `Highlighter`, `HoverIcon`, `RotateController`, `ContextMenuInfo`.
- Hosts the **Monomer Creation Wizard** — builds macromolecule monomer templates from micro structures via `MacromoleculesConverter` and monomer-creation operations.

### Key methods

| Method                                           | Purpose                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| `constructor(ketcherId, clientArea, options, …)` | Creates `Render`, wires the event object, calls `domEventSetup`         |
| `tool(name?, opts?)`                             | Get/set active tool. Cancels previous, `new toolsMap[name](this, opts)` |
| `struct(value?, …)`                              | Get/set the molecule (`fromNewCanvas`)                                  |
| `selection(ci?)`                                 | Get/set selection; supports `'all'`, `'descriptors'`                    |
| `update(action, ignoreHistory?)`                 | Apply `Action`, push to history, dispatch `change`                      |
| `undo()` / `redo()`                              | Perform stored `Action`, replace slot with its inverse                  |
| `findItem(event, maps, skip)`                    | Hit-testing via `closest.item(...)`                                     |

### Tools

Registry: `packages/ketcher-react/src/script/editor/tool/index.ts` exports `toolsMap: Record<string, ToolConstructorInterface>`. ~25 tools; interface in `tool/Tool.ts` (`ToolEventHandler`: click, dblclick, mousedown, mousemove, mouseup, mouseleave, mouseover). DOM wiring is in `domEventSetup(editor, clientArea)`, guarded by `window.isPolymerEditorTurnedOn` so micro tools go silent while macro mode is active.

## Macromolecules `CoreEditor`

Class `CoreEditor`. Key state fields:

- `events: IEditorEvents` — the event bus (see below).
- `drawingEntitiesManager: DrawingEntitiesManager` — the macro model.
- `renderersContainer: RenderersManager` — the D3/SVG renderers.
- `mode: BaseMode` + `previousModes: BaseMode[]`.
- `tool?: Tool | BaseTool` (exposed via `selectedTool`).
- `micromoleculesEditor: Editor` — back-reference obtained via `ketcherProvider.getKetcher(ketcherId).editor`.
- `zoomTool`, `viewModel`, `transientDrawingView`.

Registered **per `ketcherId`** via `setEditorInstance(this)` and unregistered on `destroy()` via `resetEditorInstance(this.ketcherId)` (`editorSingleton.ts`). This is **no longer a process-wide singleton** — multiple `CoreEditor` instances can coexist on one page (e.g. several embedded Ketchers). `editorSingleton.ts` keeps a `Map<ketcherId, CoreEditor>` plus two fallbacks (a `_lastEditorInstance` and a transient `_renderingContext`).

Instances are resolved with `provideEditorInstance(ketcherId?)`, which picks in this order:

1. the active `_renderingContext`, if one is set (see below);
2. the instance registered under the given `ketcherId`;
3. otherwise the most recently registered instance (`_lastEditorInstance`).

The `_renderingContext` is a scoping mechanism used during rendering: `RenderersManager.update()` calls `setEditorRenderingContext(this.editor)` for the duration of a render pass (and clears it in a `finally`). This lets renderers and model entities that call `provideEditorInstance()` **without** a `ketcherId` (e.g. atom/bond/monomer/sequence renderers, `DrawingEntitiesManager`, `AttachmentPoint`) resolve to the correct editor even when several instances exist. Callers that hold a `ketcherId` should pass it so they don't rely on the fallback.

### Mode system

`packages/ketcher-core/src/application/editor/modes/`

| Mode     | Class                 | File              | `modeName`             |
| -------- | --------------------- | ----------------- | ---------------------- |
| Base     | `BaseMode` (abstract) | `BaseMode.ts`     | —                      |
| Flex     | `FlexMode`            | `FlexMode.ts`     | `flex-layout-mode`     |
| Snake    | `SnakeMode`           | `SnakeMode.ts`    | `snake-layout-mode`    |
| Sequence | `SequenceMode`        | `SequenceMode.ts` | `sequence-layout-mode` |

Each concrete mode self-registers via `registerMode(name, ctor)` (`modesRegistry.ts`); `getModeConstructor(mode)` looks them up. `DEFAULT_LAYOUT_MODE = 'sequence-layout-mode'`. `BaseMode` provides `initialize()`, `onKeyDown`, copy/cut/paste handling (`pasteFromClipboard`, `pasteKetFormatFragment`, `pasteWithIndigoConversion`), and abstract `getNewNodePosition()` / `isPasteAllowedByMode()` / `scrollForView()`.

### Tools

Registry: `application/editor/tools/index.ts` exports `toolsMap: Record<ToolName, ToolConstructorInterface>`. Base class `BaseTool` in `tools/Tool.ts`.

### Event bus (`IEditorEvents`)

`editorEvents.ts` defines the `IEditorEvents` interface (~74 `Subscription` fields: `selectTool`, `selectMode`, `selectMonomer`, `selectPreset`, `createBondViaModal`, `copySelectedStructure`, `pasteFromClipboard`, `switchToMacromoleculesMode`, `switchToMoleculesMode`, `flipHorizontal/Vertical`, `layoutCircular`, …), the `createEditorEvents()` factory, the `renderersEvents` array (DOM events forwarded to mode+tool), and `hotkeysConfiguration`.

The event bus is **no longer a shared singleton**. Each `CoreEditor` builds its **own** bus in its constructor via `this.events = createEditorEvents()`, so every editor instance has an independent set of `Subscription`s; there is no cross-instance event leakage. On `destroy()` the editor removes every handler and empties each subscription's `handlers` array (there is no separate `resetEditorEvents()` — teardown is per-instance).

`CoreEditor.subscribeEvents()` wires each subscription to a handler (`selectTool → onSelectTool`, etc.). For every `renderersEvents` name it adds a handler that calls `useModeIfNeeded(...)` then `useToolIfNeeded(...)`.

## Bridging the two editors

- **`Ketcher` facade** (`application/ketcher.ts`) holds only the micro `Editor` (`#editor`). Facade structure ops (`getSmiles`, `setMolecule`, `addFragment`, …) drive the micro editor. To coordinate with macro it resolves the matching `CoreEditor` via `provideEditorInstance()` (ideally by its own `ketcherId`). Mode switch entry points: `switchToMacromoleculesMode()` / `switchToMoleculesMode()`.
- **`MacromoleculesConverter`** (`application/editor/MacromoleculesConverter.ts`) translates between the shared micro `Struct`/`ReStruct` and the macro `DrawingEntitiesManager`:
  - `convertStructToDrawingEntities(struct, dem)` — micro → macro (used by `CoreEditor.switchToMacromolecules()`).
  - `convertDrawingEntitiesToStruct(dem, struct, reStruct)` — macro → micro (used by `CoreEditor.switchToMicromolecules()`).
  - Monomer↔S-Group conversion helpers (`convertMonomerToMonomerMicromolecule`, attachment-point mapping) shared with the Monomer Creation Wizard.

## Assumptions & constraints

- Only one input pipeline is live at a time; `window.isPolymerEditorTurnedOn` selects it.
- `CoreEditor` is **not** a global singleton: instances are keyed by `ketcherId` in `editorSingleton.ts`, so multiple editors can share a page. Code that resolves an instance via `provideEditorInstance()` without a `ketcherId` relies on the render-scoped `_renderingContext` or the last-registered fallback; prefer passing a `ketcherId` where available.
- The macro event bus is also **not** a singleton: each `CoreEditor` owns its own `IEditorEvents` from `createEditorEvents()` and tears it down on `destroy()`.
- All model changes must go through `Action`/`Command` — never mutate `Struct` or `DrawingEntitiesManager` directly from tools/UI. See [operations-history](./operations-history.md).
- Renderers only read the model; the editor triggers re-render via `render.update()` (micro) or `renderersContainer.update(command)` (macro). See [rendering](./rendering.md).
- Many **Monomer Creation Wizard** logic hosted in micromolecules editor. There is a plan to move it to separate module.
- Usage of window.isPolymerEditorTurnedOn is a bad pattern and should be removed in future refactoring.
