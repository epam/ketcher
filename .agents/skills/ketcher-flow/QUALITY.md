# Quality

How code is written and reviewed in every flow. **Implementers** apply it while writing. **Reviewers** apply it beside the repo's own rules. The repo's rules come first and win where they differ:

- [invariants.md](../../../.memory-bank/invariants.md): rules that must never break.
- [review-rules.md](../../../.memory-bank/review-rules.md): rules a reviewer checks, by ID.
- [coding-standards.md](../../../.memory-bank/coding-standards.md): conventions that hold today.
- [accepted-patterns.md](../../../.memory-bank/accepted-patterns.md): patterns nobody raises.
- [testing.md](../../../.memory-bank/testing/testing.md): unit and E2E test rules.

The next contributor is an agent that opens one file, copies the nearest example, and takes the shortest path that compiles. Write so that a change which looks right from one file is right for the whole repo.

## Shape first

Name the data shape before writing logic: the types, and the structure that organizes them. Reach for:

- a state machine over several booleans or phase checks;
- a table, registry, or discriminated union over a branch chain spread across files;
- a typed model over loose parameters or a shape assumption repeated in several files;
- a module that owns one body of domain knowledge over stages that each repeat its rules.

The sign the shape was skipped: the change adds one more branch to an existing if/else chain, or a second flag that must stay in sync with the first.

Boring code stays when its shape is already clear and local. An abstraction earns its place only by deleting branches, duplicated rules, or invalid states.

In Ketcher, the shape also names its layer: domain and application logic in `ketcher-core`, which has no React (invariant A5) and whose domain layer has no rendering imports (A4); UI in `ketcher-react` or `ketcher-macromolecules`. Every model change goes through a command and its operations (A2, A3), so undo sees it.

## Write

- **Smallest diff** that meets the ticket. Subtract first: delete dead code, one-caller wrappers, and redundant checks, then build on the simpler base.
- **Validate at the boundary**: file parsers, the Indigo service, the public `Ketcher` API, browser storage. Parse raw data into typed values there, then trust those types inside.
- **Pure core.** Logic lives in pure functions. React components and editor tools only call them.
- **Precise types**: name the real contract in place of `any`, casts, or optional fields that are always set.
- **One way to do each task.** A new internal API moves every caller and deletes the old one in the same commit.
- **One owner per piece of state**, and one list per set of items, with every other list derived from it.
- **Canonical home.** Reuse the repo's existing helper. Put logic in the module that already owns the concept (`.memory-bank/modules/` names the owners).
- **Files under 1,000 lines.** When the change would push a file past that, split it first.
- **Comments say why**, and only a why the code cannot show: a constraint from Indigo or a browser, a public API contract, a linked issue.

## Tests

A test asserts what users of the code observe: return values, errors, the structure read back, the exported file. Check each test against two imagined edits:

- Break the behavior: the test fails.
- Restructure the internals with every observable result kept: the test still passes.

The expected value comes from the requirement or the issue, never from a run of the code under test.

## Fixes

- **Spec first.** A fix that contradicts a requirement in `openspec/specs/` or an ADR in `.memory-bank/adr/` is the wrong fix: the argument already lives there, so read both before choosing one.
- **Root cause.** Fix the first place the system did something wrong, not the place the symptom showed. A guard is a fix only when the state it handles is legitimate. When the state should never exist, find what produced it.
- **The pattern, not the instance.** Search for every place with the same fault and fix them together. Molecules and macromolecules modes often hold two copies of one concept: check both.
- **Premise.** When two fixes built on one belief have failed the same check, write that belief as one sentence and test it directly before a third fix.

## Review ranking

Reviewers apply the sections above, then rank structural findings in this order:

1. **Code judo**: a restructuring that keeps behavior and makes whole branches, modes, helpers, or layers disappear. Ask for it whenever one is visible.
2. **Spaghetti growth**: ad-hoc conditionals or one-off flags inserted into an unrelated flow.
3. **Leaks**: casts, `any`, needless optionality, feature logic in a shared module, render or editor types in the domain.
4. **Split ownership**: two ways to do one task, hand-synced lists, internals importable from outside their module.
5. A file pushed from under 1,000 lines to over.
6. **Non-atomic updates** that can leave the model half-applied, or an edit that bypasses undo.

Prefer a few high-conviction findings to many cosmetic ones. Code that works but leaves the codebase messier is a finding.
