---
paths:
  - "openspec/**"
description: "OpenSpec change folders and how to work with them without the CLI"
---

# OpenSpec changes

`openspec/config.yaml` (`schema: spec-driven`) defines the flow: a change folder
`openspec/changes/<name>/` with `proposal.md`, `design.md`, `tasks.md` and
`specs/<capability>/spec.md`; a finished change moves to `openspec/changes/archive/`.

- The `/opsx:*` commands named in `CLAUDE.md` are not committed to this repository — they exist only
  where a developer installed the OpenSpec CLI. Without them, follow `config.yaml` by hand.
- Mark tasks done one at a time as you finish them.
- Update `.memory-bank/` when a change is archived, not while it is in progress. `config.yaml` still
  mentions `.memory-bank/specs/{active,archived}`; that directory does not exist.
