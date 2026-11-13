# Design

## Context

The current change calculates valence independently of Indigo's validation dialog and applies it in both molecular `Struct` atoms and macromolecule `CoreAtom` instances. See [proposal.md](proposal.md) and [specs/dative-bond-valence/spec.md](specs/dative-bond-valence/spec.md) for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Keep the electron/orbital calculation deterministic and reusable across atom models.
- Recalculate affected atoms after bond edits without changing stored aromatic bond representations.
- Bound aromatic matching work during interactive edits.

**Non-Goals:**

- Change Indigo's independent validation-dialog verdict.
- Extend the aromatic solver to element models it does not support.
- Change import/export formats or persisted structure data.

## Decisions

- Keep the electron/orbital rules in a pure calculation backed by a per-element configuration table. This keeps chemistry rules testable independently of rendering; deriving the table from legacy valence behavior would conflate the two models.
- Count dative direction at the bond endpoints and cancel opposing donor/acceptor pairs before applying capacity and hydrogen rules. This follows the feature requirements and avoids treating a balanced pair of directions as net resource consumption.
- For aromatic atoms, derive bond orders from an in-memory Kekulé assignment and leave the structure aromatic. Using a library dearomatizer or rewriting stored bonds could change unrelated structure state; an unsupported or unsatisfiable system instead takes the documented conservative fallback.
- Cache aromatic assignments within one recalculation and cap matching work. This avoids repeating the same search for atoms in one system and bounds work on every edit.
- Trigger recalculation from the affected endpoints and relevant aromatic neighbors after bond addition, removal, flipping, and type changes. This keeps displayed atom state synchronized with the edited model.

## Risks / Trade-offs

- The aromatic solver does not cover every element-specific or hypervalent case → retain the legacy hydrogen path and conservative capacity check when the system is unsupported or cannot be kekulized.
- The standalone editor and Indigo validation dialog can report different dative valence results → keep this limitation explicit; changing the dialog is outside this change.
- A complex aromatic graph could make matching expensive → cap search steps and use the conservative fallback when the cap is reached.

## Migration Plan

No persisted data migration is needed. The calculated values are derived from the current structure and are recomputed when it is loaded or edited. Reverting the code restores the previous dative-bond valence behavior without data conversion.

## Open Questions

None.
