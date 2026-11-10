# E2E test plan — S-group bracket type (#10469)

## 1. Feature summary

Every S-group properties dialog except Data gets a "Bracket type" radio row: `[ ]`, `( )`, `{ }`. New S-groups default to `[ ]`. Editing shows the stored type. KET stores it as `bracketType` (`round`/`curly`, square omitted). The canvas draws the chosen shape.

| #   | Requirement                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------------- |
| R1  | Picker exists for Multiple group, SRU polymer, Copolymer, Superatom, Query component, Nucleotide Component |
| R2  | Picker has `[ ]`, `( )`, `{ }`                                                                             |
| R3  | New S-group: `[ ]` selected                                                                                |
| R4  | Editing shows the stored type                                                                              |
| R5  | KET save/load keeps round and curly; square is omitted on save                                             |
| R6  | Canvas draws round and curly brackets; labels stay where square brackets put them                          |
| R7  | Undo/redo restores the previous bracket type (testing.md "Expectations for New Features")                  |
| R8  | Visible groups with identical atoms have distinct, nested bracket pairs and retain their own styles        |
| N1  | Data S-group has no picker                                                                                 |

Out of scope: MOL V2000/V3000, CDX, CDXML, PNG/SVG export (Indigo, epam/Indigo#3783).

## 2. Verified facts

- POM `tests/pages/molecules/canvas/S-GroupPropertiesDialog.ts` covers type selection, bracket selection, fields and Apply.
- Radios get `data-testid="bracketType-input-<square|round|curly>"`, the same scheme as `radiobuttons-input-Absolute`.
- Type options: `TypeOption` in `tests/pages/constants/s-GroupPropertiesDialog/Constants.ts`.
- KET paste and `getKet` run in Ketcher (KetSerializer), so `verifyFileExport(..., FileType.KET)` sees `bracketType` (proved with verify-ketcher).
- Existing coverage: none; net-new.

## 3. Where the tests live

`ketcher-autotests/tests/specs/Chromium-popup/Features/10469-sgroup-bracket-type.spec.ts`, chromium-popup. One file with 35 tests; three cases also exercise Macromolecules mode.

## 4. Infrastructure

- Constants: `enum BracketTypeOption { Square = 'bracketType-input-square', Round = 'bracketType-input-round', Curly = 'bracketType-input-curly' }`.
- POM: locators `squareBracketRadioButton`, `roundBracketRadioButton`, `curlyBracketRadioButton`; method `selectBracketType(option)`; optional `BracketType` in `setOptions` settings for non-Data types.
- No source change needed.

## 5. Test cases

Shared page (`initMoleculesCanvas`, `MoleculesCanvas` reset after each). No test asserts undo stack depth.

| Test                                                                          | Steps                                                                                                                   | Assert                                                                                                                                                                                                                                 | Req         |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Case 1 - Bracket type picker shows `[ ]` by default for each non-Data type    | Load chain fixture, select all, S-Group tool, pick each type                                                            | three radios visible; square `toBeChecked`, others not                                                                                                                                                                                 | R1 R2 R3    |
| Case 2 - Data S-group has no bracket type picker                              | same, pick Data                                                                                                         | radios have count 0                                                                                                                                                                                                                    | N1          |
| Case 3 - SRU polymer with `( )` is saved to KET                               | create SRU, pick round, Apply                                                                                           | `verifyFileExport` KET; editor screenshot                                                                                                                                                                                              | R5 R6       |
| Case 4 - Multiple group with `{ }` is saved to KET                            | create MUL, count 2, pick curly, Apply                                                                                  | `verifyFileExport` KET; editor screenshot                                                                                                                                                                                              | R5 R6       |
| Case 5 - Editing shows the stored bracket type                                | open KET with curly SRU, select all, S-Group tool                                                                       | curly `toBeChecked`                                                                                                                                                                                                                    | R4          |
| Case 6 - Switching back to `[ ]` drops bracketType from KET                   | from Case 5 state pick square, Apply                                                                                    | `verifyFileExport` KET without the field                                                                                                                                                                                               | R5          |
| Case 7 - Undo and redo restore the bracket type                               | from curly, change to round, undo, redo                                                                                 | `verifyFileExport` after undo (curly) and after redo (round)                                                                                                                                                                           | R7          |
| Case 8 - KET with every type and bracket loads and saves unchanged            | open all-types fixture                                                                                                  | `verifyFileExport` round trip; editor screenshot                                                                                                                                                                                       | R5 R6       |
| Case 9 - Same-atom S-groups have separate brackets                            | open the supplied SRU-round/Nucleotide-Phosphate-square KET                                                             | both groups and their atom memberships/styles remain in KET; the two left and the two right bracket paths have a visible gap and different top/bottom extents; the outer bracket does not cross the Phosphate label; editor screenshot | R5 R8       |
| Case 10 - Same-atom groups can be edited independently                        | open the same KET; open each group's properties from its own bracket, change both styles, undo and redo the second edit | each dialog shows its own style; KET preserves both groups, chemistry, coordinates and membership; undo/redo affects only the edited style                                                                                             | R4 R5 R7 R8 |
| Case 11 - Same-atom brackets stay separate in Macromolecules mode             | open the same KET, switch to Flex, then return to Molecules                                                             | both D3 bracket pairs have a visible gap, the label does not cross the outer bracket, a screenshot records the second renderer, and returning to Molecules preserves both groups and their styles                                      | R5 R8       |
| Case 12 - Style and label edits keep same-atom group hierarchy                | open the same KET, change the outer SRU's bracket type and polymer label together, then undo and redo                   | both groups retain their hierarchy, membership, styles and coordinates; the inner group's properties remain independently accessible                                                                                                   | R4 R5 R7 R8 |
| Case 13 - Removing and restoring a same-atom group reflows brackets           | open the same KET; erase the inner group, undo, then redo                                                               | the remaining SRU returns to the original single-group bracket position; undo restores both separated pairs and redo reflows again without changing atoms, bonds or SRU style                                                          | R5 R7 R8    |
| Case 14 - Contracting and expanding a same-atom group reflows brackets        | open the same KET; contract and expand the inner Nucleotide Component                                                   | the contracted group does not reserve a bracket position; expansion restores separated pairs and each group's style                                                                                                                    | R4 R5 R8    |
| Case 15 - Bracket picker is accessible by keyboard                            | open a new group dialog, focus square and press the right arrow twice, then apply                                       | the picker and its choices expose meaningful accessible names; focus, selected radio and saved KET advance to curly                                                                                                                    | R1 R2 R3 R5 |
| Case 16 - Cancelling a bracket change preserves the group                     | open a curly SRU, choose round and cancel                                                                               | reopening shows curly and the exported KET is unchanged                                                                                                                                                                                | R4 R5       |
| Case 17 - Switching group types preserves the selected bracket                | open a curly SRU, switch to Multiple group and apply                                                                    | curly remains selected after switching and reopening; KET contains a curly MUL                                                                                                                                                         | R1 R4 R5    |
| Case 18 - Unrelated edits retain the selected bracket                         | open a curly SRU and change only its polymer label                                                                      | KET keeps curly and all other chemistry; undo and redo restore the respective labels and keep curly                                                                                                                                    | R4 R5 R7    |
| Case 19 - Unrelated same-atom edits keep group hierarchy                      | open the same-atom fixture and change only the outer SRU's polymer label                                                | both groups retain their hierarchy, membership and styles through undo/redo; the inner group remains independently accessible                                                                                                          | R4 R5 R7 R8 |
| Case 20 - Rotated molecule retains bracket and label positions                | open a rotated SRU with square brackets, then apply round and curly in turn                                             | bracket bounds and the polymer label remain in the same positions; KET chemistry is unchanged; square and curly screenshots                                                                                                            | R4 R5 R6    |
| Case 21 - Bracket styles retain label positions in Macromolecules mode        | render the same SRU in Flex with square, round and curly styles                                                         | D3 renders each shape and retains the bracket/label geometry and styles                                                                                                                                                                | R4 R5 R6    |
| Case 22 - Nucleotide label and icon retain their positions                    | open the same-atom fixture and change the Phosphate component's square brackets to curly                                | the Phosphate label and icon stay in place; both groups keep their membership and styles                                                                                                                                               | R4 R5 R6 R8 |
| Case 23 - Repeat count retains its position when the bracket changes          | create a square Multiple group with repeat count 2 and change its brackets to curly                                     | bracket bounds and repeat label remain in place; KET keeps repeat count and membership                                                                                                                                                 | R4 R5 R6    |
| Case 24 - Creating another same-atom group reflows brackets                   | open a single round SRU, draw a Phosphate component around it, then undo and redo                                       | creation separates the pairs; undo restores the single position and redo separates them again without changing chemistry or styles                                                                                                     | R5 R7 R8    |
| Case 25 - Contracted same-atom groups reflow in Macromolecules mode           | contract the Phosphate component in Molecules, switch to Flex, expand it in Molecules and return to Flex                | Flex shows one pair and the contracted label, then two separated pairs after expansion; styles and memberships survive both switches                                                                                                   | R4 R5 R8    |
| Case 26 - Copying a styled S-group retains its bracket                        | open a curly SRU, select and copy it, paste away from the original, then undo and redo                                  | both independent groups retain curly and their chemistry; undo removes the copy and redo restores it                                                                                                                                   | R4 R5 R7    |
| Case 27 - Moving same-atom groups keeps their geometry and styles             | open the same-atom fixture, select the structure, drag it, then undo and redo                                           | all atoms move by the same nonzero offset; the bracket pairs stay separated with their labels, styles and memberships intact; undo and redo restore the respective positions                                                           | R5 R6 R7 R8 |
| Case 28 - Redoing a pasted pair of same-atom S-groups restores their brackets | copy and paste the same-atom fixture away from the original, then undo and redo the paste and reopen the saved KET      | both structures retain their four bracket paths, hierarchy, styles and memberships; redo restores the pasted bracket positions and reopening retains both pairs                                                                        | R5 R6 R7 R8 |
| Case 29 - Undoing structure deletion restores same-atom brackets              | delete the entire same-atom structure, then undo and redo the deletion twice                                            | both bracket pairs return to their original positions with their styles, memberships, bonds and hierarchy intact after each undo                                                                                                       | R5 R6 R7 R8 |
| Case 30 - Undoing outer-group removal restores hierarchy and KET              | erase the outer group, undo and redo, then reopen the restored structure                                                | the child stays visible; the original bracket positions, styles, chemistry and hierarchy survive undo and KET reopening                                                                                                                | R5 R6 R7 R8 |

## 6. Verification strategy

1. Radio state (`toBeChecked`, counts).
2. KET file comparison for the saved model, with floating-point coordinate tolerance for the mixed-group fixture.
3. Measured SVG bracket bounds for same-atom groups and movement, so coincident paths cannot pass merely because four paths exist.
4. Screenshots only for bracket shapes, rotated labels and the same-atom layout (Cases 3, 4, 8, 9, 11, 20).

## 7. Test data

- `tests/test-data/KET/Chromium-popup/10469-sgroup-bracket-type/`: `sru-curly.ket`, `all-types.ket` (MUL round, SUP curly, COP round, query component curly, SRU square), the supplied structure as `same-atoms.ket`, its single-SRU variant, `rotated-sru.ket`, and the `*-expected.ket` export files. New-chain cases paste SMILES directly.

## 8. Implementation order

1. Spike: Case 1 locally against the dev server.
2. POM and constants.
3. Fixtures.
4. Cases 1–8, run locally (non-screenshot assertions).
5. Linux snapshots for Cases 3, 4, 8, 9, 11 and 20 via Docker, followed by a run without update mode.

## 9. Rules

chromium-popup only; import from `@fixtures`; POM for all locators and actions; no `waitForTimeout`; one behavior per test; standard comment block with `Version 3.21.0`; inline coordinates.

## 10. Open questions / risks

| Question                                                 | Mitigation                                                                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Docker on Apple Silicon makes arm64 images               | testing.md: compare one existing spec first; CI regenerates if pixels differ                  |
| Nucleotide Component may need a monomer-creation context | Case 1 only opens the dialog; if the type is hidden, cover it in the Jest dialog test instead |

## Results

- Spec: `tests/specs/Chromium-popup/Features/10469-sgroup-bracket-type.spec.ts` (35 tests: Case 1 runs once per non-Data type). Cases 28–30 cover paste history, whole-structure deletion and outer-group restoration.
- Clean baseline: exported commit `dc118fee52` to an isolated session directory, reused installed dependencies and ran `npm run build:core && npm test` → passed. An initial baseline run hit TS2883 because a test dependency was symlinked outside the snapshot; using a local copy of that installed dependency removed the isolated-environment artifact. The final feature-branch `npm test` also passed with no added failures: 1,269 core, 613 React and 262 macromolecule tests passed; the standalone package had no unit tests.
- Final standalone build: `npm run build:packages && npm run build:example:standalone` → passed.
- Related Linux snapshot generation, from `ketcher-autotests/`: `docker-compose run --rm autotests bash /app/test_run.sh --project=chromium-popup --workers=1 --grep 'Case (9|11|20) -' --update-snapshots=changed tests/specs/Chromium-popup/Features/10469-sgroup-bracket-type.spec.ts --reporter=line` → 3 passed.
- Linux verification without snapshot-update mode, from `ketcher-autotests/`: `docker-compose run --rm autotests bash /app/test_run.sh --project=chromium-popup --workers=1 tests/specs/Chromium-popup/Features/10469-sgroup-bracket-type.spec.ts --reporter=line` → 35 passed. Colima used an arm64 image, so CI on amd64 remains the authoritative cross-platform snapshot check.
- Browser-code checks, from `ketcher-autotests/`: `npx tsc --noEmit`; `npx eslint --no-ignore tests/specs/Chromium-popup/Features/10469-sgroup-bracket-type.spec.ts tests/pages/molecules/canvas/SGroupCanvas.ts tests/pages/molecules/canvas/S-GroupPropertiesDialog.ts tests/pages/constants/s-GroupPropertiesDialog/Constants.ts`; and `npx prettier --check` on those same four files → passed.
- OpenSpec: `npx openspec validate add-sgroup-bracket-type --strict` and `npx openspec validate --all --strict` → passed.
- Standalone app: the supplied same-atom KET retained both groups and their independent styles after editing, KET reopening, undo/redo, copying, outer-group removal/restoration, and a Molecules/Macromolecules/Flex mode switch. The local `.verify-ketcher/evidence/10469-final-validation-v2/` evidence records each journey, exported structures, screenshots and browser errors.
- Limitations observed during app verification: direct KET export in Macromolecules failed in atom serialization, also for a single carbon with no S-groups; the supplied SRU could not be exported as SMILES because it has no outgoing bonds. One `info operation timeout after 30000ms` was recorded and reproduced after reloading the single-carbon control. The affected atom serialization and standalone worker timeout paths are unchanged by this feature. Remote mode and Indigo-owned bracket formats and image rendering were not verified.
- With two workers in a 2 GiB Colima VM, the first test's browser was OOM-killed (`dmesg`: `Out of memory: Killed process (headless_shell)`); the final run used one worker.
