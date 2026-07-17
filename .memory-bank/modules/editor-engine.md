# Editor Engine

> The two editor controllers that own tools, selection, events, and the edit loop.

This is a cross-cutting deep-dive. For package boundaries see [ketcher-react](./ketcher-react.md) and [ketcher-macromolecules](./ketcher-macromolecules.md). For the mutation/undo machinery see [operations-history](./operations-history.md).

## Responsibility

Ketcher runs **two independent editor controllers** — one for micromolecules, one for macromolecules. Each owns its input pipeline (user gestures → active tool), the active tool, the current selection, and its render target. They never share an instance; a converter bridges them when data needs to move between the two, and the top-level Ketcher facade coordinates them from the outside.

|           | Micromolecules editor                   | Macromolecules editor    |
| --------- | --------------------------------------- | ------------------------ |
| Model     | `Struct` via a render-structure wrapper | `DrawingEntitiesManager` |
| Render    | Raphael                                 | D3/SVG                   |
| Mutations | Action + base operation                 | Command + operation      |
| History   | stack held inside the editor            | history singleton        |
| Modes     | single                                  | Flex / Snake / Sequence  |

## Micromolecules editor

The micromolecules editor owns the Raphael render object and, through it, the render-structure view-model. It holds the current selection and the active tool, and manages the undo/redo history stack directly (capped at 32 steps).

It exposes a rich set of event streams that the UI subscribes to — structure changes, selection changes, element/bond/S-group/R-group edit requests, zoom changes, aromatization, cursor updates, and more. It also hosts a handful of auxiliary controllers: a highlighter, a hover-icon manager, a rotate controller, and context-menu state.

The **Monomer Creation Wizard** related logic also lives here — it lets users draw a small molecule and promote it into a macromolecule monomer template, using the converter and dedicated monomer-creation operations to do so. There is a plan to move this to its own module.

Key capabilities:

- **Tool management** — switching tools cancels the previous one and activates the new one.
- **Struct management** — getting and setting the current molecule on the canvas.
- **Selection** — get or set the current selection, including convenience modes like "select all" or "select descriptors".
- **Update** — apply an Action, push it to history, and fire the change event so subscribers know the model changed.
- **Hit testing** — given a DOM event, find the nearest canvas item at that position.

### Tools

About 25 tools are registered in a map by name. Each tool implements a standard set of mouse/keyboard event handlers (click, double-click, mousedown, mousemove, mouseup, mouseleave, mouseover). DOM events are wired to the active tool, but the whole pipeline is silenced while the macromolecules editor is active — the two input pipelines never run at the same time.

## Macromolecules editor (CoreEditor)

The macromolecules editor owns the drawing-entities manager (the model), the renderers manager (the D3/SVG visual layer), the active mode, and the active tool. It also holds a back-reference to the micromolecules editor instance for operations that need to cross the boundary.

### Mode system

There are three concrete modes, all extending a shared abstract base:

| Mode     | Name in the system     |
| -------- | ---------------------- |
| Flex     | `flex-layout-mode`     |
| Snake    | `snake-layout-mode`    |
| Sequence | `sequence-layout-mode` |

The default mode is Sequence. Each mode is registered by name and looked up by name at runtime. The base mode provides common behaviour: initialization, keyboard handling, copy/cut/paste (including conversion from non-KET clipboard content via Indigo), and abstract hooks that each concrete mode implements — how to position a newly added node, whether pasting is allowed, and how to scroll the view.

### Tools

Tools follow the same pattern as the micromolecules side: a map of tool constructors keyed by name, and a shared base class. The macromolecules tool set covers monomer placement, bond creation, erasing, selection variants, rotation, zoom, and sequence editing.

### Event bus

Each macromolecules editor instance builds its **own** event bus on construction — there is no shared global bus, so multiple editor instances on the same page do not leak events into each other. The bus is a collection of about 74 typed subscriptions covering tool selection, mode switching, monomer/preset selection, bond creation, clipboard operations, layout commands, flip and rotation, and mode-switch triggers between the two editor domains. On teardown every handler is removed.

When the editor starts up it wires each subscription to its handler. For every standard DOM event (mouse, keyboard, wheel) it adds a handler that first lets the active mode inspect the event, then lets the active tool handle it.

## Multiple instances and instance resolution

Neither editor is a global singleton so multiple independent Ketcher instances — each with their own pair of micro and macro editors — can coexist on the same page without interfering with each other.

## Bridging the two editors

**The Ketcher facade** is the public API surface. It holds a reference to the micromolecules editor and coordinates with the macromolecules editor by resolving it via its ID. Mode-switch entry points on the facade trigger the handoff between the two editor domains.

**The converter** translates between the two data models when switching modes:

- Micro → macro: converts the current `Struct` and its render-structure into drawing entities (used when switching into macromolecules mode).
- Macro → micro: converts drawing entities back into a `Struct` and render-structure (used when switching back to micromolecules mode).
- It also provides the monomer↔S-group conversion helpers shared with the Monomer Creation Wizard.

## Assumptions & constraints

- Only one input pipeline is live at a time; a global flag selects which editor receives DOM events. The global flag is a known bad pattern, can affect multiple ketcher instances on the same page and is planned for removal.
- Neither editor is a global singleton — both are scoped to a `ketcherId`.
- All model changes must go through Action/Command — never mutate `Struct` or `DrawingEntitiesManager` directly from tools or UI. See [operations-history](./operations-history.md).
- Renderers only read the model; the editor triggers re-render after every mutation. See [rendering](./rendering.md).
- The Monomer Creation Wizard related logic currently lives in the micromolecules editor; there is a plan to move it to a dedicated module.
