## Why

Ketcher can create an antisense strand and keeps the two strands in step for deletion and for keyboard typing, but not for base replacement. Today it does not keep them in step because it refuses the edit outright: "Modify in RNA Builder..." is disabled whenever the selection touches a duplex, and clicking a monomer in the library to replace a duplex selection returns silently with no message and no change. Clicking a preset does nothing at all. All three guards were added in February 2025 with the antisense representation work, before anyone had decided what a duplex edit should do.

This change makes that decision and implements it. A duplex selection becomes editable through both paths, the selected strand is the strand that changes, and in sync mode the paired base on the opposite strand is rewritten to match. The one case where propagation is meaningless, a selection holding both bases of the same pair, is refused with an explicit message rather than producing a result that depends on iteration order.

GitHub issue: epam/ketcher#6595.

## What Changes

- The three blanket antisense guards are removed: the two on the RNA Builder and the monomer library, and the one on preset replacement. Selecting part of a duplex no longer disables "Modify in RNA Builder...", and no longer makes library replacement a silent no-op. The narrow blocked-pair rule below takes their place.
- Both replacement paths now edit the selected strand, and when both strands of a position are selected they both edit both monomers: library replacement visits each strand in its own pass instead of picking the sense node. Previously they resolved the target by index and then took the sense node, so an antisense selection would have rewritten the sense strand. Whether one or both bases of a pair are being edited is read from the selection itself, per pair.
- In sequence mode with sync editing on, replacing a base changes the H-bonded base on the opposite strand so the pair stays complementary. This works in either direction, sense to antisense or antisense to sense. It applies to both the RNA Builder update flow and the select-and-replace-from-library flow.
- Propagation happens only when the replacement changes the base's natural analogue. Swapping a base for a different modification of the same natural analogue leaves the opposite strand untouched.
- The mirrored base is chosen from the DNA complement table when the opposite nucleotide's sugar is deoxyribose, and from the RNA table otherwise. Adenine is the only analogue whose complement differs between the two tables.
- Propagation is skipped for a base whose opposite base is itself selected, and skipped entirely in non-sync mode.
- The mirrored edit and the original edit are a single undo step.
- Only the base of the opposite nucleotide changes. Its sugar and phosphate are left alone, so a DNA antisense strand stays a DNA strand.
- If the opposite base carried a modification, it is replaced by the plain natural complement and the modification is lost. This only happens when the base had to change anyway.
- In the RNA Builder, when sync editing is on and both bases of at least one H-bonded sense/antisense base pair are selected, the bases section is blocked. Clicking a symbol and every edit-mode selection select both strands of each position, so they fall under this rule; a view-mode drag over one row does not. In non-sync mode nothing is blocked, since that is the mode the message directs the user to. Clicking it disables every base in the library and shows the error toast "Modification of bases is disabled in sync mode when both the sense and antisense strands are selected. Go to non-sync mode for base modification."
- When the blocked selection has bases that are not all identical, the bases section shows `[disabled]` instead of `[multiple]`. When they are all identical the symbol is still shown.
- The sugar and phosphate sections stay fully editable while the bases section is blocked.
- The same block applies to select-and-replace-from-library whenever the clicked library item carries a base: a base monomer, an unsplit nucleotide, or a preset that has a base. Previously only a base monomer was blocked, so replacing a both-strands selection with an unsplit nucleotide rewrote the sense strand and left its partner stale, with no message and a duplex no longer complementary.
- Preset replacement works on a duplex. Clicking a preset in the library with part of a duplex selected replaces the selected strand's nucleotides, rebuilds that strand's backbone in its own chain direction, and in sync mode rewrites the paired base from the preset's own base when the natural analogue changes. It previously did nothing at all, on any selection that touched a duplex, including a plain sense-strand selection in non-sync mode.
- The RNA Builder's update confirmation names the unselected nucleotides that will also change: "You are going to modify n nucleotides, and that will change m additional nucleotides. Are you sure?" It keeps the existing text when nothing else changes, and it now also appears for a single edited nucleotide whose partner will change.
- The refusal toast grows to fit its text instead of clipping it.
- Bug fix, shipped separately and first: `replaceMonomer` currently recreates a hydrogen bond as a covalent single bond, because it never passes the bond type through on recreation.

## Correction after manual testing

The first implementation of this change was built on a premise that turned out to be false: that the selection layer was already strand-aware. It is not. Selection in sequence layout is column-based, and three gestures put both strands of a position into the selection regardless of which row the user acted on. Anything inferring a strand from selection state therefore answers "sense" every time.

