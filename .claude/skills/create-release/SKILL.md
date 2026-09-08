---
name: create-release
description: Tag a Ketcher release and create its GitHub release (draft candidate, or published public release combining candidate drafts) after a prepare-release PR merges
disable-model-invocation: true
argument-hint: <mode: draft-candidate|publish-public> <X.Y>
---

# Create a Ketcher GitHub release

Parse the mode and version (`X.Y`) from the arguments the user gave; ask if
unclear. This runs *after* the matching `prepare-release` PR has merged —
check `git log` on the target branch, or ask the user to confirm, before
tagging. Tagging before the bump merges tags the wrong version.

Note: the mode names use "candidate" — the actual version strings and git
tags still use the real semver/npm convention `X.Y.0-rc.N` (e.g.
`v3.19.0-rc.1`). Don't rewrite those to "candidate" — `rc` there is a
literal part of the published version string, not just a label.

A changelog-cleanup script lives at `scripts/clean_changelog.py` next to
this file — both modes below use it. It strips GitHub's `by @author in
<PR URL>` noise, looks up each ticket's GitHub issue type (`gh issue view
--json issueType` — this repo has real `Feature`/`Bug`/`Task` types
configured) to sort entries into "New features" / "Bugfixes and
improvements", and drops Autotest/Backmerge/Refactor/Task/version-bump-commit
entries into an `excluded` bucket rather than the changelog. Anything it
can't confidently place (no ticket number, no resolvable issue type) goes
to a `flagged` bucket instead of being silently dropped — always show the
user `excluded` and `flagged` before finalizing a release body, and do a
quick read over the kept entries yourself for typos (don't reword
chemistry/domain terms that merely look unfamiliar).

`combine` mode's `looks_sectioned()` check requires `re.MULTILINE` on
`SECTION_HEADER_RE` to detect an already-sectioned draft (`^###...$`
otherwise only matches when the *entire* body starts with `###`). Without
it, every input — sectioned or not — silently falls through to the raw
`gh issue view` pipeline, which can drop previously-curated entries into
`flagged` if a lookup fails for any reason. If `combine` ever starts
re-flagging entries from an already-sectioned draft, check this regex
first before assuming the entries themselves are the problem.

## Mode: `draft-candidate`

**Figure out which case you're in first:**

**Case A — first candidate of a new cycle** (the `new-candidate` bump
merged into `master`, `release/X.Y` doesn't exist yet):

```bash
git fetch --all --quiet
git checkout master && git pull
git checkout -b release/X.Y
git push -u origin release/X.Y
```

**Case B — a later candidate on an existing cycle** (the
`update-candidate` bump merged into `release/X.Y`):

```bash
git checkout release/X.Y && git pull
```

Either way, read the version from `packages/ketcher-standalone/package.json`
— should read `X.Y.0-rc.N`, matching the merged PR. Tag it:

```bash
git tag -a vX.Y.0-rc.N -m "Updated version to vX.Y.0-rc.N"
git describe          # confirm it resolves to the tag you just made
git push origin vX.Y.0-rc.N
```

**Pick the changelog's start tag explicitly — never let `gh` auto-detect
it.** Without `previous_tag_name`, `generate-notes` can pick a base years
back instead of the previous cycle, producing a changelog with well over a
thousand stray entries. Always pass one:

- Case B: the previous candidate in *this* cycle, `vX.Y.0-rc.{N-1}`.
- Case A: the previous minor's rc.1 tag (this matches the release doc's own
  "diff with the previous release rc.1 tag" instruction). Find it with
  `gh release list --repo epam/ketcher | grep -- '-rc\.1$'` and confirm
  with the user which one is actually "the previous cycle" before using it
  — don't just take the most recent line blind.

Fetch and clean the notes:

```bash
gh api repos/epam/ketcher/releases/generate-notes \
  -f tag_name=vX.Y.0-rc.N -f previous_tag_name={start-tag} \
  --jq .body > /tmp/raw-notes.txt

python3 .claude/skills/create-release/scripts/clean_changelog.py \
  --owner epam --repo ketcher clean < /tmp/raw-notes.txt
```

