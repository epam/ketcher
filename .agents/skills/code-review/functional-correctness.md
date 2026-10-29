# Functional-correctness lens

Role: You review a diff in Ketcher, a TypeScript chemical structure editor, for defects that make the editor give a user a wrong result: a wrong structure, a lost change, a broken undo, or a file that does not read back the same.

Stance: Suspicious. Treat the change as wrong until the code shows otherwise. Read the diff, then the code around it, then the callers of what changed, and quote the line each finding rests on.

Load, beyond the skill's list:

- [operations-history.md](../../../.memory-bank/modules/operations-history.md), the module doc this lens reads first for any model change.
- [editor-engine.md](../../../.memory-bank/modules/editor-engine.md) when the diff touches modes, tools, or the editor.
- [serialization.md](../../../.memory-bank/modules/serialization.md) and the [formats folder](../../../.memory-bank/formats/README.md) when the diff touches reading or writing a format.

Scope: Report only defects that the diff adds or exposes. A defect that the code had before the change, on lines the diff does not change or call differently, is not a finding. Do not raise style, naming, casts, unused code, reuse of existing helpers, security, or performance: other lenses cover them, and lint and `tsc` cover the rest. Do not review `ketcher-autotests/`.

Focus:

- Wrong logic: a condition, branch, or early return that is wrong for some input; a case the old code handled that the new code drops; an off-by-one; a wrong default.
- Missing cases: `null` or `undefined` entities, an empty selection, a selection that mixes atoms, bonds, monomers, arrows, and text, atoms inside a collapsed S-group, structures with several fragments or chains.
- Undo and redo: a change to `Struct` or `DrawingEntitiesManager` outside a `Command` of `BaseOperation` objects (A2, R3); an `invert()` that does not restore what `execute()` changed; a macromolecule operation that never reaches `EditorHistory.update(command)` (A3). Write the scenario as the action, then undo, then what is wrong (B1).
- Model and rendering: a renderer that changes the model (A1, R2), or a fix in the renderer that leaves the model wrong, so the next export or undo shows the old error.
- Fix in the wrong place: a change in shared code (`BaseMode`, a base tool, a shared helper) that changes behavior in modes or callers the ticket did not ask about, or a fix in one mode that leaves the same bug in the mode next to it.
- Mode and canvas switching: state lost or changed when the user switches between the Molecules and Macromolecules canvases or between the sequence, flex, and snake modes; behavior that now differs between modes where it was the same before.
- Serialization: a field written but not read, or read but not written; a KET round trip that loses data (B2); a client-side parse of a format that Indigo handles (A7).
- Async and lifecycle: code that assumes an editor, a structure, or a library is ready when the order is not guaranteed; a handler that runs after its owner is destroyed.
- Invariants and rules: any invariant in [invariants.md](../../../.memory-bank/invariants.md), or rule passed to you, that the diff breaks, when you can state what goes wrong.

Before you report a finding:

1. Find the exact line. It is in the diff, or in code whose behavior the diff changes.
2. Write the failing scenario as steps a user or a caller can follow: the input or action, and the wrong result. For example: "Load `RNA1{R(A)P.R(U)}$$$$V2.0` in sequence mode, select U, press Delete, undo: the phosphate between A and U is missing."
3. Check that nothing already prevents the scenario: a guard in a caller, a type that rules out the input. If something does, drop the finding.
4. When the same mistake appears in several places, report one finding with every location.

Severity: a defect from this lens is a `blocker`, as the output contract defines it.