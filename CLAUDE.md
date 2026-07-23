# CLAUDE.md

This file provides guidance to AI assistants (Claude, Copilot, Cursor, etc.) when working with this repository.

## What is Ketcher

Ketcher is an open-source **chemical structure editor** built with TypeScript and React. It renders molecules, reactions, macromolecules, and monomers using a custom MVC architecture over SVG.

---

## Memory Bank

The `.memory-bank/` directory at the repo root is the **canonical knowledge base** for this project. Read it before starting any non-trivial task.

### When to read it

- Before implementing a feature, fixing a bug, or refactoring code
- Before writing tests
- Before proposing or designing a change
- Whenever you are unsure about architecture, domain terms, or invariants

### Structure and file formats

```
.memory-bank/
├── architecture.md     # How the system is organized: packages, subsystems, data flow
├── domain.md           # Domain concepts: atoms, bonds, monomers, reactions, etc.
├── glossary.md         # Term definitions used in code and product
├── invariants.md       # Rules that must never be broken (architectural + domain)
├── testing.md          # Testing strategy: unit (Jest), integration, E2E (Playwright)
│
├── features/           # Current observable behavior of each product feature
│   ├── README.md       # Index + format convention
│   └── <feature>.md    # Problem / User interaction / Expected behavior / Guarantees / Limitations
│
├── modules/            # Deep-dive documentation for each subsystem
│   ├── README.md       # Index + format convention
│   └── <module>.md     # Responsibility / Public interfaces / Dependencies / Dependents / Constraints
│
├── adr/                # Architecture Decision Records
│   ├── README.md       # Format convention
│   └── YYYY-MM-DD-<title>.md  # Decision / Context / Alternatives / Rationale / Consequences
│
└── specs/              # Feature specifications tied to changes
    ├── active/         # Specs for changes currently in progress
    │   └── <change-name>/   # proposal.md, requirements.md, design.md, tasks.md
    └── archived/       # Completed specs (read-only historical records)
        └── <change-name>/
```

### File format details

| File                       | Purpose                      | Key sections                                                                                |
| -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------- |
| `architecture.md`          | System overview              | Package structure, subsystems, data flow                                                    |
| `domain.md`                | Domain model concepts        | Entities, relationships, constraints                                                        |
| `glossary.md`              | Shared vocabulary            | Term, Definition, Used In                                                                   |
| `invariants.md`            | Non-negotiable rules         | Labeled D1/A1/etc., what must never break                                                   |
| `testing.md`               | Test strategy                | Levels, locations, how to run                                                               |
| `features/<name>.md`       | Product behavior             | Problem, User interaction, Expected behavior (WHEN/THEN scenarios), Guarantees, Limitations |
| `modules/<name>.md`        | Subsystem docs               | Responsibility, Public interfaces, Dependencies, Dependents, Assumptions & constraints      |
| `adr/<date>-<title>.md`    | Architectural decisions      | Decision, Context, Alternatives considered, Rationale, Consequences                         |
| `specs/active/<change>/`   | In-progress change artifacts | proposal.md, requirements.md, design.md, tasks.md                                           |
| `specs/archived/<change>/` | Historical records           | Same structure, read-only                                                                   |

### How to update the memory bank

Update the memory bank **whenever product behavior or architecture changes**. The right time is:

- **During implementation** — if you discover something wrong or missing, fix it immediately
- **After completing a change** — extract lasting knowledge before archiving

What goes where:

- New or changed feature behavior → `features/<name>.md` (create if new)
- Architectural changes → `architecture.md` and/or a new `adr/YYYY-MM-DD-<title>.md`
- New subsystem → `modules/<name>.md`
- New terms → `glossary.md`
- New non-negotiable rules → `invariants.md`
- Completed change specs → move from `specs/active/` to `specs/archived/`

Do **not** put implementation details (function names, file paths, variable names) into `features/` or `domain.md`. Those belong in `modules/` or code comments.

---

## OpenSpec

This project uses [OpenSpec](https://openspec.dev) for spec-driven development. The `openspec/` directory contains changes (proposals, specs, design, tasks) and main specs.

OpenSpec changes go through: **propose → implement → archive**

- Run `/opsx:propose` to start a new change
- Run `/opsx:apply` to implement tasks
- Run `/opsx:archive` to archive a completed change

When archiving a change, also update the memory bank as described above.
