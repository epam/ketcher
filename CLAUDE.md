# CLAUDE.md

@AGENTS.md

## OpenSpec flow

OpenSpec changes go through propose, implement, archive. The `/opsx:*` commands are optional, and they work only where OpenSpec is installed locally.

- `/opsx:propose` starts a change in `openspec/changes/`.
- `/opsx:apply` implements the change's tasks.
- `/opsx:archive` archives a finished change. Then update the memory bank as [AGENTS.md](AGENTS.md#where-knowledge-lives) describes.

Rules for `/opsx:apply`:

- Mark each task done as soon as it is complete. Do not tick them all at the end.
- Before writing E2E tests, read [testing.md](.memory-bank/testing/testing.md) and ask the user to proceed. For a new spec file or folder, follow its E2E Test Plans section.
