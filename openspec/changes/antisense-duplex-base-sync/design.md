## Context

The macromolecules editor already models antisense duplexes end to end:

- `DrawingEntitiesManager.createAntisenseChain` builds the complementary strand, and `antisenseChainBasesMap(isDnaAntisense)` holds the complement table for the five natural analogues plus the eleven ambiguous IUPAC codes. Lookups are keyed by `MonomerNaturalAnalogCode`, so a modified base resolves through its natural analogue.
- Hydrogen bonds are `HydrogenBond` instances stored in a monomer's `hydrogenBonds` array rather than in an attachment-point slot, though they also live in the shared `DrawingEntitiesManager.polymerBonds` map. `getAttachmentPointByBond` reports `AttachmentPointName.HYDROGEN` for both endpoints.
- Sync state is two booleans on the `SequenceMode` instance, `_isSyncEditMode` and `_isAntisenseEditMode`, exposed through the `needToEditSense` and `needToEditAntisense` getters. `BaseMode` hardcodes both to false, so sync editing exists only in sequence layout mode.
- Deletion already mirrors across strands in `deleteNode`, and typing already mirrors in the keyboard handler, creating the complementary base and its hydrogen bond. Both distinguish which strand is genuinely selected by checking `monomer.selected` per node.
- Most selection gestures in sequence layout are column-based: they put both strands of a position into the selection regardless of which row the user acted on. `SelectBase.mousedownEntity` pushes both the sense and the antisense monomer of the clicked column, `SequenceRenderer.getMonomersByCaretPositionRange` does the same for every column in an edit-mode drag, and `getShiftArrowChanges` does the same for shift-arrow selection. The selection rectangle — a drag over symbols in view mode — is the one gesture that is geometric and selects only what it covers; with shift held it adds to the existing selection, so it can select unpaired symbols on both rows. An earlier version of this document claimed the selection layer was strand-aware; a later one treated the column-based gestures as one-strand gestures and kept a separate record of the row they were aimed at. Both are superseded by Decision 10: a column-based gesture really does select both strands, and is treated as doing so.
- Where a column-based gesture has selected a position, its sense monomer is selected, so anything that infers a single strand per position from selection state answers "sense" there. `SequenceRenderer.selections` prefers the sense node when its monomer is selected and so emits one sense-biased entry per column, while the editor's right-click handler emits one entry per selected strand and so emits two per column. The two replacement paths read these two different shapes, which is why library replacement always rewrote the sense strand while the RNA Builder rewrote both strands with the same base.
- The write-back layer is not strand-aware. `modifySequenceInRnaBuilder` resolves its target by index and then takes `senseNode`, and `replaceSelectionsWithMonomer` does the same while skipping any selection that has no `senseNode`. An antisense selection therefore rewrites the sense strand.
- No write path can be reached on a duplex today. The "Modify in RNA Builder..." context menu item is disabled whenever a selected node has an antisense partner, and both `insertMonomerFromLibrary` and `insertPresetFromLibrary` return early, with no message, on the same condition. All three guards arrived in February 2025 with the antisense representation work, before duplex editing behavior had been specified.

The gap is therefore wider than base replacement alone. Three blanket guards make every duplex read-only through these entry points, and simply removing them would expose a write-back layer that edits the wrong strand. This change lifts the guards, teaches the write-back layer which strand it is editing, and adds the mirroring that makes both safe.

## Goals / Non-Goals

**Goals:**

- Allow a duplex selection to be edited at all through the RNA Builder and through the monomer library, replacing the two blanket antisense guards with the narrow blocked-pair rule the issue specifies.
- Read which strand is being edited from the selection itself, per H-bonded pair, with no separate record of the gesture.
- Edit the selected strand in both replacement entry points.
- Mirror a base replacement from one strand to its H-bonded partner, in either direction.
- Derive the DNA versus RNA complement table from the opposite nucleotide's sugar.
- Suppress mirroring when the natural analogue is unchanged, when the opposite base is itself selected, or when sync editing is off.
- Keep the original edit and its mirror in one undo step.
- Block base modification in the RNA Builder, and in library replace, when both bases of an H-bonded pair are selected.
- Tell the user, in the RNA Builder's update confirmation, how many unselected nucleotides the update will also change.
- Support preset replacement on a duplex on the same terms as monomer replacement, and let the refusal toast grow to fit its text.
- Fix the hydrogen bond type loss in `replaceMonomer`.

