# Triage one task

You are a **diagnoser** in a batch. You get one **task** (an issue number, or a task file `<run dir>/tasks/<id>.md` for a task given in prose), a triage worktree (detached at `<base>`, installed), and the **run directory**. You end with exactly one **outcome**, written to `<run dir>/triage/<id>.md`. Leave the tracker unchanged: draft any comment the outcome needs in `<run dir>/comments/<id>.md`, starting with the line from [TRACKER.md](TRACKER.md).

Before exploring, read `.memory-bank/glossary.md`, the `.memory-bank/modules/` doc of the task's area, and its `openspec/specs/` capability. Use their terms.

## Freshness

An issue filed by a hunt ends with the line `Diagnosed against: <sha>`: the `<base>` commit its diagnosis read. The issue is **fresh** when it has that line and the files in its _Where_ section are the same on `<base>` as at that sha:

```sh
git diff --quiet <sha> <base> -- <every file named in Where>
```

Exit code 0 means fresh. A fresh task skips steps 4 and 5. A task with no stamp, or with changed files, takes every step.

## Steps

1. **Read the task in full**, comments included: `gh issue view <N> --comments`, or the task file. Done when you have read the body and every comment.

2. **Name its kind** from the _Kinds_ table in [SKILL.md](SKILL.md): `bug`, `small`, `feature`, or `refactor`. The issue type is a hint, not the answer: a `Task` issue that changes what a user sees is a feature. When no kind fits, or the task holds two unrelated kinds → outcome `handed-to-human`, naming the kinds that fit. Done when you hold one kind, or that outcome.

3. **Look for a self-gate**: an instruction in the body or comments to hold the work ("do not start", "wait for", "needs requirements", a `Questions remain` label). If you find one → outcome `self-gated`. Done when you have checked the body, every comment, and the labels.

4. **Check whether `<base>` already does it.** Read `git log <base> --since=<issue creation date>` for commits in the task's area, and the code at each site the task names as it is on `<base>`. For a bug that shows in the editor, reproduce as [RED.md](RED.md) step 2 says. If the work is there → outcome `already-done`, with a draft comment naming the commit and one line on how it does the work. Done when you have read every site and every commit in the area.

5. **Check the premise.** When the task names `file:line` sites, grep for the code at each: the code counts, not the line number. If the named code no longer exists, or a bug's steps no longer reproduce → outcome `stale`, with a draft comment on what is there now. Done when every named site is found or shown gone.

6. **Prepare by kind.**
   - **bug**: follow [RED.md](RED.md) in your triage worktree. Red → outcome `ready`, and save the test as a patch: `git -C <worktree> add -N .` then `git -C <worktree> diff --binary > <run dir>/triage/<id>.patch`. When the loop stays green everywhere you can reach, or the bug needs remote mode with no Indigo service, a product decision, or an answer only the issue's author has → outcome `handed-to-human`, with a draft comment on why and what you ran.
   - **small**: list what the change covers, as SMALL.md step 1 says: the files, and for a lint rule every violation. A small task that needs new tests to hold its behavior is a refactor: write `Kind: refactor` and prepare it as the next bullet says. → outcome `ready`.
   - **feature** and **refactor**: write no code. List the specs, the modules, and the files the work will likely change, so the plan can find shared files. → outcome `ready`.

## Outcome file

Write `<run dir>/triage/<id>.md`:

```markdown
# <id> <title>

Kind: <bug | small | feature | refactor>
Outcome: <ready | already-done | stale | handed-to-human | self-gated>
Fresh: <yes | no>
Cause: <bug only: one line, with file:line>
Red test: <bug only: test file path and test name, or none>
Repro: <the verify-ketcher evidence path, or none>
Touches: <the modules and paths the work will change>
Notes: <one to three lines for the orchestrator>
```

Done when the outcome file exists, with the comment draft the outcome requires.
