# Invariants

> What must never be broken?

These are architectural and domain rules that must always remain true. Unlike implementation details, invariants define the contracts that all future changes must preserve.

---

## Domain Invariants

**D1 — Attachment point uniqueness per monomer**
Each attachment point on a monomer (R1, R2, …) may be occupied by at most one `PolymerBond` at any given time. Attempting to connect a second bond to an already-occupied attachment point is invalid.

**D2 — PolymerBond always has two distinct endpoints**
A `PolymerBond` always connects exactly two different monomers. Self-bonds are not valid.

**D3 — Monomer library identity**
A monomer in the library is uniquely identified by the combination of `(MonomerName, MonomerClass)`. Alias collisions across monomers (HELM alias, BILN alias, IDT aliases) are rejected at insert time and must never exist in the in-memory library.

**D4 — RNA preset class constraint**
`MonomerGroupTemplate` entries in the library must have class `RNA`. Non-RNA monomer group templates are not handled.

---

## Architectural Invariants

**A1 — Renderer never mutates the model**
Renderers (Raphael `ReStruct` and D3 `RenderersManager`) are read-only consumers of the domain model. They must never call mutation methods on `Struct`, `DrawingEntitiesManager`, or any entity directly.

**A2 — All model mutations go through Command + BaseOperation**
Every change to `DrawingEntitiesManager` or `Struct` must be encoded as a `Command` containing `BaseOperation` objects with `execute()` and `invert()`. Direct mutations outside this pattern break undo/redo.

**A3 — EditorHistory is the only undo/redo stack for macromolecules**
The `EditorHistory` singleton (max 32 steps) is the authoritative undo/redo mechanism for the macro editor. History must be updated via `EditorHistory.update(command)` after every undoable operation.

**A4 — domain layer has no rendering or React imports**
The `packages/ketcher-core/src/domain/` directory must not import from `application/render/`, `application/editor/` (except types), React, or any UI framework. It must remain a pure TypeScript domain layer.

**A5 — ketcher-core has no React dependency**
`packages/ketcher-core` must not declare React as a dependency. It is a framework-agnostic library consumed by React packages.

**A6 — Single Ketcher instance per ketcherId**
The `ketcherProvider` registry enforces at most one `Ketcher` instance per `ketcherId`. Code must use `ketcherProvider.getKetcher(id)` to retrieve instances — never store raw `Ketcher` references in module-level variables without going through the provider.

---

## Behavioral Invariants

**B1 — Undo preserves document consistency**
After any number of undo/redo operations, the canvas must be in a valid state where all attachment points, bonds, and chain references are consistent.

**B2 — Format round-trip fidelity for KET**
Serializing the current canvas to KET and immediately deserializing it must yield a functionally equivalent structure. The KET format is the lossless round-trip format.
