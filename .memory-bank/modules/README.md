# Modules

Each file in this directory describes a single subsystem of Ketcher.

## Convention

Each module document answers:

- **Responsibility** — What is this subsystem responsible for?
- **Public interfaces** — What does it expose to the rest of the system?
- **Dependencies** — Which modules does it depend on?
- **Dependents** — Which modules depend on it?
- **Assumptions & constraints** — What important rules apply?

## Documented Modules

### Packages (npm workspaces)

- [ketcher-core](./ketcher-core.md) — shared domain, application logic, serializers, renderers
- [ketcher-react](./ketcher-react.md) — micromolecules React UI + integration host
- [ketcher-macromolecules](./ketcher-macromolecules.md) — macromolecules React UI
- [ketcher-standalone](./ketcher-standalone.md) — offline Indigo WASM bundle

### Cross-cutting subsystems (deep dives)

These span multiple packages and are the most valuable parts to understand. They are referenced from [../architecture.md](../architecture.md#deep-dives-the-biggest-most-valuable-parts).

- [editor-engine](./editor-engine.md) — the two editor controllers, tools, events, modes, converter bridge
- [rendering](./rendering.md) — Raphael (`ReStruct`) and D3 (`RenderersManager`) pipelines
- [serialization](./serialization.md) — serializers, `FormatterFactory`, `StructService`, `Indigo`
- [operations-history](./operations-history.md) — `Action`/`BaseOperation` and `Command`/`Operation` + undo/redo
- [monomer-library](./monomer-library.md) — loading/caching/merging monomers, RNA presets, library UI
- [monomer-drag-and-drop](./monomer-drag-and-drop.md) — dragging library items onto the canvas (D3 drag, ghost preview, placement, mode differences)