`--owner`/`--repo` are top-level flags, not part of `clean`/`combine` —
place them *before* the subcommand or argparse rejects them as unrecognized
arguments. Always write it
`clean_changelog.py --owner X --repo Y {clean,combine} ...`.

This prints JSON: `categories` (the keepers, already sorted into "New
features" / "Bugfixes and improvements"), `excluded` (Autotest/Backmerge/Refactor/
Task/version-bump — dropped by design, just report the count), and
`flagged` (needs a human look — no ticket number or no resolvable issue
type). Show the user `excluded` and `flagged`; for each `flagged` entry,
confirm with the user whether it belongs in a category after all (they may
know the ticket even though `gh` couldn't resolve its issue type) — if
they reject it, just drop it rather than keeping a leftover "needs review"
section in the published notes. Assemble the final body as:

```
## What's Changed

### New features
<entries>

### Bugfixes and improvements
<entries>
```

Write it to a file and create the draft:

```bash
gh release create vX.Y.0-rc.N \
  --target release/X.Y --draft --prerelease \
  -F /tmp/release-notes.md
```

Leave it as a draft — candidate releases are never published, only kept as
drafts for reference until the public release combines them. Report the
release URL.

## Mode: `publish-public`

```bash
git checkout release/X.Y && git pull
```

Read the version from `packages/ketcher-standalone/package.json` — should
read `X.Y.Z` with no `-rc` suffix, matching the merged `promote-public`/
`patch-public` PR.

```bash
git tag -a vX.Y.Z -m "Updated version to vX.Y.Z"
git describe
git push origin vX.Y.Z
```

### Stop: wait for the npm publish

Pushing the tag is as far as this skill can automate the npm side — the
actual `npm publish` runs as a manual CodeBuild job triggered off that tag,
and unlike `draft-candidate` (a draft nobody sees), this GitHub release
goes public immediately. Publishing the GitHub release before the npm
packages exist risks someone finding the release first and hitting a
version that isn't installable yet — and the release date below is read
*from* the npm publish timestamp, so that step has nothing to read until
npm publish has actually run.

**Stop here and tell the user the tag is pushed — ask them to confirm once
the CodeBuild npm publish for `X.Y.Z` has completed.** Don't just take
their word for it either; once they confirm, double-check for real:

```bash
npm view ketcher-core@X.Y.Z version
```

If that comes back empty/errors, the publish either hasn't finished
propagating or didn't happen — report that back and wait rather than
proceeding on the assumption it'll show up by the time the GitHub release
goes out. Once it resolves to `X.Y.Z`, continue.

**Build the changelog by combining this cycle's already-cleaned candidate
drafts** rather than re-deriving it from a raw git diff — every candidate
draft from `draft-candidate` mode was already cleaned and categorized once;
redoing that work by hand (or re-running the cleaner over the full public
diff) is exactly the duplicated effort this skill exists to avoid.

Find all candidates in this cycle and save each body to a file, in
candidate order — don't hand-count N or copy-paste one `gh release view`
per candidate, drive it from the actual list:

```bash
N=$(gh release list --repo epam/ketcher | grep -c "vX.Y.0-rc\.")
for i in $(seq 1 "$N"); do
  gh release view "vX.Y.0-rc.$i" --repo epam/ketcher --json body --jq .body > "/tmp/rc$i.txt"
done
```

This assumes rc numbers run contiguously from 1 to N. If any candidate was
skipped, retagged, or is otherwise out of sequence, list the actual tags
first (`gh release list --repo epam/ketcher | grep "vX.Y.0-rc\."`) and
adjust the loop to match.

**Sanity check before running the cleaner:** `grep -c '^\* #' /tmp/rcK.txt`
on each file. A candidate draft created by `draft-candidate` mode is
already sectioned (has `### ` headers) and gets merged as-is, cheaply. But
if a draft predates this skill, it will be a raw, un-sectioned body, and
`combine` will fall back to cleaning it — meaning a `gh issue view` API
call per entry. If any raw file has significantly more than ~50-60
entries, stop and flag it to the user instead of grinding through: it
likely means that draft itself was built from a bad base tag (same failure
mode as the Case A bug above) and should be re-created with
`draft-candidate` against the correct start tag first, rather than combined
as-is.

```bash
python3 .claude/skills/create-release/scripts/clean_changelog.py \
  --owner epam --repo ketcher combine --report \
  /tmp/rc1.txt /tmp/rc2.txt ... /tmp/rcN.txt \
  > /tmp/release-notes.md
```

`--report` prints any `excluded`/`flagged` items from raw (unreviewed)
inputs to stderr — show those to the user the same way as in
`draft-candidate` mode. Sectioned inputs are trusted as-is (a human already
reviewed them when that draft was created), so nothing to re-review there.

### Append the Indigo compatibility line

Every public release body ends with this exact structure. If in doubt,
confirm against a recent public release's real body with
`gh release view vX.Y.Z --repo epam/ketcher --json body --jq .body` rather
than trusting a paraphrase:

```markdown
---

### Additional notes:
- Ketcher X.Y.Z has been built and tested with Indigo version X.Y ([standalone](STANDALONE_URL) and [remote](REMOTE_URL)).
```

Only "standalone" and "remote" are hyperlinks — the Indigo version number
itself (`X.Y`, no patch) is plain text, not a link. Don't just append a
bare sentence after the category sections without the `---` / `###
Additional notes:` wrapper — that's the actual convention real releases
use, not merely "last line of the body." Read `dependencies.indigo-ketcher`
from `packages/ketcher-standalone/package.json` (it's public by this point,
`X.Y.Z` with no `-rc` suffix) — that's the Indigo version this Ketcher
release actually shipped with. Build the two links from it:

- **standalone** → the npm package page:
  `https://www.npmjs.com/package/indigo-ketcher/v/{X.Y.Z}`
- **remote** → the Docker Hub image layer page:
  `https://hub.docker.com/layers/epmlsop/indigo-service/{X.Y.Z}/images`
  (the trailing `sha256-...` digest segment is only needed if the tag has
  more than one image. Check first: `curl -s
  "https://hub.docker.com/v2/repositories/epmlsop/indigo-service/tags/{X.Y.Z}"`
  and count entries in the response's `images` array. Exactly one → the
  digest-less `/images` URL is unambiguous, use it as-is. More than one →
  pick the correct image and append its digest to the URL instead.)

The visible link text conventionally drops the trailing `.0` patch
(`1.45` reads better than `1.45.0`) — use `{X.Y}` in the sentence and the
full `{X.Y.Z}` in both URLs. Append the whole `---` / `### Additional
notes:` block as shown above, after the category sections.

### Build and attach the release zips

Public releases ship the built binaries as 6 zip attachments.

**Clear stale rollup caches before building.** A leftover
`packages/*/node_modules/.cache` (rollup-plugin-typescript2 cache) from a
previous build can feed stale compiled output into the new `dist/` instead
of retranspiling, surfacing as `Attempted import error: 'X' is not
exported from 'ketcher-core'` for a symbol that no longer exists anywhere
in source. Clear the cache first, every time:

```bash
rm -rf packages/*/node_modules/.cache
```

Then build from repo root:

```bash
npm run build   # = build:packages (core, react, macromolecules, standalone) + build:example (remote, standalone)
```

If it still fails on an "is not exported from" error after clearing the
cache, that's a real regression on the branch — don't chase it as another
cache issue.

Then zip each package's `dist/` folder, named after the package, plus the
two example bundles under `example/dist/`, named with the version:

```bash
cd packages/ketcher-core        && zip -r /tmp/ketcher-core.zip dist        && cd -
cd packages/ketcher-react       && zip -r /tmp/ketcher-react.zip dist       && cd -
cd packages/ketcher-macromolecules && zip -r /tmp/ketcher-macromolecules.zip dist && cd -
cd packages/ketcher-standalone  && zip -r /tmp/ketcher-standalone.zip dist  && cd -
cd example/dist/remote          && zip -r /tmp/ketcher-remote-X.Y.Z.zip .   && cd -
cd example/dist/standalone      && zip -r /tmp/ketcher-standalone-X.Y.Z.zip . && cd -
```

Note `ketcher-standalone.zip` (the package dist) and
`ketcher-standalone-X.Y.Z.zip` (the example bundle) are two different
zips with deliberately similar names — don't collapse them into one.

Set the title to the public-release convention — exactly `Ketcher X.Y.Z
{Month D, YYYY}`, e.g. "Ketcher 3.17.0 July 13, 2026". No parentheses,
comma, or dash around the date — it's just appended after the version with
a space.

**Get the date from npm, not the local clock** — the npm publish and this
GitHub release can happen on different days, and the doc's convention is
the npm publish date. This is exactly the timestamp behind the version you
just confirmed exists in the "Stop: wait for the npm publish" step above,
so it's guaranteed to be there now. Any of the four packages works since
they publish together in one job:

```bash
npm view ketcher-core time --json | python3 -c "
import json, sys
from datetime import datetime
t = json.load(sys.stdin)['X.Y.Z']
print(datetime.fromisoformat(t.replace('Z', '+00:00')).strftime('%B %-d, %Y'))
"
```

**Pause for confirmation before publishing** — unlike candidate drafts,
this creates a published, publicly-visible release:

```bash
gh release create vX.Y.Z \
  --target release/X.Y \
  --title "Ketcher X.Y.Z {Month D, YYYY}" \
  -F /tmp/release-notes.md \
  /tmp/ketcher-core.zip /tmp/ketcher-react.zip \
  /tmp/ketcher-macromolecules.zip /tmp/ketcher-standalone.zip \
  /tmp/ketcher-remote-X.Y.Z.zip /tmp/ketcher-standalone-X.Y.Z.zip
```

Ask the user whether to add `--latest=false` — needed if this is a patch
for a version that isn't the newest public release (the same situation the
release doc's `IS_PATCH_FOR_PREVIOUS_PUBLIC_VERSION` flag handles on the
npm-publish side).

