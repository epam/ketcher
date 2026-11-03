# Macromolecule operations live in `domain/operations/`, not in `application/editor/operations/`

## Decision

The macromolecule operation classes in the files below move from `application/editor/operations/` to `domain/operations/`, keeping their relative paths and their code. The classes are: the monomer operations (`AttachmentPointHoverOperation`, `MonomerAddOperation`, `MonomerDeleteOperation`, `MonomerHoverOperation`, `MonomerItemModifyOperation`, `MonomerMoveOperation`), `drawingEntity`, `polymerBond`, `coreAtom/atom`, `coreBond/bond`, `monomerToAtomBond/monomerToAtomBond`, `coreRxn/rxnArrow`, `coreRxn/multitailArrow`, `coreRxn/rxnPlus`, `stereoFlag`, `coreSGroup/sgroup`, and `modes/snake`. This is 36 classes in 17 files and about 1,200 lines. `DrawingEntitiesManager` builds 34 of the classes; `SelectLayoutModeOperation` and `PolymerBondSnapToMonomersOperation` come along because they share the `polymerBond` module, which `Editor.ts`, `BaseMode.ts` and `repositioning.ts` also use. The classes sit beside `Operation` and `Command`, which already live in `domain/entities/`.

One class does not move: `ReinitializeModeOperation` (`modes/index.ts`). It reads the editor singleton at run time, and it is public API with 19 construction sites in 4 files (`SequenceMode.ts` 16, `SnakeMode.ts` 1, `Clear.ts` 1, `Editor.ts` 1). `DrawingEntitiesManager` gets an instance from its editor port instead: `EditorPort` (added by sub-issue #12571) gets one member, `createReinitializeModeOperation(): Operation`, and the port adapter in `application/editor/editorPort.ts` returns `new ReinitializeModeOperation()`.

The micromolecule operations (`BaseOperation` and its subclasses), the three `monomer/` operations that extend `BaseOperation` (`FlipMonomerOperation`, `RotateMonomerOperation`, `ShiftMonomerOperation`), `monomerFactory`, `monomerCreation/`, and `RestoreSequenceCaretPositionOperation` stay in `application/editor/operations/`. `DrawingEntitiesManager` does not use them.

## Context

Invariant A4 says `domain/` makes no runtime import from `application/editor/` or `application/render/`. `DrawingEntitiesManager.ts` imports 13 operation modules there: 65 runtime uses, 13 of the 18 imports in its allowlist entry. It must build operations, because invariant A2 requires every model change to be encoded as a `Command` of operations.

The operation classes are small. Each of the 17 files above imports only `domain/` code, `utilities`, and type-only `application/` imports: `RenderersManager` in every file, which the `Operation` interface in `domain/entities/Operation.ts` already uses in the same way, plus `LayoutMode` (from `application/editor/modes/types`) in `polymerBond/index.ts`. They call the renderers only through the `renderersManager` argument that `Command.execute` passes in. Moving them adds no dependency from `domain/` to a renderer. Only `modes/index.ts` (`ReinitializeModeOperation`) has a runtime application import: `editorSingleton`.

`operations/index.ts` is public API: `application/editor/index.ts` does `export *` from it, and `src/index.ts` re-exports that. Of the moved names, only the six monomer operations are on that path. `polymerBond` is also imported by `Editor.ts`, `BaseMode.ts` and `repositioning.ts`.

## Alternatives considered

- **Keep the operations in `application/` and pass an operation factory into `DrawingEntitiesManager`** (the issue's second option). Rejected: the moved set is 36 classes in 17 files, 34 of them built by the manager. A factory needs one method per class, with the constructor arguments of each, in a domain interface that mirrors the 17 files. That is a second copy of every operation's constructor signature to keep in sync, and it moves no code to where its dependencies are. The classes have no application dependency to hide, so the seam would hide nothing.
- **Keep the imports and record an exception in `accepted-patterns.md`** (the issue's third option). Rejected: the issue's own done-when needs the allowlist entries gone, and the code can move at no cost. It would also keep the largest block of A4 debt in the repo.
- **Move `ReinitializeModeOperation` too, with an injected function.** Rejected: the 19 construction sites in 4 files would have to supply the function, or `domain/` would need a singleton default, which breaks A4.
- **Split `ReinitializeModeOperation` into a domain base class and an application subclass.** Rejected: it changes which editor `execute` reads.
- **A registry port: `editor.operations.create('reinitializeMode')`.** Rejected: for one operation it is a string-keyed factory with a typed map. One method on the port is enough, and a registry can replace it if a second editor-bound operation appears.

## Rationale

The A4 rule says what `domain/` may import. It does not say that operations belong to the application. An operation is a pair of model changes (`execute`, `invert`) and a call to the renderers it receives. It is part of the domain's command model, as `Command` and `Operation` are. Moving the classes takes 12 of the 13 modules out of the allowlist with no new interface and no code change except import paths.

`ReinitializeModeOperation` is different in kind: it drives the editor's mode. It stays in `application/`, and the manager gets it through the same constructor port that sub-issue #12571 adds for the manager's other editor reads. One port, one way to reach the editor. The class keeps its singleton read, so it does what it did before: this change does not alter which editor `execute` initializes.

## Consequences

- `DrawingEntitiesManager.ts` loses 13 allowlist entries. Its remaining entries are other sub-issues' work (#12571, #12572, and the unrelated modules).
- The six moved monomer operations stay public through explicit re-exports in `application/editor/operations/index.ts`. The old files are deleted, with no stub at the old paths. `polymerBond`, `drawingEntity` and the others were never in a public barrel, and their application importers change import paths.
- `application/editor/operations/` no longer holds every operation. A reader looking for `MonomerAddOperation` finds it in `domain/operations/monomer/`. `.memory-bank/modules/operations-history.md` records the split.
- `EditorPort` (from #12571) grows to 9 members. This change builds on #12571: its branch is stacked on #12571's branch and retargets to `master` after #12571 merges. The 12 modules that move do not need the port.
- Operations in `domain/operations/` must not import `application/editor/` or `application/render/` at run time. The A4 lint rule enforces this for the new folder with no new allowlist entry.
- `ReinitializeModeOperation` still reads the editor singleton when it runs. Removing that read is a separate change.
