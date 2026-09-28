## Context

The macromolecules editor already models antisense duplexes end to end:

- `DrawingEntitiesManager.createAntisenseChain` builds the complementary strand, and `antisenseChainBasesMap(isDnaAntisense)` holds the complement table for the five natural analogues plus the eleven ambiguous IUPAC codes. Lookups are keyed by `MonomerNaturalAnalogCode`, so a modified base resolves through its natural analogue.
- Hydrogen bonds are `HydrogenBond` instances stored in a monomer's `hydrogenBonds` array rather than in an attachment-point slot, though they also live in the shared `DrawingEntitiesManager.polymerBonds` map. `getAttachmentPointByBond` reports `AttachmentPointName.HYDROGEN` for both endpoints.
- Sync state is two booleans on the `SequenceMode` instance, `_isSyncEditMode` and `_isAntisenseEditMode`, exposed through the `needToEditSense` and `needToEditAntisense` getters. `BaseMode` hardcodes both to false, so sync editing exists only in sequence layout mode.
- Deletion already mirrors across strands in `deleteNode`, and typing already mirrors in the keyboard handler, creating the complementary base and its hydrogen bond. Both distinguish which strand is genuinely selected by checking `monomer.selected` per node.
- The selection layer is NOT strand-aware, and an earlier version of this document claimed it was. That claim is the root of the defects found in manual testing after the first implementation landed, and it is corrected here. Selection in sequence layout is column-based: three gestures put both strands of a position into the selection regardless of which row the user acted on. `SelectBase.mousedownEntity` pushes both the sense and the antisense monomer of the clicked column, `SequenceRenderer.getMonomersByCaretPositionRange` does the same for every column in an edit-mode drag, and `getShiftArrowChanges` does the same for shift-arrow selection. The selection rectangle is the one gesture that is genuinely geometric and selects only what it covers, but the two rows sit close enough together that an ordinary drag straddles both.
- Because the sense monomer of a duplex column is therefore always selected, anything that infers a strand from selection state answers "sense" every time. `SequenceRenderer.selections` prefers the sense node when its monomer is selected and so emits one sense-biased entry per column, while the editor's right-click handler emits one entry per selected strand and so emits two per column. The two replacement paths read these two different shapes, which is why library replacement always rewrote the sense strand while the RNA Builder rewrote both strands with the same base.
- The write-back layer is not strand-aware. `modifySequenceInRnaBuilder` resolves its target by index and then takes `senseNode`, and `replaceSelectionsWithMonomer` does the same while skipping any selection that has no `senseNode`. An antisense selection therefore rewrites the sense strand.
- No write path can be reached on a duplex today. The "Modify in RNA Builder..." context menu item is disabled whenever a selected node has an antisense partner, and both `insertMonomerFromLibrary` and `insertPresetFromLibrary` return early, with no message, on the same condition. All three guards arrived in February 2025 with the antisense representation work, before duplex editing behavior had been specified.

The gap is therefore wider than base replacement alone. Three blanket guards make every duplex read-only through these entry points, and simply removing them would expose a write-back layer that edits the wrong strand. This change lifts the guards, teaches the write-back layer which strand it is editing, and adds the mirroring that makes both safe.

## Goals / Non-Goals

**Goals:**

- Allow a duplex selection to be edited at all through the RNA Builder and through the monomer library, replacing the two blanket antisense guards with the narrow blocked-pair rule the issue specifies.
- Track which strand each selection gesture targeted, since selection state cannot answer that question.
- Edit the strand the gesture targeted, in both replacement entry points, once per position rather than once per strand.
- Mirror a base replacement from one strand to its H-bonded partner, in either direction.
- Derive the DNA versus RNA complement table from the opposite nucleotide's sugar.
- Suppress mirroring when the natural analogue is unchanged, when the gesture targeted both strands, or when sync editing is off.
- Keep the original edit and its mirror in one undo step.
- Block base modification in the RNA Builder, and in library replace, when the gesture targets both strands of an H-bonded pair.
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

### Decision 10: A purpose-built targeted-strand record, not the existing antisense edit flag

