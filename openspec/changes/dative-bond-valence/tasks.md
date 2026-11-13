# Tasks

## 1. Dative valence calculation

- [x] 1.1 Add element-specific electron and orbital data and the dative capacity calculation; verify with the `dativeValence` constant and atom-calculation unit tests.
- [x] 1.2 Apply the calculation to molecular and core atoms, including implicit hydrogens and valence-error feedback; verify with the `CoreAtom.dativeValence` and `struct.dativeValence` unit tests.
- [x] 1.3 Calculate aromatic bond orders without changing stored aromatic structures and provide the unsupported-system fallback; verify with aromatic dative-valence unit tests.

## 2. Editing and integration

- [x] 2.1 Recalculate affected atoms after dative-bond edits; verify with dative bond-flipping and atom-attribute unit tests.
- [x] 2.2 Run the focused core build, typecheck, and dative-valence unit suites; verify all complete successfully.
- [x] 2.3 Document the user-visible behavior and known limitations; verify the feature and module documentation describes the dative-valence behavior.
