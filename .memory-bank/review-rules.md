# Review rules

Rules that a reviewer checks in a diff. A reviewer applies the rules whose scope matches the changed files and reports each violation with its rule ID.

Each rule is a `###` heading in the form `R<number>: <rule>`, followed by its fields. Scope, Severity, Enforced by, Status, Why, and Source are required. Bad, Good, and Bans are optional. Rules that come from mined review comments start as `proposed`, and the team approves them before they apply. Rules that were already in agent instructions are `active`, and their source is `agent-docs`.

Severity levels are: blocker, which must be fixed before merge; major, which must be fixed or declined with a one-line reason; and nit, which is optional. Human reviewers prefix optional comments with `Nit:` or `Non-blocking:`.

## Architecture

### R1: Domain code does not import rendering, editor, or React code

Scope: packages/ketcher-core/src/domain/**
Severity: major
Enforced by: AI
Status: active
Why: Invariant A4 keeps the domain layer free of rendering, editor, and UI imports. Existing violations are listed in accepted-patterns.md. Only new imports are flagged.
Source: agent-docs
Bad: a new `import { provideEditorInstance } from 'application/editor/editorSingleton';` in a file under domain/
Good: move the logic into application/ and pass the domain value into it

### R2: Renderers do not mutate the domain model

Scope: packages/*/src/**
Severity: major
Enforced by: AI
Status: active
Why: Invariant A1. Renderers are read-only consumers of the model. A mutation in a render path skips the Command history, so undo and redo cannot reverse it.
Source: agent-docs

### R3: Model changes go through a Command of BaseOperation objects

Scope: packages/*/src/**
Severity: major
Enforced by: AI
Status: active
Why: Invariant A2. Each operation implements execute() and invert(), which lets undo and redo replay a change. A direct mutation of Struct or DrawingEntitiesManager breaks that.
Source: agent-docs

### R4: New dependencies get a manual review before they are added

Scope: package.json, packages/*/package.json, ketcher-autotests/package.json
Severity: major
Enforced by: human
Status: active
Why: The agent instructions require a manual review of each new dependency. Check that the package is needed and maintained, and that an existing dependency does not already cover the job, as lodash does for many helpers.
Source: agent-docs

## Types

### R5: Do not add casts to satisfy the type checker

Scope: packages/*/src/**
Severity: major
Enforced by: AI
Status: proposed
Why: A cast turns off the check at that point, so the mismatch it hid reaches runtime. Reviewers asked for a type guard or a corrected type in 36 PRs. No lint rule covers casts, because consistent-type-assertions is not configured.
Source: PR #9214, PR #10804, PR #11950, PR #10657
Bad: `const atom = value as unknown as Atom;`
Good: narrow value with a type guard, or correct the type where it is declared

### R6: Remove null or undefined checks that the type already rules out

Scope: packages/ketcher-core/src/**, packages/ketcher-react/src/**
Severity: nit
Enforced by: AI
Status: proposed
Why: A check on a value that the type or the caller guarantees adds noise and hides the real contract. Keep the check when the value can be null at runtime. Reviewers have asked for both directions, so decide from the type at the call site.
Source: PR #8378, PR #11950

## Code quality

### R7: Do not add eslint-disable comments; fix the violation

Scope: packages/*/src/**
Severity: major
Enforced by: AI
Status: proposed
Why: A suppression hides the rule it names. reportUnusedDisableDirectives flags a directive only after it goes unused, so nothing blocks a new one.
Source: PR #9213, PR #12035, PR #11433, PR #11356
Bad: `// eslint-disable-next-line no-alert`
Good: fix the code the rule flags, then delete any directive that your change made unused

### R8: Delete code that your change leaves unused

Scope: packages/*/src/**
Severity: major
Enforced by: AI
Status: proposed
Why: @typescript-eslint/no-unused-vars catches unused locals and imports only. Unused exports, types, props, and flags stay in place unless a reviewer finds them.
Source: PR #9196, PR #11389, PR #11320, PR #10632

### R9: Reuse existing helpers, types, and constants before adding new ones

Scope: packages/*/src/**
Severity: nit
Enforced by: AI
Status: proposed
Why: Duplicate helpers drift apart. Check lodash and the shared types in ketcher-core first. Extract logic that two or more places use into one helper.
Source: PR #9226, PR #9473, PR #10576, PR #10803
Bad: a new local helper that re-implements omit
Good: import omit from lodash, which the package already depends on

### R10: Use full, descriptive names instead of abbreviations

Scope: packages/*/src/**
Severity: nit
Enforced by: AI
Status: proposed
Why: Short names such as newAid take a reviewer a step to decode. Established names are exceptions, and accepted-patterns.md lists them.
Source: PR #9960, PR #10649, PR #10371, PR #9292
Bad: `const newAid = ...`
Good: `const newAtomId = ...`

## React and UI

### R11: Do not use useEffect for event work or derived state, and clean up every subscription

Scope: packages/ketcher-react/src/**
Severity: major
Enforced by: AI
Status: proposed
Why: An effect that reacts to a user action, or derives a value from props, adds an extra render. A subscription, timer, or listener without a cleanup leaks. Lint covers part of this through react-you-might-not-need-an-effect/no-event-handler and react-hooks/set-state-in-effect (eslint.config.mjs:206 and :213). Missing cleanup and effect-as-derived-state are not covered.
Source: PR #10316, PR #11333, PR #11313, PR #11375
Bad: `useEffect(() => setTotal(items.length), [items]);`
Good: `const total = items.length;`

### R12: New UI code uses function components, not class components

Scope: packages/*/src/**
Severity: major
Enforced by: AI
Status: active
Why: The agent instructions ask for function components and forbid class components. Twelve class components remain. Reviewers do not flag them, and accepted-patterns.md lists them.
Source: agent-docs
Bad: `class Panel extends Component` in a new file
Good: `function Panel(props)`

## Tests and docs

### R13: A bug fix or new non-trivial helper comes with a test that fails without the change

Scope: packages/*/src/**, ketcher-autotests/tests/**
Severity: major
Enforced by: human
Status: proposed
Why: Reviewers asked for a regression test in 19 PRs. Judging it needs context: the test must exercise the changed behaviour and fail on the code before the change.
Source: PR #10380, PR #10810, PR #10476, PR #10255

### R14: Update or delete comments that your change makes stale

Scope: packages/*/src/**
Severity: major
Enforced by: AI
Status: active
Why: A comment that describes old behaviour misleads the next reader. The documentation review agent checks for stale comments.
Source: agent-docs

### R15: E2E specs reach the UI through page objects, not raw getByTestId

Scope: ketcher-autotests/tests/**
Severity: major
Enforced by: AI
Status: proposed
Why: Page objects own the selectors, so specs read as user steps and a selector change touches one file. The selector and page-object conventions are in .memory-bank/testing/testing.md, section Page Object Model (POM). This rule links there and does not restate them. Existing raw calls are accepted; see accepted-patterns.md.
Source: PR #9651, PR #10466, PR #10320
Bad: `await page.getByTestId('zoom-out').click();` in a spec file
Good: call the method on the page object that owns the zoom control
