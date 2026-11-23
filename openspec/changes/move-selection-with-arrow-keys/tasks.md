# Tasks

## 1. Arrow-key handler

- [x] 1.1 Add the `moveSelectionByArrowKeys` handler module with 1 px steps, 10 px with `Shift`, and one history entry per press; verify with `cd packages/ketcher-core && npx vitest run moveSelectionByArrowKeys`
- [x] 1.2 Return the handler from `keyboardEventHandlers` in `FlexMode` and `SnakeMode` and leave `SequenceMode` alone; verify the Flex, Snake, and Sequence tests in the same file pass
- [x] 1.3 Redraw only the rotation handle after a move by making `SelectBase.updateRotationView` public; verify the "redraws the rotation handle without dispatching selectEntities" tests pass

## 2. Documentation

- [x] 2.1 Add the "Moving a selection with arrow keys" requirement to `.memory-bank/features/macromolecules.md` in Requirement/SHALL/Scenario format; verify it sits before "Chain enumeration" and has no conflict markers

## 3. Verification

- [ ] 3.1 Run the `verify-ketcher` skill: press arrows and `Shift`+arrows with a selection in Flex and Snake modes, then undo; verify the exported structure and screenshot show the moves and add the result to the PR under "Verified in the app"

## Workflow follow-up

- Archive the change with `openspec archive move-selection-with-arrow-keys --skip-specs` once the PR is approved, per `openspec/config.yaml`.