**Non-Goals:**

- End-to-end Playwright coverage. A separate team owns autotest coverage and adds it after the feature lands.
- Drag-and-drop replacement. It operates in flex and snake modes where no sync toggle exists, so there is no signal to gate propagation on. Out of scope by construction.
- Peptide modification. `Editor.onModifyAminoAcids` is a separate feature with no antisense concept.
- Mirroring sugar or phosphate changes. The issue restricts itself to bases.
- Preserving modifications on the mirrored base.
- Recognizing modified sugars as deoxyribose. See risks.
- Changing how antisense strands are created.

## Decisions

### Decision 1: A dedicated helper module in `ketcher-core`, not methods on `DrawingEntitiesManager`

**Problem**: Where should the propagation logic live?

**Decision**: A new module under `packages/ketcher-core/src/domain/helpers/`, exporting a pure complement resolver and a command builder. Both sequence-mode call sites import it.

**Rationale**: The pure resolver takes plain values and returns a label, so the chemistry — including the new sugar-based DNA rule — is unit-testable with no canvas fixture. That matters because no `SequenceMode` unit test harness exists, and end-to-end coverage is owned by a separate team and lands after this change, so the alternative is shipping the chemistry with no coverage of its own. Keeping the module at the sequence-mode layer also respects the scope decision, since that is where the sync flags live.

**Alternatives considered**:

- Methods on `DrawingEntitiesManager`, next to `createAntisenseChain` and the complement map. Rejected: that file is already past 4700 lines, and testing would still need a canvas.
- Teaching `modifyMonomerItem` and `replaceMonomer` to mirror automatically. Rejected: those primitives are shared with drag-and-drop replacement and the peptide flow, both explicitly out of scope. Implicit mirroring inside a low-level primitive is also action at a distance that makes later bugs hard to trace.

### Decision 2: Rule 1.2 falls out of an analogue comparison rather than its own branch

**Problem**: The issue states as a separate rule that a replacement which does not change the natural analogue must not touch the opposite strand.

**Decision**: The pure resolver compares the old and new `MonomerNaturalAnalogCode` and returns nothing when they match, before consulting any table.

**Rationale**: Expressing 1.2 as the early return of the same function that implements 1.1 makes it impossible for the two rules to drift apart, and means a modification swap such as C to 5meC costs one string comparison.

### Decision 3: The DNA versus RNA table is chosen from the opposite nucleotide's sugar

**Problem**: The existing code picks the table from a boolean the user supplied at creation time, `Shift+Alt+D` versus `Shift+Alt+R`. Nothing inspects a sugar. The issue requires a sugar-based rule.

**Decision**: Read the sugar of the antisense nucleotide being rewritten. Deoxyribose selects the DNA table, anything else selects the RNA table.

**Rationale**: That nucleotide keeps its own sugar and only its base is swapped, so the new base must be chemically consistent with the sugar it actually sits on. Reading the edited sense sugar instead could place thymine on ribose. The creation-time flag is not persisted and cannot be read back after a reload.

**Consequence**: The tables differ only for adenine, thymine versus uracil, so the observable effect is narrow but correct.

### Decision 4: Guards live in the command builder, not the pure resolver

**Problem**: Three conditions suppress mirroring, and they are not all chemistry.

**Decision**: The resolver handles only the analogue comparison. The command builder handles the selection check and the sync-mode check.

**Rationale**: The selection check reuses the `monomer.selected` predicate that the deletion path already applies per node, and the sync check reads `needToEditAntisense`, which already exists. Neither belongs in a function that should stay free of editor state.

### Decision 5: The blocked-pair predicate is computed once, in `generateLabeledNodes`

