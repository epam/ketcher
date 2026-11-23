# Design

## Context

Each macromolecules mode extends `BaseMode`. `BaseMode.onKeyDown` looks up the pressed key in `keyboardEventHandlers`, a getter that returns `{}` by default. `SequenceMode` already overrides it. `FlexMode` and `SnakeMode` do not, so arrow keys did nothing there. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**

- Reuse the existing keyboard-handler hook, so no new key-dispatch path.
- Keep one implementation shared by Flex and Snake.

**Non-Goals:**

- Changing arrow-key behavior in Sequence mode or Molecules mode.
- Making the step size configurable.

## Decisions

- **One shared handler module, `moveSelectionByArrowKeys`.** `FlexMode` and `SnakeMode` both return its handler map from `keyboardEventHandlers`. Alternative: put the handler in `BaseMode`. Rejected: Sequence mode would inherit it, and the spec requires that its selection does not move.
- **Move through `moveSelectedDrawingEntities`, then record one history entry.** The same call a mouse drag uses, so overlapping bonds, rendering, and undo behave like a drag. One press produces one `EditorHistory` update, which gives one undo step. An empty operation list returns early, so an empty selection adds no history.
- **Redraw only the rotation handle afterwards.** The selection is unchanged by a move, so the handler does not dispatch `selectEntities`. Only the rotation handle depends on the selection bounds, so it calls `updateRotationView()`. That method changed from `protected` to `public` for this.
- **Check the selected tool by name, not with `instanceof`.** A runtime import of `SelectBase` creates a circular dependency through the renderers, so the handler imports it as a type only and compares `selectedTool.name` with `'select-tool'`.
- **Leave `BaseMode`'s default getter in place.** `BaseMode.onKeyDown` reads it and the `BaseMode` test subclasses rely on it.

## Risks / Trade-offs

- [The tool-name check silently skips the rotation redraw if the select tool is renamed] → the unit test "redraws the rotation handle without dispatching selectEntities" fails in that case.
- [Holding a key repeats the handler, so many undo steps pile up] → accepted: each press is a deliberate single step, as in Molecules mode.