Manual testing surfaced three defects that all trace back to this. The RNA Builder offered to modify twice as many nucleotides as were targeted and wrote the chosen base onto both strands, since the payload carries one entry per selected strand. Library replacement always rewrote the sense strand, since it reads a sense-biased one-entry-per-position view. And with sync editing on, the both-strands rule fired on every duplex selection, so base modification was permanently blocked and the feature's main behavior was unreachable.

The correction introduces an explicit record of which strand each gesture targeted, and routes every strand decision through it. That record is itself withdrawn by the correction after review below.

## Correction: preset replacement is in scope

The first correction left preset replacement refused and made the refusal visible. Manual testing of that result showed the
refusal is itself the defect. Issue items 1.1 and 1.2 govern a nucleotide or nucleoside that is "selected and then updated
(select and replace from the library)", and a preset is the library item that updates a nucleotide: replacing one with a
lone base monomer deletes its sugar and phosphate, so preset and unsplit nucleotide are the only library gestures that keep
the node a nucleotide at all. Refusing presets therefore left 1.1 and 1.2 unimplemented for the primary gesture.

The guard was also wider than "both strands": it refused whenever any selected column had an antisense partner, so a
sense-only selection in non-sync mode was refused too, against item 2.1.

Testing the same paths surfaced a second, quieter defect. On a both-strands gesture every column resolves to the sense
strand, so replacing with an unsplit nucleotide rewrote the sense base while propagation was suppressed for the very same
reason, leaving the partner stale with no message. The both-strands refusal is therefore restated to cover any library item
that carries a base, rather than base monomers alone.

## Correction after review: no gesture record

The first correction recorded, for each gesture, which strand it was aimed at, and let that record override the selection.
Review showed that this misleads the user. A click or an edit-mode selection (drag between symbols, shift with the arrow
keys) highlights both rows and selects both strands, yet the record named one strand, the context menu named half the
highlighted nucleotides, and nothing on screen said which row the edit would land on. The record was also one value for
the whole selection, so a shift+drag picking unpaired symbols on both rows suppressed every mirror without refusing
anything.

The record is removed. Each H-bonded pair is judged by what is actually selected: a selected base with an unselected
partner mirrors to it, and a selected base with a selected partner blocks base modification, exactly as issue items 1.1
and 1.3 are worded. A view-mode drag over one row is the gesture that selects one strand.

The issue also gained item 1.1.1 after the first implementation: the RNA Builder's confirmation must name the additional
nucleotides the update will change. That is added here.

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
- **`ketcher-core`** — `SequenceMode.getSelectedStrandType`: answer per position from that position's own selection state.
- **`ketcher-core`** — `domain/helpers/antisenseBaseSync.ts`: the mirror and blocked-pair predicates decide per pair from `selected`, and the mirror decision is split into a pure helper shared by the command builder and the new count.
- **`ketcher-core`** — `SequenceMode.replaceSelectionsWithMonomer`, `replaceSelectionsWithPreset` and the linker, attachment-point and side-chain pre-checks: iterate per-strand runs so both monomers of a both-strands position are replaced and checked.
- **`ketcher-core`** — `SequenceMode.countMirroredBaseChanges`: new public method counting the opposite bases an RNA Builder update will rewrite.
- **`ketcher-macromolecules`** — `UpdateSequenceInRNABuilder` and `RnaEditorExpanded.onUpdateSequence`: the n/m confirmation text, shown when n > 1 or m > 0.
- **`ketcher-core`** — `SequenceMode.insertPresetFromLibrary`: drop the blanket antisense guard; refuse only the both-strands case, through the shared rule below.
- **`ketcher-core`** — `SequenceMode.replaceSelectionsWithPreset` and `replaceSelectionWithPreset`: resolve the strand per range and rebuild the backbone in that strand's chain direction, as the monomer path already does; mirror the paired base from the preset's base.
- **`ketcher-core`** — `SequenceMode.selectionsCantPreserveConnectionsWithPreset`: resolve the node per strand instead of reading `senseNode` directly.
- **`ketcher-core`** — the both-strands refusal moves out of `replaceSelectionsWithMonomer` into one method called from both library entry points before any confirmation dialog.
- **`ketcher-macromolecules`** — `StyledToast`: let the container grow to fit its text.
- No new external dependencies, no public API changes, no import/export format changes.
