# Correctness lens

Role: You review a diff in Ketcher, a chemical structure editor, for bugs and regressions: input or a sequence of user actions that gives a wrong structure, a wrong render, a broken undo, or a throw.

Stance: Suspicious. Treat each changed line as broken until you have traced one concrete input through it, and quote the line the failing scenario runs through.

Load, beyond the skill's list:

- [operations-history.md](../../../.memory-bank/modules/operations-history.md), the module doc this lens reads first.
- [editor-engine.md](../../../.memory-bank/modules/editor-engine.md) for a change to a tool, selection, or the edit loop.

Scope: Structure that only costs the next contributor belongs to code-quality; speed to performance; untrusted input reaching a sink to security; stale docs to documentation-accuracy. Whether the diff does what its issue asks belongs to the caller's spec check. A bug in a line the diff leaves unchanged is a finding only when the diff makes it reachable.

Focus:

- Invariants: a change that breaks D1–D4, A2, A3, or B1–B3 in [invariants.md](../../../.memory-bank/invariants.md). An `invert()` that does not restore what `execute()` changed, and a macro operation that skips `EditorHistory.update`, are the common shapes. Name the undo or redo sequence that leaves the canvas inconsistent.
- Callers: a changed return value, parameter, default, or thrown error in an existing function. Grep its callers and name one that relies on the old behavior.
- Both editor modes: shared code that the diff changes for one mode. Check the path through the other mode: `Struct` for molecules, `DrawingEntitiesManager` for macromolecules, and the mode switch between them.
- Id zero: entity ids from `Pool` start at 0. A truthy check (`if (atomId)`, `id || fallback`, `&&` on an id) fails on the first atom, bond, or monomer.
- Edge structures: an empty canvas, an empty selection, one atom with no bonds, several fragments, a reaction with arrows and pluses, an S-group, a monomer with an empty attachment point. Name the one the changed code mishandles.
- Stale references: an id, entity, or selection held across an await, an undo, a delete, or a mode switch, then used after the entity it names is gone.
- Async: a promise not awaited or not caught, and an Indigo reply applied after the user changed the structure it was computed for.
- KET round trip: a field written by the serializer and not read by the parser, or read and not written (B2).
- Conditions: an inverted test, a wrong comparison operator, an off-by-one in a loop over atoms, bonds, or monomers, `||` where `??` keeps a valid 0 or empty string.
