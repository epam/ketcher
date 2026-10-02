---
name: ketcher-model-change
description: "Add or change a Ketcher model mutation so that undo/redo, rendering and serialization keep working: micro BaseOperation + Action, or macro Operation + Command + EditorHistory. Use for any edit that changes Struct or DrawingEntitiesManager."
argument-hint: "<what the user action changes>"
---

# Changing the model safely

Target: **$ARGUMENTS**. Background: [modules/operations-history.md](../../../.memory-bank/modules/operations-history.md),
invariants A1–A3, B1, B2. A mutation outside the pattern below compiles, renders correctly, and
breaks undo with no error anywhere — that is why this is a checklist.

## 1. Which model

| The change affects | Model | Unit | Grouped by | Committed through |
| --- | --- | --- | --- | --- |
| atoms, bonds, S-/R-Groups, reaction objects in Molecules mode | `Struct` → `ReStruct` | `extends BaseOperation` | `Action` | `packages/ketcher-react/src/script/editor/Editor.ts#update(action: Action` |
| monomers, polymer bonds, sequence, anything in Macromolecules mode | `DrawingEntitiesManager` | `implements Operation` | `Command` | `renderersContainer.update(command)` + `EditorHistory.update(command)` |

Both kinds live under `packages/ketcher-core/src/application/editor/operations/`, sometimes in the same
folder: check `extends BaseOperation` vs `implements Operation` in the neighbour you copy.

## 2a. Micro: operation → action → editor

1. Operation class in `operations/<area>/`: `extends BaseOperation` with a new entry in
   `packages/ketcher-core/src/application/editor/operations/OperationType.ts#export const OperationType`.
   `execute(restruct)` changes `restruct.molecule` and invalidates what must be redrawn; the inverse
   is a sibling class set as `static InverseConstructor` (or override `invert()`); `isDummy()` returns
   `true` when the operation would change nothing.
2. Action creator in `application/editor/actions/<area>.ts` (pattern:
   `packages/ketcher-core/src/application/editor/actions/atom.ts#export function fromAtomAddition`):
   build an `Action`, `addOp(...)`, `perform(restruct)`, return the inverted action it produces.
3. The tool or UI calls `editor.update(action)` — that pushes history. Never mutate `Struct` and
   re-render instead.

## 2b. Macro: operation → command → renderers + history

1. Operation class `implements Operation` (pattern:
   `packages/ketcher-core/src/application/editor/operations/monomer/MonomerAddOperation.ts#implements Operation`):
   the constructor receives the model-changing callbacks; `execute(renderersManager)` applies the
   change and tells the renderers; `invert(renderersManager)` undoes both. Use `priority` or the
   `*AfterAllOperations` hooks only when order matters.
2. A `DrawingEntitiesManager` method builds the `Command` from operations (pattern:
   `packages/ketcher-core/src/domain/entities/DrawingEntitiesManager.ts#public addMonomer(`). The
   file is 4.9k lines — grep the method you imitate, read that range.
3. The tool or mode applies it: `editor.renderersContainer.update(command)` then
   `history.update(command)` (pattern: `packages/ketcher-core/src/application/editor/tools/Bond.ts#this.history.update(modelChanges)`).
   Merge into the previous history entry only for continuous gestures.
4. Renderers read the model and never write it (A1); transient overlays are not operations — see
   [modules/transient-views.md](../../../.memory-bank/modules/transient-views.md).

## 3. What else the change drags in

- **Persisted state** → KET: the `ketcher-ket-format` skill, both directions (B2).
- **Chemistry computed by Indigo** (valence, layout, aromaticity, CIP) → do not recompute it in the
  model; see [modules/indigo-boundary.md](../../../.memory-bank/modules/indigo-boundary.md).
- **Both modes show it** → macro-to-micro conversion in `MacromoleculesConverter.ts`.
- **User-visible** → the matching `features/*.md` and E2E coverage of undo/redo.

## 4. Prove it

A unit test that executes the change, inverts it and compares with the starting state (exemplars in
the `ketcher-unit-tests` skill), then `/ketcher-verify`. If the change introduces a new pattern,
update `operations-history.md` in the same change.