**Problem**: The RNA Builder needs to know whether the selection contains an H-bonded sense/antisense base pair, and three separate UI seams need the answer.

**Decision**: Add one field to `LabeledNodesWithPositionInSequence` and populate it in `generateLabeledNodes`, which already builds the Builder's payload and already holds the two-stranded node. The label logic, the library hook, and the toast all read it from the existing redux payload.

**Rationale**: The neighboring `hasAntisense` field cannot be reused. It means only that an opposite node exists, so relying on it would disable base editing on every duplex, including ones where only the sense strand is selected. Computing the stricter predicate at the same point avoids new plumbing while keeping a single source of truth.

**Predicate**: sync editing is on, the node's base has a hydrogen bond to the opposite node's base, the base reaches its sugar through the R1 to R3 pairing, that sugar has at least one backbone connection, and the opposite base monomer is itself selected. The middle three conditions have existing helpers in `domain/helpers/monomers.ts`.

The sync condition is load-bearing rather than incidental. The error message directs the user to non-sync mode to perform this exact edit, so blocking it there too would leave them with no way forward.

### Decision 6: The blanket antisense guards are replaced by the narrow blocked-pair rule

**Problem**: Both replacement entry points refuse any selection that touches a duplex. The context menu disables "Modify in RNA Builder..." when a selected node has an antisense partner, and `insertMonomerFromLibrary` returns early on the same condition. Every behavior this issue specifies is therefore unreachable, since all of it concerns duplexes.

**Decision**: Remove both blanket guards and put the blocked-pair predicate from Decision 5 in their place. A selection that covers one strand of a duplex becomes editable and mirrors. A selection that covers both strands of the same H-bonded pair is refused, with the mandated message.

**Rationale**: The guards were placeholders. They landed in February 2025 alongside the antisense representation work, at a point when what a duplex edit should do had not been decided. This issue is that decision, so the guards have served their purpose. Leaving them in place while adding mirroring underneath would ship code that never runs.

**Consequence**: This is the change's largest behavioral step and its largest risk. Editing a duplex through these two paths is new surface, not a refinement of existing surface, and the mirroring in Decisions 1 through 4 is what keeps the result chemically valid.

### Decision 7: Propagation is bidirectional, carried by an explicit strand marker

**Problem**: The issue title speaks of one side influencing the other without naming a direction, and sync mode sets both `needToEditSense` and `needToEditAntisense`. But the write-back layer takes `senseNode` unconditionally, so it cannot express "edit the antisense strand" even though the selection layer already knows the user selected it.

**Decision**: Carry the strand through from selection to write-back, then mirror in whichever direction the edit was made.

- Add a strand marker to `LabeledNodesWithPositionInSequence`. `generateLabeledNodes` sets it by comparing the selected node against the two-stranded node's `antisenseNode`, both of which it already holds.
- `modifySequenceInRnaBuilder` picks `antisenseNode` or `senseNode` from that marker instead of hardcoding `senseNode`.
- `replaceSelectionsWithMonomer` resolves its target with the same rule `SequenceRenderer.selections` already applies internally: take the sense node when its monomer is selected, otherwise the antisense node.
- The mirror helper is unchanged. It takes the edited base and its partner, so it serves both directions.

**Rationale**: Rule 1.1 says "the opposite chain" rather than "the antisense chain", and the complement table is symmetric across every entry, natural and ambiguous alike, so one lookup serves both directions. Sugar-based table selection stays correct because it always reads the sugar of whichever nucleotide is being rewritten. The per-strand `monomer.selected` test is the same one `deleteNode` already uses to decide which strand a deletion applies to, so this brings replacement in line with deletion rather than inventing a mechanism.

**Consequence**: This also fixes a latent defect. Without the marker, an antisense selection reaching the RNA Builder would rewrite the sense strand at the same index. The blanket guard hides that today, so lifting the guard and adding the marker have to land together.

### Decision 8: Library replace is blocked on a both-strands selection, matching the Builder

**Problem**: The issue specifies the block only for the RNA Builder, leaving library replace with both strands selected unspecified.

