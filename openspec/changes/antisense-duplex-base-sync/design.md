## Context

The macromolecules editor already models antisense duplexes end to end:

- `DrawingEntitiesManager.createAntisenseChain` builds the complementary strand, and `antisenseChainBasesMap(isDnaAntisense)` holds the complement table for the five natural analogues plus the eleven ambiguous IUPAC codes. Lookups are keyed by `MonomerNaturalAnalogCode`, so a modified base resolves through its natural analogue.
- Hydrogen bonds are `HydrogenBond` instances stored in a monomer's `hydrogenBonds` array rather than in an attachment-point slot, though they also live in the shared `DrawingEntitiesManager.polymerBonds` map. `getAttachmentPointByBond` reports `AttachmentPointName.HYDROGEN` for both endpoints.
- Sync state is two booleans on the `SequenceMode` instance, `_isSyncEditMode` and `_isAntisenseEditMode`, exposed through the `needToEditSense` and `needToEditAntisense` getters. `BaseMode` hardcodes both to false, so sync editing exists only in sequence layout mode.
- Deletion already mirrors across strands in `deleteNode`, and typing already mirrors in the keyboard handler, creating the complementary base and its hydrogen bond. Both distinguish which strand is genuinely selected by checking `monomer.selected` per node.
- The selection layer is already strand-aware. `SequenceRenderer.selections` falls back to the antisense node when the sense node is not selected, and the editor's right-click handler emits one selection entry per selected strand, each carrying the shared two-stranded node. `generateLabeledNodes` labels whichever node was selected, so the RNA Builder payload already describes antisense nodes correctly.
- The write-back layer is not strand-aware. `modifySequenceInRnaBuilder` resolves its target by index and then takes `senseNode`, and `replaceSelectionsWithMonomer` does the same while skipping any selection that has no `senseNode`. An antisense selection therefore rewrites the sense strand.
- Neither write path can be reached on a duplex today. The "Modify in RNA Builder..." context menu item is disabled whenever a selected node has an antisense partner, and `insertMonomerFromLibrary` returns early, with no message, on the same condition. Both guards arrived in February 2025 with the antisense representation work, before duplex editing behavior had been specified.

The gap is therefore wider than base replacement alone. Two blanket guards make every duplex read-only through these two entry points, and simply removing them would expose a write-back layer that edits the wrong strand. This change lifts the guards, teaches the write-back layer which strand it is editing, and adds the mirroring that makes both safe.

## Goals / Non-Goals

**Goals:**

- Allow a duplex selection to be edited at all through the RNA Builder and through the monomer library, replacing the two blanket antisense guards with the narrow blocked-pair rule the issue specifies.
- Edit the strand the user actually selected, in both replacement entry points.
- Mirror a base replacement from one strand to its H-bonded partner, in either direction.
- Derive the DNA versus RNA complement table from the opposite nucleotide's sugar.
- Suppress mirroring when the natural analogue is unchanged, when the opposite base is itself selected, or when sync editing is off.
- Keep the original edit and its mirror in one undo step.
- Block base modification in the RNA Builder, and in library replace, when the selection spans both strands of an H-bonded pair.
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

## Risks / Trade-offs

- **Modifications on the mirrored base are lost.** When the analogue changes, the opposite base becomes the plain natural complement and any modification it carried is discarded. This is the issue's stated behavior and there is often no chemically meaningful counterpart, but users working with heavily modified duplexes will notice. Mitigation considered and rejected for scope: a confirmation dialog listing affected bases.
- **Modified sugars are not recognized as deoxyribose.** Every deoxyribose test in the codebase today is an exact label match against `dR`, in five places. Following that precedent means a modified DNA sugar such as an LNA takes the RNA table and an adenine mirrors to uracil rather than thymine. Broadening the test is a separate change with its own compatibility surface, and doing it here would silently alter antisense creation too.
- **Ambiguous bases take the expensive path.** When either the old or the new base is ambiguous, the existing code falls back from an in-place item swap to full delete and recreate. The mirrored edit inherits that branch, which is why Decision 9 is a prerequisite rather than a nicety.
- **Antisense chain ordering in the library-replace path.** `replaceSelectionWithMonomer` deletes the node and reinserts a new monomer, rebuilding the backbone from neighbor lookups that read `senseNode` off the previous and next two-stranded nodes. An antisense chain runs in the opposite direction relative to the two-stranded index, so those lookups have to become strand-aware alongside the target itself. There is precedent to follow: `insertNewSequenceFragment` already branches on `isAntisenseEditMode` for the end-of-chain case, and the no-selection branch of `insertMonomerFromLibrary` already picks antisense neighbors in that mode. This is the most intricate part of the change and the likeliest source of a broken backbone.
- **Lifting the guards is new surface, not a refinement.** Duplex editing through the RNA Builder and the library has never run. Behavior that looks unrelated to bases, such as adding a phosphate to a nucleoside or replacing a linker node, executes on a duplex for the first time. Unit coverage cannot reach these paths, so the separate e2e effort carries more weight here than elsewhere in this change.
- **Unsplit nucleotides carry the hydrogen bond differently.** For an unsplit nucleotide the bond may sit on the nucleotide monomer rather than on a separate base monomer, so the traversal must handle both shapes.
- **Undo ordering.** `replaceSelectionsWithMonomer` already calls `setUndoOperationReverse` and `setUndoOperationsByPriority` on its command. Operations appended by the mirror must tolerate that reordering, or undo will leave the duplex inconsistent. Invariants A2 and A3 make this non-negotiable.
- **End-to-end coverage is out of scope for this change.** Playwright coverage is owned by a separate testing team and is added after the feature lands, so this change deliberately does not touch `ketcher-autotests`. That raises the stakes on the unit tier: with no `SequenceMode` unit harness, the only coverage this change ships is the pure resolver's tests plus canvas-fixture tests for the command builder. Decision 1 exists partly so the chemistry is fully covered by fast tests that do not depend on the separate e2e effort.