**Problem**: Base replacement needs to know which strand the user meant. Selection state cannot say, because selection is column-based and the sense monomer of a duplex column is always among the selected ones.

**Decision**: Add a dedicated tri-state record of the strand the current selection gesture targeted: sense, antisense, or both. Populate it at each gesture site from information already present there, and read it wherever a strand decision is made.

**Rationale**: The obvious shortcut is to reuse `_isAntisenseEditMode`, which mousedown already sets from the clicked row. It was rejected on three counts. It is a caret-location flag rather than a gesture result, so it means something different from what we need and reusing it would couple two concerns that drift apart. Its setter calls `initialize()`, which clears and re-lays-out the canvas, so driving it from every view-mode click and drag tick is a flicker and performance risk. And the keyboard range gestures have no row information to feed it in the first place.

**Mechanism per gesture**: the click path takes the clicked renderer's `isAntisenseNode`. Shift-extension combines the new click with the row composition of what was already selected. The edit-mode drag takes the row the drag began on, which mousedown already records. Shift-arrow takes the caret's row. Select-all is both. The selection rectangle is the exception and needs no record at all, because it is genuinely geometric and selects only the monomers it covers, so the targeted strand can be derived from selection state for that gesture alone.

**Consequence**: The record must be reset when the selection is cleared, or a stale strand from a previous gesture will steer the next edit.

### Decision 11: The record resolves to a binary strand before it reaches the write-back layer

**Problem**: The write-back helpers take a two-way strand and default to the sense node. Handing them a third value would silently select the sense branch.

**Decision**: `getSelectedStrandType` and anything feeding `getNodeForStrand` or the replacement loop keep a strictly binary return type. When the record names one strand, every position answers that strand. When there is no record, or the record is "both", each position answers from its own selection state: the sense strand if its sense monomer is selected, otherwise the antisense strand.

**Why "both" cannot simply be blocked upstream**: an earlier draft of this decision said "both" is consumed by the blocking rule and never reaches the write-back layer. That is false. The selection rectangle writes no record, and over a duplex whose strands do not line up column for column it can select the sense node at some columns and the antisense node at others, which derives to "both". Library replacement reaches the write-back layer from that state without passing the blocking rule, which only applies to base replacement in sync mode. Answering sense for every position there replaced monomers nobody selected. Resolving per position replaces exactly what was selected, and for a genuine both-strands gesture, where every column has both strands selected, it still answers sense.

**Rationale**: The replacement loop iterates ranges in reverse and carries a previously-replaced node across iterations on the strength of one range being one strand. A third value passing through would break both that seed logic and the chain-direction reversal that antisense ranges depend on.

### Decision 12: Every user-facing count names the targeted positions

**Problem**: The doubled count in the update confirmation and the doubled write share one cause: the editor's right-click handler emits one entry per selected strand, so a duplex column produces two.

**Decision**: Filter to the targeted strand once, at the top of `generateSequenceContextMenuProps`, before anything derives a count, a title or an enablement flag from the flat selection. Every number the user sees for a duplex selection of N positions is N. When the gesture targeted one strand, the filter keeps only that strand's entries. When it targeted both, the filter keeps every entry: the RNA Builder writes each entry to its own strand, and the both-strands block needs to see the pair.

**Rationale**: An earlier draft filtered only the RNA Builder payload, which would have left the context menu title naming 2N while the update confirmation named N. Two different numbers for one selection is a defect in its own right, whatever each one technically counts. One filter, applied once and early, keeps them in step by construction.

**Consequence**: The context menu title now names the targeted positions rather than every selected monomer, so for a duplex it no longer matches what delete, copy and cut actually act on. Those actions read the selection directly and are unaffected in behavior. Menu enablement flags derived from the same flat list narrow to the targeted strand as well, and each menu item needs checking against that.

### Decision 13: Preset replacement is supported on a duplex, not refused

**Problem**: Clicking a preset in the library with a duplex selection does nothing at all. The guard that refuses it, `isSelectionsContainAntisenseChains` in `insertPresetFromLibrary`, predates this change. An earlier version of this decision kept it and merely gave it a voice.