**Decision**: Apply the same predicate and the same message to library replace.

**Rationale**: The literal alternative — replacing every selected base with the chosen monomer and skipping propagation for both-selected pairs — is deterministic but produces a duplex where adenine sits opposite adenine. Consistency across the two entry points costs nothing, since the predicate and the toast already exist for the Builder.

### Decision 9: The hydrogen bond fix ships first, as its own commit

**Problem**: `replaceMonomer` collects bonds from `polymerBonds`, which holds hydrogen bonds, then recreates each one with `createPolymerBond` without passing the bond type. The type defaults to single. A hydrogen bond passes the guard clause because both endpoints report `AttachmentPointName.HYDROGEN`, so nothing throws and the bond is silently rebuilt as a covalent `PolymerBond`. Because `setBond` routes to the `hydrogenBonds` array only for `HydrogenBond` instances, the rebuilt bond also lands in the wrong collection.

**Decision**: Pass the collected bond's type through on recreation, as a standalone commit ahead of the feature work.

**Rationale**: This is pre-existing and reachable today through drag-and-drop replacement of any base in a duplex. It becomes load-bearing here because the ambiguous-base branch of the RNA Builder path routes through `replaceMonomer`, on exactly the H-bonded pairs this feature targets. Shipping it separately keeps it reviewable and revertable on its own.

### Decision 10: The edited strand is read from the selection, pair by pair — no gesture record

**Problem**: Base replacement needs to know, for each H-bonded pair, whether one base is being edited (mirror the other) or both are (refuse). An earlier revision of this change answered with a tri-state record of the strand each gesture was aimed at — sense, antisense or both — written by clicks, shift-clicks, select-all, the edit-mode drag and shift-arrow selection, and consulted instead of selection state. Review found that it misleads the user: an edit-mode or click selection highlights both rows and puts both strands into the selection, yet the record said one strand, the context menu named half the selected nucleotides, and nothing on screen showed which row the edit would land on. The record was also one value for the whole selection, so a shift+drag that picked unpaired symbols on both rows derived to "both" and silently suppressed every mirror without refusing anything.

**Decision**: Remove the record. Decide per H-bonded pair from what is actually selected: a selected base whose partner is not selected mirrors to it; a selected base whose partner is also selected makes the selection a both-strands selection, which blocks base modification (Decision 14). Every gesture is treated as selecting what it visibly selects. A view-mode drag over one row selects that row and mirrors; a click, shift-click, select-all or any edit-mode selection selects both strands of each column and is blocked.

**Rationale**: This is issue rule 1.1 ("that symbol is not selected itself") and rule 1.3 ("within the selection there is at least one pair") applied literally. What the user sees highlighted is exactly what decides the outcome, so there is no hidden state to explain, nothing to reset when a selection is cleared, and no gesture site to keep in step. It also restores the mechanism Decision 4 and the existing deletion path already rely on: the per-node `monomer.selected` test.

**Alternatives considered**:

- Keep the record and stop writing it from edit mode only. Rejected: clicks and shift-clicks select both strands just as edit-mode selections do, so they carry the same mismatch; and the record's single value for the whole selection still breaks shift+drag across both rows.
- Edit-mode selections skip sync and edit every selected monomer plainly. Rejected: sync mode would then silently not sync in one sub-mode, the opposite of the clarity this revision is for.

**Consequence**: Base modification on a duplex in sync mode requires a view-mode drag (optionally extended with shift+drag) over the strand to edit. Editing bases from an edit-mode or click selection requires switching sync off, which is what the refusal message already says.

### Decision 11: Per-position strand resolution for the write-back layer

**Problem**: The write-back helpers take a two-way strand and default to the sense node, and the replacement loop iterates ranges in reverse, carrying a previously-replaced node across iterations on the strength of one range being one strand.

**Decision**: `getSelectedStrandType` keeps a strictly binary return type and always answers per position from that position's own selection state: the sense strand if its sense monomer is selected, otherwise the antisense strand. `splitSelectionRangeByStrand` keeps splitting a range wherever that answer changes.