### Clean up the candidate drafts

Once the public release is live, the `vX.Y.0-rc.N` drafts from this cycle
have served their purpose — their content is now folded into the public
release body, and leaving them around just clutters the releases list.
Deleting a draft release destroys its body text for good (the underlying
tag stays, but the description doesn't) — before deleting, make sure the
`/tmp/rc1.txt` .. `/tmp/rcN.txt` files saved during the changelog step are
still around and move them somewhere durable if `/tmp` isn't reliably kept
on this machine; don't delete drafts if those files are already gone and
you have no other copy of their content.

Confirm with the user before deleting (this destroys the draft release
entries, though their tags stay intact for history):

```bash
N=$(gh release list --repo epam/ketcher | grep -c "vX.Y.0-rc\.")
for i in $(seq 1 "$N"); do
  gh release delete "vX.Y.0-rc.$i" --repo epam/ketcher --yes
done
```

Deliberately **don't** pass `--cleanup-tag` — the underlying `vX.Y.0-rc.N`
git tags are legitimate version-history markers (they're what got tagged
and, for rc.1, pushed to trigger real builds); only the draft *release*
entries are noise worth removing once the public release supersedes them.

Report the release URL. Mention that the npm CodeBuild publish itself,
closing the GitHub milestone, and the announcement emails are still
manual — not something this mode attempts.

## Explicitly out of scope

Publishing to npm via CodeBuild, closing the GitHub milestone, and the
release-announcement emails aren't part of either mode — they either can't
be automated (npm publish is a manual CodeBuild job) or need a human call
(recipients, timing). Say so if asked rather than attempting them.