**Decision**: Remove the guard and make the preset path strand-aware, on the same terms as the monomer path. `PRESET_REPLACEMENT_UNSUPPORTED_ON_DUPLEX` is deleted along with it; the only refusal left on this path is the both-strands rule of Decision 14.

**Rationale**: Issue items 1.1 and 1.2 are written about a nucleotide or nucleoside that is updated by selecting and replacing from the library, and a preset is the library item that performs that update. Replacing a nucleotide with a lone base monomer is not the same gesture: `replaceSelectionWithMonomer` deletes every monomer of the selected node, so picking a base from the library destroys the sugar and phosphate. Preset and unsplit nucleotide are the only library items that leave a nucleotide a nucleotide, and one of them was refused. The guard was also wider than its justification: it fired on any selected column with an antisense partner, so a sense-only selection in non-sync mode was refused too, against item 2.1.

**What the refusal was actually protecting**: `replaceSelectionsWithPreset` and `replaceSelectionWithPreset` read `senseNode` in four places — the seed for `previousReplacedNode`, the node to replace, the `nextNode?.senseNode` handed to `insertNewSequenceFragment`, and the heuristic that drops a preset's phosphate before an existing one — and `getPreviousNodeInSameChain` runs the wrong direction for an antisense chain. Run unguarded on a duplex, that corrupts the backbone. The guard was a stand-in for the strand-awareness the monomer path received in this change and the preset path did not.

**Consequence**: The preset path gains the same three mechanisms the monomer path uses: `splitSelectionRangeByStrand` to make one range one strand, a `strandType` resolved once per range and threaded into `replaceSelectionWithPreset`, and reverse iteration with a chain-direction-appropriate seed for antisense ranges. `selectionsCantPreserveConnectionsWithPreset` is resolved per strand for the same reason `getFirstMissingAttachmentPoint` and `selectionsContainLinkerNode` already are. Mirroring reuses `createMirroredBaseCommand` unchanged, passing `preset.base` as the new item; its natural analogue is read the same way any other library item's is.

**Limitation**: A preset with no base carries no natural analogue, so it neither mirrors nor falls under the Decision 14 refusal. It replaces the targeted strand and that column loses its hydrogen bond, since the new node has no base to re-attach it to. This is what the same preset already does on a single-stranded chain, and the issue says nothing about it; inventing a rule here would be guesswork.

### Decision 14: The both-strands refusal keys off the item carrying a base

**Problem**: The refusal implementing rule 1.3 for library replacement fires only when the clicked item's monomer class is `Base`. On a both-strands gesture every column resolves to the sense strand, so replacing with an unsplit nucleotide rewrote the sense base; propagation was suppressed because the gesture targeted both strands; and the partner was left stale, with no message and a duplex no longer complementary. Adding presets to a rule with that hole would widen it.

**Decision**: Refuse whenever sync editing is on, the gesture targeted both strands, the selection holds at least one eligible H-bonded pair, and the clicked item would set a new base — a `Base`-class monomer, an unsplit nucleotide, or a preset that has a base. One method serves both library entry points, and it runs before any confirmation dialog.

**Rationale**: Rule 1.3 is written about the RNA Builder's bases section, but the condition it describes is the ambiguity of editing both halves of a pair at once, which does not depend on where the edit came from. Keying on "the item carries a base" rather than on its monomer class closes the hole by construction: every path that can change a base on a both-strands gesture passes through the same test, and there is no second rule to keep in step. Items that set no base — sugars, phosphates, CHEM, peptides — are untouched; they destroy the node either way and the existing code re-attaches the partner's hydrogen bond to whatever replaced it.

**Why it moves before the dialogs**: the refusal currently sits inside `replaceSelectionsWithMonomer`, which runs after `insertMonomerFromLibrary` has already put up the "@ can represent multiple monomers" or "side chain connections will be deleted" confirmation. The user confirms a destructive-sounding dialog and is then told the edit is refused. Hoisting the check to the top of both entry points removes that sequence and gives the rule a single home.

## Risks / Trade-offs