**Rationale**: With no record, per-position resolution is the only branch left, and it already handles both the one-row drag (every position answers the dragged strand) and a ragged selection rectangle (each position answers the strand actually selected there). A position with both strands selected answers sense; for a base edit that position is blocked before it reaches the write-back layer, so the answer matters only for items that set no base (see Risks).

### Decision 12: Every count names the selected nucleotides

**Problem**: An earlier revision filtered the context-menu selection down to the recorded strand so a duplex column counted once. With the record gone there is nothing to filter on.

**Decision**: Remove the filter. The context menu title and enablement flags are computed from the selection as the editor's right-click handler emits it, one entry per selected strand. A one-row drag over N positions names N nucleotides; a selection that covers both strands of N positions names 2N.

**Rationale**: The count now describes exactly what is highlighted. The earlier objection to 2N — that the RNA Builder then wrote the chosen base onto both strands — no longer applies, because a selection holding both bases of a pair is blocked from base modification and sugar or phosphate edits are meant to apply to every selected nucleotide.

### Decision 13: Preset replacement is supported on a duplex, not refused

**Problem**: Clicking a preset in the library with a duplex selection does nothing at all. The guard that refuses it, `isSelectionsContainAntisenseChains` in `insertPresetFromLibrary`, predates this change. An earlier version of this decision kept it and merely gave it a voice.

**Decision**: Remove the guard and make the preset path strand-aware, on the same terms as the monomer path. `PRESET_REPLACEMENT_UNSUPPORTED_ON_DUPLEX` is deleted along with it; the only refusal left on this path is the both-strands rule of Decision 14.

**Rationale**: Issue items 1.1 and 1.2 are written about a nucleotide or nucleoside that is updated by selecting and replacing from the library, and a preset is the library item that performs that update. Replacing a nucleotide with a lone base monomer is not the same gesture: `replaceSelectionWithMonomer` deletes every monomer of the selected node, so picking a base from the library destroys the sugar and phosphate. Preset and unsplit nucleotide are the only library items that leave a nucleotide a nucleotide, and one of them was refused. The guard was also wider than its justification: it fired on any selected column with an antisense partner, so a sense-only selection in non-sync mode was refused too, against item 2.1.

**What the refusal was actually protecting**: `replaceSelectionsWithPreset` and `replaceSelectionWithPreset` read `senseNode` in four places — the seed for `previousReplacedNode`, the node to replace, the `nextNode?.senseNode` handed to `insertNewSequenceFragment`, and the heuristic that drops a preset's phosphate before an existing one — and `getPreviousNodeInSameChain` runs the wrong direction for an antisense chain. Run unguarded on a duplex, that corrupts the backbone. The guard was a stand-in for the strand-awareness the monomer path received in this change and the preset path did not.

**Consequence**: The preset path gains the same three mechanisms the monomer path uses: `splitSelectionRangeByStrand` to make one range one strand, a `strandType` resolved once per range and threaded into `replaceSelectionWithPreset`, and reverse iteration with a chain-direction-appropriate seed for antisense ranges. `selectionsCantPreserveConnectionsWithPreset` is resolved per strand for the same reason `getFirstMissingAttachmentPoint` and `selectionsContainLinkerNode` already are. Mirroring reuses `createMirroredBaseCommand` unchanged, passing `preset.base` as the new item; its natural analogue is read the same way any other library item's is.

**Limitation**: A preset with no base carries no natural analogue, so it neither mirrors nor falls under the Decision 14 refusal. It replaces the selected strand and that column loses its hydrogen bond, since the new node has no base to re-attach it to. This is what the same preset already does on a single-stranded chain, and the issue says nothing about it; inventing a rule here would be guesswork.

### Decision 14: The both-strands refusal keys off the item carrying a base

**Problem**: The refusal implementing rule 1.3 for library replacement fires only when the clicked item's monomer class is `Base`. When both bases of a pair are selected the column resolves to the sense strand, so replacing with an unsplit nucleotide rewrote the sense base; propagation was suppressed because the partner was selected too; and the partner was left stale, with no message and a duplex no longer complementary. Adding presets to a rule with that hole would widen it.

