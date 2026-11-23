# Proposal

## Why

In Molecules mode the arrow keys nudge the selection, but in the macromolecules editor they do nothing. Users who need to place monomers or small molecules precisely have to drag with the mouse. Issue #12177 asks for the same keyboard control in Flex and Snake modes.

## What Changes

- In Flex and Snake modes, the arrow keys move the current selection by 1 px per press.
- Holding `Shift` with an arrow key moves the selection by 10 px per press.
- Each key press is one undo step.
- Sequence mode is unchanged: its selection does not move on arrow keys.
- This change was built first and documented afterwards, so the code is already on the PR branch.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `macromolecules`: adds the requirement "Moving a selection with arrow keys". Current behavior lives in `.memory-bank/features/macromolecules.md`; there is no `openspec/specs/` folder.

## Impact

- `packages/ketcher-core`: `FlexMode` and `SnakeMode` register the arrow-key handler; a new `moveSelectionByArrowKeys` module holds it.
- `SelectBase.updateRotationView` becomes public so the handler can redraw the rotation handle.
- No change to the public API, file formats, or `ketcher-react`.
- Memory bank: `.memory-bank/features/macromolecules.md` already carries the new requirement on this branch.
