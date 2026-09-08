## Context

In Ketcher's micromolecules mode, atoms can be configured as "atom lists" — they represent not a single element but a set of elements (inclusion list) or any element except a set (not-list). The `AtomList` class stores `notList: boolean` and `ids: number[]` (atomic numbers) and can produce the canonical label notation, e.g. `[C,N,O]` or `![C,N,O]`.

When a structure containing atom-list atoms is loaded or switched to macromolecules mode, `MacromoleculesConverter` maps micro-mode `Atom` objects to macro-mode `CoreAtom` objects. Currently this conversion copies charge, isotope, radical, alias, cip, and stereoLabel — but silently drops `atomList`. The `CoreAtom` entity has no `atomList` field, and `AtomRenderer.labelText` returns only `alias ?? label`. The result is that atom-list atoms render as `"L"` — a meaningless placeholder — instead of their correct notation.

## Goals / Non-Goals

**Goals:**

- Atom-list atoms (both inclusion lists and not-lists) that are present on the macromolecules canvas render with their correct label notation (`[C,N,O]` / `![C,N,O]`).
- The existing micromolecule rendering of atom lists is unaffected.
- The `AtomList` reuse the existing `AtomList` class from `ketcher-core/domain/entities/atomList.ts` — no duplication.

**Non-Goals:**

- Editing atom lists from within macromolecules mode (read/display-only).
- Persisting the atom-list data through the macromolecules serialization format (KET already encodes this in the micro-struct bridge).
- Changes to how atom lists are created or edited in micromolecules mode.

## Decisions

### Decision 1: Extend `CoreAtom.AtomProperties` with `atomList?: AtomList | null`

**Rationale:** `CoreAtom` is the macro-side data model for atoms drawn on the macro canvas. Adding `atomList` to its `AtomProperties` interface is the minimal, most direct change — it mirrors what `Atom` already has in the micro model and lets the renderer consume it without special-casing in multiple places.

**Alternative considered:** Store a pre-computed label string (e.g. `atomListLabel?: string`) on `AtomProperties` instead of the full `AtomList` object. Rejected because it duplicates data unnecessarily and forces string-generation at conversion time rather than on render; keeping the object preserves options (e.g. future equality checks or tooltip display of individual elements).

### Decision 2: Copy `atom.atomList` in `MacromoleculesConverter`

**Rationale:** The conversion is the single authoritative path from micro to macro. Adding one field copy there is safe, localized, and low-risk. No other place in the pipeline needs to change for the data to flow through.

### Decision 3: Update `AtomRenderer.labelText` to call `atomList.label()` when present

**Rationale:** The micro-mode renderer (`reatom.ts`) already does `if (atom.atomList !== null) return atom.atomList.label()`. Applying the same pattern in `AtomRenderer.labelText` keeps the two renderers consistent. The logic is: if `atomList` is set, generate and return the list label; otherwise fall back to `alias ?? label` as before.

**Alternative considered:** Introduce a shared utility function that both renderers call. Deferred — the logic is trivial (one conditional) and a shared helper would add indirection without meaningful benefit at this scale.

### Decision 4: Propagate `atomList` through `DrawingEntitiesManager.addAtom`

**Rationale:** `addAtom` is the factory that constructs `CoreAtom`; it must accept and forward `atomList` so the renderer can access it.

## Risks / Trade-offs

- **[Risk] `AtomLabel` enum does not include `"L"` / `"L#"`** → No change to `AtomLabel` is needed because when `atomList` is non-null, the renderer bypasses the label enum entirely and returns the list notation. The `label` field on `CoreAtom` still holds `"L"` as a fallback but is not displayed.
- **[Risk] `DrawingEntitiesManager.addAtomChangeModel` signature change** → This is an internal API used only within `ketcher-core`. Adding an optional parameter with `undefined` default is backward-compatible.
- **[Risk] Serialization round-trip** → The macro-side `CoreAtom` does not have its own serializer; atom-list data is serialized through the micro-struct bridge in KET format. Adding `atomList` to `CoreAtom` does not affect KET output — the feature is display-only at the macro layer.

## Open Questions

- Should the atom-list label in macro mode be styled differently (e.g. smaller font or color) for readability when the list is long? Deferred to implementation; start with the same rendering as micromolecules mode and revisit based on visual review.
