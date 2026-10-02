---
name: ketcher-e2e-baselines
description: "Maintain Playwright screenshot baselines and expected files: regenerate them in Docker, find orphans left by a renamed or moved spec, and keep the two projects' suffixes straight. Use when a UI change, rename, move or split touches snapshots."
argument-hint: "[spec path] | orphans"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/find-orphan-baselines.mjs*) PowerShell(node ${CLAUDE_SKILL_DIR}/scripts/find-orphan-baselines.mjs*)
---

# Baselines and expected files

Target: **$ARGUMENTS**. 28 601 baselines are committed, and their names are derived from the test
title plus a hash (`{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}`). Nothing
in the repository reports a baseline that lost its test, so every rename, move or split is a
bookkeeping task, not just a code change.

## Which operation you are doing

| Change | What happens to baselines | What to do |
| --- | --- | --- |
| a UI change alters rendering | existing baselines mismatch | regenerate the affected spec in Docker, review every diff, commit the PNGs with the code |
| renaming a test title | the derived filename changes: the old PNG is orphaned, a new one appears | regenerate, then delete the orphan in the same commit |
| splitting a giant spec | the whole `<spec>.spec.ts-snapshots/` folder is keyed to the file name | regenerate for each new file, delete the old folder |
| moving a spec into or out of `tests/specs/Chromium-popup/` | the project changes, so the suffix changes (`-chromium-linux` ↔ `-chromium-popup-linux`) and the base URL changes to `/popup.html` | regenerate with `docker:update-popup` (or `docker:update`), delete the old-suffix files |
| deleting a spec | its folder becomes orphaned silently | delete the folder with the spec |

## Regenerate — Docker only

Linux baselines come from the pinned Playwright image; a Windows or macOS run writes `-win32` /
`-darwin` files that are git-ignored and prove nothing. From `ketcher-autotests/`, after a host build
(`npm run build:packages && npm run build:example:standalone`):

```sh
npm run docker:update -- "tests/specs/<path>.spec.ts"          # project chromium
npm run docker:update-popup -- "tests/specs/Chromium-popup/<path>.spec.ts"
```

On this machine Docker lives inside WSL and the baselines are excluded by a sparse checkout — the
local `ketcher-local-env` skill has both recipes.

**A regeneration run also rewrites expected data files.** `verifyFileExport` regenerates its
`*-expected.*` file whenever `GENERATE_DATA=true` or any `--update-snapshots` flag is present, and
`npm run docker:update` sets both. So a snapshot refresh can silently bless a broken export: read the
diff of every changed `-expected.*` file, not only the PNGs.

## Find orphans

```sh
node ${CLAUDE_SKILL_DIR}/scripts/find-orphan-baselines.mjs [--limit <n>] [--quiet]
```

It reads the git index (correct under a sparse checkout) and reports snapshot folders whose spec no
longer exists, baselines whose project suffix contradicts the spec's location, and `-win32`/`-darwin`
files that should never be tracked. Exit 0 — clean, 1 — something orphaned, 2 — could not run.

Delete only what your change accounts for: an orphan from *your* rename is yours to remove, an
orphan inherited from an earlier change is a separate cleanup, and a mismatch report is not a licence
to delete a baseline that a spec still needs.

## Before handing over

- Every regenerated PNG reviewed, not just counted; an unexplained pixel change is a finding.
- Expected data files in the diff reviewed the same way.
- The orphan check run again and clean, or the remaining entries named in the summary.
- Baselines committed together with the code that changed them (this repository keeps them in git).
