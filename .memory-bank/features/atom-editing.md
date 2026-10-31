# Atom Editing

Chemists need to place, replace, and annotate atoms in a 2D structure — choosing any element, adjusting charge, and setting atom-level properties (isotope, valence, radical, query attributes) — without editing raw file formats.

Spec: [openspec/specs/atom-editing/spec.md](../../openspec/specs/atom-editing/spec.md)

## User interaction

- **Place / replace an atom** — select an element on the _Atoms_ toolbar and click empty canvas to place it, or click an existing atom to change its element.
- **Grow a structure** — select an element, click an existing atom, and drag; a single bond is added and vacant valences are filled with implicit hydrogens.
- **Less common elements** — open the _Periodic Table_ (single atom, atom _List_, or _Not List_) or the _Extended Table_ (generic groups, special nodes, pseudo-atoms) when the element is not on the toolbar.
- **Charge** — the _Charge Plus_ / _Charge Minus_ tools increment/decrement an atom's charge on each click.
- **Type-to-edit** — click an atom with the _Selection tool_ and start typing to change its label.
- **Atom Properties dialog** — double-click an atom (or press `/`) to edit element, charge, isotope, valence, radical, and query features.

## Expected behavior

Placing or replacing an atom keeps implicit hydrogen counts and valence consistent, and each change is a single undoable step.

#### Scenario: Placing a new element on empty canvas

- **WHEN** the user selects an element and clicks empty canvas
- **THEN** a single atom of that element is created with implicit hydrogens filling its valence

#### Scenario: Growing a chain from an existing atom

- **WHEN** the user selects an element, clicks an existing atom, and drags
- **THEN** a new atom is created and joined to the clicked atom by a single bond, and implicit hydrogens are recalculated for both atoms

#### Scenario: Changing an atom's element

- **WHEN** the user clicks an existing atom with a different element selected
- **THEN** the atom's element changes and its implicit hydrogen count and valence are recalculated

#### Scenario: Invalid valence is surfaced

- **WHEN** an element/charge change produces an impossible valence
- **THEN** the atom is displayed underlined in red to flag the error

#### Scenario: Adjusting charge

- **WHEN** the user clicks an atom with the _Charge Plus_ or _Charge Minus_ tool
- **THEN** the atom's charge increases or decreases by one and implicit hydrogens are recalculated

#### Scenario: Dative donor and acceptor bonds

- **WHEN** an atom has dative bonds
- **THEN** a dative bond that starts on the atom (donor) uses an electron pair, and one that ends on it (acceptor) uses an empty orbital; the atom's implicit hydrogens are what its remaining electrons and orbitals allow

#### Scenario: Dative limits exceeded

- **WHEN** an atom has more donor bonds or more acceptor bonds than its valence electron pairs and empty orbitals allow
- **THEN** the atom is underlined in red; for an atom without an explicit valence, the underline comes only from these donor/acceptor limits, not from covalent over-valence alone (atoms with an explicit valence are covered by their own scenario below)

#### Scenario: Donor and acceptor on the same atom cancel

- **WHEN** an atom has one donor bond and one acceptor bond
- **THEN** the two cancel out and do not count against the limits

#### Scenario: Dative bond on an aromatic atom

- **WHEN** an aromatic atom has a dative bond and its ring system can be assigned a Kekulé structure
- **THEN** the atom's implicit hydrogens use its Kekulé bond orders, without changing the drawn structure; in a ring, an atom with more donor than acceptor bonds is preferred to take the double bond (so a donor nitrogen in imidazole is the pyridine-like one)

#### Scenario: Dative bond on an aromatic atom without a Kekulé structure

- **WHEN** an aromatic atom has a dative bond but its ring system cannot be assigned a Kekulé structure (for example, it contains query atoms or query bonds, or elements outside the main-group s/p set)
- **THEN** its implicit hydrogens follow the usual aromatic rules, and it is underlined only if the limits are exceeded even when each aromatic bond counts as one

#### Scenario: Atom with explicit valence and dative bonds

- **WHEN** an atom has an explicit valence and a dative bond
- **THEN** its implicit hydrogens still follow the explicit valence, and it is underlined when it exceeds the donor/acceptor limits or when its explicit valence is below its covalent bond count

#### Scenario: User-set implicit hydrogen count

- **WHEN** the user has set an atom's implicit hydrogen count
- **THEN** that count is kept as the implicit hydrogen count, and it is counted as covalent bonds when the electron and orbital limits are checked

#### Scenario: Dative implicit hydrogens for listed elements only

- **WHEN** an atom with a dative bond is an element outside H, Li, B, C, N, O, F, Na, Al, Si, P, S, Cl, K, Ga, Ge, As, Se, Br, Rb, In, Sn, Sb, Te, I, Cs, Tl, Pb, Bi, Po, At, Fr
- **THEN** its implicit hydrogen count from the dative calculation is zero, unless the user has set a count

## Guarantees

- Implicit hydrogen counts stay consistent with element, charge, isotope, and bond changes.
- Every atom edit is one atomic entry in the undo history (see [undo-redo](./undo-redo.md)).
- Structures remain as chemically well-formed as the editor can enforce; remaining issues are reported by [Structure Check](./import-export.md).

## Limitations

- This is a **molecules-mode** feature. In macromolecules mode the equivalent is placing monomers (see [macromolecules](./macromolecules.md)); individual atoms of an abbreviated group / functional group cannot be edited until the abbreviation is removed.
- Query atom features (lists, not-lists, generics) are meaningful only for query-capable export formats.
- Dative-bond valence in aromatic rings uses a simplified Kekulé model: element-specific cases such as hypervalent S/Se or N(V) are not modelled.

## Related

- Engine: [editor-engine](../modules/editor-engine.md) · Model: [domain.md](../domain.md) (Atom)
- See also: [bond-editing](./bond-editing.md), [stereochemistry](./stereochemistry.md)
