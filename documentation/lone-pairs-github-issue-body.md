## Background

Users have asked for a way to **see lone (nonbonding) electron pairs** on heteroatoms in drawn structures—for example, two pairs on oxygen in an alcohol. This request goes back to community feedback such as [#1383](https://github.com/epam/ketcher/issues/1383).

This issue specifies **optional, settings-driven visualization** of lone pairs in **Molecules (micro)** mode. Lone pairs are **editor annotations**: they are derived from the current structure and valence bookkeeping and are not independent entities in the molecular graph.

Implementation is tracked in PR [#9766](https://github.com/epam/ketcher/pull/9766).

---

## Requirements

### Expected lone-pair count

1. For supported atoms, Ketcher shall compute an **expected lone-pair count** from the atom label, formal charge, radical state, implicit hydrogens, bond orders, and membership in an aromatic ring, using documented valence-electron rules. **Aromatic heteroatoms** (e.g. furan-like O/S, pyrrole-like N) shall use explicit templates where generic bookkeeping would mis-count lone pairs.

2. **Elements with Settings toggles** for default lone-pair visibility (per-element **Show lone pairs**): **N, O, S, F, Cl, Br, I**. **Carbon and hydrogen** shall not produce a lone-pair annotation from this feature (expected count treated as not applicable).

### When lone pairs are drawn

3. Lone pairs shall be drawn **only** when the expected count is a **positive integer** and the atom is allowed to show lone pairs under the rules below.

4. Each lone pair shall be shown as a **pair of dots** placed outside the atom label, with spacing and size controlled by global render options (see Settings).

5. **Placement** shall choose among the four cardinal directions around the label (top / right / bottom / left). The editor shall **score** candidate directions to reduce overlap with other atom decorations (e.g. charge, isotope) and to avoid pointing lone pairs directly along existing bond directions where possible. Multiple lone pairs on one atom shall use **distinct** directions when candidates allow.

### Global visibility (Settings → Atoms)

6. The **Settings** dialog shall expose, on the **Atoms** (render) tab, **per-element toggles** that default to *off* for **N, O, S, F, Cl, Br, I** and control whether lone pairs are shown for atoms that **inherit** global behavior.

7. The same tab shall expose numeric **style** controls (with sensible min/max): **dot diameter**, **offset** from the label, and **spread** between the two dots of a pair, consistent with existing Ketcher render-option patterns.

8. Render options for lone pairs shall be **persisted** with other user settings (same mechanism as existing render preferences).

### Atom-level override

9. **Atom Properties** shall show **expected lone pairs** as a **read-only** field reflecting the computed count (or blank / not applicable when the atom does not participate in lone-pair display).

10. **Atom Properties** shall expose **Lone pair display** with values **`inherit`**, **`show`**, and **`hide`**:

    - `inherit` — follow the per-element global toggle for that element.
    - `show` — force lone pairs **on** for that atom when the expected count is positive (even if the global toggle for that element is off), subject to the same placement and drawing rules.
    - `hide` — force lone pairs **off** for that atom regardless of global toggles.

11. **Query-only / restricted atom types** (e.g. atom lists, R-group labels) shall **not** be toggled or edited for lone-pair display via the dedicated tool (see below).

### Toolbar tool

12. A **Toggle Lone Pair Display** tool shall be available in the left toolbar (subject to existing toolbar visibility rules). **Hover** over a supported atom shall indicate it can be toggled; **click** shall flip atom-level behavior between forcing display **on** and **off** in a way consistent with requirement 10 (i.e. `show` ↔ `hide` semantics relative to the current state).

### Scope and limitations

13. This feature applies to **standard molecule editing / viewing** in Molecules mode. Behavior in special modes (e.g. macromolecule editors) is **out of scope** unless separately specified.

14. **File interchange:** persistence of `lonePairDisplay` (and any related presentation fields) in exported chemical formats shall follow whatever the implementation documents for Ketcher/KET; formats that do not support these fields may drop them on export.

---

## Example

![Propan-1-ol with lone pairs on oxygen](https://raw.githubusercontent.com/scottmreed/ketcher/1395-lone-pairs-representation/documentation/images/lone-pairs/propan-1-ol-lone-pairs.png)

With **Show lone pairs on Oxygen** enabled in Settings, neutral **propan-1-ol** shows **two** lone-pair dot pairs on the hydroxyl oxygen, placed above and below the O label without obscuring the chain or the OH label.

---

## UI (summary)

- **Settings → Atoms:** per-element lone-pair visibility toggles (**N, O, S, F, Cl, Br, I**) and lone-pair geometry controls (dot diameter, offset, spread).
- **Atom Properties → General:** read-only expected lone pairs; lone-pair display override dropdown.
- **Toolbar:** “Toggle Lone Pair Display” action alongside related annotation tools.
