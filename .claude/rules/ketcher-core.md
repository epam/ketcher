---
paths:
  - "packages/ketcher-core/**"
description: "ketcher-core: layers, the two mutation systems, formats, unit-test traps"
---

# ketcher-core

Deep dives: [modules/ketcher-core.md](../../.memory-bank/modules/ketcher-core.md),
[modules/operations-history.md](../../.memory-bank/modules/operations-history.md),
[modules/rendering.md](../../.memory-bank/modules/rendering.md). Invariants A1–A7 all apply here.

## Layers

`domain/` → `application/` → `infrastructure/`, with `utilities/` shared; imports go one way. `domain/`
takes nothing from `application/render/` or `application/editor/` except types, and nothing from
React (A4); the package declares no React dependency (A5). Import through the aliases `domain/…`,
`application/…`, `infrastructure/…`, `utilities`, `types`.

## Two mutation systems — choose by model, not by folder

| Model | Unit of change | Grouped into | History |
| --- | --- | --- | --- |
| micro: `Struct` rendered by `ReStruct` | `extends BaseOperation`, inverse via `InverseConstructor` | `Action` | react `Editor.update(action)` |
| macro: `DrawingEntitiesManager` | `implements Operation`, `execute`/`invert` on `RenderersManager` | `Command` | `EditorHistory.update(command)`, 32 steps |

Anchors: `packages/ketcher-core/src/application/editor/operations/BaseOperation.ts#class BaseOperation`,
`packages/ketcher-core/src/application/editor/actions/action.ts#export class Action`,
`packages/ketcher-core/src/domain/entities/Command.ts#export class Command`,
`packages/ketcher-core/src/application/editor/EditorHistory.ts#const HISTORY_SIZE = 32`.

`application/editor/operations/` holds both kinds side by side — `operations/monomer/` mixes them —
so check `extends BaseOperation` vs `implements Operation` before copying a neighbour. A model change
outside these units breaks undo without any error (A2, A3); renderers never write to the model (A1).
Full checklist: the `ketcher-model-change` skill.

## Formats

Only KET and in-limit MOL V2000 are parsed here; everything else goes to Indigo through
`ServerFormatter` (A7). `domain/serializers/ket/validate.ts` imports the generated, git-ignored
`compiledSchema.js`: after editing `schema.json`, or on a fresh clone, run
`npm run ajv -w ketcher-core`. See `ket-format.md`.

## Tests

Jest collects only `__tests__/**/*.{test,spec}.{ts,js}` (`packages/ketcher-core/jest.config.js#testMatch`,
with `fixtures/` ignored): a `*.test.tsx`, or a test outside a `__tests__` folder, never runs and
never fails. Most tests mirror `src/` under the package-root `__tests__/`.
