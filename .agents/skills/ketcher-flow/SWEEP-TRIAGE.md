# Triage one bug

You are a **diagnoser** in a sweep. You get one issue number, a triage worktree (detached at `<base>`, installed), and the **run directory**. You end with exactly one **outcome**, written to `<run dir>/<N>.md`. You change nothing on the tracker: a comment the outcome needs is a draft in `<run dir>/comments/<N>.md`, starting with the line from [TRACKER.md](TRACKER.md).

Before exploring, read `.memory-bank/glossary.md`, the `.memory-bank/modules/` doc of the bug's area, and its `openspec/specs/` capability. Use their terms.

## Freshness

An issue filed by a hunt ends with the line `Diagnosed against: <sha>`: the `<base>` commit its diagnosis read. The issue is **fresh** when it has that line and the files in its _Where_ section are the same on `<base>` as at that sha:

```sh
git diff --quiet <sha> <base> -- <every file named in Where>
```

Exit code 0 means fresh. Fresh skips steps 3 and 4: `<base>` has not touched that code, so it cannot have fixed the bug or moved the premise. An issue with no stamp, or with changed files, takes every step.

## Steps

1. **Read the issue in full**, comments included: `gh issue view <N> --comments`.

2. **Look for a self-gate**: an instruction in the body or comments to hold the work ("do not start", "wait for", "needs requirements", a `Questions remain` label). If you find one → outcome `self-gated`.

3. **Check whether `<base>` already fixes it.** Read `git log <base> --since=<issue creation date>` for commits in the bug's area, and the code at each site the issue names as it is on `<base>`. Reproduce as [RED.md](RED.md) step 1 says when the bug shows in the editor. If the fix is there → outcome `already-fixed`, with a draft comment naming the commit and one line on how it fixes the bug.

4. **Check the premise.** Most Ketcher bugs name no code. When the issue names `file:line` sites, grep for each: line numbers drift, and the code they name is what counts. If the named code no longer exists, or the steps no longer reproduce → outcome `stale`, with a draft comment on what is there now.

5. **Go red.** Follow [RED.md](RED.md) in your triage worktree.
   - Red → outcome `ready`. Save the test as a patch: `git -C <worktree> add -N .` then `git -C <worktree> diff --binary > <run dir>/<N>.patch`.
   - The loop stays green everywhere you can reach, or the bug needs remote mode with no Indigo service, a product decision, or an answer from the issue that only its author has → outcome `handed-to-human`, with a draft comment on why it cannot be delegated and what you ran.

## Outcome file

Write `<run dir>/<N>.md`:

```markdown
# #<N> <title>

Outcome: <ready | already-fixed | stale | handed-to-human | self-gated>
Fresh: <yes | no>
Cause: <one line, with file:line>
Red test: <test file path and test name, or none>
Repro: <the verify-ketcher evidence path, or none>
Notes: <one to three lines for the orchestrator>
```

Done when the outcome file exists, with the comment draft the outcome requires.
