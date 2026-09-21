# CLAUDE.md

Guidance for AI assistants (Claude, Copilot, Cursor) working in this repository.

**Ketcher** is an open-source chemical structure editor: TypeScript and React over a custom MVC
architecture rendering molecules, reactions and macromolecules to SVG. It is an npm-workspaces
monorepo; chemistry that is not computed in the browser is computed by Indigo.

This file is loaded into every session, so it stays a routing table. The knowledge is in
`.memory-bank/` and is read on demand — open the one file that matches the task, not the whole bank.
Each bank file opens with "Read when / Skip when", so it can be skipped without being read.

## Where to look

- **rules that must never break** — [.memory-bank/invariants.md](.memory-bank/invariants.md); read
  it before changing the model, the history, the renderers or format routing
- **what a term means** — [.memory-bank/glossary.md](.memory-bank/glossary.md) (grep it),
  [.memory-bank/domain.md](.memory-bank/domain.md)
- **where things live, how events and formats flow** — [.memory-bank/architecture.md](.memory-bank/architecture.md)
- **a subsystem in depth** — [.memory-bank/modules/README.md](.memory-bank/modules/README.md) is the index
- **what a feature promises the user** — [.memory-bank/features/README.md](.memory-bank/features/README.md)
- **the KET schema** — [.memory-bank/formats/README.md](.memory-bank/formats/README.md)
- **unit tests, types, lint** — [.memory-bank/testing.md](.memory-bank/testing.md);
  **Playwright E2E** — [.memory-bank/testing-e2e.md](.memory-bank/testing-e2e.md)
- **a past architectural decision** — [.memory-bank/adr/README.md](.memory-bank/adr/README.md)
- **writing into the bank** — [.memory-bank/README.md](.memory-bank/README.md) for the formats and rules

Path-scoped conventions in `.claude/rules/` load by themselves when a matching file is opened — but
only when this checkout is the session's primary working directory. In a session started elsewhere,
read the rule whose `paths:` matches a file before editing it.

## Working agreements

- **Read the relevant memory-bank file before implementing, fixing, refactoring, or writing tests.**
  Guessing at architecture here is expensive: the model, the renderers and the history are coupled
  through invariants that no compiler enforces.
- **Verify narrowly.** `node .claude/skills/ketcher-verify/scripts/verify.mjs` (`/ketcher-verify`)
  runs Prettier, ESLint, Stylelint, `tsc` and the related Jest tests for the changed files only.
  `npm test` is the whole CI pipeline for four packages — run it only when asked.
- **Read large files by range.** Grep for the symbol, then read the lines around it: several core
  files are 2–5k lines. Never read `packages/ketcher-core/src/application/editor/data/monomers.ket`
  (3.5 MB) or `package-lock.json` (1.9 MB) whole.
- **Ask before writing Playwright E2E tests.** They are long and they fill the context window; agree
  on scope first, and read [.memory-bank/testing-e2e.md](.memory-bank/testing-e2e.md) before starting.
- **Update the bank in the same change that invalidates it.** A file that describes last month's
  behaviour is worse than no file, because it is believed.

## OpenSpec

Spec-driven changes live in `openspec/changes/`: `propose → implement → archive`, via `/opsx:propose`,
`/opsx:apply`, `/opsx:archive` where the OpenSpec CLI is installed — the commands are not committed
here; without them, follow `openspec/config.yaml` by hand.

- Mark tasks done one at a time as you complete them, not in a batch at the end.
- Update the memory bank when **archiving** a change, not while a proposal or spec is in progress.
