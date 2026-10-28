---
applyTo: 'packages/*/src/**'
---

<!-- Generated from .memory-bank/review-rules.md. Do not edit. -->

## R3: Model changes go through a Command of BaseOperation objects (major)

Why: Invariant A2. Each operation implements execute() and invert(), which lets undo and redo replay a change. A direct mutation of Struct or DrawingEntitiesManager breaks that.

## R12: New UI code uses function components, not class components (major)

Why: The agent instructions ask for function components and forbid class components. Twelve class components remain. Reviewers do not flag them, and accepted-patterns.md lists them.

Bad: `class Panel extends Component` in a new file

Good: `function Panel(props)`

## R14: Update or delete comments that your change makes stale (major)

Why: A comment that describes old behaviour misleads the next reader. The documentation review agent checks for stale comments.