- **Modifications on the mirrored base are lost.** When the analogue changes, the opposite base becomes the plain natural complement and any modification it carried is discarded. This is the issue's stated behavior and there is often no chemically meaningful counterpart, but users working with heavily modified duplexes will notice. Mitigation considered and rejected for scope: a confirmation dialog listing affected bases.
- **Modified sugars are not recognized as deoxyribose.** Every deoxyribose test in the codebase today is an exact label match against `dR`, in five places. Following that precedent means a modified DNA sugar such as an LNA takes the RNA table and an adenine mirrors to uracil rather than thymine. Broadening the test is a separate change with its own compatibility surface, and doing it here would silently alter antisense creation too.
- **Ambiguous bases take the expensive path.** When either the old or the new base is ambiguous, the existing code falls back from an in-place item swap to full delete and recreate. The mirrored edit inherits that branch, which is why Decision 9 is a prerequisite rather than a nicety.
- **The preset path repeats the hardest part of the monomer path.** Making `replaceSelectionWithPreset` strand-aware means redoing the backbone rebuild that the risk below calls the likeliest source of a broken backbone, on a node type that carries up to three monomers rather than one. The mitigation is that it is a transcription rather than a design: the monomer path's strand handling is written, reviewed and covered by tests, and any divergence between the two is itself the signal that something is wrong.
- **Preset replacement on a duplex has never run.** The guard being removed has stood since February 2025, so every preset behavior on a duplex — the phosphate-dropping heuristic before an existing phosphate, side-chain preservation onto a preset's sugar or base, hydrogen bond re-attachment to the new base — executes there for the first time. Unit tests reach the command building; the visual result on a real duplex does not have unit coverage.
- **Antisense chain ordering in the library-replace path.** `replaceSelectionWithMonomer` deletes the node and reinserts a new monomer, rebuilding the backbone from neighbor lookups that read `senseNode` off the previous and next two-stranded nodes. An antisense chain runs in the opposite direction relative to the two-stranded index, so those lookups have to become strand-aware alongside the target itself. There is precedent to follow: `insertNewSequenceFragment` already branches on `isAntisenseEditMode` for the end-of-chain case, and the no-selection branch of `insertMonomerFromLibrary` already picks antisense neighbors in that mode. This is the most intricate part of the change and the likeliest source of a broken backbone.
- **Lifting the guards is new surface, not a refinement.** Duplex editing through the RNA Builder and the library has never run. Behavior that looks unrelated to bases, such as adding a phosphate to a nucleoside or replacing a linker node, executes on a duplex for the first time. Unit coverage cannot reach these paths, so the separate e2e effort carries more weight here than elsewhere in this change.
- **Unsplit nucleotides carry the hydrogen bond differently.** For an unsplit nucleotide the bond may sit on the nucleotide monomer rather than on a separate base monomer, so the traversal must handle both shapes.
- **Undo ordering.** `replaceSelectionsWithMonomer` already calls `setUndoOperationReverse` and `setUndoOperationsByPriority` on its command. Operations appended by the mirror must tolerate that reordering, or undo will leave the duplex inconsistent. Invariants A2 and A3 make this non-negotiable.
- **A stale targeted-strand record steers the wrong edit.** The record outlives the gesture that set it, so any path that clears or replaces a selection without updating it will send the next replacement to the wrong strand. This is the likeliest defect in the follow-up work and the one least visible to unit tests.
- **The two rows are close together.** The selection rectangle straddles both rows easily, so users will hit the both-strands-targeted block more often than the wording of the rule suggests. This is behavior, not a defect, but it makes the refusal message a frequently seen surface rather than an edge case.
- **The first implementation shipped on a wrong premise.** The write-back design was built on the claim that the selection layer was already strand-aware. Everything downstream of that claim deserves rechecking rather than trusting, including the parts that passed review.
- **End-to-end coverage is out of scope for this change.** Playwright coverage is owned by a separate testing team and is added after the feature lands, so this change deliberately does not touch `ketcher-autotests`. That raises the stakes on the unit tier: with no `SequenceMode` unit harness, the only coverage this change ships is the pure resolver's tests plus canvas-fixture tests for the command builder. Decision 1 exists partly so the chemistry is fully covered by fast tests that do not depend on the separate e2e effort.