**Decision**: Refuse whenever sync editing is on, the selection holds at least one eligible H-bonded pair with both bases selected, and the clicked item would set a new base — a `Base`-class monomer, an unsplit nucleotide, or a preset that has a base. One method serves both library entry points, and it runs before any confirmation dialog.

**Rationale**: Rule 1.3 is written about the RNA Builder's bases section, but the condition it describes is the ambiguity of editing both halves of a pair at once, which does not depend on where the edit came from. Keying on "the item carries a base" rather than on its monomer class closes the hole by construction: every path that can change a base on a both-strands selection passes through the same test, and there is no second rule to keep in step. Items that set no base — sugars, phosphates, CHEM, peptides — are untouched; they destroy the node either way and the existing code re-attaches the partner's hydrogen bond to whatever replaced it.

**Why it moves before the dialogs**: the refusal currently sits inside `replaceSelectionsWithMonomer`, which runs after `insertMonomerFromLibrary` has already put up the "@ can represent multiple monomers" or "side chain connections will be deleted" confirmation. The user confirms a destructive-sounding dialog and is then told the edit is refused. Hoisting the check to the top of both entry points removes that sequence and gives the rule a single home.

### Decision 15: The update confirmation counts the additional nucleotides from the same rule that rewrites them

**Problem**: Issue item 1.1.1 replaces the RNA Builder's confirmation text with "You are going to modify n nucleotides, and that will change m additional nucleotides. Are you sure?", where m is the number of unselected nucleotides that change because of the selected ones. The dialog lives in `ketcher-macromolecules` and reads only the redux payload; the decision whether a partner is rewritten lives in `createMirroredBaseCommand` in `ketcher-core`.

**Decision**:

- Split the decision half of `createMirroredBaseCommand` into a pure helper that returns the partner and its target label, or nothing. It returns nothing when sync is off, the partner is missing or ineligible, the partner is selected, the natural analogue is unchanged, or the partner already carries the target label. `createMirroredBaseCommand` builds its command from that helper.
- Factor the per-entry resolution `modifySequenceInRnaBuilder` performs — node by `nodeIndexOverall` and `strandType`, base library item from the payload — into one private method, and add a public `SequenceMode.countMirroredBaseChanges(updatedSelection)` that runs the same resolution and the same helper without building a command, counting distinct partners.
- The dialog shows the 1.1.1 text when m is greater than 0 and keeps the existing text when m is 0. The RNA Builder opens it when n is greater than 1 or m is greater than 0, rather than only when n is greater than 1.

**Rationale**: m is a promise about what confirming will do. Computing it in the dialog from the payload would duplicate the eligibility, selection, analogue and sugar rules in a second package and let the two drift. Running the exact resolver the update runs makes disagreement impossible by construction. Skipping partners that already carry the complement keeps m honest and matches the "no empty history entry" rule. Showing the dialog for a single edited nucleotide whose partner will change is a deliberate widening of the existing n > 1 trigger: the point of the message is to warn about changes outside the selection, and a one-nucleotide edit is where such a change is least expected.

**Scope**: library replacement raises no update confirmation today and gains none. Item 1.1.1 names the confirmation window, which only the RNA Builder has. The text is used as written, without singular forms, matching the existing message.

## Risks / Trade-offs

