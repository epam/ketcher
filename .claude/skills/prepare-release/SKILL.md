---
name: prepare-release
description: Bump Ketcher package versions and open a bump-X.Y PR (new candidate, candidate update, promote to public, or public patch)
disable-model-invocation: true
argument-hint: <mode: new-candidate|update-candidate|promote-public|patch-public> <X.Y>
---

# Prepare a Ketcher release (version bump)

Parse the mode and version (`X.Y`) from the arguments the user gave. If
either is missing or ambiguous, ask the user rather than guessing — the
four modes touch different branches and end in a push + PR, which are hard
to fully undo.

This is one half of Ketcher's release process (the other half, tagging and
creating the GitHub release once this PR merges, is the `create-release`
skill). Four of Ketcher's release moments turn out to be the same
operation — edit four `package.json` versions, optionally the
`indigo-ketcher` pin, `npm install`, commit, push a `bump-*` branch, open a
PR — with a different source/target branch and version-string rule each
time:

| Mode                | Source branch | Target (PR base) | When                                   |
|---------------------|----------------|-------------------|-----------------------------------------|
| `new-candidate`     | `master`       | `master`          | starting a new release candidate cycle |
| `update-candidate`  | `release/X.Y`  | `release/X.Y`     | new candidate after fixes land         |
| `promote-public`    | `release/X.Y`  | `release/X.Y`     | promoting the final candidate to public|
| `patch-public`      | `release/X.Y`  | `release/X.Y`     | hotfix on an already-public release    |

Note: the mode names use "candidate" — the actual version strings and git
tags still use the real semver/npm convention `X.Y.0-rc.N` (e.g.
`3.19.0-rc.1`). Don't rewrite those to "candidate" — `rc` there is a
literal part of the published version string, not just a label.

## Shared setup

```bash
git status                 # must be clean before switching branches — stash/ask if not
git fetch --all --quiet
```

Create the working branch as `bump-X.Y` off the mode's source branch. If
`bump-X.Y` already exists (locally or on origin), it's likely a leftover
from a prior bump on this same release that already merged — confirm with
the user before deleting and recreating it; if it has unmerged, unexpected
content, stop and ask.

## Mode: `new-candidate` — start a new release candidate cycle

```bash
git checkout -b bump-X.Y origin/master
```

Set all four packages' `version` to `X.Y.0-rc.1`:
`packages/ketcher-core/package.json`, `packages/ketcher-react/package.json`,
`packages/ketcher-macromolecules/package.json`,
`packages/ketcher-standalone/package.json`.

`indigo-ketcher` also needs a **new minor version's** first candidate — a
step up from whatever indigo version master currently pins, not a copy of
Ketcher's own version number (indigo and Ketcher have independent version
lines). Read the current `dependencies.indigo-ketcher` value in
`ketcher-standalone/package.json`, bump its minor by 1, target
`{new-minor}.0-rc.1`, and confirm it's actually published:

```bash
npm view indigo-ketcher versions --json | grep '"{new-minor}.0-rc.1"'
```

If it's not there, stop — the Indigo team needs to publish it first; don't
substitute a different version.

`npm install`, sanity-check `git diff package-lock.json` touches only the
packages you changed, commit as `Update Ketcher to release candidate
X.Y.0-rc.1`, go to **Wrap-up**.

## Mode: `update-candidate` — bump an existing release candidate

```bash
git checkout release/X.Y     # must already exist — if not, this is new-candidate instead
git checkout -b bump-X.Y
```

Read the current version from `packages/ketcher-standalone/package.json`
(`X.Y.0-rc.N`); bump to `X.Y.0-rc.{N+1}` in all four packages.

Ask the user whether `indigo-ketcher` should also move to a newer published
version for this candidate (optional — only needed if the fixes being
picked up depend on an indigo change). If yes, confirm the target version
is published the same way as in `new-candidate`.

`npm install`, sanity-check the lockfile diff, commit as `Update Ketcher to
release candidate X.Y.0-rc.{N+1}`, go to **Wrap-up**.

## Mode: `promote-public` — promote a release candidate to public

```bash
git checkout release/X.Y
git checkout -b bump-X.Y
```

Read the current version (`X.Y.0-rc.N`); strip the `-rc.N` suffix to
`X.Y.0` in all four packages. In `ketcher-standalone/package.json`, also
strip the `-rc.N` suffix from `dependencies.indigo-ketcher` — verify the
resulting public version exists on npm (`npm view indigo-ketcher versions
--json`) before writing it in; if it hasn't been published yet, stop and
say so rather than guessing.

`npm install`, sanity-check the lockfile diff — past bumps of this shape
land around 15-20 changed lines touching only `version`/`resolved`/
`integrity` for the bumped packages (`git log --all --grep "Update Ketcher
to public version"` finds a real precedent commit if you want a concrete
anchor). Commit as `Update Ketcher to public version X.Y.0`, go to
**Wrap-up**.

## Mode: `patch-public` — bump a public release for a hotfix

```bash
git checkout release/X.Y
git checkout -b bump-X.Y
```

Read the current version — it'll already be public, `X.Y.Z` with no `-rc`
suffix. Bump the patch number directly: `X.Y.Z` → `X.Y.{Z+1}` in all four
packages. This mode does **not** go through a candidate cycle — the fix
lands straight on the release branch with its own patch version.

Ask the user whether `indigo-ketcher` needs bumping to a newer published
patch for this fix, same as in `update-candidate`.

`npm install`, sanity-check the lockfile diff, commit as `Update Ketcher to
public version X.Y.{Z+1}`, go to **Wrap-up**.

## Wrap-up (all modes)

Stage exactly the changed `package.json` files plus `package-lock.json` —
not a blanket `git add -A`.

**Pause here and show the user `git show --stat HEAD` before pushing.**
Pushing and opening a PR are the externally-visible, hard-to-fully-undo
steps in this flow — get explicit confirmation even if the user asked for
the whole release hands-off.

```bash
git push -u origin bump-X.Y
```

Find the PR template (`find . -iname pull_request_template.md`) and open a
PR via `mcp__plugin_github_github__create_pull_request` (or `gh pr create`
if that tool isn't available):

- `title`: matches the commit message
- `head`: `bump-X.Y`
- `base`: the mode's target branch from the table above
- `body`: the repo's PR template filled in — a short description of the
  bump, mechanical checklist items checked, human-judgment items (tests,
  docs, linked issue, reviewers) left for the user.

Report the PR URL. Tell the user which `create-release` mode to run once
this PR is merged (`draft-candidate` after `new-candidate`/`update-candidate`,
`publish-public` after `promote-public`/`patch-public`) — that's a
separate, later step, not something to chain automatically here.
