# ketcher-core

> The shared library that contains all domain entities, application logic, serializers, and renderers.

## Responsibility

`ketcher-core` is the foundational package. It defines:

- The **domain model** (all chemical entities)
- The **application layer** (both editor instances, operations, history, modes, tools)
- The **rendering subsystem** (both Raphael micro-renderer and D3/SVG macro-renderer)
- The **serialization layer** (KET, MOL, SDF formats + StructService interface)
- The public **`Ketcher` facade** (the API surface for host apps)

## Public Interfaces

Key exports from `packages/ketcher-core/src/index.ts`:

- `Ketcher` — main facade class
- `CoreEditor` — macromolecules editor instance
- `DrawingEntitiesManager` — macromolecules canvas state
- `RenderersManager` — D3/SVG renderer manager
- `Struct`, `Atom`, `Bond`, `SGroup` — micromolecule domain objects
- `BaseMonomer`, `Peptide`, `Sugar`, `Phosphate`, `RNABase`, `Chem` — macromolecule monomers
- `PolymerBond`, `HydrogenBond` — polymer bonds
- `KetSerializer` — KET format reader/writer
- `FormatterFactory` + `StructFormatter` — multi-format serialization
- `EditorHistory`, `Command`, `BaseOperation` — undo/redo primitives
- `SettingsManager`, `KetcherLogger` — utilities
- All type exports (ChemicalMimeType, AttachmentPointName, MonomerItemType, etc.)

## Dependencies

- External: `d3`, `raphael`, `lodash`, `subscription`, `jsonschema` (JSON schema validation), `ajv` (JSON schema precompilation only)
- No React dependency — pure TS

## Dependents

- `ketcher-react` (imports for micromolecules editor and types)
- `ketcher-macromolecules` (imports for macro editor and types)
- `ketcher-standalone` (imports StructService interfaces)

## Key Files

| File                                                            | Role                                    |
| --------------------------------------------------------------- | --------------------------------------- |
| `src/application/ketcher.ts`                                    | Public Ketcher API                      |
| `src/application/editor/Editor.ts`                              | CoreEditor — macro editor controller    |
| `src/domain/entities/DrawingEntitiesManager.ts`                 | Macro canvas model orchestrator              |
| `src/domain/entities/struct.ts`                                 | Micromolecule data model                |
| `src/application/render/renderers/RenderersManager.ts`          | D3/SVG renderer orchestrator            |
| `src/application/render/renderers/sequence/SequenceRenderer.ts` | Sequence-mode renderer                  |
| `src/application/render/restruct/restruct.ts`                   | Raphael re-renderer for micromolecules  |
| `src/application/render/raphaelRender.ts`                       | Raphael canvas host                     |
| `src/application/editor/EditorHistory.ts`                       | Undo/redo stack (max 32 steps)          |
| `src/application/editor/MacromoleculesConverter.ts`             | Converts between macro and micro models |
| `src/domain/serializers/ket/ketSerializer.ts`                   | KET format serializer/deserializer      |
| `src/application/formatters/formatterFactory.ts`                | Multi-format formatter registry         |
| `src/application/indigo.ts`                                     | StructService wrapper (chemistry ops)   |

## Assumptions & Constraints

- Must have **no React dependency** — it is consumed by both React packages but must stay framework-agnostic.
- The `domain/` layer must have **no imports from `application/render/`** (domain must not know about rendering).
- All canvas mutations must go through `Command` + `BaseOperation` — never mutate `DrawingEntitiesManager` or `Struct` directly from UI code.
