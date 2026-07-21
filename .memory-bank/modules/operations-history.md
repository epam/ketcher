# Operations & History

> How every model change is encapsulated for undo/redo.

Cross-cutting deep-dive. Every mutation of model in Ketcher is an operation; the editor never mutates the model in place. There are **two parallel systems** that share the same operations folder but use different abstractions — one for micromolecules, one for macromolecules.

| Aspect  | Micro (small molecules)                | Macro (monomers/polymers)             |
| ------- | -------------------------------------- | ------------------------------------- |
| Unit    | Base operation (class, self-inverting) | Operation (interface)                 |
| Group   | Action                                 | Command                               |
| History | held by the micro editor               | history singleton                     |
| Size    | capped at 32 steps                     | capped at 32 steps                    |
| Render  | re-render via the ReStruct pipeline    | re-render via the renderers container |

## Micromolecules: Action + Base operation

- **Base operation** — the base class for every micro operation. It carries a type, a priority, a data payload, and a reference to its inverse operation class.
- **execute** — overridden per operation. It mutates the `Struct` and marks the affected atoms/bonds/items dirty in the render structure so they get re-drawn.
- **perform** — calls `execute`, lazily builds the inverse operation, cross-links the pair, and **returns the inverse operation**. This return-the-inverse contract is the core undo mechanism.
- **invert** — instantiates the operation's declared inverse class and copies the data payload over.
- Inverse pairing is declared per operation category (for example, "atom add" is paired with "atom delete").

There are roughly ninety operation type constants and a numeric priority enum. Priority defines the order in which operations are sorted before being performed (for instance, bond-add runs before atom-delete, and S-group hierarchy operations run last).

**Operation categories** live in subfolders grouped by concern: atoms, bonds, S-groups, fragments, R-groups and their attachment points, reactions, text, images, multi-tail arrows, stereo flags, plus a handful of standalone operations (simple objects, highlights, canvas load, loop move, implicit-H calculation, descriptor alignment, enhanced-flag move).

**Action** groups operations:

- Add operations to the group (skipping dummies) and merge one action into another.
- **perform** — sorts the operations by priority, performs each one, and collects the returned inverse operations into a **new Action** that is returned for undo/redo.

Action factory functions (the `fromXxx(...)` helpers, organized by concern such as atom, bond, S-group, fragment, erase, paste, template, and reaction) each compose an Action from the appropriate operations.

**Micro history** (held by the micro editor):

- A stack of Actions with a pointer, capped at 32 steps.
- **update** — inserts at the pointer (dropping any redo tail), shifts out the oldest entry when over the cap, and advances the pointer to the end.
- **undo** — decrements the pointer, performs the stored Action, **replaces that stack slot with the returned inverse Action**, and re-renders.
- **redo** — the mirror of undo.
- History size is reported as the number of available undo and redo steps.

## Macromolecules: Command + Operation

- **Operation** is an _interface_ (not a class): an optional priority, a required `execute` and `invert` (each taking the renderers manager), and optional after-all-operations hooks. **Each operation implements both directions itself** — there is no declared inverse class.
- Example: a "monomer add" operation takes model add/delete callbacks; its `execute` re-adds the model and tells the renderers manager to add the monomer, while its `invert` deletes the model and tells the renderers manager to remove it.

**Macro operation categories:** monomers, polymer bonds, drawing entities, core atoms/bonds/reactions/S-groups, monomer-to-atom bonds, monomer creation, and editor modes.

**Command** groups operations:

- Add and merge operations, and configure how the undo direction is ordered (reversed and/or priority-sorted).
- **execute** — runs each operation's `execute`, reinitializes the view model, runs the after-all-operations hooks, then runs post-render methods.
- **invert** — builds the operation list (reversed and/or priority-sorted per its flags), runs each operation's `invert`, then the same post-steps.

**History singleton** (macro):

- A single shared instance obtained per editor and cleared on teardown, capped at 32 steps.
- A stack of Commands with a pointer.
- **update** — either merges into the latest Command or inserts at the pointer, shifting out the oldest when over the cap.
- **undo** — decrements the pointer, inverts the Command, unselects all entities, and re-renders. **The same Command object is re-invoked** — unlike micro, which swaps in the inverse Action.
- **redo** — the mirror, re-executing the Command.

**Standard macro mutation pattern** (repeated across the editor, modes, and tools): get the history singleton, build a Command from a drawing-entities-manager method, then hand the Command to both the history and the renderers container. The drawing-entities manager is the factory that produces Commands, and it is where the vast majority of Command construction happens.

## Assumptions & constraints

- UI/tools must never mutate `Struct` or the drawing-entities manager directly — always go through an Action/Command.
- Both histories cap at 32 steps.
- Micro inverts by swapping the stack slot for the returned inverse Action; macro re-invokes the same Command with execute/invert.
- See [editor-engine](./editor-engine.md) for who triggers these and [rendering](./rendering.md) for what re-rendering does.
