# Memory Bank — conventions

> **Read when:** you are about to write into `.memory-bank/`, or you need the file-format rules.
> **Skip when:** you only need to *read* knowledge — go to the file [../CLAUDE.md](../CLAUDE.md) routes you to.

This directory is the canonical knowledge base for Ketcher. It is committed with the code so that it
is reviewed and corrected by the same process as the code.

`CLAUDE.md` is loaded into every session and stays a routing table. The formats below live here
because they are needed only when *writing* into the bank, which is rare.

## Layout

```text
.memory-bank/
├── README.md         # this file — conventions only
├── architecture.md   # packages, subsystems, data flow
├── domain.md         # domain concepts: atoms, bonds, monomers, reactions
├── glossary.md       # term → definition → where used
├── invariants.md     # rules that must never break (D#/A#/B#)
├── testing.md        # test levels, unit tests (Jest), type checks, lint
├── testing-e2e.md    # end-to-end tests (Playwright): fixtures, page objects, utilities, runs
├── features/         # observable product behaviour  (README.md = index + format)
├── modules/          # subsystem deep dives          (README.md = index + format)
├── formats/          # KET 1.0 / 2.0 specifications  (README.md = index)
└── adr/              # architecture decision records (README.md = format)
```

Change proposals in flight are **not** here — they live in `openspec/changes/`, and are archived
there under `openspec/changes/archive/`.

## Document formats

| File | Key sections |
| --- | --- |
| `architecture.md` | Package structure, subsystems, data flow |
| `domain.md` | Entities, relationships, constraints |
| `glossary.md` | Term, definition, used in |
| `invariants.md` | Labelled `D1`/`A1`/`B1`, what must never break and why it breaks quietly |
| `testing.md` | Levels, locations, how to run |
| `features/<name>.md` | Problem, user interaction, expected behaviour (`WHEN`/`THEN`), guarantees, limitations |
| `modules/<name>.md` | Responsibility, public interfaces, dependencies, dependents, constraints |
| `adr/<date>-<title>.md` | Decision, context, alternatives considered, rationale, consequences |

## Read budget

New and rewritten files open with two lines:

```markdown
> **Read when:** <when this file pays for its tokens>
> **Skip when:** <when it does not>
```

An assistant reads the bank one file at a time; the point of these lines is to let it decide **not**
to open a file. Every file in the bank carries them; a new file without them is incomplete.

## Rules for writing

- No implementation details in `features/` or `domain.md` — function names, paths and variables
  belong in `modules/` or in the code.
- Back a non-obvious claim about code with an excerpt of that code: the few lines that carry the
  reason, in a fenced block, preceded by the file path from the repository root and the commit it
  was copied on. A reader who opens the file sees at once when the code no longer looks like that,
  and the excerpt still explains the claim when the file has moved. Not line numbers: they go wrong
  as soon as a line is inserted above, and silently. An excerpt that no longer matches the code is a
  defect in the document, to be fixed by whoever finds it.
- Prefer correcting an existing file over adding a new one. Duplicated knowledge diverges.
- Mark partial coverage with a `<!-- STUB: … -->` line naming what is missing.

## When to update

- **During implementation** — if you find something here wrong or missing, fix it immediately.
- **When archiving an OpenSpec change** — extract what will still be true in a year: behaviour to
  `features/`, subsystem knowledge to `modules/`, structural decisions to `adr/`, new rules to
  `invariants.md`. Do not update the bank for proposals or specs still in progress.
