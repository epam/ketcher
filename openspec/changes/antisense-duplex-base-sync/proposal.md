## Why

Ketcher can create an antisense strand and keeps the two strands in step for deletion and for keyboard typing, but not for base replacement. Today it does not keep them in step because it refuses the edit outright: "Modify in RNA Builder..." is disabled whenever the selection touches a duplex, and clicking a monomer in the library to replace a duplex selection returns silently with no message and no change. Both guards were added in February 2025 with the antisense representation work, before anyone had decided what a duplex edit should do.

This change makes that decision and implements it. A duplex selection becomes editable through both paths, the strand the user's gesture targeted is the strand that changes, and in sync mode the paired base on the opposite strand is rewritten to match. The one case where propagation is meaningless, a gesture targeting both strands of the same pair, is refused with an explicit message rather than producing a result that depends on iteration order.

GitHub issue: epam/ketcher#6595.

## What Changes

- The two blanket antisense guards are removed. Selecting part of a duplex no longer disables "Modify in RNA Builder...", and no longer makes library replacement a silent no-op. The narrow blocked-pair rule below takes their place.
- Both replacement paths now edit the strand the user's gesture targeted. Previously they resolved the target by index and then took the sense node, so an antisense selection would have rewritten the sense strand. Because selection in sequence layout is column-based and always contains the sense strand, the targeted strand is recorded per gesture and carried through to the write-back layer. Each selected position yields one edit rather than one per strand.
- In sequence mode with sync editing on, replacing a base changes the H-bonded base on the opposite strand so the pair stays complementary. This works in either direction, sense to antisense or antisense to sense. It applies to both the RNA Builder update flow and the select-and-replace-from-library flow.
- Propagation happens only when the replacement changes the base's natural analogue. Swapping a base for a different modification of the same natural analogue leaves the opposite strand untouched.
- The mirrored base is chosen from the DNA complement table when the opposite nucleotide's sugar is deoxyribose, and from the RNA table otherwise. Adenine is the only analogue whose complement differs between the two tables.
- Propagation is skipped when the gesture targeted both strands, and skipped entirely in non-sync mode.
- The mirrored edit and the original edit are a single undo step.
- Only the base of the opposite nucleotide changes. Its sugar and phosphate are left alone, so a DNA antisense strand stays a DNA strand.
- If the opposite base carried a modification, it is replaced by the plain natural complement and the modification is lost. This only happens when the base had to change anyway.
- In the RNA Builder, when sync editing is on and the gesture targeted both strands of at least one H-bonded sense/antisense base pair, the bases section is blocked. In non-sync mode nothing is blocked, since that is the mode the message directs the user to. Clicking it disables every base in the library and shows the error toast "Modification of bases is disabled in sync mode when both the sense and antisense strands are selected. Go to non-sync mode for base modification."
- When the blocked selection has bases that are not all identical, the bases section shows `[disabled]` instead of `[multiple]`. When they are all identical the symbol is still shown.
- The sugar and phosphate sections stay fully editable while the bases section is blocked.
- The same block applies to select-and-replace-from-library when the gesture targets both strands of a pair, using the same message.
- Clicking a preset in the library with a duplex selection reports that preset replacement is not supported there, instead of doing nothing at all.
- The refusal toast grows to fit its text instead of clipping it.
- Bug fix, shipped separately and first: `replaceMonomer` currently recreates a hydrogen bond as a covalent single bond, because it never passes the bond type through on recreation.

## Correction after manual testing

The first implementation of this change was built on a premise that turned out to be false: that the selection layer was already strand-aware. It is not. Selection in sequence layout is column-based, and three gestures put both strands of a position into the selection regardless of which row the user acted on. Anything inferring a strand from selection state therefore answers "sense" every time.

Manual testing surfaced three defects that all trace back to this. The RNA Builder offered to modify twice as many nucleotides as were targeted and wrote the chosen base onto both strands, since the payload carries one entry per selected strand. Library replacement always rewrote the sense strand, since it reads a sense-biased one-entry-per-position view. And with sync editing on, the both-strands rule fired on every duplex selection, so base modification was permanently blocked and the feature's main behavior was unreachable.

The correction introduces an explicit record of which strand each gesture targeted, and routes every strand decision through it. The requirements are restated in those terms.

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
- **`ketcher-core`** — `SequenceMode`: a tri-state record of the strand the current selection gesture targeted, plus its reset on selection clear.
- **`ketcher-core`** — `SelectBase.mousedownEntity`: record the clicked row, and combine rows on shift-extension.
- **`ketcher-core`** — `SequenceMode.mousedown` and `mousemove`: record the row an edit-mode drag began on.
- **`ketcher-core`** — `SequenceRenderer.shiftArrowSelectionInEditMode`: record the caret's row.
- **`ketcher-core`** — `SequenceMode.getSelectedStrandType`: answer from the record instead of from selection state.
- **`ketcher-macromolecules`** — `generateLabeledNodes`: emit one entry per position for the targeted strand instead of one per selected strand.
- **`ketcher-core`** — `SequenceMode.insertPresetFromLibrary`: report the refusal instead of returning silently.
- **`ketcher-macromolecules`** — `StyledToast`: let the container grow to fit its text.
- No new external dependencies, no public API changes, no import/export format changes.