- **Modifications on the mirrored base are lost.** When the analogue changes, the opposite base becomes the plain natural complement and any modification it carried is discarded. This is the issue's stated behavior and there is often no chemically meaningful counterpart, but users working with heavily modified duplexes will notice. The RNA Builder confirmation now names how many additional nucleotides will change (Decision 15), but does not list them; the library path warns about neither.
- **Modified sugars are not recognized as deoxyribose.** Every deoxyribose test in the codebase today is an exact label match against `dR`, in five places. Following that precedent means a modified DNA sugar such as an LNA takes the RNA table and an adenine mirrors to uracil rather than thymine. Broadening the test is a separate change with its own compatibility surface, and doing it here would silently alter antisense creation too.
- **Ambiguous bases take the expensive path.** When either the old or the new base is ambiguous, the existing code falls back from an in-place item swap to full delete and recreate. The mirrored edit inherits that branch, which is why Decision 9 is a prerequisite rather than a nicety.
- **The preset path repeats the hardest part of the monomer path.** Making `replaceSelectionWithPreset` strand-aware means redoing the backbone rebuild that the risk below calls the likeliest source of a broken backbone, on a node type that carries up to three monomers rather than one. The mitigation is that it is a transcription rather than a design: the monomer path's strand handling is written, reviewed and covered by tests, and any divergence between the two is itself the signal that something is wrong.
- **Preset replacement on a duplex has never run.** The guard being removed has stood since February 2025, so every preset behavior on a duplex — the phosphate-dropping heuristic before an existing phosphate, side-chain preservation onto a preset's sugar or base, hydrogen bond re-attachment to the new base — executes there for the first time. Unit tests reach the command building; the visual result on a real duplex does not have unit coverage.
- **Antisense chain ordering in the library-replace path.** `replaceSelectionWithMonomer` deletes the node and reinserts a new monomer, rebuilding the backbone from neighbor lookups that read `senseNode` off the previous and next two-stranded nodes. An antisense chain runs in the opposite direction relative to the two-stranded index, so those lookups have to become strand-aware alongside the target itself. There is precedent to follow: `insertNewSequenceFragment` already branches on `isAntisenseEditMode` for the end-of-chain case, and the no-selection branch of `insertMonomerFromLibrary` already picks antisense neighbors in that mode. This is the most intricate part of the change and the likeliest source of a broken backbone.
- **Lifting the guards is new surface, not a refinement.** Duplex editing through the RNA Builder and the library has never run. Behavior that looks unrelated to bases, such as adding a phosphate to a nucleoside or replacing a linker node, executes on a duplex for the first time. Unit coverage cannot reach these paths, so the separate e2e effort carries more weight here than elsewhere in this change.
- **Unsplit nucleotides carry the hydrogen bond differently.** For an unsplit nucleotide the bond may sit on the nucleotide monomer rather than on a separate base monomer, so the traversal must handle both shapes.
- **Undo ordering.** `replaceSelectionsWithMonomer` already calls `setUndoOperationReverse` and `setUndoOperationsByPriority` on its command. Operations appended by the mirror must tolerate that reordering, or undo will leave the duplex inconsistent. Invariants A2 and A3 make this non-negotiable.
- **Most gestures now count as both strands.** Clicks, shift-clicks, select-all and every edit-mode selection select both rows of each column, so in sync mode they are all blocked from base modification. The only way to edit bases in sync mode is a view-mode drag over one row. This follows the issue's rule literally and matches what is highlighted, but it makes the refusal message a frequently seen surface rather than an edge case, and the two rows sit close enough that a careless drag straddles both.
- **Library replacement on a both-strands column acts on the sense node only.** For an item that sets no base — a sugar, phosphate or CHEM — `getSelectedStrandType` answers sense where both strands are selected, so the antisense monomer at that position is not replaced, while the RNA Builder edits every selected nucleotide. This predates this revision (it was the "both" branch of the removed record) and is not addressed here; it becomes more reachable because clicks now produce both-strands selections.
- **The first implementation shipped on a wrong premise, and the correction on another.** The write-back design was first built on the claim that the selection layer was already strand-aware, then on a gesture record that disagreed with what the selection showed. Everything downstream of that claim deserves rechecking rather than trusting, including the parts that passed review.
- **End-to-end coverage is out of scope for this change.** Playwright coverage is owned by a separate testing team and is added after the feature lands, so this change deliberately does not touch `ketcher-autotests`. That raises the stakes on the unit tier: with no `SequenceMode` unit harness, the only coverage this change ships is the pure resolver's tests plus canvas-fixture tests for the command builder. Decision 1 exists partly so the chemistry is fully covered by fast tests that do not depend on the separate e2e effort.
