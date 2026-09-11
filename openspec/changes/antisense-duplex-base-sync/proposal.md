## Why

Ketcher can create an antisense strand and keeps the two strands in step for deletion and for keyboard typing, but not for base replacement. Today it does not keep them in step because it refuses the edit outright: "Modify in RNA Builder..." is disabled whenever the selection touches a duplex, and clicking a monomer in the library to replace a duplex selection returns silently with no message and no change. Both guards were added in February 2025 with the antisense representation work, before anyone had decided what a duplex edit should do.

This change makes that decision and implements it. A duplex selection becomes editable through both paths, the strand the user actually selected is the strand that changes, and in sync mode the paired base on the opposite strand is rewritten to match. The one case where propagation is meaningless, a selection spanning both strands of the same pair, is refused with an explicit message rather than producing a result that depends on iteration order.

GitHub issue: epam/ketcher#6595.

## What Changes

- The two blanket antisense guards are removed. Selecting part of a duplex no longer disables "Modify in RNA Builder...", and no longer makes library replacement a silent no-op. The narrow blocked-pair rule below takes their place.
- Both replacement paths now edit the strand the user selected. Previously they resolved the target by index and then took the sense node, so an antisense selection would have rewritten the sense strand. A strand marker on the RNA Builder payload and a per-strand selection check on the library path carry the correct strand through.
- In sequence mode with sync editing on, replacing a base changes the H-bonded base on the opposite strand so the pair stays complementary. This works in either direction, sense to antisense or antisense to sense. It applies to both the RNA Builder update flow and the select-and-replace-from-library flow.
- Propagation happens only when the replacement changes the base's natural analogue. Swapping a base for a different modification of the same natural analogue leaves the opposite strand untouched.
- The mirrored base is chosen from the DNA complement table when the opposite nucleotide's sugar is deoxyribose, and from the RNA table otherwise. Adenine is the only analogue whose complement differs between the two tables.
- Propagation is skipped when the opposite base is itself part of the selection, and skipped entirely in non-sync mode.
- The mirrored edit and the original edit are a single undo step.
- Only the base of the opposite nucleotide changes. Its sugar and phosphate are left alone, so a DNA antisense strand stays a DNA strand.
- If the opposite base carried a modification, it is replaced by the plain natural complement and the modification is lost. This only happens when the base had to change anyway.
- In the RNA Builder, when sync editing is on and the selection contains at least one H-bonded sense/antisense base pair, the bases section is blocked. In non-sync mode nothing is blocked, since that is the mode the message directs the user to. Clicking it disables every base in the library and shows the error toast "Modification of bases is disabled in sync mode when both the sense and antisense strands are selected. Go to non-sync mode for base modification."
- When the blocked selection has bases that are not all identical, the bases section shows `[disabled]` instead of `[multiple]`. When they are all identical the symbol is still shown.
- The sugar and phosphate sections stay fully editable while the bases section is blocked.
- The same block applies to select-and-replace-from-library when the selection spans both strands of a pair, using the same message.
- Bug fix, shipped separately and first: `replaceMonomer` currently recreates a hydrogen bond as a covalent single bond, because it never passes the bond type through on recreation.

## Capabilities

### New Capabilities

- `antisense-duplex-base-sync`: Propagating a base replacement on one strand of an H-bonded duplex to the paired base on the other strand, and blocking base modification when a selection spans both strands of a pair.

### Modified Capabilities

- `macromolecules`: The synced double-stranded editing behavior is extended from deletion and typing to cover base replacement, and gains the blocked-selection case.

## Impact

- **`ketcher-core`** — new helper module under `domain/helpers/` holding the pure complement resolution and the command builder for the mirrored edit.
- **`ketcher-core`** — `SequenceMode.modifySequenceInRnaBuilder` and `SequenceMode.replaceSelectionsWithMonomer`: one call each into the new helper inside the existing per-node loop, merged into the existing `Command`.
- **`ketcher-core`** — `LabeledNodesWithPositionInSequence` in `application/editor/tools/Tool.ts`: two new fields, the blocked-pair predicate and the strand marker.
- **`ketcher-core`** — `SequenceMode.insertMonomerFromLibrary`: the blanket antisense early return is replaced by the blocked-pair refusal.
- **`ketcher-core`** — `SequenceMode.replaceSelectionWithMonomer`: neighbor lookups for the backbone rebuild become strand-aware.
- **`ketcher-macromolecules`** — `SequenceItemContextMenu`: the "Modify in RNA Builder..." item no longer disables on `hasAntisense`.
- **`ketcher-core`** — `DrawingEntitiesManager.replaceMonomer`: pass the collected bond type through on recreation so hydrogen bonds survive.
- **`ketcher-macromolecules`** — `generateLabeledNodes`: populate the new field.
- **`ketcher-macromolecules`** — `sequenceEdit.ts`: emit `[disabled]` in place of `[multiple]` when blocked.
- **`ketcher-macromolecules`** — `useDisabledForSequenceMode`: disable every bases-group item when blocked.
- **`ketcher-macromolecules`** — `RnaEditorExpanded.selectGroup`: dispatch the error toast when the blocked bases section is clicked.
- No new external dependencies, no public API changes, no import/export format changes.
